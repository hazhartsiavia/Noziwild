import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from 'react-router-dom'
import NosyIranja from '../assets/images/NosyIranja.png'
import Ambanja from '../assets/images/Ambanja.png'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { fetchCircuits, assetUrl } from '../api'
import { formatPrice } from '../utils/format'
import { useLanguage, useT } from '../i18n/LanguageContext'
import { usePhoto } from '../sitePhotos'

gsap.registerPlugin(ScrollTrigger)

/* Constantes partagées : mêmes valeurs que Blog et Contact */
const SECTION_WIDTH = 'w-[90vw] lg:max-w-[95vw]'
const SECTION_TITLE = 'text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-forest leading-[1.15] tracking-tight'
const SECTION_SUBTITLE = 'text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl'
const META_TEXT = 'text-xs sm:text-sm'
const PAGE_TITLE = 'text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold uppercase leading-none tracking-tight'
const BADGE = 'inline-block bg-[#C49849] text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm'
const BUTTON = 'text-sm font-medium px-5 py-2.5 rounded-full'

/* ---------------------------- Données ---------------------------- */

// Ordre d'affichage des régions connues ; une région créée depuis l'admin s'ajoute à la fin
const REGION_ORDER = ['North', 'Highlands', 'South & West', 'East']

// Filtres de durée (libellés traduits : circuits.durations, dans le même ordre)
const durations = [
  { test: () => true },
  { test: (d) => d <= 7 },
  { test: (d) => d >= 8 && d <= 12 },
  { test: (d) => d >= 13 },
]

/* ----------------------- Utilitaires GSAP ------------------------ */

/* matchMedia scopé à la section (évite que les sélecteurs touchent toute la page)
   + respect de prefers-reduced-motion + nettoyage au démontage. */
function useGsap(scope, setup, deps = []) {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia(scope)
    mm.add('(prefers-reduced-motion: no-preference)', () => setup())
    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/* fromTo qui coupe la transition CSS Tailwind pendant l'animation, puis
   restitue tous les styles d'origine à la fin (clearProps). */
const reveal = (targets, from, to, extra = {}) =>
  gsap.fromTo(
    targets,
    { transition: 'none', ...from },
    { transition: 'none', clearProps: 'all', ...to, ...extra }
  )

/* -------------------------- Composants --------------------------- */

function CircuitsHero() {
  const photo = usePhoto()
  const root = useRef(null)
  const t = useT('circuits')

  // Hero : l'image se dézoome, le titre se découvre comme un rideau de gauche à droite
  useGsap(root, () => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.fromTo('.hero-bg', { scale: 1.25 }, { scale: 1, duration: 2.2, ease: 'power2.out', clearProps: 'all' }, 0)
      .fromTo('.hero-shade', { opacity: 0 }, { opacity: 1, duration: 1, clearProps: 'all' }, 0)
      .fromTo(
        '.hero-title',
        { clipPath: 'inset(-10% 100% -10% 0%)', x: -40 },
        { clipPath: 'inset(-10% 0% -10% 0%)', x: 0, duration: 1.2, ease: 'expo.out', clearProps: 'all' },
        0.3
      )
      .fromTo('.hero-rule', { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.9, ease: 'power2.inOut', clearProps: 'all' }, 0.8)
      .fromTo('.hero-crumb', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, clearProps: 'all' }, 1.1)
  })

  return (
    <>
      <Navbar />
      <section ref={root} className={`${SECTION_WIDTH} relative flex items-center overflow-hidden rounded-3xl bg-[#084838] text-white min-h-[100px] md:min-h-[360px]`}>
        <img src={photo('circ.hero')} alt="" className="hero-bg absolute inset-0 w-full h-full object-cover" />
        <div className="hero-shade absolute inset-0 bg-slate-950/60" />
        <div className="relative w-full max-w-5xl mx-auto px-6 md:px-10 py-16">
          <h1 className={`hero-title ${PAGE_TITLE}`}>{t('title')}</h1>
          <hr className="hero-rule my-6 md:my-8 border-white/30" />
          <nav aria-label="Breadcrumb" className="hero-crumb text-sm md:text-base font-medium">
            <a href="/" className="hover:underline underline-offset-4">{t('home')}</a> <span aria-hidden="true">/</span> {t('crumb')}
          </nav>
        </div>
      </section>
    </>
  )
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`chip rounded-full border px-4 py-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2 ${
        active
          ? 'bg-[#084838] border-[#084838] text-white'
          : 'bg-white border-slate-300 text-slate-700 hover:border-slate-500'
      }`}
    >
      {children}
    </button>
  )
}

function CircuitCard({ circuit }) {
  const t = useT('circuits')
  const { lang } = useLanguage()
  return (
    <Link to={`/circuits/${circuit.slug}`} className="circuit-card group flex flex-col rounded-xl bg-white p-3 text-slate-800">
      <div className="relative aspect-[4/3] overflow-hidden rounded-md">
        <img
          src={assetUrl(circuit.image)}
          alt={circuit.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className={`circuit-badge ${BADGE} absolute left-3 top-3`}>{t('days', { count: circuit.days })}</span>
      </div>
      <div className="flex flex-1 flex-col px-3 pt-6 pb-4">
        <p className={`flex items-center gap-3 ${META_TEXT} text-slate-600`}>
          <span>{circuit.regionLabel || circuit.region}</span>
          <span className="w-px h-4 bg-slate-700" />
          <span>{circuit.level}</span>
        </p>
        <h3 className="mt-4 text-xl md:text-2xl leading-snug group-hover:underline">{circuit.title}</h3>
        <p className={`mt-3 ${META_TEXT} text-slate-600`}>{circuit.stops}</p>
        <p className="mt-auto pt-6 text-base md:text-lg font-medium text-slate-900">{t('from', { price: formatPrice(circuit.price, lang) })}</p>
      </div>
    </Link>
  )
}

function Circuits() {
  const photo = usePhoto()
  const t = useT('circuits')
  const { lang } = useLanguage()
  const [region, setRegion] = useState('All')
  const [duration, setDuration] = useState(0)
  // Circuits lus depuis l'API
  const [circuits, setCircuits] = useState([])
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'

  useEffect(() => {
    let cancelled = false
    fetchCircuits(lang)
      .then((data) => {
        if (cancelled) return
        setCircuits(data.circuits)
        setStatus('ready')
      })
      .catch(() => !cancelled && setStatus('error'))
    return () => {
      cancelled = true
    }
  }, [lang])

  // Nom affiché d'une région : traduit par l'API pour les circuits, sinon par le fichier de textes
  const regionLabel = (r) =>
    r === 'All' ? t('all') : circuits.find((c) => c.region === r)?.regionLabel || t('regions')[r] || r

  const regions = [
    'All',
    ...REGION_ORDER,
    ...new Set(circuits.map((c) => c.region).filter((r) => !REGION_ORDER.includes(r))),
  ]

  const introRef = useRef(null)
  const gridRef = useRef(null)
  const highlightsRef = useRef(null)
  const ctaRef = useRef(null)

  const visible = circuits.filter(
    (c) => (region === 'All' || c.region === region) && durations[duration].test(c.days)
  )

  /* Intro : titre qui se précise (flou -> net), panneau de filtres qui glisse,
     puces qui « popent » en cascade */
  useGsap(introRef, () => {
    const st = (trigger, start = 'top 85%') => ({ trigger, start, once: true })

    reveal('.intro-eyebrow', { y: 12, opacity: 0, letterSpacing: '0.2em' }, { y: 0, opacity: 1, letterSpacing: '0.025em', duration: 0.8, ease: 'power2.out', scrollTrigger: st('.intro-eyebrow') })
    reveal('.intro-title', { y: 30, opacity: 0, filter: 'blur(14px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out', scrollTrigger: st('.intro-title') })
    reveal('.intro-sub', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.15, ease: 'power2.out', scrollTrigger: st('.intro-sub') })

    reveal('.filter-panel', { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: st('.filter-panel', 'top 90%') })
    reveal('.chip', { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(2.2)', stagger: { each: 0.05, from: 'start' }, delay: 0.3, scrollTrigger: st('.filter-panel', 'top 90%') })
  })

  /* Cartes : entrée par lots au scroll, direction selon la colonne,
     puis pastille « jours » qui rebondit. Rejoué à chaque changement de filtre. */
  useGsap(gridRef, () => {
    const cards = gsap.utils.toArray('.circuit-card')
    if (!cards.length) return
    const dirs = [-50, 0, 50]
    gsap.set(cards, { opacity: 0, y: 60, x: (i) => dirs[i % 3], transition: 'none' })

    ScrollTrigger.batch(cards, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, { opacity: 1, x: 0, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12, clearProps: 'all' })
        gsap.from(
          batch.map((c) => c.querySelector('.circuit-badge')),
          { scale: 0, rotate: -12, duration: 0.6, ease: 'back.out(3)', delay: 0.35, stagger: 0.12, clearProps: 'all' }
        )
      },
    })
  }, [region, duration, circuits])

  /* Points forts : chaque carte se dévoile de bas en haut (clip-path) */
  useGsap(highlightsRef, () => {
    reveal(
      '.highlight',
      { clipPath: 'inset(100% 0% 0% 0% round 1.5rem)', y: 30 },
      { clipPath: 'inset(0% 0% 0% 0% round 1.5rem)', y: 0, duration: 1, ease: 'power4.out', stagger: 0.18, scrollTrigger: { trigger: highlightsRef.current, start: 'top 85%', once: true } }
    )
  })

  /* CTA : la carte grandit, le fond se dézoome au scroll, le bouton rebondit */
  useGsap(ctaRef, () => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: ctaRef.current, start: 'top 80%', once: true } })
    tl.fromTo('.cta-card', { scale: 0.92, opacity: 0, transition: 'none' }, { scale: 1, opacity: 1, duration: 1, ease: 'power3.out', clearProps: 'all' })
      .fromTo('.cta-text > *', { x: -30, opacity: 0, transition: 'none' }, { x: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out', clearProps: 'all' }, '-=0.5')
      .fromTo('.cta-btn', { scale: 0.6, opacity: 0, transition: 'none' }, { scale: 1, opacity: 1, duration: 1, ease: 'elastic.out(1, 0.5)', clearProps: 'all' }, '-=0.3')

    gsap.fromTo(
      '.cta-bg',
      { scale: 1.15 },
      { scale: 1, ease: 'none', scrollTrigger: { trigger: ctaRef.current, start: 'top bottom', end: 'bottom top', scrub: true } }
    )
  })

  // Recalcule les positions une fois les images chargées
  useLayoutEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    const t = setTimeout(refresh, 600)
    return () => {
      window.removeEventListener('load', refresh)
      clearTimeout(t)
    }
  }, [])

  return (
    <>
      <main className="relative overflow-hidden w-full bg-[#D5E8E2] pt-0 pb-16 md:pb-24 flex flex-col items-center">
        <CircuitsHero />

        {/* Intro + filtres */}
        <section className={`${SECTION_WIDTH} mt-[50px] md:mt-[100px]`}>
          <div ref={introRef}>
            <div className="text-center mb-8 md:mb-12 flex flex-col items-center">
              <p className="intro-eyebrow mb-2 text-xs sm:text-sm md:text-base uppercase tracking-wide text-slate-700">
                {t('eyebrow')}
              </p>
              <h2 className={`intro-title ${SECTION_TITLE}`}>{t('heading')}</h2>
              <p className={`intro-sub ${SECTION_SUBTITLE} mt-4`}>
                {t('intro')}
              </p>
            </div>

            <div className="filter-panel rounded-3xl bg-white p-5 md:p-8 flex flex-col gap-6">
              <div>
                <p className="mb-3 text-sm md:text-base text-slate-700">{t('region')}</p>
                <div className="flex flex-wrap gap-3">
                  {regions.map((r) => (
                    <Chip key={r} active={region === r} onClick={() => setRegion(r)}>{regionLabel(r)}</Chip>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm md:text-base text-slate-700">{t('duration')}</p>
                <div className="flex flex-wrap gap-3">
                  {durations.map((d, i) => (
                    <Chip key={i} active={duration === i} onClick={() => setDuration(i)}>{t('durations')[i]}</Chip>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Grille de circuits */}
          <div ref={gridRef}>
            {status === 'loading' && (
              <div role="status" aria-label={t('loading')} className="mt-10 md:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-9">
                {[0, 1, 2].map((n) => (
                  <div key={n} className="rounded-xl bg-white p-3 animate-pulse">
                    <div className="aspect-[4/3] rounded-md bg-slate-200" />
                    <div className="mx-3 mt-6 h-4 w-1/3 rounded bg-slate-200" />
                    <div className="mx-3 mt-4 mb-6 h-6 w-3/4 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            )}
            {status === 'error' && (
              <div role="alert" className="mt-10 md:mt-16 rounded-3xl bg-white p-8 text-center text-slate-700">
                <p className="text-lg">{t('loadError')}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className={`mt-4 bg-[#084838] hover:bg-[#0a5c47] active:scale-95 transition text-white ${BUTTON}`}
                >
                  {t('reload')}
                </button>
              </div>
            )}
            {status === 'ready' && (visible.length > 0 ? (
              <div className="mt-10 md:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-9">
                {visible.map((circuit) => (
                  <CircuitCard key={circuit.slug} circuit={circuit} />
                ))}
              </div>
            ) : (
              <div role="status" className="mt-10 md:mt-16 rounded-3xl bg-white p-8 text-center text-slate-700">
                <p className="text-lg">{t('empty')}</p>
                <button
                  type="button"
                  onClick={() => { setRegion('All'); setDuration(0) }}
                  className={`mt-4 bg-[#084838] hover:bg-[#0a5c47] active:scale-95 transition text-white ${BUTTON}`}
                >
                  {t('reset')}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Points forts */}
        <section ref={highlightsRef} className={`${SECTION_WIDTH} mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6`}>
          {t('highlights').map((item) => (
            <div key={item.title} className="highlight rounded-3xl bg-white p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-medium text-forest">{item.title}</h3>
              <p className="mt-3 text-sm md:text-base text-slate-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </section>

        {/* Appel à l'action */}
        <section ref={ctaRef} className={`${SECTION_WIDTH} mt-16 md:mt-24`}>
          <div className="cta-card relative overflow-hidden rounded-3xl text-white">
            <img src={photo('circ.cta')} alt="" className="cta-bg absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-slate-950/70" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 md:p-12">
              <div className="cta-text max-w-2xl">
                <h2 className="text-2xl md:text-4xl font-medium leading-snug">{t('ctaTitle')}</h2>
                <p className="mt-3 text-sm md:text-base">{t('ctaText')}</p>
              </div>
              <a
                href="/contact"
                className={`cta-btn shrink-0 self-start md:self-center bg-[#C49849] hover:bg-[#a9813a] active:scale-95 transition text-white ${BUTTON} md:px-6 md:py-3`}
              >
                {t('ctaButton')}
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

export default Circuits