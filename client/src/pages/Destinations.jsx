import React, { useState, useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Ramena from '../assets/images/Ramena.png'
import NosyIranja from '../assets/images/NosyIranja.png'
import NosyLonjo from '../assets/images/NosyLonjo.png'
import Ambanja from '../assets/images/Ambanja.png'
import Deux from '../assets/images/2.jpg'
import Tana from '../assets/images/Tana.png'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { slugify } from './destinationsData'

gsap.registerPlugin(ScrollTrigger)

const W = 'w-[90vw] lg:max-w-[95vw]'
const GOLD = 'bg-[#C49849] hover:bg-[#a9813a]'
const BTN = 'inline-flex items-center justify-center text-sm font-medium px-6 py-3 rounded-full active:scale-95 transition'
const H2 = 'text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-medium leading-[1.1] tracking-tight text-slate-900'
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/* ---------------------------- Données ---------------------------- */

const regions = [
  {
    id: 'north',
    name: 'The North',
    tagline: 'Emerald bays, spice islands and dry forests',
    text: 'Sail the bay of Diego Suarez, hike the sharp limestone of Ankarana and finish on the islands around Nosy Be.',
    image: NosyIranja,
    months: [4, 5, 6, 7, 8, 9, 10, 11],
    places: [
      { name: 'Ramena Beach', image: Ramena },
      { name: 'Nosy Iranja', image: NosyIranja },
      { name: 'Ambanja', image: Ambanja },
    ],
  },
  {
    id: 'highlands',
    name: 'The Highlands',
    tagline: 'Royal hills, rice terraces and cool mornings',
    text: 'Start in Antananarivo, climb to the royal hill of Ambohimanga and ride south through the terraced valleys to Antsirabe.',
    image: Tana,
    months: [5, 6, 7, 8, 9, 10],
    places: [
      { name: 'Antananarivo', image: Tana },
      { name: 'Ambohimanga', image: Deux },
      { name: 'Antsirabe', image: Ambanja },
    ],
  },
  {
    id: 'west',
    name: 'The West',
    tagline: 'Baobab avenues and stone forests',
    text: 'Drive the famous Baobab Avenue at sunset, then cross the river to walk the Tsingy of Bemaraha.',
    image: Deux,
    months: [5, 6, 7, 8, 9, 10],
    places: [
      { name: 'Baobab Avenue', image: Deux },
      { name: 'Morondava', image: NosyLonjo },
      { name: 'Tsingy de Bemaraha', image: Ambanja },
    ],
  },
  {
    id: 'south',
    name: 'The South',
    tagline: 'Canyons, white sand and coastal villages',
    text: 'Hike the sandstone canyons of Isalo, swim in natural pools and end the trip on the Vezo coast.',
    image: NosyLonjo,
    months: [4, 5, 6, 7, 8, 9, 10, 11],
    places: [
      { name: 'Isalo', image: NosyLonjo },
      { name: 'Ifaty coast', image: Ramena },
      { name: 'Fort Dauphin', image: NosyIranja },
    ],
  },
  {
    id: 'east',
    name: 'The East',
    tagline: 'Rainforest, lemurs and island beaches',
    text: 'Listen for the indri at dawn in Andasibe, then take a boat to Ile Sainte-Marie or into the Masoala peninsula.',
    image: Ambanja,
    months: [9, 10, 11, 12],
    places: [
      { name: 'Andasibe', image: Ambanja },
      { name: 'Ile Sainte-Marie', image: NosyIranja },
      { name: 'Masoala', image: Tana },
    ],
  },
]

/* ----------------------- Hook utilitaire GSAP ---------------------- */
/* Crée un gsap.context lié à `scope`, respecte prefers-reduced-motion,
   et nettoie tout au démontage. */

function useGsap(scope, setup, deps = []) {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia(scope)
    mm.add('(prefers-reduced-motion: no-preference)', () => setup())
    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/* -------------------------- Composants --------------------------- */

function Hero() {
  const root = useRef(null)
  const strip = [
    { src: Ramena, cls: 'mt-0' },
    { src: Tana, cls: 'mt-10 md:mt-16' },
    { src: NosyLonjo, cls: 'mt-4 md:mt-6' },
  ]

  useGsap(root, () => {
    // Séquence d'arrivée (une seule fois au chargement)
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
    tl.from('.hero-eyebrow', { y: 20, opacity: 0, duration: 0.6 })
      .from('.hero-line', { y: 60, opacity: 0, duration: 1, stagger: 0.12, clearProps: 'all' }, '-=0.3')
      .from('.hero-copy', { y: 24, opacity: 0, duration: 0.7, clearProps: 'all' }, '-=0.6')
      .from('.hero-cta', { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, clearProps: 'all' }, '-=0.5')
      .from(
        '.hero-img',
        { yPercent: 25, opacity: 0, scale: 0.92, duration: 1.2, stagger: 0.15, ease: 'expo.out' },
        0.2
      )

    // Parallaxe (créée une fois l'entrée terminée pour éviter tout conflit)
    tl.add(() => {
      gsap.utils.toArray('.hero-img').forEach((el, i) => {
        gsap.to(el, {
          yPercent: -8 - i * 6,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        })
      })
    })
  })

  return (
    <>
      <Navbar />
      <section ref={root} className={`${W} mt-6 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 items-center`}>
        <div>
          <p className="hero-eyebrow text-sm md:text-base text-slate-700 mb-4">Five regions, one island</p>
          <h1 className="text-6xl sm:text-7xl md:text-8xl xl:text-[120px] font-semibold leading-[0.9] tracking-tight text-slate-900">
            <span className="hero-line inline-block">Where To</span><br />
            <span className="hero-line inline-block">Go First</span>
          </h1>
          <p className="hero-copy mt-6 text-base md:text-lg text-slate-700 leading-relaxed max-w-lg">
            Madagascar is a continent in miniature. Explore each region, find the places worth the drive and pick the right month.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#regions" className={`hero-cta ${BTN} bg-slate-800 hover:bg-slate-700 text-white`}>Explore the regions</a>
            <a href="#planner" className={`hero-cta ${BTN} border border-slate-400 hover:border-slate-800 text-slate-800`}>When to go</a>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-5">
          {strip.map((s, i) => (
            <img key={i} src={s.src} alt="" className={`hero-img ${s.cls} w-full aspect-[3/5] object-cover rounded-[1.5rem] md:rounded-[2.5rem] `} />
          ))}
        </div>
      </section>
    </>
  )
}

function RegionNav() {
  const root = useRef(null)

  useGsap(root, () => {
    // Pastille active : suit la région visible à l'écran
    const links = gsap.utils.toArray('.region-link')
    const setActive = (id) =>
      links.forEach((l) => {
        const on = l.getAttribute('href') === `#${id}`
        l.classList.toggle('bg-slate-800', on)
        l.classList.toggle('text-white', on)
      })

    regions.forEach((r) => {
      ScrollTrigger.create({
        trigger: `#${r.id}`,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && setActive(r.id),
      })
    })

    // Apparition de la barre
    gsap.from(root.current, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      clearProps: 'opacity,transform',
      scrollTrigger: { trigger: root.current, start: 'top 95%', once: true },
    })
  })

  return (
    <nav ref={root} aria-label="Regions" id="regions" className="sticky top-3 z-20 mt-16 md:mt-24 scroll-mt-4">
      <ul className="flex gap-2 rounded-full bg-white/85 backdrop-blur-md p-2 shadow-sm overflow-x-auto max-w-[90vw] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {regions.map((r) => (
          <li key={r.id} className="shrink-0">
            <a href={`#${r.id}`} className="region-link block rounded-full px-5 py-2.5 text-sm md:text-base text-slate-800 hover:bg-slate-800 hover:text-white transition">
              {r.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function Region({ region, flip }) {
  const root = useRef(null)
  const first = region.months[0]
  const last = region.months[region.months.length - 1]

  useGsap(root, () => {
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
    })

    // Révélation de l'image par un clip-path + dézoom
    tl.fromTo(
      '.region-frame',
      { clipPath: 'inset(12% 12% 12% 12% round 3rem)' },
      { clipPath: 'inset(0% 0% 0% 0% round 3rem)', duration: 1.3, ease: 'expo.out', clearProps: 'clipPath' }
    )
      .from('.region-badge', { x: -20, opacity: 0, duration: 0.6 }, '-=0.6')
      .from('.region-text > *', { y: 30, opacity: 0, duration: 0.8, stagger: 0.1, clearProps: 'all' }, '-=1')
      .from('.region-place', { y: 40, opacity: 0, duration: 0.7, stagger: 0.1, clearProps: 'all' }, '-=0.5')

    // Léger dézoom de l'image au scroll (scrub), sans changer sa taille de base
    gsap.fromTo(
      '.region-img',
      { scale: 1.12 },
      {
        scale: 1,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    )
  })

  return (
    <section ref={root} id={region.id} className={`${W} mt-16 md:mt-28 scroll-mt-24 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center`}>
      <div className={`region-frame relative aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5] overflow-hidden rounded-[2rem] md:rounded-[3rem] ${flip ? 'lg:order-2' : ''}`}>
        <img src={region.image} alt={region.name} className="region-img absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
        <span className="region-badge absolute left-5 top-5 bg-[#C49849] text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm">
          Best from {MONTHS[first - 1]} to {MONTHS[last - 1]}
        </span>
      </div>

      <div className="region-text">
        <h2 className={H2}>{region.name}</h2>
        <p className="mt-3 text-lg md:text-2xl text-slate-700">{region.tagline}</p>
        <p className="mt-5 text-sm md:text-base text-slate-600 leading-relaxed max-w-xl">{region.text}</p>

        <p className="mt-8 mb-3 text-sm md:text-base font-medium text-slate-800">Must-see places</p>
        <ul className="grid grid-cols-3 gap-3 md:gap-4">
          {region.places.map((p) => (
            <li key={p.name} className="region-place">
              <a href={`/destinations/${slugify(p.name)}`} className="group block">
                <div className="aspect-square overflow-hidden rounded-2xl md:rounded-3xl">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-800 leading-snug group-hover:underline">{p.name}</p>
              </a>
            </li>
          ))}
        </ul>

        <a href="/circuits" className={`${BTN} ${GOLD} text-white mt-8`}>See circuits in this region</a>
      </div>
    </section>
  )
}

function Planner() {
  const root = useRef(null)
  const list = useRef(null)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const good = regions.filter((r) => r.months.includes(month))

  // Entrée du bloc au scroll
  useGsap(root, () => {
    gsap.from(root.current, {
      y: 80,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      clearProps: 'all',
      scrollTrigger: { trigger: root.current, start: 'top 85%', once: true },
    })
    gsap.from('.planner-month', {
      y: 16,
      opacity: 0,
      duration: 0.5,
      stagger: 0.04,
      ease: 'power2.out',
      clearProps: 'all',
      scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
    })
  })

  // Les cartes se ré-animent à chaque changement de mois
  useGsap(list, () => {
    gsap.fromTo(
      '.planner-card',
      { y: 40, opacity: 0, scale: 0.94 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out', clearProps: 'all' }
    )
  }, [month])

  return (
    <section ref={root} id="planner" className={`${W} mt-20 md:mt-32 scroll-mt-8 rounded-[2rem] md:rounded-[3rem] bg-slate-900 text-white p-5 sm:p-8 md:p-14`}>
      <h2 className={`${H2} !text-white max-w-3xl`}>When Should You Go?</h2>
      <p className="mt-4 text-sm md:text-base text-white/75 max-w-xl">Pick a month to see which regions are at their best. Dates are a guide, weather varies each year.</p>

      <div className="mt-8 flex flex-wrap gap-2 md:gap-3">
        {MONTHS.map((m, i) => (
          <button
            key={m}
            onClick={() => setMonth(i + 1)}
            aria-pressed={month === i + 1}
            className={`planner-month rounded-full px-4 py-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C49849] ${
              month === i + 1 ? 'bg-[#C49849] text-white' : 'border border-white/30 text-white/80 hover:border-white'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div ref={list}>
        {good.length > 0 ? (
          <ul className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {good.map((r) => (
              <li key={r.id} className="planner-card">
                <a href={`#${r.id}`} className="group relative block aspect-[3/4] overflow-hidden rounded-[1.5rem]">
                  <img src={r.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 to-transparent" />
                  <p className="absolute inset-x-0 bottom-0 p-4 text-lg md:text-xl font-medium">{r.name}</p>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p role="status" className="planner-card mt-10 text-white/80">No region is at its best in {MONTHS[month - 1]}. Try another month.</p>
        )}
      </div>
    </section>
  )
}

function FinalCta() {
  const root = useRef(null)

  useGsap(root, () => {
    // Parallaxe du fond
    gsap.fromTo(
      '.cta-bg',
      { scale: 1.15 },
      {
        scale: 1,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    )
    // Contenu
    gsap.from('.cta-content > *', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power3.out',
      clearProps: 'all',
      scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
    })
  })

  return (
    <section ref={root} className={`${W} mt-20 md:mt-32 relative overflow-hidden rounded-[2rem] md:rounded-[3rem] text-white min-h-[420px] flex items-center`}>
      <img src={Ramena} alt="" className="cta-bg absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-slate-950/65" />
      <div className="cta-content relative p-8 md:p-16 max-w-3xl">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight">Not sure where to start?</h2>
        <p className="mt-4 text-sm md:text-lg text-white/85">Tell us what you love and how long you have. We will suggest the regions that fit.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="/contact" className={`${BTN} ${GOLD} text-white`}>Talk to a travel expert</a>
          <a href="/circuits" className={`${BTN} border border-white/50 hover:bg-white/10`}>Browse circuits</a>
        </div>
      </div>
    </section>
  )
}

function Destinations() {
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
        <RegionNav />
        {regions.map((r, i) => <Region key={r.id} region={r} flip={i % 2 === 1} />)}
        <Planner />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}

export default Destinations