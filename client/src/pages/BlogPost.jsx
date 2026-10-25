// /blog/:slug : un article du journal, géré depuis /admin/blog.
// Corps en blocs : intertitre, paragraphe, liste (mot-clé en gras + texte), photo, bandeau d'offre.
import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import OffersStatus from '../components/OffersStatus'
import { assetUrl, fetchPost } from '../api'
import { useLanguage, useT } from '../i18n/LanguageContext'
import { formatDate } from '../utils/format'
import { useScrollReveal } from '../utils/useScrollReveal'
import { PostCard } from './Blog'

const W = 'w-[90vw] lg:max-w-[95vw]'
const TEXT = 'mx-auto w-full max-w-3xl'
const BTN = 'inline-flex items-center justify-center text-sm md:text-base font-medium px-6 py-3 rounded-full active:scale-95 transition'

function usePost(slug) {
  const { lang } = useLanguage()
  const [state, setState] = useState({ post: null, related: [], status: 'loading' })
  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, status: 'loading' }))
    fetchPost(slug, lang)
      .then(({ post, related }) => {
        if (cancelled) return
        const withImages = (p) => ({ ...p, image: assetUrl(p.image) })
        setState({
          post: { ...withImages(post), body: post.body.map((b) => (b.image ? { ...b, image: assetUrl(b.image) } : b)) },
          related: related.map(withImages),
          status: 'ready',
        })
      })
      .catch((err) => !cancelled && setState({ post: null, related: [], status: err.status === 404 ? 'missing' : 'error' }))
    return () => {
      cancelled = true
    }
  }, [slug, lang])
  return state
}

// Bandeau d'offre : photo, grand titre, sous-titre, prix et bouton (comme « Explore your journey »)
function Cta({ block }) {
  const external = /^https?:/.test(block.link)
  return (
    <section className="relative my-12 md:my-20 overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-[#084838] text-white min-h-[340px] md:min-h-[440px] flex">
      <img src={block.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-slate-950/10" />
      <div className="relative w-full flex flex-col justify-between gap-10 p-6 sm:p-10 md:p-14">
        {block.subtitle && <p className="max-w-md text-sm md:text-lg text-white/85">{block.subtitle}</p>}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-5xl sm:text-6xl md:text-8xl font-bold uppercase leading-[0.95] tracking-tight">{block.title}</h2>
            {block.priceLabel && <p className="mt-4 text-xl md:text-2xl font-medium text-[#E6C58A]">{block.priceLabel}</p>}
          </div>
          {block.button && (
            <a
              href={block.link}
              {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
              className={`${BTN} self-start md:self-end bg-[#C49849] hover:bg-[#a9813a] text-white`}
            >
              {block.button}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

function Block({ block }) {
  const { lang } = useLanguage()
  if (block.type === 'heading') {
    return <h2 className={`${TEXT} mt-12 md:mt-16 text-2xl sm:text-3xl md:text-4xl font-medium leading-tight tracking-tight text-forest`}>{block.text}</h2>
  }
  if (block.type === 'paragraph') {
    // Lignes vides : nouveaux paragraphes
    return block.text.split(/\n\s*\n/).map((para, i) => (
      <p key={i} className={`${TEXT} mt-5 text-base md:text-lg leading-relaxed text-slate-700 whitespace-pre-line`}>{para}</p>
    ))
  }
  if (block.type === 'list') {
    return (
      <ul className={`${TEXT} mt-6 flex flex-col gap-4`}>
        {block.items.map((item, i) => (
          <li key={i} className="flex gap-4 text-base md:text-lg leading-relaxed text-slate-700">
            <span aria-hidden="true" className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-[#C49849]" />
            <span>{item.lead && <strong className="font-semibold text-slate-900">{item.lead}{lang === 'fr' ? ' : ' : ': '}</strong>}{item.text}</span>
          </li>
        ))}
      </ul>
    )
  }
  if (block.type === 'image') {
    return (
      <figure className="mx-auto w-full max-w-5xl mt-10 md:mt-14">
        <img src={block.image} alt={block.caption || ''} className="w-full max-h-[620px] object-cover rounded-[1.5rem] md:rounded-[2rem]" />
        {block.caption && <figcaption className="mt-3 text-center text-sm text-slate-600">{block.caption}</figcaption>}
      </figure>
    )
  }
  if (block.type === 'cta') return <Cta block={block} />
  return null
}

function Shell({ children }) {
  return (
    <>
      <main className="w-full min-h-[70vh] bg-[#D5E8E2] pb-24 flex flex-col items-center">
        <Navbar />
        {children}
      </main>
      <Footer />
    </>
  )
}

function BlogPost() {
  const { slug } = useParams()
  const t = useT('blog')
  const { lang } = useLanguage()
  const { post, related, status } = usePost(slug)
  const root = useRef(null)
  useScrollReveal(root, [slug, status])

  if (status === 'loading' || status === 'error') {
    return <Shell><OffersStatus status={status} className={`${W} mt-16`} /></Shell>
  }
  if (status === 'missing') {
    return (
      <Shell>
        <section className={`${W} mt-16 rounded-3xl bg-white p-10 text-center`}>
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-forest">{t('notFoundTitle')}</h1>
          <p className="mt-4 text-slate-600">{t('notFoundText')}</p>
          <a href="/blog" className={`${BTN} mt-6 bg-[#084838] hover:bg-[#0a5c47] text-white`}>{t('allArticles')}</a>
        </section>
      </Shell>
    )
  }

  return (
    <>
      <main ref={root} className="w-full bg-[#D5E8E2] pb-16 md:pb-24 flex flex-col items-center">
        <Navbar />

        <article className={`${W} mt-6`}>
          <nav aria-label="Breadcrumb" className="text-sm md:text-base text-slate-700">
            <a href="/" className="hover:underline">{t('home')}</a> / <a href="/blog" className="hover:underline">{t('crumb')}</a> /{' '}
            <span className="text-slate-500">{post.title}</span>
          </nav>
          <h1 className="mt-5 max-w-5xl text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-semibold leading-[1.05] tracking-tight text-forest">{post.title}</h1>
          <p className="mt-5 flex items-center gap-3 text-sm md:text-base text-slate-600">
            <span>{formatDate(post.date, lang)}</span>
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#C49849]" />
            <span>{t('readTime', { count: post.minutes })}</span>
          </p>

          <img src={post.image} alt="" className="mt-8 w-full h-64 sm:h-80 md:h-[520px] object-cover rounded-[1.5rem] md:rounded-[2rem]" />

          <div className="mt-12 md:mt-16">
            {post.excerpt && <p className={`${TEXT} text-xl md:text-2xl leading-relaxed text-slate-800`}>{post.excerpt}</p>}
            {post.body.map((block, i) => <Block key={i} block={block} />)}
          </div>
        </article>

        {related.length > 0 && (
          <section className={`${W} mt-20 md:mt-28`}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight text-forest">{t('related')}</h2>
              <a href="/blog" className="text-sm md:text-base font-medium text-[#a9813a] hover:underline">{t('allArticles')}</a>
            </div>
            <div className="mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-9">
              {related.map((p) => <PostCard key={p.slug} post={p} />)}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}

export default BlogPost
