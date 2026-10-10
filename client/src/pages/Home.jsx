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
import heroBeach from '../assets/images/heroBeach.jpg'
import Icone from '../assets/icone.png'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { slugify } from './destinationsData'

gsap.registerPlugin(ScrollTrigger)

/* Constantes partagées : mêmes valeurs que About, Transport, Hébergement et Destinations */
const SECTION_WIDTH = 'w-[90vw] lg:max-w-[90vw] xl:max-w-[95vw]'
const SECTION_TITLE = 'text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-slate-900 leading-[1.15] tracking-tight'
const SECTION_SUBTITLE = 'text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl'
const SECTION_GAP = 'mt-[50px] md:mt-[100px]'
const SECTION_LABEL = 'mb-3 text-xs sm:text-sm md:text-base uppercase tracking-wide text-slate-700'
const ON_IMAGE_TITLE = 'text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-white leading-[1.15] tracking-tight'
const BTN = 'inline-flex items-center justify-center text-sm md:text-base font-medium px-6 py-3 rounded-full active:scale-95 transition'
const GOLD = 'bg-[#C49849] hover:bg-[#a9813a]'
const GREEN = 'bg-[#074636]'
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const quoteHref = (k, v) => `/contact?type=quote&${k}=${encodeURIComponent(v)}`

/* ---------------------------- Données ---------------------------- */

// Les 4 façons de voyager
const ways = [
  { title: 'Circuits', text: 'Ready-made routes across the island', href: '/circuits', icon: Route, image: Tana },
  { title: 'Excursions', text: 'Day trips and short escapes', href: '/excurssions', icon: Sun, image: Ramena },
  { title: 'Long Stay', text: 'Live the island for weeks', href: '/longstay', icon: Compass, image: NosyIranja },
  { title: 'Tailor-Made', text: 'A trip designed around you', href: '/tailor-made', icon: Sparkles, image: Ambanja },
]

const stats = [
  { id: 1, value: '12+', label: 'Years of local expertise' },
  { id: 2, value: '300+', label: 'Happy travelers' },
  { id: 3, value: '4.9/5', label: 'Average rating' },
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
  { name: 'Highlands & Coast', days: 7, image: Tana, text: 'From lemur forests to a quiet bay, a slow week that mixes culture, nature and the sea.', tags: ['Andasibe forest', 'Village stays', 'Ramena sunsets'], months: ['Oct', 'Nov', 'Dec'] },
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
  return (
    <div className="relative shrink-0 w-24 h-24 md:w-32 md:h-32 text-slate-700" aria-hidden="true">
      <svg viewBox="0 0 140 140" className="absolute inset-0 w-full h-full animate-spin [animation-duration:20s] motion-reduce:animate-none">
        <defs>
          <path id="home-talk-circle" d="M70,70 m-52,0 a52,52 0 1,1 104,0 a52,52 0 1,1 -104,0" />
        </defs>
        <text fontSize="10" fill="currentColor" letterSpacing="0.5">
          <textPath href="#home-talk-circle" textLength="326" lengthAdjust="spacing">
            Talk to a Travel Expert / Talk to a Travel Expert /
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

/* Hero plein écran : photo pleine largeur sous la bande blanche de la navbar, titre géant, chiffres dans une carte vitrée */
function Hero() {
  const root = useRef(null)

  useGsap(root, () => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
    tl.fromTo(
      '.hero-card',
      { clipPath: 'inset(0% 0% 14% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.out', clearProps: 'clipPath' }
    )
      .from('.hero-img', { scale: 1.25, duration: 1.8, ease: 'power3.out' }, 0)
      .from('.hero-label, .hero-rating', { y: -16, opacity: 0, duration: 0.6, clearProps: 'all' }, 0.5)
      .from('.hero-eyebrow', { y: 20, opacity: 0, duration: 0.6, clearProps: 'all' }, 0.6)
      .from('.hero-line', { yPercent: 110, duration: 1.1, stagger: 0.12 }, 0.6)
      .from('.hero-copy', { y: 24, opacity: 0, duration: 0.7, clearProps: 'all' }, '-=0.6')
      .from('.hero-cta', { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, clearProps: 'all' }, '-=0.5')
      .from('.hero-glass', { x: 40, opacity: 0, duration: 0.9, clearProps: 'all' }, '-=0.8')
      .from('.hero-fact', { y: 20, opacity: 0, duration: 0.5, stagger: 0.08, clearProps: 'all' }, '-=0.5')

    // La photo glisse doucement au scroll pendant que le contenu s'estompe
    tl.add(() => {
      gsap.to('.hero-img', {
        yPercent: 10,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('.hero-content', {
        y: -60,
        opacity: 0.2,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'center center', end: 'bottom top', scrub: true },
      })
    })
  })

  return (
    <section ref={root} className="w-full">
      {/* Bande blanche en haut : l'onglet de la navbar y est accroché, comme sur les autres pages à photo */}
      <div className={`hero-card relative overflow-hidden border-t-[10px] border-white rounded-b-[2rem] md:rounded-b-[3rem] ${GREEN} text-white min-h-[max(640px,100svh)] flex flex-col`}>
        <img
          src={heroBeach}
          alt="White sand beach with bungalows, pirogues and a turquoise lagoon in Madagascar"
          className="hero-img absolute inset-0 w-full h-full object-cover"
          style={{ willChange: 'transform' }}
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-slate-950/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/45 via-transparent to-transparent" />

        <div className="relative z-20"><Navbar /></div>

        <div className={`relative ${SECTION_WIDTH} mx-auto flex flex-1 flex-col pt-6 md:pt-0 pb-8 md:pb-14`}>
          {/* Haut de la carte */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="hero-label flex items-center gap-2 text-base md:text-xl font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-white" aria-hidden="true" />
              Your Journey Begins Here
            </p>
            <p className="hero-rating hidden sm:flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-900">
              <Stars className="w-3.5 h-3.5" />
              4.9 from 300+ travelers
            </p>
          </div>

          {/* Bas de la carte : titre pleine largeur, puis texte + boutons et chiffres */}
          <div className="hero-content mt-auto pt-10 md:pt-12">
            <p className="hero-eyebrow text-sm md:text-base text-white/80 mb-4">Private trips across Madagascar</p>
            {/* Taille fluide : suit la largeur ET la hauteur de l'écran pour tenir sur le premier écran */}
            <h1 aria-label="Explore The Soul Of Madagascar" className="text-[clamp(2.75rem,min(10vw,13vh),9rem)] font-semibold leading-[0.92] tracking-tight">
              <span className="block overflow-hidden pb-2" aria-hidden="true"><span className="hero-line block sm:whitespace-nowrap">Explore The Soul</span></span>
              <span className="block overflow-hidden pb-2" aria-hidden="true"><span className="hero-line block sm:whitespace-nowrap">Of <span className="text-[#E9CF8F]">Madagascar</span></span></span>
            </h1>

            <div className="mt-5 md:mt-7 grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-8 xl:gap-12 items-end">
            <div>
              <p className="hero-copy text-base md:text-lg text-white/90 leading-relaxed max-w-xl">
                Local guides, handpicked stays and routes planned by people who live here. Tell us your dream trip and get a free quote within one working day.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/contact?type=quote"
                  className="hero-cta group inline-flex items-center gap-4 rounded-full bg-white text-slate-900 hover:bg-[#F7EEDC] transition-colors pl-6 pr-2 py-2 md:pl-7"
                >
                  <span className="text-base md:text-lg font-medium">Get a Free Quote</span>
                  <span className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${GOLD} text-white flex items-center justify-center transition-transform group-hover:translate-x-1`}>
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </span>
                </a>
                <a href="/destinations" className={`hero-cta ${BTN} border border-white/50 hover:bg-white/10 text-white md:px-8`}>Explore destinations</a>
              </div>
            </div>

            {/* Carte vitrée : chiffres clés */}
            <div className="hero-glass rounded-3xl border border-white/25 bg-white/10 backdrop-blur-md p-5 md:p-7 md:max-w-xl xl:max-w-none">
              <ul className="grid grid-cols-3 gap-4">
                {stats.map((s) => (
                  <li key={s.id} className="hero-fact">
                    <p className="text-2xl md:text-4xl font-semibold leading-none">{s.value}</p>
                    <p className="mt-2 text-xs md:text-sm text-white/80 leading-snug">{s.label}</p>
                  </li>
                ))}
              </ul>
              <div className="hero-fact mt-6 flex items-center gap-4 border-t border-white/25 pt-5">
                <img src={Icone} alt="" className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white object-contain p-1.5" />
                <p className="text-sm md:text-base text-white/90 leading-snug">A real planner answers you, before, during and after your trip.</p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* Les 4 façons de voyager : cartes photo (même style que les cartes de la page Destinations) */
function Ways() {
  const root = useRef(null)

  useReveal(root, '.ways-head > *, .way-card')

  return (
    <section ref={root} className={`${SECTION_WIDTH} ${SECTION_GAP}`}>
      <div className="ways-head flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 lg:gap-12">
        <div>
          <p className={SECTION_LABEL}>How you travel</p>
          <h2 className={SECTION_TITLE}>Every Way To Discover Madagascar</h2>
        </div>
        <p className={`${SECTION_SUBTITLE} lg:max-w-md`}>From a single morning on the water to a month on the island, pick the format that fits you.</p>
      </div>

      <ul className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {ways.map((w) => {
          const WayIcon = w.icon
          return (
            <li key={w.title} className="way-card">
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

  useReveal(root, '.intro-text > *, .intro-card')

  return (
    <section ref={root} className={`${SECTION_WIDTH} ${SECTION_GAP}`}>
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-16 items-center">
        <div className="intro-text">
          <p className={SECTION_LABEL}>Why Noziwild</p>
          <h2 className={SECTION_TITLE}>A Local Team, From The First Idea To The Last Sunset</h2>
          <p className={`mt-5 md:mt-6 ${SECTION_SUBTITLE}`}>
            We live in Madagascar and plan every trip ourselves. Routes, drivers, guides and stays are chosen by people who know them personally.
          </p>
        </div>

        <div className="intro-card flex items-center gap-5 md:gap-6 rounded-3xl bg-white p-5 md:p-8">
          <TalkBadge />
          <div>
            <p className="text-lg md:text-2xl font-medium leading-snug text-slate-900">Not sure where to start?</p>
            <p className="mt-2 text-sm md:text-base text-slate-600">Tell us what you love. We suggest the route.</p>
            <a href="/contact" className={`${BTN} ${GREEN} hover:bg-[#0a5f48] text-white mt-4`}>Talk to an expert</a>
          </div>
        </div>
      </div>

      <ul className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {promises.map((p) => {
          const PromiseIcon = p.icon
          return (
            <li key={p.title} className="intro-card flex flex-col rounded-2xl bg-white p-5 md:p-6">
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
  const [active, setActive] = useState(0)
  const region = regions[active]
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
          <p className={SECTION_LABEL}>Destinations</p>
          <h2 className={SECTION_TITLE}>Five Regions, One Island</h2>
        </div>
        <p className={`${SECTION_SUBTITLE} lg:max-w-md`}>Madagascar is a continent in miniature. Pick a region to see what it is known for and when to go.</p>
      </div>

      <div className="mt-8 md:mt-10 flex">
        <ul role="tablist" aria-label="Regions" className="flex gap-2 rounded-full bg-white/85 backdrop-blur-md p-2 shadow-sm overflow-x-auto max-w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                {r.name}
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
            Best from {MONTHS[first - 1]} to {MONTHS[last - 1]}
          </span>
        </div>

        <div className="region-text">
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.1] tracking-tight text-slate-900">{region.name}</h3>
          <p className="mt-3 text-lg md:text-2xl text-slate-700">{region.tagline}</p>
          <p className="mt-5 text-sm md:text-base text-slate-600 leading-relaxed max-w-xl">{region.text}</p>

          <p className="mt-8 mb-3 text-sm md:text-base font-medium text-slate-800">Must-see places</p>
          <ul className="grid grid-cols-3 gap-3 md:gap-4">
            {region.places.map((p) => (
              <li key={p.name}>
                <a href={`/destinations/${slugify(p.name)}`} className="group block">
                  <div className="aspect-square overflow-hidden rounded-2xl md:rounded-3xl">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-800 leading-snug group-hover:underline">{p.name}</p>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/destinations" className={`${BTN} ${GOLD} text-white`}>Explore this region</a>
            <a href="/circuits" className={`${BTN} border border-slate-400 hover:border-slate-800 text-slate-800`}>See circuits</a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* Voyages signature : une grande carte + deux petites */
function Trips() {
  const root = useRef(null)
  const [big, ...rest] = trips
  const card = 'trip-card group relative overflow-hidden rounded-3xl bg-slate-900 text-white flex focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-800'
  const shade = 'absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent'
  const img = 'absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105'

  useReveal(root, '.trips-head > *, .trip-card')

  return (
    <section ref={root} className={`${SECTION_WIDTH} ${SECTION_GAP}`}>
      <div className="trips-head flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 lg:gap-12">
        <div>
          <p className={SECTION_LABEL}>Signature trips</p>
          <h2 className={`${SECTION_TITLE} max-w-3xl`}>Trips We Love To Send You On</h2>
        </div>
        <p className={`${SECTION_SUBTITLE} lg:max-w-md`}>Ready-made starting points. We adapt each one to your dates, pace and budget.</p>
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-4 md:gap-6">
        <a href={quoteHref('trip', big.name)} className={`${card} min-h-[480px] lg:min-h-[640px] lg:row-span-2`}>
          <img src={big.image} alt={big.name} className={img} /><span className={shade} />
          <span className="relative flex w-full flex-col justify-end p-6 md:p-10">
            <span className="self-start bg-[#C49849] text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm">{big.days} days</span>
            <span className="mt-4 block text-3xl md:text-5xl font-medium tracking-tight">{big.name}</span>
            <span className="mt-3 block max-w-md text-sm md:text-base text-white/85">{big.text}</span>
            <span className="mt-4 flex flex-wrap gap-2">
              {big.tags.map((h) => <span key={h} className="rounded-full border border-white/40 bg-white/10 backdrop-blur-sm px-3 py-1 text-xs md:text-sm">{h}</span>)}
            </span>
            <span className="mt-5 flex flex-wrap items-center gap-2 text-sm text-white/80">
              Best months: {big.months.map((m) => <span key={m} className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-900">{m}</span>)}
            </span>
            <span className="mt-6 flex items-center justify-between border-t border-white/25 pt-5">
              <span className="text-white/85">Free quote, no obligation</span>
              <span className="w-11 h-11 rounded-full bg-[#C49849] flex items-center justify-center transition group-hover:translate-x-1"><ArrowRight className="w-5 h-5" aria-hidden="true" /></span>
            </span>
          </span>
        </a>
        {rest.map((t) => (
          <a key={t.name} href={quoteHref('trip', t.name)} className={`${card} min-h-[310px]`}>
            <img src={t.image} alt={t.name} className={img} /><span className={shade} />
            <span className="relative flex w-full flex-col justify-end p-5 md:p-8">
              <span className="self-start bg-[#C49849] text-xs font-medium px-3 py-1.5 rounded-sm">{t.days} days</span>
              <span className="mt-3 block text-2xl md:text-3xl font-medium tracking-tight">{t.name}</span>
              <span className="mt-2 block text-sm text-white/80">{t.text}</span>
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

  useReveal(root, '.services-head > *, .service-item')

  return (
    <section ref={root} className={`${SECTION_WIDTH} ${SECTION_GAP} rounded-[2rem] md:rounded-[3rem] ${GREEN} text-white p-5 sm:p-8 md:p-14`}>
      <div className="services-head flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 lg:gap-12">
        <div>
          <p className="mb-3 text-xs sm:text-sm md:text-base uppercase tracking-wide text-white/70">Services</p>
          <h2 className={`${ON_IMAGE_TITLE} max-w-3xl`}>Everything Taken Care Of</h2>
        </div>
        <p className="text-sm sm:text-base md:text-lg text-white/75 leading-relaxed lg:max-w-md">
          Book the whole trip with us, or only the part you need. Every service is run by our team and trusted local partners.
        </p>
      </div>

      <ul className="mt-10 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {services.map((s) => {
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
                <span className="flex-1 text-sm lg:text-base font-medium leading-snug">{s.title}</span>
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
  const initials = (name) => name.split(/[\s&.]+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('')

  useReveal(root, '.testimonial-card')

  return (
    <section ref={root} className={`${SECTION_WIDTH} ${SECTION_GAP}`}>
      <div className="mb-10 md:mb-14 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 lg:gap-12">
        <div>
          <p className={SECTION_LABEL}>Kind words</p>
          <h2 className={SECTION_TITLE}>Loved By Travelers</h2>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-5xl md:text-6xl leading-none text-slate-800">4.9<span className="text-2xl text-slate-500">/5</span></p>
          <div>
            <Stars />
            <p className="mt-2 text-sm md:text-base text-slate-600">Average rating from 300+ travelers</p>
          </div>
        </div>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {quotes.map((q) => (
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
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight">Ready To Plan Your Trip?</h2>
        <p className="mt-4 text-sm md:text-lg text-white/85">Tell us what you love and how long you have. A real planner answers within one working day with a first idea and a free quote.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="/contact?type=quote" className={`${BTN} ${GOLD} text-white`}>Get a free quote</a>
          <a href="/tailor-made" className={`${BTN} border border-white/50 hover:bg-white/10`}>Design my own trip</a>
        </div>
      </div>
    </section>
  )
}

/* ================= Page ================= */

function Home() {
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
      <main className="w-full bg-[#D5E8E2] pb-16 md:pb-24 flex flex-col items-center">
        <Hero />
        <Ways />
        <Intro />
        <Regions />
        <Trips />
        <Services />
        <Testimonials />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}

export default Home
