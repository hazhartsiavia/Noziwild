import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowUpRight, Backpack, BedDouble, Camera, Car, Compass, Route, Ship,
  Sparkles, Sun, Ticket, Users, UtensilsCrossed,
} from 'lucide-react'
import Ramena from '../assets/images/site/ramena-beach-aerial.jpg'
import NosyIranja from '../assets/images/site/nosy-iranja-aerial.jpg'
import NosyLonjo from '../assets/images/site/sugar-loaf-view.jpg'
import Ambanja from '../assets/images/site/sambirano-river.jpg'
import Deux from '../assets/images/site/coastal-tsingy.jpg'
import Tana from '../assets/images/site/antananarivo-rice-fields.jpg'
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
import Img from '../components/Img'

gsap.registerPlugin(ScrollTrigger)

/* Constantes partagées : mêmes valeurs que About, Transport, Hébergement et Destinations */
const SECTION_WIDTH = 'w-[90vw] max-w-[1360px]'
const SECTION_TITLE = 'text-[clamp(2.6rem,5.4vw,5rem)] text-forest leading-[1] [text-wrap:balance]'
const SECTION_SUBTITLE = 'text-base md:text-lg text-slate-600 leading-relaxed max-w-xl'
const SECTION_GAP = 'mt-24 md:mt-40'
const SECTION_LABEL = 'eyebrow mb-5 md:mb-6'
const HAIRLINE = 'border-forest/15'
const BTN = 'inline-flex items-center justify-center gap-2 text-sm font-medium tracking-wide px-7 py-3.5 rounded-full transition-colors duration-300'
const LIGHT = 'bg-[#F4F1EA] text-forest hover:bg-white'
const GHOST = 'border border-white/50 text-white hover:bg-white hover:text-forest'
const quoteHref = (k, v) => `/contact?type=quote&${k}=${encodeURIComponent(v)}`
const number = (i) => String(i + 1).padStart(2, '0')

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
      y: 28,
      opacity: 0,
      duration: 1,
      stagger: 0.08,
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
    <div className="relative shrink-0 w-24 h-24 md:w-28 md:h-28 text-forest/70" aria-hidden="true">
      <svg viewBox="0 0 140 140" className="absolute inset-0 w-full h-full animate-spin [animation-duration:24s] motion-reduce:animate-none">
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
        <img src={Icone} alt="" className="w-[56px] h-[56px] object-contain" />
      </span>
    </div>
  )
}

/* -------------------------- Sections --------------------------- */

/* Les 4 façons de voyager : quatre photos droites, numérotées, en quinconce. Rien d'incliné ni d'agrandi :
   une photo tournée ou zoomée est recalculée par le navigateur et perd sa netteté. */
function Ways() {
  const photo = usePhoto()
  const root = useRef(null)
  const t = useT('home')
  const { isHidden } = useSitePages()

  // Les photos se dévoilent de bas en haut, l'une après l'autre
  useGsap(root, () => {
    const trigger = { trigger: root.current, start: 'top 75%', once: true }
    gsap.from('.ways-head > *', { y: 28, opacity: 0, duration: 1, stagger: 0.08, ease: 'power3.out', clearProps: 'all', scrollTrigger: trigger })
    gsap.fromTo('.way-media', { clipPath: 'inset(100% 0% 0% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, stagger: 0.12, ease: 'expo.out', clearProps: 'clipPath',
      scrollTrigger: { trigger: '.ways-list', start: 'top 85%', once: true },
    })
    gsap.from('.way-text', { y: 16, opacity: 0, duration: 0.9, stagger: 0.12, delay: 0.25, ease: 'power3.out', clearProps: 'all', scrollTrigger: { trigger: '.ways-list', start: 'top 85%', once: true } })
  })

  return (
    <section ref={root} className={`${SECTION_WIDTH} ${SECTION_GAP}`}>
      <div className="ways-head grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-6 lg:gap-20 lg:items-end">
        <div>
          <p className={SECTION_LABEL}>{t('waysLabel')}</p>
          <h2 className={SECTION_TITLE}>{t('waysTitle')}</h2>
        </div>
        <p className={SECTION_SUBTITLE}>{t('waysText')}</p>
      </div>

      <ul className="ways-list mt-12 md:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-12">
        {ways.map((way, i) => {
          if (isHidden(way.href)) return null
          const w = { ...way, ...t('ways')[i] }
          return (
            <li key={way.href} className={`way-card ${i % 2 ? 'lg:mt-20' : ''}`}>
              <A href={w.href} className="group block">
                <span className="way-media relative block aspect-[3/4] overflow-hidden rounded-xl bg-[#EAE5D9]">
                  <Img src={photo(w.slot)} sizes="(min-width: 1024px) 45vw, 95vw" className="img-zoom absolute inset-0 w-full h-full object-cover" />
                </span>
                <span className="way-text block">
                  <span className={`mt-5 flex items-center justify-between border-t ${HAIRLINE} pt-4 text-[11px] font-medium tracking-[0.2em] text-slate-500 tabular-nums`}>
                    {number(i)}
                    <ArrowUpRight className="w-4 h-4 text-forest transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <span className="mt-3 block font-display text-[1.75rem] md:text-4xl leading-none text-forest">{w.title}</span>
                  <span className="mt-2.5 block text-sm leading-relaxed text-slate-600">{w.text}</span>
                </span>
              </A>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* Qui sommes-nous : grande phrase + invitation à nous écrire, puis nos engagements séparés par de simples filets */
function Intro() {
  const root = useRef(null)
  const t = useT('home')

  useReveal(root, '.intro-text > *, .intro-card')

  return (
    <section ref={root} className={`${SECTION_WIDTH} ${SECTION_GAP}`}>
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-24 lg:items-end">
        <div className="intro-text">
          <p className={SECTION_LABEL}>{t('introLabel')}</p>
          <h2 className={SECTION_TITLE}>{t('introTitle')}</h2>
          <p className={`mt-6 md:mt-8 ${SECTION_SUBTITLE}`}>
            {t('introText')}
          </p>
        </div>

        <div className={`intro-card flex items-center gap-6 border-t ${HAIRLINE} pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12`}>
          <TalkBadge />
          <div>
            <p className="font-display text-2xl md:text-3xl leading-tight text-forest">{t('notSure')}</p>
            <p className="mt-2 text-sm md:text-base text-slate-600">{t('notSureText')}</p>
            <A href="/contact" className="group mt-4 inline-flex items-center gap-2 border-b border-forest pb-1 text-sm font-medium text-forest">
              {t('talkExpert')}
              <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.5} aria-hidden="true" />
            </A>
          </div>
        </div>
      </div>

      <ul className={`mt-14 md:mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t ${HAIRLINE}`}>
        {promises.map((promise, i) => {
          const p = { ...promise, ...t('promises')[i] }
          const PromiseIcon = p.icon
          return (
            <li key={promise.title} className={`intro-card flex flex-col py-8 md:py-10 border-b ${HAIRLINE} lg:border-b-0 lg:border-l lg:first:border-l-0 sm:px-6 lg:px-8 lg:first:pl-0 lg:last:pr-0`}>
              <span className="flex items-center justify-between text-forest">
                <PromiseIcon className="w-6 h-6" strokeWidth={1.25} aria-hidden="true" />
                <span className="text-[11px] font-medium tracking-[0.2em] text-slate-400 tabular-nums">{number(i)}</span>
              </span>
              <h3 className="mt-8 md:mt-12 text-lg md:text-xl font-medium text-forest">{p.title}</h3>
              <p className="mt-2.5 text-sm md:text-[0.9375rem] text-slate-600 leading-relaxed">{p.text}</p>
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
    gsap.fromTo('.region-content > *', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, delay: 0.25, ease: 'power3.out', clearProps: 'all' })
  }, [active])

  return (
    <section ref={root} className={`${SECTION_WIDTH} ${SECTION_GAP}`}>
      <div className="regions-head grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-6 lg:gap-20 lg:items-end">
        <div>
          <p className={SECTION_LABEL}>{t('regionsLabel')}</p>
          <h2 className={SECTION_TITLE}>{t('regionsTitle')}</h2>
        </div>
        <p className={SECTION_SUBTITLE}>{t('regionsText')}</p>
      </div>

      {/* Fresque : un panneau photo par région, celui qui est choisi s'ouvre en grand.
          Les photos gardent leurs couleurs : seul le bas s'assombrit, sous le texte. */}
      <ul ref={stage} aria-label={t('regionsTabs')} className="mt-10 md:mt-16 flex flex-col lg:flex-row gap-1.5 lg:h-[max(600px,min(84vh,780px))]">
        {regions.map((r, i) => {
          const open = i === active
          const tr = texts[i]
          return (
            <li
              key={r.id}
              onMouseEnter={() => openSoon(i)}
              onMouseLeave={cancelOpen}
              className={`region-panel relative flex flex-col justify-end min-w-0 overflow-hidden rounded-xl bg-forest text-white transition-[flex-grow,min-height] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none lg:basis-0 ${
                open ? 'min-h-[560px] lg:min-h-0 lg:grow-[8]' : 'min-h-[84px] md:min-h-[100px] lg:min-h-0 lg:grow'
              }`}
            >
              <Img
                src={photo(r.slot)}
                alt={open ? tr.name : ''}
                sizes="(min-width: 1024px) 1400px, 300vw"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {open ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#072a1f]/90 via-[#072a1f]/35 via-50% to-transparent to-80%" />
                  <div className="region-content relative p-6 md:p-10 lg:p-12 lg:w-[min(44rem,50vw)] max-w-full">
                    <p className="eyebrow eyebrow-light">
                      {t('bestFrom', { from: monthName(r.months[0], lang, 'long'), to: monthName(r.months[1], lang, 'long') })}
                    </p>
                    <h3 tabIndex={-1} className="region-title mt-5 font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95] focus:outline-none">{tr.name}</h3>
                    <p className="mt-4 text-lg md:text-xl text-white/95">{tr.tagline}</p>
                    <p className="mt-3 text-sm md:text-base text-white/80 leading-relaxed max-w-xl">{tr.text}</p>

                    <ul aria-label={t('mustSee')} className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      {r.places.map((p, n) => (
                        <li key={p.name}>
                          <A href={`/destinations/${slugify(p.name)}`} className="inline-flex items-center gap-2.5 border-b border-white/35 pb-1 hover:border-white transition-colors">
                            <Img src={photo(p.slot)} alt="" loading="lazy" decoding="async" className="w-6 h-6 rounded-full object-cover" />
                            {tr.places[n]}
                          </A>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-8 flex flex-wrap gap-3">
                      <A href="/destinations" className={`${BTN} ${LIGHT}`}>{t('exploreRegion')}</A>
                      <A href="/circuits" className={`${BTN} ${GHOST}`}>{t('seeCircuits')}</A>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#072a1f]/85 via-[#072a1f]/20 to-transparent lg:via-40%" />
                  <button
                    type="button"
                    aria-expanded={false}
                    aria-label={tr.name}
                    onClick={(event) => {
                      cancelOpen()
                      moveFocus.current = event.detail === 0
                      setActive(i)
                    }}
                    className="absolute inset-0 flex items-center lg:flex-col lg:items-center lg:justify-end gap-4 lg:gap-5 p-5 lg:px-2 lg:py-8 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#E6C58A]"
                  >
                    <span className="lg:order-2 text-[11px] font-medium tracking-[0.2em] tabular-nums text-[#E6C58A]">{number(i)}</span>
                    <span className="font-display text-2xl md:text-3xl lg:text-4xl whitespace-nowrap lg:[writing-mode:vertical-rl] lg:rotate-180">{tr.name}</span>
                  </button>
                </>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* Voyages signature : une grande photo nette à gauche, la liste des voyages à droite. Survoler un voyage change la photo. */
function Trips() {
  const photo = usePhoto()
  const root = useRef(null)
  const t = useT('home')
  const { lang } = useLanguage()
  const [active, setActive] = useState(0)
  const items = trips.map((trip, i) => ({ ...trip, ...t('trips')[i] }))
  const current = items[active]

  useReveal(root, '.trips-head > *, .trip-card > *')

  // La légende de la photo se renouvelle à chaque voyage
  useGsap(root, () => {
    gsap.fromTo('.trip-caption > *', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: 'power3.out', clearProps: 'all' })
  }, [active])

  return (
    <section ref={root} className={`w-full ${SECTION_GAP} bg-[#EAE5D9] py-20 md:py-32 flex justify-center`}>
      <div className={SECTION_WIDTH}>
        <div className="trips-head grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-6 lg:gap-20 lg:items-end">
          <div>
            <p className={SECTION_LABEL}>{t('tripsLabel')}</p>
            <h2 className={SECTION_TITLE}>{t('tripsTitle')}</h2>
          </div>
          <p className={SECTION_SUBTITLE}>{t('tripsText')}</p>
        </div>

        <div className="trip-card mt-12 md:mt-20 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-20">
          <figure className="flex flex-col">
            <div className="relative flex-1 aspect-[4/5] sm:aspect-[5/4] lg:aspect-auto lg:min-h-[620px] overflow-hidden rounded-xl bg-[#d9d3c4]">
              {/* Simple fondu entre les photos : aucun zoom, pour qu'elles restent nettes */}
              {items.map((trip, i) => (
                <Img key={trip.name} src={photo(trip.slot)} alt={i === active ? trip.name : ''} sizes="(min-width: 1024px) 1300px, 190vw" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === active ? 'opacity-100' : 'opacity-0'}`} />
              ))}
            </div>
            <figcaption className="trip-caption mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-sm text-slate-600 min-h-6">
              <span className="font-medium text-forest">{current.name}</span>
              {current.tags && <span>{current.tags.join(' · ')}</span>}
              {current.months && <span>{t('bestMonths')} {current.months.map((m) => monthName(m, lang)).join(' · ')}</span>}
            </figcaption>
          </figure>

          <ul className={`flex flex-col border-t ${HAIRLINE}`}>
            {items.map((trip, i) => (
              <li key={trip.name} className={`border-b ${HAIRLINE}`}>
                <A
                  href={quoteHref('trip', trip.name)}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="group flex items-start gap-5 md:gap-8 py-8 md:py-10"
                >
                  <span className="pt-2 text-[11px] font-medium tracking-[0.2em] text-slate-500 tabular-nums">{number(i)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a6a2b]">{t('days', { count: trip.days })}</span>
                    <span className={`mt-3 block font-display text-4xl md:text-5xl leading-none transition-colors duration-500 ${i === active ? 'text-forest' : 'text-forest/40'}`}>{trip.name}</span>
                    <span className="mt-4 block max-w-md text-sm md:text-base leading-relaxed text-slate-600">{trip.text}</span>
                  </span>
                  <span aria-hidden="true" className={`hidden sm:flex shrink-0 w-11 h-11 rounded-full items-center justify-center border transition-colors duration-500 ${i === active ? 'bg-forest border-forest text-[#F4F1EA]' : 'border-forest/25 text-forest'}`}>
                    <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
                  </span>
                </A>
              </li>
            ))}
            <li className="pt-6 text-sm text-slate-500">{t('freeQuote')}</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

/* Services : grande bande vert forêt, titre fixe à gauche et liste en grandes lignes à droite */
function Services() {
  const root = useRef(null)
  const t = useT('home')
  const { isHidden } = useSitePages()

  useReveal(root, '.services-head > *, .service-item')

  return (
    <section ref={root} className="w-full bg-forest text-[#F4F1EA] py-20 md:py-32 flex justify-center">
      <div className={`${SECTION_WIDTH} grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-10 lg:gap-24`}>
        <div className="services-head lg:sticky lg:top-12 self-start">
          <p className={`${SECTION_LABEL} eyebrow-light`}>{t('servicesLabel')}</p>
          <h2 className="text-[clamp(2.6rem,5.4vw,5rem)] leading-[1] [text-wrap:balance]">{t('servicesTitle')}</h2>
          <p className="mt-6 text-base md:text-lg text-[#F4F1EA]/70 leading-relaxed max-w-md">{t('servicesText')}</p>
        </div>

        <ul className="border-t border-white/15">
          {services.map((s, i) => {
            if (isHidden(s.href)) return null
            return (
              <li key={s.title} className="service-item border-b border-white/15">
                <A href={s.href} className="group flex items-baseline gap-5 md:gap-8 py-5 md:py-7 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C58A]">
                  <span className="w-6 text-[11px] font-medium tracking-[0.2em] text-[#E6C58A] tabular-nums">{number(i)}</span>
                  <span className="flex-1 font-display text-3xl md:text-5xl leading-none transition-transform duration-500 ease-out group-hover:translate-x-3">{t('services')[i]}</span>
                  <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 shrink-0 self-center opacity-40 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.25} aria-hidden="true" />
                </A>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/* Appel final : une seule photo sur toute la largeur, le titre posé en bas. La photo glisse lentement au
   défilement (elle est plus haute que son cadre) au lieu d'être agrandie, pour rester nette. */
function FinalCta() {
  const root = useRef(null)
  const t = useT('home')

  useGsap(root, () => {
    gsap.fromTo('.cta-bg', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 } })
    gsap.from('.cta-content > *', {
      y: 28, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out', clearProps: 'all',
      scrollTrigger: { trigger: root.current, start: 'top 65%', once: true },
    })
  })

  return (
    <section ref={root} className={`w-full ${SECTION_GAP} relative overflow-hidden bg-forest text-white min-h-[600px] md:min-h-[88vh] flex items-end justify-center`}>
      <div className="cta-bg absolute inset-x-0 -top-[8%] h-[116%]">
        <SiteMedia slot="home.cta" alt="" sizes="(min-width: 768px) 120vw, 260vw" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#072a1f]/90 via-[#072a1f]/60 via-50% to-transparent to-90% md:via-[#072a1f]/30 md:via-45% md:to-75%" />
      <div className={`cta-content relative ${SECTION_WIDTH} pb-12 md:pb-20 pt-40 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-20 lg:items-end`}>
        <h2 className="text-[clamp(3rem,8vw,8rem)] leading-[0.92] [text-wrap:balance]">{t('ctaTitle')}</h2>
        <div>
          <p className="max-w-md text-base md:text-lg text-white/85 leading-relaxed">{t('ctaText')}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <A href="/contact?type=quote" className={`${BTN} ${LIGHT}`}>{t('ctaQuote')}</A>
            <A href="/tailor-made" className={`${BTN} ${GHOST}`}>{t('ctaDesign')}</A>
          </div>
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
      <main className="w-full overflow-x-clip bg-[#F4F1EA] flex flex-col items-center">
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
