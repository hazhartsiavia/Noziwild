import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link, A } from '../i18n/router'
import NosyIranja from '../assets/images/NosyIranja.jpg'
import Ambanja from '../assets/images/Ambanja.jpg'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { CARD, CARD_BADGE, CARD_BODY, CARD_IMG, CARD_MEDIA, CARD_TITLE, CardMeta } from '../components/Card'
import PageHero from '../components/PageHero'
import PageCta, { PAGE_CTA_GOLD, PAGE_CTA_GHOST } from '../components/PageCta'
import { fetchCircuits, assetUrl } from '../api'
import { useLanguage, useT } from '../i18n/LanguageContext'

gsap.registerPlugin(ScrollTrigger)

/* Constantes partagées : mêmes valeurs que Blog et Contact */
const SECTION_WIDTH = 'w-[90vw] lg:max-w-[95vw]'
const SECTION_TITLE = 'text-[clamp(2rem,4.4vw,4rem)] font-bold text-forest leading-[1.08] tracking-tight'
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

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`chip rounded-full border px-4 py-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2 ${
        active
          ? 'bg-[#074636] border-[#074636] text-white'
          : 'bg-white border-slate-300 text-slate-700 hover:border-slate-500'
      }`}
    >
      {children}
    </button>
  )
}

function CircuitCard({ circuit }) {
  const t = useT('circuits')
  return (
    <Link to={`/circuits/${circuit.slug}`} className={`circuit-card ${CARD}`}>
      <div className={CARD_MEDIA}>
        <img src={assetUrl(circuit.image)} alt={circuit.title} className={CARD_IMG} />
        <span className={`circuit-badge ${CARD_BADGE}`}>{t('days', { count: circuit.days })}</span>
      </div>
      <div className={CARD_BODY}>
        <CardMeta items={[circuit.regionLabel || circuit.region, circuit.level]} />
        <h3 className={`${CARD_TITLE} group-hover:underline`}>{circuit.title}</h3>
        <p className={`mt-3 ${META_TEXT} text-slate-600`}>{circuit.stops}</p>
      </div>
    </Link>
  )
}

function Circuits() {
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
      <main className="relative overflow-hidden w-full bg-[#D5E8E2] flex flex-col items-center">
        <Navbar />
        <PageHero slot="circ.hero" title={t('title')} crumb={t('crumb')} />

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
                  className={`mt-4 bg-[#074636] hover:bg-[#0a5c47] active:scale-95 transition text-white ${BUTTON}`}
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
                  className={`mt-4 bg-[#074636] hover:bg-[#0a5c47] active:scale-95 transition text-white ${BUTTON}`}
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
              <h3 className="text-xl md:text-2xl font-bold text-forest">{item.title}</h3>
              <p className="mt-3 text-sm md:text-base text-slate-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </section>

        {/* Appel à l'action */}
        <PageCta slot="circ.cta" title={t('ctaTitle')} text={t('ctaText')}>
          <A href="/contact" className={PAGE_CTA_GOLD}>{t('ctaButton')}</A>
        </PageCta>
      </main>

      <Footer />
    </>
  )
}

export default Circuits