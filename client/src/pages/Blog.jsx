import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import OffersStatus from '../components/OffersStatus'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { assetUrl, fetchPosts } from '../api'
import { useLanguage, useT } from '../i18n/LanguageContext'
import { usePhoto } from '../sitePhotos'
import { formatDate } from '../utils/format'

gsap.registerPlugin(ScrollTrigger)

const SECTION_WIDTH = 'w-[90vw] lg:max-w-[95vw]'
const SECTION_TITLE = 'text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-forest leading-[1.15] tracking-tight'
const META_TEXT = 'text-xs sm:text-sm'
const PAGE_TITLE = 'text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold uppercase leading-none tracking-tight'
const BADGE = 'inline-block bg-[#C49849] text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm'

// Articles : dans la base, gérés depuis /admin/blog. « À la une » : les 3 plus récents cochés comme tels.
export function usePosts() {
  const { lang } = useLanguage()
  const [state, setState] = useState({ posts: [], status: 'loading' })
  useEffect(() => {
    let cancelled = false
    fetchPosts(lang)
      .then(({ posts }) => !cancelled && setState({ posts: posts.map((p) => ({ ...p, image: assetUrl(p.image) })), status: 'ready' }))
      .catch(() => !cancelled && setState((s) => ({ ...s, status: 'error' })))
    return () => {
      cancelled = true
    }
  }, [lang])
  return state
}

function BlogHero() {
  const t = useT('blog')
  const photo = usePhoto()
  return (
    <>
      <Navbar />
      <section className={`${SECTION_WIDTH} relative flex items-center overflow-hidden rounded-3xl bg-[#084838] text-white min-h-[100px] md:min-h-[360px]`}>
        <img src={photo('blog.hero')} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-slate-950/60" />
        <div className="relative w-full max-w-5xl mx-auto px-6 md:px-10 py-16">
          <h1 className={PAGE_TITLE}>{t('title')}</h1>
          <hr className="my-6 md:my-8 border-white/30" />
          <nav aria-label="Breadcrumb" className="text-sm md:text-base font-medium">
            <a href="/" className="hover:underline underline-offset-4">{t('home')}</a> <span aria-hidden="true">/</span> {t('crumb')}
          </nav>
        </div>
      </section>
    </>
  )
}

function FeaturedJournal({ posts }) {
  const t = useT('blog')
  const { lang } = useLanguage()
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] overflow-hidden rounded-3xl bg-white">
      <a href={`/blog/${posts[0].slug}`} className="relative block min-h-[260px] sm:min-h-[340px] lg:min-h-full">
        <img src={posts[0].image} alt={t('imageAlt')} className="absolute inset-0 w-full h-full object-cover" />
      </a>
      <ul className="flex flex-col divide-y divide-slate-200 px-5 py-2 md:px-12 md:py-6">
        {posts.map((post) => (
          <li key={post.slug}>
            <a href={`/blog/${post.slug}`} className="group flex items-center justify-between gap-4 py-6 text-slate-800">
              <div>
                <span className={BADGE}>{formatDate(post.date, lang)}</span>
                <h3 className="mt-4 text-lg md:text-2xl leading-snug group-hover:underline">{post.title}</h3>
              </div>
              <img src={post.image} alt="" className="shrink-0 w-24 h-24 sm:w-40 sm:h-32 rounded-xl object-cover" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PostCard({ post }) {
  const t = useT('blog')
  const { lang } = useLanguage()
  return (
    <a href={`/blog/${post.slug}`} className="group flex flex-col rounded-xl bg-white p-3 text-slate-800">
      <div className="aspect-[4/3] overflow-hidden rounded-md">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="px-3 pt-6 pb-6">
        <p className={`flex items-center gap-3 ${META_TEXT} text-slate-600`}>
          <span>{formatDate(post.date, lang)}</span>
          <span className="w-px h-4 bg-slate-700" />
          <span>{t('readTime', { count: post.minutes })}</span>
        </p>
        <h3 className="mt-4 text-xl md:text-2xl leading-snug group-hover:underline">{post.title}</h3>
      </div>
    </a>
  )
}

function Blog() {
  const t = useT('blog')
  const mainRef = useRef(null)
  const bgRef = useRef(null)
  const { posts, status } = usePosts()
  const featured = posts.filter((p) => p.isFeatured).slice(0, 3)
  // Sans article à la une, tout va dans la grille
  const grid = featured.length ? posts.filter((p) => !featured.includes(p)) : posts

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Fond initial : caché au-dessus de la section
      gsap.set(bgRef.current, {
        yPercent: -100,
      })

      // Animation du fond au scroll
      gsap.to(bgRef.current, {
        yPercent: 0,
        duration: 8.2,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: mainRef.current,
          start: 'top 75%',
          toggleActions: 'play none none none',
          once: true,
        },
      })
    }, mainRef)

    return () => ctx.revert()
  }, [])

  return (
    <>
      <main
        ref={mainRef}
        className="relative overflow-hidden w-full bg-white pt-0 pb-16 md:pb-24 flex flex-col items-center"
      >
        {/* Fond animé au scroll */}
        <div
          ref={bgRef}
          aria-hidden="true"
          className="absolute inset-0 bg-[#D5E8E2] pointer-events-none"
        />

        {/* Contenu au-dessus du fond */}
        <div className="relative z-10 w-full flex flex-col items-center">
          <BlogHero />

          {/* Journal */}
          <section className={`${SECTION_WIDTH} mt-[50px] md:mt-[100px]`}>
            <div className="text-center mb-8 md:mb-12">
              <p className="mb-2 text-xs sm:text-sm md:text-base uppercase tracking-wide text-slate-700">
                {t('eyebrow')}
              </p>

              <h2 className={SECTION_TITLE}>
                {t('heading')}
              </h2>
            </div>

            <OffersStatus status={status} empty={posts.length === 0} />

            {featured.length > 0 && <FeaturedJournal posts={featured} />}

            {/* Grille d'articles */}
            {grid.length > 0 && (
              <div className="mt-10 md:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-9">
                {grid.map((post) => <PostCard key={post.slug} post={post} />)}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default Blog
