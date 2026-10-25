import React, { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowRight, Backpack, BedDouble, Camera, Car, Compass, Map, Route, Ship,
  Sparkles, Star, Sun, Ticket, Users, UtensilsCrossed,
} from 'lucide-react'
import Ramena from '../assets/images/Ramena.png'
import NosyIranja from '../assets/images/NosyIranja.png'
import NosyLonjo from '../assets/images/NosyLonjo.png'
import Ambanja from '../assets/images/Ambanja.png'
import Deux from '../assets/images/2.jpg'
import Tana from '../assets/images/Tana.png'
import Icone from '../assets/icone.png'
import Footer from '../components/Footer'
import { slugify } from './destinationsData'
import { Hero, Preloader, shouldPlayPreloader } from './HomeHero'
import { useLanguage, useT } from '../i18n/LanguageContext'
import './home.css'
import { monthName } from '../utils/format'

gsap.registerPlugin(ScrollTrigger)

/* Constantes partagées : mêmes valeurs que About, Transport, Hébergement et Destinations */
const SECTION_WIDTH = 'w-[90vw] lg:max-w-[90vw] xl:max-w-[95vw]'
const SECTION_TITLE = 'nz-serif text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-slate-900 leading-[1.15] tracking-tight'
const SECTION_SUBTITLE = 'text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl'
const SECTION_GAP = 'mt-[50px] md:mt-[100px]'
const SECTION_LABEL = 'mb-3 text-xs sm:text-sm md:text-base uppercase tracking-wide text-slate-700'
const ON_IMAGE_TITLE = 'nz-serif text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-white leading-[1.15] tracking-tight'
const BTN = 'inline-flex items-center justify-center text-sm md:text-base font-medium px-6 py-3 rounded-full active:scale-95 transition'
const GOLD = 'bg-[#C49849] hover:bg-[#a9813a]'
const GREEN = 'bg-[#074636]'
const quoteHref = (k, v) => `/contact?type=quote&${k}=${encodeURIComponent(v)}`

/* ---------------------------- Données ---------------------------- */
// Les textes affichés viennent de locales/<langue>/home.json (mêmes listes, même ordre) ;
// les textes anglais ci-dessous servent d'identifiants (adresses des lieux, clés React).

// Les 4 façons de voyager
const ways = [
  { title: 'Circuits', text: 'Ready-made routes across the island', href: '/circuits', icon: Route, image: Tana },
  { title: 'Excursions', text: 'Day trips and short escapes', href: '/excurssions', icon: Sun, image: Ramena },
  { title: 'Long Stay', text: 'Live the island for weeks', href: '/longstay', icon: Compass, image: NosyIranja },
  { title: 'Tailor-Made', text: 'A trip designed around you', href: '/tailor-made', icon: Sparkles, image: Ambanja },
]

const promises = [
  { title: 'Local first', text: 'Local guides, family-run stays and small restaurants that support the people who make the place special.', icon: Users },
  { title: 'Slow by design', text: 'Fewer stops, more time. We leave room for a long lunch, a detour or a swim you did not plan.', icon: Sun },
  { title: 'Honest quotes', text: 'One clear quote with everything in it. No hidden fees and no surprises at the end.', icon: Ticket },
  { title: 'Always reachable', text: 'A real person before, during and after your trip, who answers when you need it.', icon: Compass },
]

// Mêmes régions que la page Destinations (version courte)
const regions = [
  {
    id: 'north', name: 'The North', tagline: 'Emerald bays, spice islands and dry forests', image: NosyIranja, months: [4, 11],
    text: 'Sail the bay of Diego Suarez, hike the sharp limestone of Ankarana and finish on the islands around Nosy Be.',
    places: [{ name: 'Ramena Beach', image: Ramena }, { name: 'Nosy Iranja', image: NosyIranja }, { name: 'Ambanja', image: Ambanja }],
  },
  {
    id: 'highlands', name: 'The Highlands', tagline: 'Royal hills, rice terraces and cool mornings', image: Tana, months: [5, 10],
    text: 'Start in Antananarivo, climb to the royal hill of Ambohimanga and ride south through the terraced valleys to Antsirabe.',
    places: [{ name: 'Antananarivo', image: Tana }, { name: 'Ambohimanga', image: Deux }, { name: 'Antsirabe', image: Ambanja }],
  },
  {
    id: 'west', name: 'The West', tagline: 'Baobab avenues and stone forests', image: Deux, months: [5, 10],
    text: 'Drive the famous Baobab Avenue at sunset, then cross the river to walk the Tsingy of Bemaraha.',
    places: [{ name: 'Baobab Avenue', image: Deux }, { name: 'Morondava', image: NosyLonjo }, { name: 'Tsingy de Bemaraha', image: Ambanja }],
  },
  {
    id: 'south', name: 'The South', tagline: 'Canyons, white sand and coastal villages', image: NosyLonjo, months: [4, 11],
    text: 'Hike the sandstone canyons of Isalo, swim in natural pools and end the trip on the Vezo coast.',
    places: [{ name: 'Isalo', image: NosyLonjo }, { name: 'Ifaty coast', image: Ramena }, { name: 'Fort Dauphin', image: NosyIranja }],
  },
  {
    id: 'east', name: 'The East', tagline: 'Rainforest, lemurs and island beaches', image: Ambanja, months: [9, 12],
    text: 'Listen for the indri at dawn in Andasibe, then take a boat to Ile Sainte-Marie or into the Masoala peninsula.',
    places: [{ name: 'Andasibe', image: Ambanja }, { name: 'Ile Sainte-Marie', image: NosyIranja }, { name: 'Masoala', image: Tana }],
  },
]

const trips = [
  { name: 'Highlands & Coast', days: 7, image: Tana, text: 'From lemur forests to a quiet bay, a slow week that mixes culture, nature and the sea.', tags: ['Andasibe forest', 'Village stays', 'Ramena sunsets'], months: [10, 11, 12] },
  { name: 'Island Escape', days: 5, image: NosyIranja, text: 'White sand, turquoise water and days that end on a boat.' },
  { name: 'Wild North', days: 10, image: Deux, text: 'Baobabs, canyons and empty beaches, for the ones who want more.' },
]

const services = [
  { title: 'Accommodation', href: '/hosting', icon: BedDouble },
  { title: 'Transport', href: '/transport', icon: Car },
  { title: 'Guides', href: '/guide', icon: Users },
  { title: 'Food & Dining', href: '/Food-dining', icon: UtensilsCrossed },
  { title: 'Equipment Rentals', href: '/equipment-rentals', icon: Backpack },
  { title: 'Photography', href: '/photography', icon: Camera },
  { title: 'Travel Planning', href: '/travel-planning', icon: Map },
  { title: 'Cruise Excursions', href: '/cruise-excurssion', icon: Ship },
]

const quotes = [
  { text: 'They planned every detail, yet the trip never felt planned. It felt like we were visiting friends.', name: 'Emma & Tom', origin: 'Lyon' },
  { text: 'Our guide showed us a side of the island we never expected. The food, the people, the little workshops.', name: 'Giulia R.', origin: 'Milan' },
  { text: 'When our flight was cancelled, they had a new plan before we finished our coffee. Impressive.', name: 'Markus B.', origin: 'Munich' },
  { text: 'Having one person to call for everything made our family trip stress-free. The kids still talk about it.', name: 'Sophie L.', origin: 'Montréal' },
]

/* ----------------------- Hook utilitaire GSAP ---------------------- */
/* Même hook que la page Destinations : respecte prefers-reduced-motion
   et nettoie tout au démontage. */

function useGsap(scope, setup, deps = []) {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia(scope)
    mm.add('(prefers-reduced-motion: no-preference)', () => setup())
    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

// Apparition des enfants d'une section quand elle entre à l'écran
function useReveal(scope, selector) {
  useGsap(scope, () => {
    gsap.from(selector, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      clearProps: 'all',
      scrollTrigger: { trigger: scope.current, start: 'top 80%', once: true },
    })
  })
}

/* -------------------------- Petits composants --------------------------- */

const Stars = ({ className = 'w-4 h-4' }) => (
  <span className="flex gap-0.5" aria-hidden="true">
    {[0, 1, 2, 3, 4].map((n) => <Star key={n} className={`${className} text-[#F5B800] fill-current`} />)}
  </span>
)

// Badge circulaire "Talk to a Travel Expert" (identique à la page About)
function TalkBadge() {
  const t = useT('home')
  return (
    <div className="relative shrink-0 w-24 h-24 md:w-32 md:h-32 text-slate-700" aria-hidden="true">
      <svg viewBox="0 0 140 140" className="absolute inset-0 w-full h-full animate-spin [animation-duration:20s] motion-reduce:animate-none">
        <defs>
          <path id="home-talk-circle" d="M70,70 m-52,0 a52,52 0 1,1 104,0 a52,52 0 1,1 -104,0" />
        </defs>
        <text fontSize="10" fill="currentColor" letterSpacing="0.5">
          <textPath href="#home-talk-circle" textLength="326" lengthAdjust="spacing">
            {t('talkBadge')}
          </textPath>
        </text>
      </svg>
      <span className="absolute inset-0 m-auto w-[48%] h-[48%] flex items-center justify-center">
        <img src={Icone} alt="" className="w-[64px] h-[64px] object-contain" />
      </span>
    </div>
  )
}

/* -------------------------- Sections --------------------------- */

/* Les 4 façons de voyager : cartes photo (même style que les cartes de la page Destinations) */
function Ways() {
  const root = useRef(null)
  const t = useT('home')

  useReveal(root, '.ways-head > *, .way-card')

  return (
    <section ref={root} className={`${SECTION_WIDTH} ${SECTION_GAP}`}>
      <div className="ways-head flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 lg:gap-12">
        <div>
          <p className={SECTION_LABEL}>{t('waysLabel')}</p>
          <h2 className={SECTION_TITLE}>{t('waysTitle')}</h2>
        </div>
        <p className={`${SECTION_SUBTITLE} lg:max-w-md`}>{t('waysText')}</p>
      </div>

      <ul className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {ways.map((way, i) => {
          const w = { ...way, ...t('ways')[i] }
          const WayIcon = w.icon
          return (
            <li key={way.href} className="way-card">
              <a href={w.href} className="group relative block aspect-[3/4] overflow-hidden rounded-[1.5rem] md:rounded-[2rem] text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-800">
                <img src={w.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent" />
                <span className="absolute left-4 top-4 md:left-5 md:top-5 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center">
                  <WayIcon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.6} aria-hidden="true" />
                </span>
                <span className="absolute inset-x-0 bottom-0 p-4 md:p-6 flex items-end justify-between gap-3">
                  <span>
                    <span className="block text-lg md:text-2xl font-medium">{w.title}</span>
                    <span className="mt-1 block text-xs md:text-sm text-white/80">{w.text}</span>
                  </span>
                  <span aria-hidden="true" className="hidden sm:flex shrink-0 w-10 h-10 rounded-full bg-white/90 text-slate-900 items-center justify-center transition group-hover:bg-[#C49849] group-hover:text-white">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* Qui sommes-nous : titre + badge expert, puis nos engagements */
function Intro() {
  const root = useRef(null)
  const t = useT('home')

  useReveal(root, '.intro-text > *, .intro-card')

  return (
    <section ref={root} className={`${SECTION_WIDTH} ${SECTION_GAP}`}>
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-16 items-center">
        <div className="intro-text">
          <p className={SECTION_LABEL}>{t('introLabel')}</p>
          <h2 className={SECTION_TITLE}>{t('introTitle')}</h2>
          <p className={`mt-5 md:mt-6 ${SECTION_SUBTITLE}`}>
            {t('introText')}
          </p>
        </div>

        <div className="intro-card flex items-center gap-5 md:gap-6 rounded-3xl bg-white p-5 md:p-8">
          <TalkBadge />
          <div>
            <p className="text-lg md:text-2xl font-medium leading-snug text-slate-900">{t('notSure')}</p>
            <p className="mt-2 text-sm md:text-base text-slate-600">{t('notSureText')}</p>
            <a href="/contact" className={`${BTN} ${GREEN} hover:bg-[#0a5f48] text-white mt-4`}>{t('talkExpert')}</a>
          </div>
        </div>
      </div>

      <ul className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {promises.map((promise, i) => {
          const p = { ...promise, ...t('promises')[i] }
          const PromiseIcon = p.icon
          return (
            <li key={promise.title} className="intro-card flex flex-col rounded-2xl bg-white p-5 md:p-6">
              <span className="w-11 h-11 lg:w-[52px] lg:h-[52px] rounded-full bg-[#C49849] flex items-center justify-center text-white">
                <PromiseIcon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg md:text-xl font-medium text-slate-900">{p.title}</h3>
              <p className="mt-2 text-sm md:text-base text-slate-600 leading-relaxed">{p.text}</p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* Les régions : onglets + aperçu (même style que la page Destinations) */
function Regions() {
  const root = useRef(null)
  const panel = useRef(null)
  const t = useT('home')
  const { lang } = useLanguage()
  const [active, setActive] = useState(0)
  const texts = t('regions')
  const tr = texts[active]
  // Lieux : nom anglais pour l'adresse de la page, nom traduit à l'écran
  const region = { ...regions[active], ...tr, places: regions[active].places.map((p, i) => ({ ...p, label: tr.places[i] })) }
  const [first, last] = region.months

  useReveal(root, '.regions-head > *')

  // L'aperçu se ré-anime à chaque changement de région
  useGsap(panel, () => {
    gsap.fromTo('.region-frame', { clipPath: 'inset(6% 6% 6% 6% round 3rem)' }, { clipPath: 'inset(0% 0% 0% 0% round 3rem)', duration: 1, ease: 'expo.out', clearProps: 'clipPath' })
    gsap.fromTo('.region-text > *', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out', clearProps: 'all' })
  }, [active])

  return (
    <section ref={root} className={`${SECTION_WIDTH} ${SECTION_GAP}`}>
      <div className="regions-head flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 lg:gap-12">
        <div>
          <p className={SECTION_LABEL}>{t('regionsLabel')}</p>
          <h2 className={SECTION_TITLE}>{t('regionsTitle')}</h2>
        </div>
        <p className={`${SECTION_SUBTITLE} lg:max-w-md`}>{t('regionsText')}</p>
      </div>

      <div className="mt-8 md:mt-10 flex">
        <ul role="tablist" aria-label={t('regionsTabs')} className="flex gap-2 rounded-full bg-white/85 backdrop-blur-md p-2 shadow-sm overflow-x-auto max-w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {regions.map((r, i) => (
            <li key={r.id} className="shrink-0">
              <button
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-controls="region-panel"
                onClick={() => setActive(i)}
                className={`block rounded-full px-5 py-2.5 text-sm md:text-base transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C49849] ${
                  i === active ? 'bg-slate-800 text-white' : 'text-slate-800 hover:bg-slate-800/10'
                }`}
              >
                {texts[i].name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div ref={panel} id="region-panel" role="tabpanel" className="mt-8 md:mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        <div className="region-frame relative aspect-[4/3] overflow-hidden rounded-[2rem] md:rounded-[3rem]">
          <img src={region.image} alt={region.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
          <span className="absolute left-5 top-5 bg-[#C49849] text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm">
            {t('bestFrom', { from: monthName(first, lang, 'long'), to: monthName(last, lang, 'long') })}
          </span>
        </div>

        <div className="region-text">
          <h3 className="nz-serif text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.1] tracking-tight text-slate-900">{region.name}</h3>
          <p className="mt-3 text-lg md:text-2xl text-slate-700">{region.tagline}</p>
          <p className="mt-5 text-sm md:text-base text-slate-600 leading-relaxed max-w-xl">{region.text}</p>

          <p className="mt-8 mb-3 text-sm md:text-base font-medium text-slate-800">{t('mustSee')}</p>
          <ul className="grid grid-cols-3 gap-3 md:gap-4">
            {region.places.map((p) => (
              <li key={p.name}>
                <a href={`/destinations/${slugify(p.name)}`} className="group block">
                  <div className="aspect-square overflow-hidden rounded-2xl md:rounded-3xl">
                    <img src={p.image} alt={p.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-800 leading-snug group-hover:underline">{p.label}</p>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/destinations" className={`${BTN} ${GOLD} text-white`}>{t('exploreRegion')}</a>
            <a href="/circuits" className={`${BTN} border border-slate-400 hover:border-slate-800 text-slate-800`}>{t('seeCircuits')}</a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* Voyages signature : une grande carte + deux petites */
function Trips() {
  const root = useRef(null)
  const t = useT('home')
  const { lang } = useLanguage()
  const [big, ...rest] = trips.map((trip, i) => ({ ...trip, ...t('trips')[i] }))
  const card = 'trip-card group relative overflow-hidden rounded-3xl bg-slate-900 text-white flex focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-800'
  const shade = 'absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent'
  const img = 'absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105'

  useReveal(root, '.trips-head > *, .trip-card')

  return (
    <section ref={root} className={`${SECTION_WIDTH} ${SECTION_GAP}`}>
      <div className="trips-head flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 lg:gap-12">
        <div>
          <p className={SECTION_LABEL}>{t('tripsLabel')}</p>
          <h2 className={`${SECTION_TITLE} max-w-3xl`}>{t('tripsTitle')}</h2>
        </div>
        <p className={`${SECTION_SUBTITLE} lg:max-w-md`}>{t('tripsText')}</p>
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-4 md:gap-6">
        <a href={quoteHref('trip', big.name)} className={`${card} min-h-[480px] lg:min-h-[640px] lg:row-span-2`}>
          <img src={big.image} alt={big.name} className={img} /><span className={shade} />
          <span className="relative flex w-full flex-col justify-end p-6 md:p-10">
            <span className="self-start bg-[#C49849] text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm">{t('days', { count: big.days })}</span>
            <span className="mt-4 block text-3xl md:text-5xl font-medium tracking-tight">{big.name}</span>
            <span className="mt-3 block max-w-md text-sm md:text-base text-white/85">{big.text}</span>
            <span className="mt-4 flex flex-wrap gap-2">
              {big.tags.map((h) => <span key={h} className="rounded-full border border-white/40 bg-white/10 backdrop-blur-sm px-3 py-1 text-xs md:text-sm">{h}</span>)}
            </span>
            <span className="mt-5 flex flex-wrap items-center gap-2 text-sm text-white/80">
              {t('bestMonths')} {big.months.map((m) => <span key={m} className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-900">{monthName(m, lang)}</span>)}
            </span>
            <span className="mt-6 flex items-center justify-between border-t border-white/25 pt-5">
              <span className="text-white/85">{t('freeQuote')}</span>
              <span className="w-11 h-11 rounded-full bg-[#C49849] flex items-center justify-center transition group-hover:translate-x-1"><ArrowRight className="w-5 h-5" aria-hidden="true" /></span>
            </span>
          </span>
        </a>
        {rest.map((trip) => (
          <a key={trip.name} href={quoteHref('trip', trip.name)} className={`${card} min-h-[310px]`}>
            <img src={trip.image} alt={trip.name} className={img} /><span className={shade} />
            <span className="relative flex w-full flex-col justify-end p-5 md:p-8">
              <span className="self-start bg-[#C49849] text-xs font-medium px-3 py-1.5 rounded-sm">{t('days', { count: trip.days })}</span>
              <span className="mt-3 block text-2xl md:text-3xl font-medium tracking-tight">{trip.name}</span>
              <span className="mt-2 block text-sm text-white/80">{trip.text}</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}

/* Services : bloc sombre avec les pastilles des services (comme les piliers de la page About) */
function Services() {
  const root = useRef(null)
  const t = useT('home')

  useReveal(root, '.services-head > *, .service-item')

  return (
    <section ref={root} className={`${SECTION_WIDTH} ${SECTION_GAP} rounded-[2rem] md:rounded-[3rem] ${GREEN} text-white p-5 sm:p-8 md:p-14`}>
      <div className="services-head flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 lg:gap-12">
        <div>
          <p className="mb-3 text-xs sm:text-sm md:text-base uppercase tracking-wide text-white/70">{t('servicesLabel')}</p>
          <h2 className={`${ON_IMAGE_TITLE} max-w-3xl`}>{t('servicesTitle')}</h2>
        </div>
        <p className="text-sm sm:text-base md:text-lg text-white/75 leading-relaxed lg:max-w-md">
          {t('servicesText')}
        </p>
      </div>

      <ul className="mt-10 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {services.map((s, i) => {
          const ServiceIcon = s.icon
          return (
            <li key={s.title} className="service-item">
              <a
                href={s.href}
                className="group flex items-center gap-3 lg:gap-4 rounded-full bg-white p-2.5 lg:p-3 pr-5 text-slate-800 transition hover:bg-[#F7EEDC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C49849]"
              >
                <span className="shrink-0 w-11 h-11 lg:w-[52px] lg:h-[52px] rounded-full bg-[#C49849] flex items-center justify-center text-white">
                  <ServiceIcon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className="flex-1 text-sm lg:text-base font-medium leading-snug">{t('services')[i]}</span>
                <ArrowRight className="w-4 h-4 text-slate-500 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* Avis : carte note + citations sur fond blanc */
function Testimonials() {
  const root = useRef(null)
  const t = useT('home')
  const initials = (name) => name.split(/[\s&.]+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('')

  useReveal(root, '.testimonial-card')

  return (
    <section ref={root} className={`${SECTION_WIDTH} ${SECTION_GAP}`}>
      <div className="mb-10 md:mb-14 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 lg:gap-12">
        <div>
          <p className={SECTION_LABEL}>{t('reviewsLabel')}</p>
          <h2 className={SECTION_TITLE}>{t('reviewsTitle')}</h2>
        </div>
        <div className="flex items-center gap-4">
          <p className="nz-serif text-5xl md:text-6xl leading-none text-slate-800">4.9<span className="text-2xl text-slate-500">/5</span></p>
          <div>
            <Stars />
            <p className="mt-2 text-sm md:text-base text-slate-600">{t('reviewsAverage')}</p>
          </div>
        </div>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {quotes.map((quote, i) => ({ ...quote, ...t('quotes')[i] })).map((q) => (
          <li key={q.name} className="testimonial-card">
            <figure className="flex h-full flex-col rounded-2xl bg-white p-6 md:p-7">
              <Stars />
              <blockquote className="mt-4 text-base text-slate-700 leading-relaxed">“{q.text}”</blockquote>
              <figcaption className="mt-auto pt-8 flex items-center gap-3">
                <span aria-hidden="true" className="w-11 h-11 rounded-full bg-[#C49849] text-white text-sm font-medium flex items-center justify-center">{initials(q.name)}</span>
                <span>
                  <span className="block text-sm md:text-base font-medium text-slate-900">{q.name}</span>
                  <span className="block text-xs md:text-sm text-slate-500">{q.origin}</span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* Appel final (même carte que la page Destinations) */
function FinalCta() {
  const root = useRef(null)
  const t = useT('home')

  useGsap(root, () => {
    gsap.fromTo('.cta-bg', { scale: 1.15 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
    })
    gsap.from('.cta-content > *', {
      y: 40, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', clearProps: 'all',
      scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
    })
  })

  return (
    <section ref={root} className={`${SECTION_WIDTH} ${SECTION_GAP} relative overflow-hidden rounded-[2rem] md:rounded-[3rem] text-white min-h-[420px] flex items-center`}>
      <img src={Ramena} alt="" className="cta-bg absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-slate-950/65" />
      <div className="cta-content relative p-8 md:p-16 max-w-3xl">
        <h2 className="nz-serif text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight">{t('ctaTitle')}</h2>
        <p className="mt-4 text-sm md:text-lg text-white/85">{t('ctaText')}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="/contact?type=quote" className={`${BTN} ${GOLD} text-white`}>{t('ctaQuote')}</a>
          <a href="/tailor-made" className={`${BTN} border border-white/50 hover:bg-white/10`}>{t('ctaDesign')}</a>
        </div>
      </div>
    </section>
  )
}

/* ================= Page ================= */

function Home() {
  // Preloader au premier affichage, puis entrée du hero
  const [ready, setReady] = useState(() => !shouldPlayPreloader())

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
    <div className="nz-home">
      {!ready && <Preloader onDone={() => setReady(true)} />}
      <main className="w-full bg-[#D5E8E2] pb-16 md:pb-24 flex flex-col items-center">
        <Hero ready={ready} />
        <Ways />
        <Intro />
        <Regions />
        <Trips />
        <Services />
        <Testimonials />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}

export default Home
