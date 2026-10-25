import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Deux from "../assets/images/2.jpg";
import Ambanja from "../assets/images/Ambanja.png";
import NosyLonjo from "../assets/images/NosyLonjo.png";
import NosyIranja from "../assets/images/NosyIranja.png";
import Ramena from "../assets/images/Ramena.png";
import Tana from "../assets/images/Tana.png";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useTrip } from '../context/TripContext';
import { useTripItem } from '../components/AddToTrip';
import { sendRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { Trans, useLanguage, useT } from '../i18n/LanguageContext';
import { formatPrice } from '../utils/format';
import { localize } from '../i18n/localize';
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* Constantes partagées : mêmes valeurs que dans les autres pages */
const SECTION_WIDTH = "w-[90vw] lg:max-w-[90vw] xl:max-w-[95vw]"
const SECTION_TITLE = "text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-forest leading-[1.15] tracking-tight"
const SECTION_SUBTITLE = "text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl"
const META_TEXT = "text-xs sm:text-sm"
const STATEMENT_TITLE = "text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-medium uppercase leading-[1.15] tracking-tight text-forest"
const BUTTON = "text-sm font-medium px-5 py-2.5 rounded-full md:px-6 md:py-3 active:scale-95 transition"
const SECTION_GAP = "mt-[60px] md:mt-[120px]"

/* ---------------------------- Données ---------------------------- */
// Textes affichés : locales/<langue>/equipment.json, posés sur ces données par localize()

const CATEGORIES = [
  { id: 'all', label: 'All Gear' },
  { id: 'water', label: 'Water' },
  { id: 'trek', label: 'Trek & Camp' },
  { id: 'ride', label: 'Ride' },
  { id: 'optics', label: 'Photo & Optics' },
]

// price = prix par jour (exemples, à adapter à tes vrais tarifs)
const GEAR = [
  { id: 1, category: 'water', name: 'Snorkel Set', image: Ramena, price: 6, specs: ['Mask + fins + snorkel', 'All sizes'], text: 'Clean, well-fitted gear for reefs and calm bays.' },
  { id: 2, category: 'water', name: 'Double Kayak', image: NosyIranja, price: 25, specs: ['2 persons', 'Paddles + vests'], text: 'Stable and easy to handle, ideal for calm coastal water.' },
  { id: 3, category: 'water', name: 'Stand-Up Paddle Board', image: NosyLonjo, price: 20, specs: ['Inflatable', 'Pump + paddle'], text: 'Explore quiet lagoons at your own pace.' },
  { id: 4, category: 'trek', name: 'Trekking Backpack 50L', image: Deux, price: 6, specs: ['50 L', 'Rain cover'], text: 'Comfortable carry for multi-day walks and short treks.' },
  { id: 5, category: 'trek', name: '2-Person Tent', image: Tana, price: 15, specs: ['2 persons', 'Waterproof'], text: 'Light, quick to pitch and ready for rainy nights.' },
  { id: 6, category: 'ride', name: 'Mountain Bike', image: Ambanja, price: 12, specs: ['21 speeds', 'Helmet included'], text: 'Discover villages and coastal roads on two wheels.' },
  { id: 7, category: 'ride', name: 'Scooter 125cc', image: Ramena, price: 20, specs: ['Licence required', 'Helmet included'], text: 'Freedom to explore, with insurance and a full tank at pickup.' },
  { id: 8, category: 'optics', name: 'Binoculars 8x42', image: Tana, price: 5, specs: ['8x42', 'Neck strap + case'], text: 'Bright and sharp, perfect for birds and lemurs.' },
  { id: 9, category: 'optics', name: 'Waterproof Camera', image: NosyIranja, price: 18, specs: ['4K video', '64 GB card'], text: 'Capture snorkeling and boat trips without worry.' },
]

const ARCHES = [
  { id: 'water', label: 'Water', image: Ramena },
  { id: 'trek', label: 'Trek & Camp', image: Deux },
  { id: 'ride', label: 'Ride', image: Ambanja },
  { id: 'optics', label: 'Photo & Optics', image: Tana },
]

const PICKUPS = [
  { id: 1, title: 'Pick Up At Our Office', text: 'Collect and return your gear at our Antananarivo office, open every day.', price: 'Free', icon: 'pin' },
  { id: 2, title: 'Hotel Delivery', text: 'We bring the gear to your hotel and collect it at the end of your stay.', price: 'From €5', icon: 'truck' },
  { id: 3, title: 'Airport Handover', text: 'Meet us at arrivals with your gear ready. Return it before you fly.', price: 'From €10', icon: 'plane' },
]


/* ---------------------------- Icônes ----------------------------- */

const Svg = ({ children, className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)
const ArrowIcon = () => <Svg className="w-5 h-5"><path d="M5 12h14M13 6l6 6-6 6" /></Svg>
const PlusIcon = () => <Svg><path d="M12 5v14M5 12h14" /></Svg>
const MinusIcon = () => <Svg><path d="M5 12h14" /></Svg>
const CheckIcon = () => <Svg className="w-4 h-4"><path d="M20 6 9 17l-5-5" /></Svg>
const pickupIcons = {
  pin: <Svg className="w-6 h-6"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></Svg>,
  truck: <Svg className="w-6 h-6"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></Svg>,
  plane: <Svg className="w-6 h-6"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" /></Svg>,
}

/* -------------------------- Composants --------------------------- */

// Prix qui s'anime doucement quand sa valeur change (GSAP), en euros dans la langue du site
function AnimatedPrice({ value, lang }) {
  const ref = useRef(null)
  const shown = useRef(value)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = formatPrice(value, lang)
      shown.current = value
      return
    }
    const counter = { v: shown.current }
    const tween = gsap.to(counter, {
      v: value, duration: 0.5, ease: 'power2.out',
      onUpdate: () => { shown.current = counter.v; el.textContent = formatPrice(Math.round(counter.v), lang) },
    })
    return () => tween.kill()
  }, [value, lang])

  return <span ref={ref}>{formatPrice(value, lang)}</span>
}

// Hero : titre + arches cliquables (filtrent le catalogue)
function Hero({ counts, onPick }) {
  const t = useT('equipment')
  const arches = localize(ARCHES, t('arches'))
  return (
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-16 lg:items-end">
        <div>
          <p data-hero className="mb-4 text-xs sm:text-sm md:text-base uppercase tracking-wide text-slate-700">{t('eyebrow')}</p>
          <h1 data-hero className={STATEMENT_TITLE}>{t('title')}</h1>
        </div>
        <div data-hero>
          <p className={SECTION_SUBTITLE}>
            {t('intro')}
          </p>
          <a href="#catalog" className={`mt-6 inline-block bg-[#084838] hover:bg-[#0a5c47] text-white ${BUTTON}`}>{t('browse')}</a>
        </div>
      </div>

      <ul className="mt-10 md:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {arches.map((a, i) => (
          <li key={a.id} data-arch>
            <a href="#catalog" onClick={() => onPick(a.id)} className="group block">
              <div className="aspect-[3/4] overflow-hidden rounded-t-[999px] rounded-b-3xl">
                <img src={a.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg md:text-2xl font-medium text-slate-900">{a.label}</p>
                  <p className={`${META_TEXT} text-slate-600`}>{counts[a.id] === 1 ? t('itemOne') : t('items', { count: counts[a.id] })}</p>
                </div>
                <span className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#084838] text-white flex items-center justify-center transition group-hover:bg-[#C49849]">
                  <ArrowIcon />
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

function GearCard({ item, qty, onChange }) {
  const t = useT('equipment')
  const { lang } = useLanguage()
  const label = localize(CATEGORIES, t('categories')).find((c) => c.id === item.category)?.label
  const round = "w-9 h-9 flex items-center justify-center rounded-full transition active:scale-95"

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-800">{label}</span>
      </div>
      <div className="flex flex-col flex-1 p-4 md:p-5">
        <h3 className="text-lg md:text-xl font-medium text-forest">{item.name}</h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.text}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {item.specs.map((s) => <li key={s} className="rounded-full bg-[#D5E8E2] px-3 py-1 text-xs text-slate-700">{s}</li>)}
        </ul>

        <div className="mt-auto pt-5 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600"><Trans text={t('perDay')} values={{ price: <span className="text-xl md:text-2xl font-medium text-slate-900">{formatPrice(item.price, lang)}</span> }} /></p>

          {qty === 0 ? (
            <button type="button" onClick={() => onChange(item.id, 1)} className={`inline-flex items-center gap-1.5 bg-[#084838] hover:bg-[#0a5c47] text-white text-sm font-medium px-4 py-2 rounded-full active:scale-95 transition`}>
              <PlusIcon /> {t('add')}
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-full bg-[#D5E8E2] p-1">
              <button type="button" onClick={() => onChange(item.id, -1)} aria-label={t('removeOne', { name: item.name })} className={`${round} bg-white text-[#084838]`}><MinusIcon /></button>
              <span className="w-5 text-center text-sm font-medium tabular-nums" aria-live="polite">{qty}</span>
              <button type="button" onClick={() => onChange(item.id, 1)} aria-label={t('addOne', { name: item.name })} className={`${round} bg-[#084838] text-white`}><PlusIcon /></button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

// Catalogue + liste de location (estimation du prix)
function Catalog({ category, setCategory }) {
  const t = useT('equipment')
  const tt = useT('trip')
  const { lang } = useLanguage()
  const categories = localize(CATEGORIES, t('categories'))
  const gear = localize(GEAR, t('gear'))
  const [cart, setCart] = useState({})   // id -> quantité
  const [days, setDays] = useState(3)
  const gridRef = useRef(null)
  const first = useRef(true)

  const list = category === 'all' ? gear : gear.filter((g) => g.category === category)

  // Les cartes réapparaissent en cascade quand on change de catégorie
  useLayoutEffect(() => {
    if (first.current) { first.current = false; return }
    if (!gridRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.from(gridRef.current.children, { y: 24, opacity: 0, duration: 0.45, ease: 'power3.out', stagger: 0.06, clearProps: 'transform,opacity' })
  }, [category])

  const change = (id, delta) =>
    setCart((prev) => {
      const next = Math.max(0, (prev[id] || 0) + delta)
      const copy = { ...prev }
      if (next === 0) delete copy[id]
      else copy[id] = next
      return copy
    })

  const lines = gear.filter((g) => cart[g.id])
  const perDay = lines.reduce((sum, g) => sum + g.price * cart[g.id], 0)
  const subtotal = perDay * days
  const discount = days >= 7 ? Math.round(subtotal * 0.1) : 0
  const total = subtotal - discount
  const itemCount = lines.reduce((sum, g) => sum + cart[g.id], 0)

  // La liste entière devient un élément de « Mon voyage » (prix total, remise comprise)
  const { add } = useTrip()
  const rental = {
    kind: 'gear',
    ref: 'rental',
    title: t('tripTitle'),
    link: '/equipment-rentals',
    details: t('tripDetails', { items: lines.map((g) => `${cart[g.id]} × ${g.name}`).join(', '), days: days === 1 ? t('dayOne') : t('days', { count: days }) }),
    price: total,
    unit: 'fixed',
  }
  const { saved } = useTripItem(rental)
  const upToDate = saved && saved.details === rental.details && saved.price === rental.price

  const tab = (active) =>
    `rounded-full px-5 py-2 text-sm md:text-base font-medium transition ${active ? 'bg-[#084838] text-white' : 'bg-white text-slate-700 hover:bg-white/70'}`

  return (
    <div id="catalog" className={`${SECTION_GAP} scroll-mt-8`}>
      <div className="mb-8 md:mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 lg:gap-12">
        <h2 className={`${SECTION_TITLE} lg:max-w-[52%]`}>{t('catalogTitle')}</h2>
        <p className={`${SECTION_SUBTITLE} lg:max-w-md`}>{t('catalogText')}</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 md:gap-3" role="tablist" aria-label={t('tabsLabel')}>
        {categories.map((c) => (
          <button key={c.id} type="button" role="tab" aria-selected={category === c.id} onClick={() => setCategory(c.id)} className={tab(category === c.id)}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-6 lg:gap-8 items-start">

        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((item) => <GearCard key={item.id} item={item} qty={cart[item.id] || 0} onChange={change} />)}
        </div>

        {/* Liste de location : reste visible au défilement sur grand écran */}
        <aside className="lg:sticky lg:top-8 rounded-3xl bg-[#084838] text-white p-5 md:p-7">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl md:text-2xl font-medium">{t('listTitle')}</h3>
            <span className="rounded-full bg-white/15 px-3 py-1 text-sm tabular-nums">{itemCount === 1 ? t('itemOne') : t('items', { count: itemCount })}</span>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-white/10 p-3">
            <span className="text-sm md:text-base">{t('length')}</span>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setDays((d) => Math.max(1, d - 1))} aria-label={t('fewer')} className="w-9 h-9 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/10 transition"><MinusIcon /></button>
              <span className="w-16 text-center text-sm md:text-base tabular-nums">{days === 1 ? t('dayOne') : t('days', { count: days })}</span>
              <button type="button" onClick={() => setDays((d) => Math.min(30, d + 1))} aria-label={t('more')} className="w-9 h-9 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/10 transition"><PlusIcon /></button>
            </div>
          </div>

          {lines.length === 0 ? (
            <p className="mt-6 text-sm md:text-base text-white/70 leading-relaxed">{t('empty')}</p>
          ) : (
            <ul className="mt-5 flex flex-col divide-y divide-white/15">
              {lines.map((g) => (
                <li key={g.id} className="flex items-center justify-between gap-3 py-3 text-sm md:text-base">
                  <span>{cart[g.id]} × {g.name}</span>
                  <span className="tabular-nums text-white/85">{formatPrice(g.price * cart[g.id] * days, lang)}</span>
                </li>
              ))}
            </ul>
          )}

          {discount > 0 && (
            <p className="mt-2 flex items-center justify-between text-sm text-[#E6C58A]">
              <span>{t('discount')}</span><span className="tabular-nums">−{formatPrice(discount, lang)}</span>
            </p>
          )}

          <div className="mt-5 pt-5 border-t border-white/25 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm text-white/70">{t('total')}</p>
              <p className="text-4xl md:text-5xl font-medium leading-none"><AnimatedPrice value={total} lang={lang} /></p>
            </div>
            <p className="text-xs text-white/60 text-right">{t('perDay', { price: formatPrice(perDay, lang) })}</p>
          </div>

          {upToDate ? (
            <Link to="/my-trip" className={`mt-6 block text-center bg-white text-[#084838] hover:bg-white/90 ${BUTTON}`}>
              ✓ {tt('viewTrip')}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => add(rental)}
              disabled={lines.length === 0}
              className={`mt-6 block w-full text-center bg-[#C49849] hover:bg-[#b08339] text-white disabled:opacity-50 disabled:cursor-not-allowed ${BUTTON}`}
            >
              {saved ? tt('updateTrip') : tt('add')}
            </button>
          )}
          <p className="mt-3 text-xs text-white/60 leading-relaxed">{t('note')}</p>
        </aside>
      </div>
    </div>
  )
}

// Bande "inclus dans chaque location"
function Included() {
  const included = useT('equipment')('included')
  return (
    <ul className={`${SECTION_GAP} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4 border-y border-[#084838]/20 py-6 md:py-8`}>
      {included.map((text) => (
        <li key={text} className="flex items-center gap-3 text-sm md:text-base text-slate-800">
          <span className="shrink-0 w-7 h-7 rounded-full bg-[#C49849] text-white flex items-center justify-center"><CheckIcon /></span>
          {text}
        </li>
      ))}
    </ul>
  )
}

// Retrait et retour : liste en lignes avec prix
function Pickup() {
  const t = useT('equipment')
  const pickups = localize(PICKUPS, t('pickups'))
  return (
    <div className={`${SECTION_GAP} grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-16`}>
      <div>
        <h2 className={SECTION_TITLE}>{t('pickupTitle')}</h2>
        <p className={`mt-4 md:mt-6 ${SECTION_SUBTITLE}`}>{t('pickupText')}</p>
      </div>

      <ul className="flex flex-col gap-3">
        {pickups.map((p) => (
          <li key={p.id} className="flex items-center gap-4 md:gap-6 rounded-2xl bg-white p-4 md:p-6">
            <span className="shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#084838] text-white flex items-center justify-center">{pickupIcons[p.icon]}</span>
            <div className="flex-1">
              <h3 className="text-base md:text-2xl font-medium text-forest">{p.title}</h3>
              <p className="mt-1 text-sm md:text-base text-slate-600 leading-relaxed">{p.text}</p>
            </div>
            <span className="shrink-0 rounded-full border border-[#084838] px-3 py-1.5 text-sm font-medium text-[#084838]">{p.price}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// FAQ : questions en cartes blanches à gauche, titre à droite
function Faq() {
  const t = useT('equipment')
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

// CTA : bannière image avec petit formulaire "il vous manque quelque chose ?"
function Cta() {
  // Connecté : nom et email pré-remplis (la clé recrée le champ quand la session est connue)
  const { user } = useAuth()
  const t = useT('equipment')
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'sent' | 'error'
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const { gear, email } = Object.fromEntries(new FormData(form))

    setStatus('sending')
    try {
      await sendRequest('gear', { email, subject: 'Equipment request', message: gear })
      setStatus('sent')
      form.reset()
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <div className={`${SECTION_GAP} relative overflow-hidden rounded-3xl bg-[#084838] text-white`}>
      <img src={NosyIranja} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-[#084838]/80" />

      <div className="relative px-6 py-14 md:px-12 md:py-24 text-center">
        <h2 className="mx-auto max-w-3xl text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.15] tracking-tight">{t('ctaTitle')}</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm md:text-lg text-white/80 leading-relaxed">
          {t('ctaText')}
        </p>

        <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-2xl flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-3xl sm:rounded-full bg-white p-2 sm:pl-6">
          <label htmlFor="gear-request" className="sr-only">{t('gearLabel')}</label>
          <input id="gear-request" name="gear" type="text" required placeholder={t('gearPlaceholder')} className="flex-1 min-w-0 bg-transparent px-4 py-2 sm:px-0 text-sm md:text-base text-slate-800 placeholder:text-slate-500 focus:outline-none" />
          <label htmlFor="gear-email" className="sr-only">{t('emailLabel')}</label>
          <input id="gear-email" name="email" key={`e-${user?.id}`} defaultValue={user?.email} type="email" required placeholder={t('emailLabel')} className="sm:w-56 min-w-0 bg-transparent px-4 py-2 sm:border-l sm:border-slate-200 text-sm md:text-base text-slate-800 placeholder:text-slate-500 focus:outline-none" />
          <button type="submit" disabled={status === 'sending'} className={`shrink-0 bg-[#C49849] hover:bg-[#b08339] text-white disabled:opacity-60 disabled:cursor-wait ${BUTTON}`}>{status === 'sending' ? t('sending') : t('send')}</button>
        </form>

        {status === 'sent' && <p role="status" className="mt-4 text-sm md:text-base text-[#E6C58A]">{t('thanks')}</p>}
        {status === 'error' && <p role="alert" className="mt-4 text-sm md:text-base text-red-300">{error}</p>}
      </div>
    </div>
  )
}

function EquipmentRentals() {
  const contentRef = useRef(null)
  const [category, setCategory] = useState('all')

  const counts = CATEGORIES.reduce((acc, c) => {
    acc[c.id] = c.id === 'all' ? GEAR.length : GEAR.filter((g) => g.category === c.id).length
    return acc
  }, {})

  useLayoutEffect(() => {
    // Pas d'animation si l'utilisateur a demandé moins de mouvement
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      // Entrée du hero : textes puis arches qui montent l'une après l'autre
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-hero]', { y: 40, opacity: 0, duration: 0.9, stagger: 0.12 })
        .from('[data-arch]', { y: 80, opacity: 0, duration: 1, stagger: 0.15 }, '-=0.5')

      // Chaque section apparaît en remontant quand elle entre dans l'écran
      Array.from(contentRef.current.children).slice(1).forEach((el) => {
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
    <section className="w-full pt-0 pb-12 md:pb-20 bg-[#D5E8E2] flex flex-col items-center">
      <Navbar />
      <div ref={contentRef} className={`${SECTION_WIDTH} mt-8 md:mt-16`}>
        <Hero counts={counts} onPick={setCategory} />
        <Catalog category={category} setCategory={setCategory} />
        <Included />
        <Pickup />
        <Faq />
        <Cta />
      </div>
    </section>
    <Footer />
    </>
  )
}

export default EquipmentRentals