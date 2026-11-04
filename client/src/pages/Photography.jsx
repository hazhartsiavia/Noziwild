import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Ambanja from "../assets/images/Ambanja.jpg";
import NosyLonjo from "../assets/images/NosyLonjo.jpg";
import NosyIranja from "../assets/images/NosyIranja.jpg";
import Ramena from "../assets/images/Ramena.jpg";
import Tana from "../assets/images/Tana.jpg";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero'
import PageCta, { PAGE_CTA_GOLD, PAGE_CTA_GHOST } from '../components/PageCta'
import AddToTrip from '../components/AddToTrip'
import { useT } from '../i18n/LanguageContext';
import { localize } from '../i18n/localize';
import OffersStatus from '../components/OffersStatus'
import { useOffers } from '../utils/useOffers'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePhoto } from '../sitePhotos'
import { A } from '../i18n/router'

gsap.registerPlugin(ScrollTrigger)

/* Constantes partagées : mêmes valeurs que dans les autres pages */
const SECTION_WIDTH = "w-[90vw] lg:max-w-[90vw] xl:max-w-[95vw]"
const SECTION_TITLE = "text-[clamp(2rem,4.4vw,4rem)] font-bold text-forest leading-[1.08] tracking-tight"
const SECTION_SUBTITLE = "text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl"
const META_TEXT = "text-xs sm:text-sm"
const STATEMENT_TITLE = "text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-medium uppercase leading-[1.15] tracking-tight text-forest"
const BADGE = "inline-block bg-[#C49849] text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm"
const BUTTON = "text-sm font-medium px-5 py-2.5 rounded-full md:px-6 md:py-3 active:scale-95 transition"
const SECTION_GAP = "mt-[60px] md:mt-[120px]"

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------------------------- Données ---------------------------- */
// Textes affichés : locales/<langue>/photography.json, posés sur ces données par localize()

const CATEGORIES = [
  { id: 'all', label: 'All Photos' },
  { id: 'landscape', label: 'Landscapes' },
  { id: 'people', label: 'People' },
  { id: 'sea', label: 'Sea' },
  { id: 'wildlife', label: 'Wildlife' },
]

// Photos de la galerie et séances : dans la base, gérées depuis /admin/offers/photo et /admin/offers/session
// Forme d'une photo dans la mosaïque (réglage « Shape » de l'admin)
const RATIOS = { landscape: 'aspect-[4/3]', portrait: 'aspect-[3/4]', tall: 'aspect-[4/5]', square: 'aspect-square' }

const STEPS = [
  { id: 1, title: 'Tell us your plan', text: 'Dates, places and the kind of pictures you love.' },
  { id: 2, title: 'We shoot', text: 'Your photographer joins you and keeps things relaxed.' },
  { id: 3, title: 'We edit', text: 'Every photo is selected, retouched and colour-matched.' },
  { id: 4, title: 'You receive', text: 'A private online gallery, ready to download and share.' },
]

const KEEPSAKES = [
  { id: 1, title: 'Fine-Art Prints', text: 'Museum-quality paper, sizes from A5 to A2.' },
  { id: 2, title: 'Photo Book', text: 'Your story in 30 pages, hand-checked and bound.' },
  { id: 3, title: 'Framed Canvas', text: 'Your best shot, ready to hang on the wall.' },
  { id: 4, title: 'Digital Gallery', text: 'Private link and USB key with all your photos.' },
]


/* ---------------------------- Icônes ----------------------------- */

const Svg = ({ children, className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)
const ArrowIcon = () => <Svg className="w-5 h-5"><path d="M5 12h14M13 6l6 6-6 6" /></Svg>
const CloseIcon = () => <Svg className="w-6 h-6"><path d="M18 6 6 18M6 6l12 12" /></Svg>

/* -------------------------- Composants --------------------------- */

// Lightbox : photo en grand, flèches, Échap pour fermer (rendue dans <body>)
function Lightbox({ items, index, onClose, onStep }) {
  const t = useT('photography')
  const closeRef = useRef(null)
  const imgRef = useRef(null)
  const item = items[index]

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onStep(-1)
      if (e.key === 'ArrowRight') onStep(1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (!imgRef.current || prefersReducedMotion()) return
    gsap.fromTo(imgRef.current, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' })
  }, [index])

  const nav = "absolute top-1/2 -translate-y-1/2 w-11 h-11 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition"

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={t('viewer')} className="fixed inset-0 z-50 bg-[#072a1f]/90 flex items-center justify-center p-4 md:p-10" onClick={onClose}>
      <button ref={closeRef} type="button" onClick={onClose} aria-label={t('close')} className="absolute right-4 top-4 md:right-8 md:top-8 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition">
        <CloseIcon />
      </button>
      <button type="button" onClick={(e) => { e.stopPropagation(); onStep(-1) }} aria-label={t('previous')} className={`${nav} left-3 md:left-8`}>
        <span className="rotate-180"><ArrowIcon /></span>
      </button>
      <button type="button" onClick={(e) => { e.stopPropagation(); onStep(1) }} aria-label={t('next')} className={`${nav} right-3 md:right-8`}>
        <ArrowIcon />
      </button>

      <figure className="max-w-5xl max-h-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <img ref={imgRef} src={item.image} alt={item.caption} className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain" />
        <figcaption className="mt-4 text-center text-white">
          <span className="block text-base md:text-lg">{item.caption}</span>
          <span className="block text-sm text-white/60 tabular-nums">{String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
        </figcaption>
      </figure>
    </div>,
    document.body
  )
}

// Galerie en mosaïque avec filtres et lightbox
function Gallery() {
  const t = useT('photography')
  const categories = localize(CATEGORIES, t('categories'))
  const { offers, status } = useOffers('photo')
  const photos = offers.map((o) => ({ id: o.id, category: o.category, image: o.image, ratio: RATIOS[o.ratio] || RATIOS.landscape, caption: o.title }))
  const [category, setCategory] = useState('all')
  const [open, setOpen] = useState(null) // index dans la liste filtrée, ou null
  const gridRef = useRef(null)
  const first = useRef(true)

  const list = category === 'all' ? photos : photos.filter((p) => p.category === category)

  // Les photos réapparaissent en cascade au changement de filtre
  useLayoutEffect(() => {
    if (first.current) { first.current = false; return }
    if (!gridRef.current || prefersReducedMotion()) return
    gsap.from(gridRef.current.children, { y: 30, opacity: 0, duration: 0.5, ease: 'power3.out', stagger: 0.06, clearProps: 'transform,opacity' })
  }, [category])

  const step = (delta) => setOpen((i) => (i === null ? i : (i + delta + list.length) % list.length))

  const tab = (active) =>
    `rounded-full px-5 py-2 text-sm md:text-base font-medium transition ${active ? 'bg-[#074636] text-white' : 'bg-white text-slate-700 hover:bg-white/70'}`

  return (
    <div id="gallery" className={`${SECTION_GAP} scroll-mt-8`}>
      <div className="mb-8 md:mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 lg:gap-12">
        <h2 className={`${SECTION_TITLE} lg:max-w-[52%]`}>{t('galleryTitle')}</h2>
        <p className={`${SECTION_SUBTITLE} lg:max-w-md`}>{t('galleryText')}</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2 md:gap-3" role="tablist" aria-label={t('tabsLabel')}>
        {categories.map((c) => (
          <button key={c.id} type="button" role="tab" aria-selected={category === c.id} onClick={() => setCategory(c.id)} className={tab(category === c.id)}>
            {c.label}
          </button>
        ))}
      </div>

      <OffersStatus status={status} empty={list.length === 0} />
      <div ref={gridRef} className="columns-2 lg:columns-3 gap-3 md:gap-5">
        {list.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={t('open', { caption: p.caption })}
            className="group relative mb-3 md:mb-5 block w-full break-inside-avoid overflow-hidden rounded-2xl"
          >
            <img src={p.image} alt={p.caption} className={`w-full ${p.ratio} object-cover transition-transform duration-700 group-hover:scale-105`} />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#072a1f]/70 to-transparent p-4 text-left text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
              {p.caption}
            </span>
          </button>
        ))}
      </div>

      {open !== null && <Lightbox items={list} index={open} onClose={() => setOpen(null)} onStep={step} />}
    </div>
  )
}

// Séances : liste en lignes (durée, photos, délai)
function Sessions() {
  const t = useT('photography')
  const { offers, status } = useOffers('session')
  const sessions = offers.map((o) => ({ id: o.id, name: o.title, text: o.text, duration: o.duration, photos: o.photos, delivery: o.delivery, price: o.price, image: o.image }))
  return (
    <div id="sessions" className={`${SECTION_GAP} scroll-mt-8`}>
      <div className="mb-8 md:mb-12 text-center">
        <h2 className={SECTION_TITLE}>{t('sessionsTitle')}</h2>
        <p className={`mt-4 mx-auto ${SECTION_SUBTITLE}`}>{t('sessionsText')}</p>
      </div>

      <OffersStatus status={status} empty={sessions.length === 0} />
      <ul className="border-t border-[#074636]/20">
        {sessions.map((s, i) => (
          <li key={s.id} className="border-b border-[#074636]/20">
            <div className="group grid grid-cols-1 lg:grid-cols-[60px_1.4fr_1.6fr_40px] items-center gap-3 lg:gap-8 py-6 md:py-8 px-2 md:px-4 transition hover:bg-white/60 rounded-2xl">
              <span className="text-sm md:text-lg tabular-nums text-[#9a742f]">{String(i + 1).padStart(2, '0')}</span>

              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-forest tracking-tight">{s.name}</h3>
                <p className="mt-1 text-sm md:text-base text-slate-600">{s.text}</p>
              </div>

              <ul className="flex flex-wrap gap-2">
                {[s.duration, s.photos, t('delivered', { delay: s.delivery })].map((m) => (
                  <li key={m} className="rounded-full border border-slate-400 px-3 py-1 text-xs md:text-sm text-slate-700">{m}</li>
                ))}
              </ul>


              <AddToTrip variant="icon" item={{ kind: 'photo', ref: String(s.id), title: s.name, image: s.image || undefined, link: '/photography', details: [s.duration, s.photos].join(' · '), price: s.price, unit: 'unit' }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Comparateur avant / après (le curseur s'ouvre tout seul au défilement)
function BeforeAfter() {
  const photo = usePhoto()
  const t = useT('photography')
  const steps = localize(STEPS, t('steps'))
  const [pos, setPos] = useState(() => (prefersReducedMotion() ? 50 : 100)) // % de la photo "après" visible
  const boxRef = useRef(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const counter = { v: 100 }
    const tween = gsap.to(counter, {
      v: 50, duration: 1.6, ease: 'power3.inOut',
      scrollTrigger: { trigger: boxRef.current, start: 'top 75%', once: true },
      onUpdate: () => setPos(counter.v),
    })
    return () => { tween.scrollTrigger?.kill(); tween.kill() }
  }, [])

  return (
    <div className={`${SECTION_GAP} grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-center`}>
      <div>
        <p className="mb-3 text-xs sm:text-sm md:text-base uppercase tracking-wide text-slate-700">{t('editEyebrow')}</p>
        <h2 className={SECTION_TITLE}>{t('editTitle')}</h2>
        <ol className="mt-8 flex flex-col gap-5">
          {steps.map((s) => (
            <li key={s.id} className="flex items-start gap-4">
              <span className="shrink-0 w-9 h-9 rounded-full bg-[#C49849] text-white flex items-center justify-center text-sm font-medium">{s.id}</span>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-forest">{s.title}</h3>
                <p className="mt-1 text-sm md:text-base text-slate-600 leading-relaxed">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div ref={boxRef} className="relative aspect-[4/3] overflow-hidden rounded-3xl select-none">
        {/* Avant : photo terne */}
        <img src={photo('photo.edit')} alt={t('beforeAlt')} className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'saturate(0.45) contrast(0.85) brightness(0.9)' }} />
        {/* Après : photo retouchée, révélée par le curseur */}
        <img src={photo('photo.edit')} alt={t('afterAlt')} className="absolute inset-0 w-full h-full object-cover" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} />

        <span className="absolute left-4 top-4 rounded-full bg-[#074636] px-3 py-1 text-xs md:text-sm text-white">{t('after')}</span>
        <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs md:text-sm text-slate-800">{t('before')}</span>

        <div className="absolute inset-y-0 w-0.5 bg-white pointer-events-none" style={{ left: `${pos}%` }}>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center text-[#074636]">
            <Svg className="w-5 h-5"><path d="m9 6-6 6 6 6M15 6l6 6-6 6" /></Svg>
          </span>
        </div>

        <input
          type="range" min="0" max="100" step="0.5" value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label={t('compare')}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        />
      </div>
    </div>
  )
}

// Souvenirs à ramener chez soi : bande verte en colonnes
function Keepsakes() {
  const t = useT('photography')
  const keepsakes = localize(KEEPSAKES, t('keepsakes'))
  return (
    <div className={`${SECTION_GAP} rounded-3xl bg-[#074636] text-white p-6 md:p-12`}>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 lg:gap-12">
        <h2 className="text-[clamp(2rem,4.4vw,4rem)] font-bold leading-[1.08] tracking-tight lg:max-w-[45%]">{t('keepTitle')}</h2>
        <p className="text-sm md:text-lg text-white/75 leading-relaxed lg:max-w-md">{t('keepText')}</p>
      </div>

      <ul className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {keepsakes.map((k, i) => (
          <li key={k.id} className={`py-6 lg:py-2 lg:px-8 border-t border-white/20 lg:border-t-0 ${i > 0 ? 'lg:border-l lg:border-white/20' : 'lg:pl-0'}`}>
            <h3 className="text-xl md:text-2xl font-bold">{k.title}</h3>
            <p className="mt-3 text-sm md:text-base text-white/70 leading-relaxed">{k.text}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

// FAQ : questions en cartes blanches à gauche, titre à droite
function Faq() {
  const t = useT('photography')
  const faqs = t('faqs')
  const [open, setOpen] = useState(0)

  return (
    <div className={`${SECTION_GAP} grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8 lg:gap-16`}>
      <div className="lg:order-2">
        <h2 className={SECTION_TITLE}>{t('faqTitle')}</h2>
        <p className={`mt-4 md:mt-6 ${SECTION_SUBTITLE}`}>{t('faqText')}</p>
      </div>

      <div className="flex flex-col gap-3 lg:order-1">
        {faqs.map((f, i) => {
          const isOpen = open === i
          return (
            <div key={f.q} className="rounded-2xl bg-white">
              <button type="button" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="w-full flex items-center justify-between gap-4 text-left p-5 md:p-6">
                <span className="text-base md:text-xl font-medium text-slate-900">{f.q}</span>
                <Svg className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}><path d="M12 5v14M5 12h14" /></Svg>
              </button>
              {isOpen && <p className="px-5 md:px-6 pb-5 md:pb-6 -mt-1 text-sm md:text-base leading-relaxed text-slate-600">{f.a}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Photography() {
  const t = useT('photography')
  const contentRef = useRef(null)

  useLayoutEffect(() => {
    // Pas d'animation si l'utilisateur a demandé moins de mouvement
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      // Chaque section apparaît en remontant quand elle entre dans l'écran
      Array.from(contentRef.current.children).forEach((el) => {
        gsap.from(el, {
          y: 50, opacity: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })
    }, contentRef)

    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)

    return () => {
      window.removeEventListener('load', refresh)
      ctx.revert()
    }
  }, [])

  return (
    <>
    <section className="w-full overflow-x-clip bg-[#D5E8E2] flex flex-col items-center">
      <Navbar />
      <PageHero slot="photo.hero.1" title={t('title')} crumb={t('badge')} text={t('intro')} moreHref="#gallery" moreLabel={t('seeGallery')} />
      <div ref={contentRef} className={SECTION_WIDTH}>
        <Gallery />
        <Sessions />
        <BeforeAfter />
        <Keepsakes />
        <Faq />
      </div>
      <PageCta slot="photo.cta" title={t('ctaTitle')} text={t('ctaText')} floats={['photo.hero.2', 'photo.hero.3', 'photo.hero.4']}>
        <A href="/contact" className={PAGE_CTA_GOLD}>{t('ctaBook')}</A>
        <A href="#gallery" className={PAGE_CTA_GHOST}>{t('ctaBack')}</A>
      </PageCta>
    </section>
    <Footer />
    </>
  )
}

export default Photography