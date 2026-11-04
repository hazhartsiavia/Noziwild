import React, { useLayoutEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CARD, CARD_BODY, CARD_CHIP, CARD_CHIPS, CARD_FOOT, CARD_IMG, CARD_MEDIA, CARD_TITLE, CardMeta } from '../components/Card'
import PageHero from '../components/PageHero'
import AddToTrip from '../components/AddToTrip'
import { useT } from '../i18n/LanguageContext';
import { localize } from '../i18n/localize';
import OffersStatus from '../components/OffersStatus'
import { useOffers } from '../utils/useOffers'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { A } from '../i18n/router'

gsap.registerPlugin(ScrollTrigger)

/* Constantes partagées : mêmes valeurs que dans les autres pages */
const SECTION_WIDTH = "w-[90vw] lg:max-w-[90vw] xl:max-w-[95vw]"
const SECTION_TITLE = "text-[clamp(2rem,4.4vw,4rem)] font-bold text-forest leading-[1.08] tracking-tight"
const SECTION_SUBTITLE = "text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl"
const META_TEXT = "text-xs sm:text-sm"
const BADGE = "inline-block bg-[#C49849] text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm"
const BUTTON = "text-sm font-medium px-5 py-2.5 rounded-full md:px-6 md:py-3 active:scale-95 transition"
const SECTION_GAP = "mt-[60px] md:mt-[120px]"

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------------------------- Données ---------------------------- */
// Textes affichés : locales/<langue>/tickets.json, posés sur ces données par localize()

const CATEGORIES = [
  { id: 'all', label: 'All Tickets' },
  { id: 'parks', label: 'Parks & Reserves' },
  { id: 'sea', label: 'Sea & Boats' },
  { id: 'sites', label: 'Sites & Museums' },
  { id: 'events', label: 'Events & Shows' },
]

// Billets : dans la base, gérés depuis /admin/offers/ticket

const STEPS = [
  { id: 1, title: 'Pick your experience', text: 'Choose a park, boat trip, site or event and tell us the date.' },
  { id: 2, title: 'We reserve for you', text: 'We book your slot, pay fees locally and confirm within hours.' },
  { id: 3, title: 'Show your e-ticket', text: 'Your QR ticket arrives on your phone. Just scan at the entrance.' },
]


/* ---------------------------- Icônes ----------------------------- */

const Svg = ({ children, className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)
const ArrowIcon = () => <Svg className="w-5 h-5"><path d="M5 12h14M13 6l6 6-6 6" /></Svg>
const CheckIcon = () => <Svg className="w-4 h-4"><path d="M20 6 9 17l-5-5" /></Svg>
const PinIcon = () => <Svg><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></Svg>

/* -------------------------- Composants --------------------------- */

// Faux QR code (décoratif) : 9x9 avec trois coins repères
function Qr({ className = '' }) {
  const size = 9
  const cells = Array.from({ length: size * size }, (_, i) => {
    const r = Math.floor(i / size), c = i % size
    const finder = (r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3)
    return finder || (i * 7 + r * 3) % 5 < 2
  })
  return (
    <div className={`grid grid-cols-9 gap-[3px] rounded-xl bg-white p-3 ${className}`} aria-hidden="true">
      {cells.map((on, i) => <span key={i} className={`aspect-square rounded-[2px] ${on ? 'bg-[#074636]' : 'bg-transparent'}`} />)}
    </div>
  )
}

// Carte en forme de billet : photo, infos, souche
function TicketCard({ t }) {
  return (
    <article className={CARD}>
      <div className={CARD_MEDIA}>
        <img src={t.image} alt={t.name} className={CARD_IMG} />
      </div>
      <div className={CARD_BODY}>
        <CardMeta items={[t.place]} />
        <h3 className={CARD_TITLE}>{t.name}</h3>
        <ul className={CARD_CHIPS}>
          {t.perks.map((p) => <li key={p} className={CARD_CHIP}>{p}</li>)}
        </ul>
        <div className={`${CARD_FOOT} justify-end`}>
          <AddToTrip variant="icon" item={{ kind: 'ticket', ref: String(t.id), title: t.name, image: t.image, link: '/ticket-reservation', details: t.place, price: t.price, unit: 'person' }} />
        </div>
      </div>
    </article>
  )
}

// Offre de la base -> forme utilisée par les billets
const toTicket = (o) => ({ id: o.id, category: o.category, name: o.title, place: o.place, price: o.price, image: o.image, perks: o.perks })

function Browse() {
  const tr = useT('tickets')
  const categories = localize(CATEGORIES, tr('categories'))
  const { offers, status } = useOffers('ticket')
  const tickets = offers.map(toTicket)
  const [category, setCategory] = useState('all')
  const gridRef = useRef(null)
  const first = useRef(true)
  const list = category === 'all' ? tickets : tickets.filter((t) => t.category === category)

  useLayoutEffect(() => {
    if (first.current) { first.current = false; return }
    if (!gridRef.current || prefersReducedMotion()) return
    gsap.from(gridRef.current.children, { y: 24, opacity: 0, duration: 0.45, ease: 'power3.out', stagger: 0.06, clearProps: 'transform,opacity' })
  }, [category])

  return (
    <div id="tickets" className={`${SECTION_GAP} scroll-mt-8`}>
      <div className="mb-8 md:mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-12">
        <h2 className={`${SECTION_TITLE} lg:max-w-[52%]`}>{tr('findTitle')}</h2>
        <p className={`${SECTION_SUBTITLE} lg:max-w-md`}>{tr('findText')}</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2 md:gap-3" role="tablist" aria-label={tr('tabsLabel')}>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={category === c.id}
            onClick={() => setCategory(c.id)}
            className={`rounded-full px-5 py-2 text-sm md:text-base font-medium transition ${category === c.id ? 'bg-[#074636] text-white' : 'bg-white text-slate-700 hover:bg-white/70'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <OffersStatus status={status} empty={list.length === 0} />
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-9">
        {list.map((t) => <TicketCard key={t.id} t={t} />)}
      </div>
    </div>
  )
}

// Comment ça marche : 3 étapes reliées par une ligne pointillée
function HowItWorks() {
  const t = useT('tickets')
  const steps = localize(STEPS, t('steps'))
  return (
    <div className={SECTION_GAP}>
      <h2 className={`${SECTION_TITLE} text-center mb-10 md:mb-16`}>{t('stepsTitle')}</h2>
      <ol data-stagger className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
        <span className="hidden md:block absolute left-[17%] right-[17%] top-8 border-t-2 border-dashed border-[#074636]/30" aria-hidden="true" />
        {steps.map((s) => (
          <li key={s.id} className="relative flex flex-col items-center text-center">
            <span className="w-16 h-16 rounded-full bg-[#C49849] text-white text-2xl font-medium flex items-center justify-center ring-8 ring-[#D5E8E2]">{s.id}</span>
            <h3 className="mt-6 text-xl md:text-2xl font-bold text-forest">{s.title}</h3>
            <p className="mt-2 max-w-xs text-sm md:text-base text-slate-600 leading-relaxed">{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

// Téléphone avec e-ticket + avantages
function AppSection() {
  const t = useT('tickets')
  return (
    <div className={`${SECTION_GAP} grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center`}>
      <div className="mx-auto w-[280px] md:w-[300px]">
        <div data-bob className="rounded-[2.5rem] border-[10px] border-[#074636] bg-white p-4 shadow-xl">
          <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-slate-200" />
          <div className="rounded-2xl bg-[#D5E8E2] p-4 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#074636] px-3 py-1 text-xs text-white"><CheckIcon /> {t('confirmed')}</span>
            <p className="mt-3 text-lg font-medium text-slate-900">{t('phoneTitle')}</p>
            <p className={`${META_TEXT} text-slate-600`}>{t('phoneMeta')}</p>
            <Qr className="mx-auto mt-4 w-40" />
            <p className={`mt-3 ${META_TEXT} text-slate-600`}>{t('phoneScan')}</p>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs sm:text-sm md:text-base uppercase tracking-wide text-slate-700">{t('whyEyebrow')}</p>
        <h2 className={SECTION_TITLE}>{t('whyTitle')}</h2>
        <ul className="mt-8 flex flex-col gap-4">
          {t('benefits').map((b) => (
            <li key={b} className="flex items-center gap-4 text-base md:text-xl text-slate-800">
              <span className="shrink-0 w-8 h-8 rounded-full bg-[#074636] text-white flex items-center justify-center"><CheckIcon /></span>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// FAQ : toutes les réponses visibles, en grille de petites cartes
function Faq() {
  const t = useT('tickets')
  return (
    <div className={SECTION_GAP}>
      <div className="mb-8 md:mb-12 text-center">
        <h2 className={SECTION_TITLE}>{t('faqTitle')}</h2>
        <p className={`mt-4 mx-auto ${SECTION_SUBTITLE}`}>{t('faqText')}</p>
      </div>
      <div data-stagger className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {t('faqs').map((f, i) => (
          <article key={f.q} className="rounded-2xl bg-white p-6 md:p-7">
            <span className="w-9 h-9 rounded-full bg-[#C49849] text-white text-sm font-medium flex items-center justify-center">{i + 1}</span>
            <h3 className="mt-4 text-lg md:text-xl font-bold text-forest leading-snug">{f.q}</h3>
            <p className="mt-2 text-sm md:text-base text-slate-600 leading-relaxed">{f.a}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

// CTA : bandeau en forme de billet
function Cta() {
  const t = useT('tickets')
  const notch = "absolute w-8 h-8 rounded-full bg-[#D5E8E2]"
  return (
    <div className={`${SECTION_GAP} relative overflow-hidden rounded-3xl bg-[#C49849] text-white grid grid-cols-1 md:grid-cols-[1fr_auto]`}>
      <div className="p-6 md:p-12">
        <h2 className="text-[clamp(2rem,4.4vw,4rem)] font-bold leading-[1.08] tracking-tight">{t('ctaTitle')}</h2>
        <p className="mt-3 max-w-xl text-sm md:text-lg text-white/90 leading-relaxed">{t('ctaText')}</p>
      </div>
      <div className="relative flex items-center justify-center p-6 md:p-12 border-t-2 md:border-t-0 md:border-l-2 border-dashed border-white/50">
        <span className={`${notch} -top-4 -left-4 md:left-[-16px]`} />
        <span className={`${notch} -top-4 -right-4 md:top-auto md:right-auto md:-bottom-4 md:-left-4`} />
        <A href="/contact" className={`inline-flex items-center gap-3 bg-[#074636] hover:bg-[#0a5c47] text-white ${BUTTON}`}>{t('ctaButton')} <ArrowIcon /></A>
      </div>
    </div>
  )
}

function TicketsReservations() {
  const t = useT('tickets')
  const contentRef = useRef(null)

  useLayoutEffect(() => {
    // Pas d'animation si l'utilisateur a demandé moins de mouvement
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      // Le téléphone flotte doucement
      gsap.to('[data-bob]', { y: -10, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 })

      // Chaque section apparaît en remontant
      Array.from(contentRef.current.children).forEach((el) => {
        gsap.from(el, { y: 50, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
      })

      // Les étapes et les cartes de la FAQ arrivent l'une après l'autre
      gsap.utils.toArray('[data-stagger]').forEach((grid) => {
        gsap.from(grid.children, { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12, scrollTrigger: { trigger: grid, start: 'top 88%', once: true } })
      })
    }, contentRef)

    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    return () => { window.removeEventListener('load', refresh); ctx.revert() }
  }, [])

  return (
    <>
    <section className="w-full pt-0 pb-12 md:pb-20 bg-[#D5E8E2] flex flex-col items-center">
      <Navbar />
      <PageHero slot="tickets.hero" title={t('title')} crumb={t('badge')} text={t('intro')} moreHref="#tickets" moreLabel={t('browse')} />
      <div ref={contentRef} className={SECTION_WIDTH}>
        <Browse />
        <HowItWorks />
        <AppSection />
        <Faq />
        <Cta />
      </div>
    </section>
    <Footer />
    </>
  )
}

export default TicketsReservations