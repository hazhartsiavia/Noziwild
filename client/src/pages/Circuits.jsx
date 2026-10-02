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

gsap.registerPlugin(ScrollTrigger)

/* Constantes partagées : mêmes valeurs que Blog et Contact */
const SECTION_WIDTH = 'w-[90vw] lg:max-w-[95vw]'
const SECTION_TITLE = 'text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-slate-900 leading-[1.15] tracking-tight'
const SECTION_SUBTITLE = 'text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl'
const META_TEXT = 'text-xs sm:text-sm'
const PAGE_TITLE = 'text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold uppercase leading-none tracking-tight'
const BADGE = 'inline-block bg-[#C49849] text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm'
const BUTTON = 'text-sm font-medium px-5 py-2.5 rounded-full'

/* ---------------------------- Données ---------------------------- */

const regions = ['All', 'North', 'Highlands', 'South & West', 'East']

const durations = [
  { label: 'Any length', test: () => true },
  { label: '1 week or less', test: (d) => d <= 7 },
  { label: '8 to 12 days', test: (d) => d >= 8 && d <= 12 },
  { label: '13 days or more', test: (d) => d >= 13 },
]

const circuits = [
  {
    id: 1,
    region: 'North',
    title: 'Diego Suarez Bay And Ramena Coast',
    days: 6,
    stops: 'Diego Suarez · Ramena · Emerald Sea',
    level: 'Easy',
    price: 'From €890',
    image: Ramena,
  },
  {
    id: 2,
    region: 'North',
    title: 'Nosy Be, Nosy Iranja And Nosy Lonjo',
    days: 8,
    stops: 'Nosy Be · Nosy Iranja · Nosy Lonjo',
    level: 'Easy',
    price: 'From €1,240',
    image: NosyIranja,
  },
  {
    id: 3,
    region: 'North',
    title: 'Ambanja Cocoa Country And Northern Wildlife',
    days: 10,
    stops: 'Ambanja · Ankarana · Amber Mountain',
    level: 'Moderate',
    price: 'From €1,480',
    image: Ambanja,
  },
  {
    id: 4,
    region: 'Highlands',
    title: 'Antananarivo And The Royal Highlands',
    days: 5,
    stops: 'Antananarivo · Ambohimanga · Antsirabe',
    level: 'Easy',
    price: 'From €640',
    image: Tana,
  },
  {
    id: 5,
    region: 'South & West',
    title: 'Baobab Avenue And The Tsingy',
    days: 12,
    stops: 'Morondava · Baobab Avenue · Bekopaka',
    level: 'Moderate',
    price: 'From €1,760',
    image: Deux,
  },
  {
    id: 6,
    region: 'East',
    title: 'Rainforests, Lemurs And Indri Trails',
    days: 14,
    stops: 'Andasibe · Ile Sainte-Marie · Masoala',
    level: 'Active',
    price: 'From €2,150',
    image: NosyLonjo,
  },
]

const highlights = [
  { id: 1, title: 'Local guides', text: 'Every circuit is led by a licensed Malagasy guide who knows the parks, the roads and the villages.' },
  { id: 2, title: 'Small groups', text: 'No more than eight travellers per vehicle, so you see more and wait less.' },
  { id: 3, title: 'Made to measure', text: 'Every circuit can be shortened, extended or mixed with another one.' },
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
  const root = useRef(null)

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
      <section ref={root} className={`${SECTION_WIDTH} relative flex items-center overflow-hidden rounded-3xl bg-slate-900 text-white min-h-[100px] md:min-h-[360px]`}>
        <img src={NosyIranja} alt="" className="hero-bg absolute inset-0 w-full h-full object-cover" />
        <div className="hero-shade absolute inset-0 bg-slate-950/60" />
        <div className="relative w-full max-w-5xl mx-auto px-6 md:px-10 py-16">
          <h1 className={`hero-title ${PAGE_TITLE}`}>Our Circuits</h1>
          <hr className="hero-rule my-6 md:my-8 border-white/30" />
          <nav aria-label="Breadcrumb" className="hero-crumb text-sm md:text-base font-medium">
            <a href="/" className="hover:underline underline-offset-4">Home</a> <span aria-hidden="true">/</span> Circuits
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
          ? 'bg-slate-800 border-slate-800 text-white'
          : 'bg-white border-slate-300 text-slate-700 hover:border-slate-500'
      }`}
    >
      {children}
    </button>
  )
}

function CircuitCard({ circuit }) {
  return (
    <a href={`/circuits/${circuit.id}`} className="circuit-card group flex flex-col rounded-xl bg-white p-3 text-slate-800">
      <div className="relative aspect-[4/3] overflow-hidden rounded-md">
        <img
          src={circuit.image}
          alt={circuit.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className={`circuit-badge ${BADGE} absolute left-3 top-3`}>{circuit.days} days</span>
      </div>
      <div className="flex flex-1 flex-col px-3 pt-6 pb-4">
        <p className={`flex items-center gap-3 ${META_TEXT} text-slate-600`}>
          <span>{circuit.region}</span>
          <span className="w-px h-4 bg-slate-700" />
          <span>{circuit.level}</span>
        </p>
        <h3 className="mt-4 text-xl md:text-2xl leading-snug group-hover:underline">{circuit.title}</h3>
        <p className={`mt-3 ${META_TEXT} text-slate-600`}>{circuit.stops}</p>
        <p className="mt-auto pt-6 text-base md:text-lg font-medium text-slate-900">{circuit.price}</p>
      </div>
    </a>
  )
}

function Circuits() {
  const [region, setRegion] = useState('All')
  const [duration, setDuration] = useState(0)

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
  }, [region, duration])

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
                Travel across Madagascar
              </p>
              <h2 className={`intro-title ${SECTION_TITLE}`}>Find The Circuit That Fits Your Trip</h2>
              <p className={`intro-sub ${SECTION_SUBTITLE} mt-4`}>
                From the northern bays to the baobabs of the west, choose a ready-made route or ask us to build your own.
              </p>
            </div>

            <div className="filter-panel rounded-3xl bg-white p-5 md:p-8 flex flex-col gap-6">
              <div>
                <p className="mb-3 text-sm md:text-base text-slate-700">Region</p>
                <div className="flex flex-wrap gap-3">
                  {regions.map((r) => (
                    <Chip key={r} active={region === r} onClick={() => setRegion(r)}>{r}</Chip>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm md:text-base text-slate-700">Duration</p>
                <div className="flex flex-wrap gap-3">
                  {durations.map((d, i) => (
                    <Chip key={d.label} active={duration === i} onClick={() => setDuration(i)}>{d.label}</Chip>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Grille de circuits */}
          <div ref={gridRef}>
            {visible.length > 0 ? (
              <div className="mt-10 md:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-9">
                {visible.map((circuit) => (
                  <CircuitCard key={circuit.id} circuit={circuit} />
                ))}
              </div>
            ) : (
              <div role="status" className="mt-10 md:mt-16 rounded-3xl bg-white p-8 text-center text-slate-700">
                <p className="text-lg">No circuit matches these filters.</p>
                <button
                  type="button"
                  onClick={() => { setRegion('All'); setDuration(0) }}
                  className={`mt-4 bg-slate-800 hover:bg-slate-700 active:scale-95 transition text-white ${BUTTON}`}
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Points forts */}
        <section ref={highlightsRef} className={`${SECTION_WIDTH} mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6`}>
          {highlights.map((item) => (
            <div key={item.id} className="highlight rounded-3xl bg-white p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-medium text-slate-900">{item.title}</h3>
              <p className="mt-3 text-sm md:text-base text-slate-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </section>

        {/* Appel à l'action */}
        <section ref={ctaRef} className={`${SECTION_WIDTH} mt-16 md:mt-24`}>
          <div className="cta-card relative overflow-hidden rounded-3xl text-white">
            <img src={Ambanja} alt="" className="cta-bg absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-slate-950/70" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 md:p-12">
              <div className="cta-text max-w-2xl">
                <h2 className="text-2xl md:text-4xl font-medium leading-snug">Want a route that is not on this list?</h2>
                <p className="mt-3 text-sm md:text-base">Tell us your dates and interests. A travel expert replies within one working day.</p>
              </div>
              <a
                href="/contact"
                className={`cta-btn shrink-0 self-start md:self-center bg-[#C49849] hover:bg-[#a9813a] active:scale-95 transition text-white ${BUTTON} md:px-6 md:py-3`}
              >
                Plan my circuit
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