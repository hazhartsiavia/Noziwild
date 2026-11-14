import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowRight, Backpack, BedDouble, Camera, Car, Compass, Route, Ship,
  Sparkles, Sun, Ticket, Users, UtensilsCrossed,
} from 'lucide-react'
import Ramena from '../assets/images/Ramena.jpg'
import NosyIranja from '../assets/images/NosyIranja.jpg'
import NosyLonjo from '../assets/images/NosyLonjo.jpg'
import Ambanja from '../assets/images/Ambanja.jpg'
import Deux from '../assets/images/2.jpg'
import Tana from '../assets/images/Tana.jpg'
import Icone from '../assets/logo/icon.svg'
import Footer from '../components/Footer'
import Testimonials from '../components/Testimonials'
import { useSitePages } from '../context/SitePagesContext'
import { slugify } from './destinationsData'
import { Hero, Preloader, shouldPlayPreloader } from './HomeHero'
import { useLanguage, useT } from '../i18n/LanguageContext'
import { monthName } from '../utils/format'
import { usePhoto } from '../sitePhotos'
import { A } from '../i18n/router'
import SiteMedia from '../components/SiteMedia'

gsap.registerPlugin(ScrollTrigger)

/* Constantes partagées : mêmes valeurs que About, Transport, Hébergement et Destinations */
const SECTION_WIDTH = 'w-[90vw] lg:max-w-[90vw] xl:max-w-[95vw]'
const SECTION_TITLE = 'text-[clamp(2rem,4.4vw,4rem)] font-bold text-forest leading-[1.08] tracking-tight'
const SECTION_SUBTITLE = 'text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl'
const SECTION_GAP = 'mt-[50px] md:mt-[100px]'
const SECTION_LABEL = 'mb-3 flex items-center gap-2 text-xs sm:text-sm font-medium uppercase tracking-wide text-slate-700'
const ON_IMAGE_TITLE = 'text-[clamp(2rem,4.4vw,4rem)] font-bold text-white leading-[1.08] tracking-tight'
const BTN = 'inline-flex items-center justify-center text-sm md:text-base font-medium px-6 py-3 rounded-full active:scale-95 transition'
const GOLD = 'bg-[#C49849] hover:bg-[#a9813a]'
const GREEN = 'bg-[#074636]'
// Inclinaison de chaque carte tant qu'elle n'est pas redressée par le défilement
const WAY_TILTS = [-9, 6, -5, 8]
const quoteHref = (k, v) => `/contact?type=quote&${k}=${encodeURIComponent(v)}`

/* ---------------------------- Données ---------------------------- */
// Les textes affichés viennent de locales/<langue>/home.json (mêmes listes, même ordre) ;
// les textes anglais ci-dessous servent d'identifiants (adresses des lieux, clés React).

// Les 4 façons de voyager
const ways = [
  { title: 'Circuits', text: 'Ready-made routes across the island', href: '/circuits', icon: Route, slot: 'home.ways.1', image: Tana },
  { title: 'Excursions', text: 'Day trips and short escapes', href: '/excursions', icon: Sun, slot: 'home.ways.2', image: Ramena },
  { title: 'Long Stay', text: 'Live the island for weeks', href: '/long-stay', icon: Compass, slot: 'home.ways.3', image: NosyIranja },
  { title: 'Tailor-Made', text: 'A trip designed around you', href: '/tailor-made', icon: Sparkles, slot: 'home.ways.4', image: Ambanja },
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
    id: 'north', name: 'The North', tagline: 'Emerald bays, spice islands and dry forests', slot: 'region.north', image: NosyIranja, months: [4, 11],
    text: 'Sail the bay of Diego Suarez, hike the sharp limestone of Ankarana and finish on the islands around Nosy Be.',
    places: [{ name: 'Ramena Beach', slot: 'region.north.1', image: Ramena }, { name: 'Nosy Iranja', slot: 'region.north.2', image: NosyIranja }, { name: 'Ambanja', slot: 'region.north.3', image: Ambanja }],
  },
  {
    id: 'highlands', name: 'The Highlands', tagline: 'Royal hills, rice terraces and cool mornings', slot: 'region.highlands', image: Tana, months: [5, 10],
    text: 'Start in Antananarivo, climb to the royal hill of Ambohimanga and ride south through the terraced valleys to Antsirabe.',
    places: [{ name: 'Antananarivo', slot: 'region.highlands.1', image: Tana }, { name: 'Ambohimanga', slot: 'region.highlands.2', image: Deux }, { name: 'Antsirabe', slot: 'region.highlands.3', image: Ambanja }],
  },
  {
    id: 'west', name: 'The West', tagline: 'Baobab avenues and stone forests', slot: 'region.west', image: Deux, months: [5, 10],
    text: 'Drive the famous Baobab Avenue at sunset, then cross the river to walk the Tsingy of Bemaraha.',
    places: [{ name: 'Baobab Avenue', slot: 'region.west.1', image: Deux }, { name: 'Morondava', slot: 'region.west.2', image: NosyLonjo }, { name: 'Tsingy de Bemaraha', slot: 'region.west.3', image: Ambanja }],
  },
  {
    id: 'south', name: 'The South', tagline: 'Canyons, white sand and coastal villages', slot: 'region.south', image: NosyLonjo, months: [4, 11],
    text: 'Hike the sandstone canyons of Isalo, swim in natural pools and end the trip on the Vezo coast.',
    places: [{ name: 'Isalo', slot: 'region.south.1', image: NosyLonjo }, { name: 'Ifaty coast', slot: 'region.south.2', image: Ramena }, { name: 'Fort Dauphin', slot: 'region.south.3', image: NosyIranja }],
  },
  {
    id: 'east', name: 'The East', tagline: 'Rainforest, lemurs and island beaches', slot: 'region.east', image: Ambanja, months: [9, 12],
    text: 'Listen for the indri at dawn in Andasibe, then take a boat to Ile Sainte-Marie or into the Masoala peninsula.',
    places: [{ name: 'Andasibe', slot: 'region.east.1', image: Ambanja }, { name: 'Ile Sainte-Marie', slot: 'region.east.2', image: NosyIranja }, { name: 'Masoala', slot: 'region.east.3', image: Tana }],
  },
]

const trips = [
  { name: 'Highlands & Coast', days: 7, slot: 'home.trips.1', image: Tana, text: 'From lemur forests to a quiet bay, a slow week that mixes culture, nature and the sea.', tags: ['Andasibe forest', 'Village stays', 'Ramena sunsets'], months: [10, 11, 12] },
  { name: 'Island Escape', days: 5, slot: 'home.trips.2', image: NosyIranja, text: 'White sand, turquoise water and days that end on a boat.' },
  { name: 'Wild North', days: 10, slot: 'home.trips.3', image: Deux, text: 'Baobabs, canyons and empty beaches, for the ones who want more.' },
]

const services = [
  { title: 'Accommodation', href: '/accommodation', icon: BedDouble },
  { title: 'Transport', href: '/transport', icon: Car },
  { title: 'Guides', href: '/guides', icon: Users },
  { title: 'Food & Dining', href: '/food-dining', icon: UtensilsCrossed },
  { title: 'Equipment Rentals', href: '/equipment-rentals', icon: Backpack },
  { title: 'Photography', href: '/photography', icon: Camera },
  { title: 'Cruise Excursions', href: '/cruise-excursions', icon: Ship },
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
  const photo = usePhoto()
  const root = useRef(null)
  const t = useT('home')
  const { isHidden } = useSitePages()

  // Au défilement, les cartes inclinées et serrées se redressent et s'alignent (et l'inverse en remontant)
  useGsap(root, () => {
    const trigger = { trigger: root.current, start: 'top 75%', once: true }
    gsap.from('.ways-head > *', { y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', clearProps: 'all', scrollTrigger: trigger })
    gsap.fromTo('.way-card', {
      rotation: (i) => WAY_TILTS[i % WAY_TILTS.length],
      x: (i, el, all) => ((all.length - 1) / 2 - i) * el.offsetWidth * 0.12,
      y: (i) => (i % 2 ? 46 : 14),
    }, {
      rotation: 0, x: 0, y: 0, ease: 'none',
      scrollTrigger: { trigger: '.ways-list', start: 'top 92%', end: 'top 38%', scrub: 0.7 },
    })
  })

  return (
    <section ref={root} className={`${SECTION_WIDTH} ${SECTION_GAP}`}>
      <div className="ways-head mx-auto max-w-3xl text-center">
        <p className={`${SECTION_LABEL} justify-center`}><span className="w-1.5 h-1.5 rounded-full bg-[#C49849]" aria-hidden="true" />{t('waysLabel')}</p>
        <h2 className={SECTION_TITLE}>{t('waysTitle')}</h2>
        <p className={`mt-4 mx-auto ${SECTION_SUBTITLE}`}>{t('waysText')}</p>
      </div>

      <ul className="ways-list mt-12 md:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {ways.map((way, i) => {
          if (isHidden(way.href)) return null
          const w = { ...way, ...t('ways')[i] }
          const WayIcon = w.icon
          return (
            <li key={way.href} className="way-card relative hover:z-10">
              <A href={w.href} className={`group block rounded-2xl bg-white p-2 md:p-3 pb-4 md:pb-5 text-center shadow-xl shadow-[#072a1f]/15 transition-transform duration-500 hover:-translate-y-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#C49849]`}>
                <span className="relative block aspect-[4/5] overflow-hidden rounded-xl">
                  <img src={photo(w.slot)} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <span className="absolute left-2.5 top-2.5 w-9 h-9 md:w-11 md:h-11 rounded-full bg-[#C49849] text-white flex items-center justify-center">
                    <WayIcon className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                </span>
                <span className="mt-3 md:mt-4 block font-display text-lg md:text-2xl font-bold text-forest">{w.title}</span>
                <span className="mt-1 block px-1 text-xs md:text-sm leading-snug text-slate-600">{w.text}</span>
              </A>
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
            <A href="/contact" className={`${BTN} ${GREEN} hover:bg-[#0a5f48] text-white mt-4`}>{t('talkExpert')}</A>
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
              <h3 className="mt-5 text-lg md:text-xl font-medium text-forest">{p.title}</h3>
              <p className="mt-2 text-sm md:text-base text-slate-600 leading-relaxed">{p.text}</p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* Les régions : une fresque de panneaux photo, celui qui est choisi s'ouvre en grand */
function Regions() {
  const photo = usePhoto()
  const root = useRef(null)
  const stage = useRef(null)
  const hoverTimer = useRef(null)
  const moveFocus = useRef(false)
  const t = useT('home')
  const { lang } = useLanguage()
  const [active, setActive] = useState(0)
  const texts = t('regions')

  useReveal(root, '.regions-head > *, .region-panel')

  // Avec une souris sur grand écran, le panneau survolé s'ouvre après un court instant
  const openSoon = (i) => {
    clearTimeout(hoverTimer.current)
    if (!window.matchMedia('(hover: hover) and (min-width: 1024px)').matches) return
    hoverTimer.current = setTimeout(() => setActive(i), 120)
  }
  const cancelOpen = () => clearTimeout(hoverTimer.current)
  useEffect(() => cancelOpen, [])

  // Au clavier, le bouton disparaît avec l'ouverture : le focus passe au titre de la région
  useEffect(() => {
    if (!moveFocus.current) return
    moveFocus.current = false
    stage.current?.querySelector('.region-title')?.focus()
  }, [active])

  // Les textes de la région ouverte arrivent l'un après l'autre
  useGsap(stage, () => {
    gsap.fromTo('.region-content > *', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, delay: 0.2, ease: 'power3.out', clearProps: 'all' })
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

      {/* Fresque : un panneau photo par région, celui qui est choisi s'ouvre en grand */}
      <ul ref={stage} aria-label={t('regionsTabs')} className="mt-8 md:mt-12 flex flex-col lg:flex-row gap-2 md:gap-3 lg:h-[max(600px,min(82vh,760px))]">
        {regions.map((r, i) => {
          const open = i === active
          const tr = texts[i]
          return (
            <li
              key={r.id}
              onMouseEnter={() => openSoon(i)}
              onMouseLeave={cancelOpen}
              className={`region-panel relative flex flex-col justify-end min-w-0 overflow-hidden rounded-2xl md:rounded-3xl bg-[#084838] text-white transition-[flex-grow,min-height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none lg:basis-0 ${
                open ? 'min-h-[560px] lg:min-h-0 lg:grow-[7]' : 'min-h-[84px] md:min-h-[100px] lg:min-h-0 lg:grow'
              }`}
            >
              <img
                src={photo(r.slot)}
                alt={open ? tr.name : ''}
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out motion-reduce:transition-none ${open ? 'scale-100' : 'scale-110'}`}
              />
              <div className={`absolute inset-0 transition-colors duration-700 ${open ? 'bg-transparent' : 'bg-[#072a1f]/55 hover:bg-[#072a1f]/35'}`} />

              {open ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#072a1f]/95 via-[#072a1f]/75 via-65% to-[#072a1f]/30 lg:via-[#072a1f]/45 lg:via-45% lg:to-transparent lg:to-75%" />
                  <div className="region-content relative p-5 md:p-8 lg:p-10 lg:w-[min(46rem,50vw)] max-w-full">
                    <span className="inline-block bg-[#C49849] text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm">
                      {t('bestFrom', { from: monthName(r.months[0], lang, 'long'), to: monthName(r.months[1], lang, 'long') })}
                    </span>
                    <h3 tabIndex={-1} className="region-title mt-4 font-display text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.05] tracking-tight focus:outline-none">{tr.name}</h3>
                    <p className="mt-3 text-lg md:text-2xl text-white">{tr.tagline}</p>
                    <p className="mt-3 text-sm md:text-base text-white/85 leading-relaxed max-w-xl">{tr.text}</p>

                    <ul aria-label={t('mustSee')} className="mt-5 flex flex-wrap gap-2">
                      {r.places.map((p, n) => (
                        <li key={p.name}>
                          <A href={`/destinations/${slugify(p.name)}`} className="flex items-center gap-2 rounded-full border border-white/30 bg-[#072a1f]/50 backdrop-blur-md hover:bg-white hover:text-slate-900 transition-colors pl-1 pr-4 py-1 text-sm">
                            <img src={photo(p.slot)} alt="" className="w-8 h-8 rounded-full object-cover" />
                            {tr.places[n]}
                          </A>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <A href="/destinations" className={`${BTN} ${GOLD} text-white`}>{t('exploreRegion')}</A>
                      <A href="/circuits" className={`${BTN} border border-white/50 hover:bg-white hover:text-slate-900 text-white`}>{t('seeCircuits')}</A>
                    </div>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  aria-expanded={false}
                  aria-label={tr.name}
                  onClick={(event) => {
                    cancelOpen()
                    moveFocus.current = event.detail === 0
                    setActive(i)
                  }}
                  className="absolute inset-0 flex items-center lg:flex-col lg:items-center lg:justify-end gap-4 lg:gap-5 p-5 lg:px-2 lg:py-8 text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#C49849]"
                >
                  <span className="lg:order-2 text-sm tabular-nums text-[#E6C58A]">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-display text-xl md:text-2xl lg:text-3xl font-medium whitespace-nowrap lg:[writing-mode:vertical-rl] lg:rotate-180">{tr.name}</span>
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* Voyages signature : bande de couleur, photo qui change selon le voyage survolé */
function Trips() {
  const photo = usePhoto()
  const root = useRef(null)
  const t = useT('home')
  const { lang } = useLanguage()
  const [active, setActive] = useState(0)
  const items = trips.map((trip, i) => ({ ...trip, ...t('trips')[i] }))
  const current = items[active]

  useReveal(root, '.trips-head > *, .trip-card')

  // Le texte posé sur la photo se renouvelle à chaque voyage
  useGsap(root, () => {
    gsap.fromTo('.trip-caption > *', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out', clearProps: 'all' })
  }, [active])

  return (
    <section ref={root} className={`w-full ${SECTION_GAP} bg-[#BBD9CF] py-14 md:py-24 flex justify-center`}>
      <div className={SECTION_WIDTH}>
        <div className="trips-head flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 lg:gap-12">
          <div>
            <p className={SECTION_LABEL}><span className="w-1.5 h-1.5 rounded-full bg-[#C49849]" aria-hidden="true" />{t('tripsLabel')}</p>
            <h2 className={`${SECTION_TITLE} max-w-4xl`}>{t('tripsTitle')}</h2>
          </div>
          <p className={`${SECTION_SUBTITLE} lg:max-w-md text-slate-700`}>{t('tripsText')}</p>
        </div>

        {/* Grande photo à gauche, liste à droite : survoler un voyage change la photo */}
        <div className="trip-card mt-10 md:mt-12 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] bg-[#074636] text-white">
          <div className="relative min-h-[360px] lg:min-h-[600px] flex flex-col justify-end overflow-hidden">
            {items.map((trip, i) => (
              <img key={trip.name} src={photo(trip.slot)} alt={i === active ? trip.name : ''} className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${i === active ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`} />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-[#072a1f]/90 via-[#072a1f]/15 to-transparent" />
            <div className="trip-caption relative p-5 md:p-8">
              <p className="font-display text-3xl md:text-5xl font-bold tracking-tight">{current.name}</p>
              {current.tags && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {current.tags.map((tag) => <li key={tag} className="rounded-full border border-white/40 bg-[#072a1f]/40 backdrop-blur-sm px-3 py-1 text-xs md:text-sm">{tag}</li>)}
                </ul>
              )}
              {current.months && (
                <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/85">
                  {t('bestMonths')} {current.months.map((m) => <span key={m} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-900">{monthName(m, lang)}</span>)}
                </p>
              )}
            </div>
          </div>

          <ul className="flex flex-col p-3 md:p-5 lg:p-6">
            {items.map((trip, i) => (
              <li key={trip.name} className="flex-1 border-b border-white/15 last:border-b-0">
                <A
                  href={quoteHref('trip', trip.name)}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className={`group h-full flex items-center gap-4 md:gap-5 rounded-2xl p-3 md:p-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C58A] ${i === active ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  <img src={photo(trip.slot)} alt="" className="w-20 h-20 md:w-28 md:h-28 shrink-0 rounded-xl object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="inline-block bg-[#C49849] text-xs font-medium px-2.5 py-1 rounded-sm">{t('days', { count: trip.days })}</span>
                    <span className="mt-2 block text-lg md:text-2xl font-medium leading-snug">{trip.name}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-white/75">{trip.text}</span>
                  </span>
                  <span aria-hidden="true" className={`hidden sm:flex shrink-0 w-10 h-10 rounded-full items-center justify-center transition-all ${i === active ? 'bg-[#C49849] text-white' : 'border border-white/30'} group-hover:translate-x-1`}>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </A>
              </li>
            ))}
            <li className="px-3 md:px-4 pt-4 text-sm text-white/75">{t('freeQuote')}</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

/* Services : grande bande verte, titre fixe à gauche et liste en grandes lignes à droite */
function Services() {
  const root = useRef(null)
  const t = useT('home')
  const { isHidden } = useSitePages()

  useReveal(root, '.services-head > *, .service-item')

  return (
    <section ref={root} className={`w-full ${GREEN} text-white py-14 md:py-24 flex justify-center`}>
      <div className={`${SECTION_WIDTH} grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8 lg:gap-20`}>
        <div className="services-head lg:sticky lg:top-8 self-start">
          <p className={`${SECTION_LABEL} text-white/80`}><span className="w-1.5 h-1.5 rounded-full bg-[#C49849]" aria-hidden="true" />{t('servicesLabel')}</p>
          <h2 className={ON_IMAGE_TITLE}>{t('servicesTitle')}</h2>
          <p className="mt-4 text-sm sm:text-base md:text-lg text-white/80 leading-relaxed max-w-md">{t('servicesText')}</p>
        </div>

        <ul className="border-t border-white/20">
          {services.map((s, i) => {
            if (isHidden(s.href)) return null
            const ServiceIcon = s.icon
            return (
              <li key={s.title} className="service-item border-b border-white/20">
                <A href={s.href} className="group flex items-center gap-4 md:gap-6 py-4 md:py-5 transition-all duration-300 hover:pl-3 hover:text-[#E6C58A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C58A]">
                  <span className="shrink-0 w-11 h-11 md:w-14 md:h-14 rounded-full bg-[#C49849] flex items-center justify-center text-white">
                    <ServiceIcon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <span className="flex-1 text-xl md:text-3xl font-medium tracking-tight">{t('services')[i]}</span>
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6 shrink-0 transition-transform group-hover:translate-x-1.5" aria-hidden="true" />
                </A>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/* Appel final : photo sur toute la largeur, grand titre et photos inclinées qui flottent au défilement */
function FinalCta() {
  const photo = usePhoto()
  const root = useRef(null)
  const t = useT('home')
  const floats = [
    { slot: 'home.ways.2', cls: 'left-[4%] top-[16%] w-[15vw] max-w-[230px] -rotate-6', move: -50 },
    { slot: 'home.trips.1', cls: 'right-[5%] top-[6%] w-[13vw] max-w-[200px] rotate-6', move: -40 },
    { slot: 'home.ways.4', cls: 'right-[13%] bottom-[6%] w-[12vw] max-w-[190px] -rotate-3', move: 40 },
  ]

  useGsap(root, () => {
    const whileVisible = { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
    gsap.fromTo('.cta-bg', { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: whileVisible })
    gsap.utils.toArray('.cta-float').forEach((el, i) => {
      gsap.fromTo(el, { y: -floats[i].move }, { y: floats[i].move, ease: 'none', scrollTrigger: whileVisible })
    })
    gsap.from('.cta-content > *', {
      y: 40, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', clearProps: 'all',
      scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
    })
  })

  return (
    <section ref={root} className={`w-full ${SECTION_GAP} relative overflow-hidden text-white min-h-[560px] md:min-h-[720px] flex items-center justify-center`}>
      <SiteMedia slot="home.cta" alt="" className="cta-bg absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-[#072a1f]/65" />
      {floats.map((f) => (
        <div key={f.slot} aria-hidden="true" className={`cta-float absolute hidden lg:block ${f.cls}`}>
          <img src={photo(f.slot)} alt="" className="w-full aspect-[4/5] object-cover rounded-xl border-[6px] border-white shadow-2xl" />
        </div>
      ))}
      <div className="cta-content relative w-[90vw] max-w-4xl py-16 text-center flex flex-col items-center">
        <h2 className="text-[clamp(2.25rem,6vw,5.5rem)] font-bold uppercase leading-[1.02] tracking-tight [text-wrap:balance]">{t('ctaTitle')}</h2>
        <p className="mt-5 max-w-2xl text-sm md:text-lg text-white/90">{t('ctaText')}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <A href="/contact?type=quote" className={`${BTN} ${GOLD} text-white`}>{t('ctaQuote')}</A>
          <A href="/tailor-made" className={`${BTN} border border-white/60 hover:bg-white/10`}>{t('ctaDesign')}</A>
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
    <>
      {!ready && <Preloader onDone={() => setReady(true)} />}
      <main className="w-full overflow-x-clip bg-[#D5E8E2] flex flex-col items-center">
        <Hero ready={ready} />
        <Ways />
        <Intro />
        <Regions />
        <Trips />
        <Services />
        <Testimonials className={`${SECTION_WIDTH} ${SECTION_GAP}`} />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}

export default Home
