import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { CARD, CARD_BODY, CARD_IMG, CARD_MEDIA, CARD_TITLE, CardMeta } from '../components/Card'
import PageHero from '../components/PageHero'
import OffersStatus from '../components/OffersStatus'
import { assetUrl, fetchPosts } from '../api'
import { useLanguage, useT } from '../i18n/LanguageContext'
import { formatDate } from '../utils/format'
import { A } from '../i18n/router'
import Img from '../components/Img'

const SECTION_WIDTH = 'w-[90vw] max-w-[1360px]'
const SECTION_TITLE = 'text-[clamp(2.6rem,5.4vw,5rem)] text-forest leading-[1] [text-wrap:balance]'
const META_TEXT = 'text-xs sm:text-sm'
const PAGE_TITLE = 'text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold uppercase leading-none tracking-tight'
const BADGE = 'inline-block bg-[#F4F1EA] text-forest text-[11px] font-semibold uppercase tracking-[0.14em] px-3 py-1.5 rounded-sm'

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
  return (
    <>
      <Navbar />
      <PageHero slot="blog.hero" title={t('title')} crumb={t('crumb')} />
    </>
  )
}

function FeaturedJournal({ posts }) {
  const t = useT('blog')
  const { lang } = useLanguage()
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] overflow-hidden rounded-3xl bg-white">
      <A href={`/blog/${posts[0].slug}`} className="relative block min-h-[260px] sm:min-h-[340px] lg:min-h-full">
        <Img src={posts[0].image} alt={t('imageAlt')} className="absolute inset-0 w-full h-full object-cover" />
      </A>
      <ul className="flex flex-col divide-y divide-slate-200 px-5 py-2 md:px-12 md:py-6">
        {posts.map((post) => (
          <li key={post.slug}>
            <A href={`/blog/${post.slug}`} className="group flex items-center justify-between gap-4 py-6 text-slate-800">
              <div>
                <span className={BADGE}>{formatDate(post.date, lang)}</span>
                <h3 className="mt-4 text-lg md:text-2xl leading-snug group-hover:underline">{post.title}</h3>
              </div>
              <Img src={post.image} alt="" className="shrink-0 w-24 h-24 sm:w-40 sm:h-32 rounded-xl object-cover" />
            </A>
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
    <A href={`/blog/${post.slug}`} className={CARD}>
      <div className={CARD_MEDIA}>
        <Img src={post.image} alt={post.title} className={CARD_IMG} />
      </div>
      <div className={CARD_BODY}>
        <CardMeta items={[formatDate(post.date, lang), t('readTime', { count: post.minutes })]} />
        <h3 className={`${CARD_TITLE} group-hover:underline`}>{post.title}</h3>
      </div>
    </A>
  )
}

function Blog() {
  const t = useT('blog')
  const { posts, status } = usePosts()
  const featured = posts.filter((p) => p.isFeatured).slice(0, 3)
  // Sans article à la une, tout va dans la grille
  const grid = featured.length ? posts.filter((p) => !featured.includes(p)) : posts

  return (
    <>
      <main className="w-full bg-[#F4F1EA] pt-0 pb-16 md:pb-24 flex flex-col items-center">
        <div className="w-full flex flex-col items-center">
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
