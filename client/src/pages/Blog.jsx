import React, { useLayoutEffect, useRef } from 'react'
import Ramena from '../assets/images/Ramena.png'
import NosyIranja from '../assets/images/NosyIranja.png'
import NosyLonjo from '../assets/images/NosyLonjo.png'
import Ambanja from '../assets/images/Ambanja.png'
import Deux from '../assets/images/2.jpg'
import Tana from '../assets/images/Tana.png'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage, useT } from '../i18n/LanguageContext'
import { formatDate } from '../utils/format'

gsap.registerPlugin(ScrollTrigger)

const SECTION_WIDTH = 'w-[90vw] lg:max-w-[95vw]'
const SECTION_TITLE = 'text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-forest leading-[1.15] tracking-tight'
const META_TEXT = 'text-xs sm:text-sm'
const PAGE_TITLE = 'text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold uppercase leading-none tracking-tight'
const BADGE = 'inline-block bg-[#C49849] text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm'

// Titres : locales/<langue>/blog.json (featured et posts, dans cet ordre). Dates au format AAAA-MM-JJ.
const featured = {
  image: NosyIranja,
  posts: [
    { id: 1, date: '2025-11-20', thumb: Deux },
    { id: 2, date: '2025-11-11', thumb: Ambanja },
    { id: 3, date: '2025-10-14', thumb: NosyLonjo },
  ],
}

const posts = [
  { id: 1, image: Deux, date: '2023-11-17', minutes: 6 },
  { id: 2, image: Tana, date: '2023-10-18', minutes: 6 },
  { id: 3, image: NosyIranja, date: '2023-10-05', minutes: 6 },
  { id: 4, image: Ramena, date: '2023-09-22', minutes: 5 },
  { id: 5, image: Ambanja, date: '2023-09-09', minutes: 7 },
  { id: 6, image: NosyLonjo, date: '2023-08-27', minutes: 4 },
]

function BlogHero() {
  const t = useT('blog')
  return (
    <>
      <Navbar />
      <section className={`${SECTION_WIDTH} relative flex items-center overflow-hidden rounded-3xl bg-[#084838] text-white min-h-[100px] md:min-h-[360px]`}>
        <img src={Ramena} alt="" className="absolute inset-0 w-full h-full object-cover" />
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

function FeaturedJournal() {
  const t = useT('blog')
  const { lang } = useLanguage()
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] overflow-hidden rounded-3xl bg-white">
      <div className="relative min-h-[260px] sm:min-h-[340px] lg:min-h-full">
        <img src={featured.image} alt={t('imageAlt')} className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <ul className="flex flex-col divide-y divide-slate-200 px-5 py-2 md:px-12 md:py-6">
        {featured.posts.map((post, i) => <li key={post.id}><a href="#" className="group flex items-center justify-between gap-4 py-6 text-slate-800"><div><span className={BADGE}>{formatDate(post.date, lang)}</span><h3 className="mt-4 text-lg md:text-2xl leading-snug group-hover:underline">{t('featured')[i]}</h3></div><img src={post.thumb} alt="" className="shrink-0 w-24 h-24 sm:w-40 sm:h-32 rounded-xl object-cover" /></a></li>)}
      </ul>
    </div>
  )
}

function PostCard({ post, title }) {
  const t = useT('blog')
  const { lang } = useLanguage()
  return <a href="#" className="group flex flex-col rounded-xl bg-white p-3 text-slate-800"><div className="aspect-[4/3] overflow-hidden rounded-md"><img src={post.image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /></div><div className="px-3 pt-6 pb-6"><p className={`flex items-center gap-3 ${META_TEXT} text-slate-600`}><span>{formatDate(post.date, lang)}</span><span className="w-px h-4 bg-slate-700" /><span>{t('readTime', { count: post.minutes })}</span></p><h3 className="mt-4 text-xl md:text-2xl leading-snug group-hover:underline">{title}</h3></div></a>
}

function Blog() {
  const t = useT('blog')
  const mainRef = useRef(null)
  const bgRef = useRef(null)

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

            <FeaturedJournal />

            {/* Grille d'articles */}
            <div className="mt-10 md:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-9">
              {posts.map((post, i) => (
                <PostCard key={post.id} post={post} title={t('posts')[i]} />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default Blog