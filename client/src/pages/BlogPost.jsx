// /blog/:slug : un article du journal, géré depuis /admin/blog.
// Corps en blocs : intertitre, paragraphe, liste (mot-clé en gras + texte), photo, bandeau d'offre.
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { useParams, A } from '../i18n/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import OffersStatus from '../components/OffersStatus'
import { assetUrl, fetchPost } from '../api'
import { useLanguage, useT } from '../i18n/LanguageContext'
import { formatDate } from '../utils/format'
import { useScrollReveal } from '../utils/useScrollReveal'
import { PostCard } from './Blog'

gsap.registerPlugin(ScrollTrigger)

const W = 'w-[90vw] lg:max-w-[95vw]'
const TEXT = 'w-full max-w-4xl'
const BTN = 'inline-flex items-center justify-center text-sm md:text-base font-medium px-6 py-3 rounded-full active:scale-95 transition'
// Photo plus haute que son cadre : c'est cette marge qui permet le mouvement au défilement
const PARALLAX_IMG = 'absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover'

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

// En-tête en cascade ; couverture et bandeaux s'ouvrent en fenêtre, leur photo glisse au défilement
function usePostMotion(scope, deps) {
  useLayoutEffect(() => {
    if (!scope.current) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.post-head > *', { y: 28, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', clearProps: 'all' })

      gsap.utils.toArray('.post-frame').forEach((frame) => {
        const r = getComputedStyle(frame).borderTopLeftRadius
        gsap.fromTo(frame,
          { clipPath: `inset(8% 4% 0% 4% round ${r})` },
          { clipPath: `inset(0% 0% 0% 0% round ${r})`, duration: 1.3, ease: 'expo.out', clearProps: 'clipPath', scrollTrigger: { trigger: frame, start: 'top 88%', once: true } })
        gsap.fromTo(frame.querySelector('img'),
          { yPercent: -8 },
          { yPercent: 8, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: 0.6 } })
      })

      gsap.utils.toArray('.post-cta').forEach((cta) => {
        const trigger = { trigger: cta, start: 'top 75%', once: true }
        gsap.from(cta.querySelectorAll('.cta-in'), { y: 34, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', clearProps: 'all', scrollTrigger: trigger })
        gsap.from(cta.querySelector('.cta-line'), { scaleX: 0, duration: 1, delay: 0.2, ease: 'power3.out', clearProps: 'transform', scrollTrigger: trigger })
      })
    }, scope.current)
    return () => mm.revert()
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
}

// Bandeau d'offre : photo, grand titre souligné et sous-titre à gauche, bouton en bas à droite
function Cta({ block }) {
  const external = /^https?:/.test(block.link)
  return (
    <section data-no-reveal className="post-frame post-cta relative my-12 md:my-16 overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-[#074636] text-white min-h-[380px] md:min-h-[440px] flex">
      <img src={block.image} alt="" className={PARALLAX_IMG} />
      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#072a1f]/90 via-[#072a1f]/45 to-[#072a1f]/10" />
      <div className="relative w-full flex flex-col justify-between gap-10 p-6 sm:p-10 md:p-14">
        <div className="max-w-3xl">
          <h2 className="cta-in text-[clamp(2.25rem,6vw,5.5rem)] font-bold uppercase leading-[0.98] tracking-tight break-words">{block.title}</h2>
          <span aria-hidden="true" className="cta-line block mt-4 md:mt-5 h-0.5 w-40 md:w-64 origin-left bg-[#E6C58A]" />
          {block.subtitle && <p className="cta-in mt-4 max-w-md text-sm md:text-lg text-white/90">{block.subtitle}</p>}
        </div>
        {block.button && (
          <A
            href={block.link}
            {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
            className={`cta-in ${BTN} group self-start md:self-end gap-2 whitespace-nowrap bg-[#C49849] hover:bg-[#a9813a] text-white`}
          >
            {block.button}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </A>
        )}
      </div>
    </section>
  )
}

function Block({ block }) {
  const { lang } = useLanguage()
  if (block.type === 'heading') {
    return <h2 className={`${TEXT} mt-12 md:mt-16 text-[clamp(1.6rem,2.6vw,2.25rem)] font-bold leading-tight tracking-tight text-forest`}>{block.text}</h2>
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
            <span>{item.lead && <strong className="font-semibold text-forest">{item.lead}{lang === 'fr' ? ' : ' : ': '}</strong>}{item.text}</span>
          </li>
        ))}
      </ul>
    )
  }
  if (block.type === 'image') {
    return (
      <figure className="w-full mt-10 md:mt-14">
        <img src={block.image} alt={block.caption || ''} className="w-full max-h-[620px] object-cover rounded-[1.5rem] md:rounded-[2rem]" />
        {block.caption && <figcaption className="mt-3 text-sm text-slate-600">{block.caption}</figcaption>}
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
  usePostMotion(root, [slug, status])

  if (status === 'loading' || status === 'error') {
    return <Shell><OffersStatus status={status} className={`${W} mt-16`} /></Shell>
  }
  if (status === 'missing') {
    return (
      <Shell>
        <section className={`${W} mt-16 rounded-3xl bg-white p-10 text-center`}>
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-forest">{t('notFoundTitle')}</h1>
          <p className="mt-4 text-slate-600">{t('notFoundText')}</p>
          <A href="/blog" className={`${BTN} mt-6 bg-[#074636] hover:bg-[#0a5c47] text-white`}>{t('allArticles')}</A>
        </section>
      </Shell>
    )
  }

  return (
    <>
      <main ref={root} className="w-full bg-[#D5E8E2] pb-16 md:pb-24 flex flex-col items-center">
        <Navbar />

        <article className={`${W} mt-6`}>
          <header data-no-reveal className="post-head">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-700">
              <A href="/" className="hover:underline underline-offset-4">{t('home')}</A>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <A href="/blog" className="hover:underline underline-offset-4">{t('crumb')}</A>
            </nav>
            <h1 className="mt-5 max-w-5xl text-[clamp(2.25rem,4.4vw,4rem)] font-bold leading-[1.08] tracking-tight text-forest">{post.title}</h1>
            <p className="mt-4 flex items-center gap-3 text-sm text-slate-600">
              <span>{formatDate(post.date, lang)}</span>
              <span aria-hidden="true" className="w-px h-4 bg-slate-500" />
              <span>{t('readTime', { count: post.minutes })}</span>
            </p>
          </header>

          <div data-no-reveal className="post-frame relative mt-8 h-64 sm:h-80 md:h-[min(68vh,620px)] overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-[#074636]">
            <img src={post.image} alt="" className={PARALLAX_IMG} />
          </div>

          <div className="mt-10 md:mt-14">
            {post.excerpt && <p className={`${TEXT} font-display text-xl md:text-2xl font-medium leading-snug text-forest`}>{post.excerpt}</p>}
            {post.body.map((block, i) => <Block key={i} block={block} />)}
          </div>
        </article>

        {related.length > 0 && (
          <section className={`${W} mt-20 md:mt-28`}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-[clamp(2rem,4.4vw,4rem)] font-bold leading-[1.08] tracking-tight text-forest">{t('related')}</h2>
              <A href="/blog" className="text-sm md:text-base font-medium text-forest underline-offset-4 hover:underline">{t('allArticles')}</A>
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
