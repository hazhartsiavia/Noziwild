import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Deux from "../assets/images/2.jpg";
import Ambanja from "../assets/images/Ambanja.png";
import NosyLonjo from "../assets/images/NosyLonjo.png";
import NosyIranja from "../assets/images/NosyIranja.png";
import Ramena from "../assets/images/Ramena.png";
import Tana from "../assets/images/Tana.png";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* Constantes partagées : mêmes valeurs que dans les autres pages */
const SECTION_WIDTH = "w-[90vw] lg:max-w-[90vw] xl:max-w-[95vw]"
const SECTION_TITLE = "text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-slate-900 leading-[1.15] tracking-tight"
const SECTION_SUBTITLE = "text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl"
const META_TEXT = "text-xs sm:text-sm"
const STATEMENT_TITLE = "text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-medium uppercase leading-[1.15] tracking-tight text-slate-900"
const BADGE = "inline-block bg-[#C49849] text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm"
const BUTTON = "text-sm font-medium px-5 py-2.5 rounded-full md:px-6 md:py-3 active:scale-95 transition"
const SECTION_GAP = "mt-[60px] md:mt-[120px]"

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------------------------- Données ---------------------------- */

// perDay = budget par personne et par jour (exemples, à adapter)
const styles = [
  { id: 'relax', label: 'Relax', perDay: 95, stops: ['Beach morning in Nosy Be', 'Day on Nosy Iranja', 'Ramena bay & lunch', 'Catamaran cruise', 'Sunset dinner', 'Spa afternoon', 'Cocoa farm in Ambanja'] },
  { id: 'culture', label: 'Culture', perDay: 85, stops: ['Antananarivo old town', 'Royal Hill visit', 'Highland villages', 'Artisan workshops', 'Market & food walk', 'Folk music night', 'Vanilla farm'] },
  { id: 'adventure', label: 'Adventure', perDay: 110, stops: ['Andasibe forest trek', 'Lemur night walk', 'Canyon hike', 'Avenue of the Baobabs', '4x4 coastal route', 'Kayak the bay', 'Waterfall day'] },
  { id: 'food', label: 'Food', perDay: 100, stops: ['Street food walk', 'Cooking class', 'Spice & vanilla farm', 'Family lunch', 'Seafood on the beach', 'Vanilla dessert tasting', 'Market breakfast'] },
]

const process = [
  { id: 1, title: 'We listen', text: 'A short call or message to understand your dates, budget, pace and the things you cannot miss.', deliverable: 'Your travel brief', tone: 'bg-white text-slate-900' },
  { id: 2, title: 'We design', text: 'We build a day-by-day itinerary with realistic travel times, the right stays and local experiences.', deliverable: 'Draft itinerary in 48 h', tone: 'bg-[#084838] text-white' },
  { id: 3, title: 'We refine', text: 'You tell us what to change. We adjust until every day feels exactly right.', deliverable: 'Unlimited edits', tone: 'bg-[#C49849] text-white' },
  { id: 4, title: 'We book & guide', text: 'We reserve everything and stay available before and during your trip.', deliverable: 'Digital travel guide', tone: 'bg-white text-slate-900' },
]

const samples = [
  { id: 1, name: 'Highlands & Coast', days: 7, price: 780, image: Tana, stops: ['Antananarivo', 'Andasibe', 'Ramena'] },
  { id: 2, name: 'Island Escape', days: 5, price: 560, image: NosyIranja, stops: ['Nosy Be', 'Nosy Iranja', 'Nosy Komba'] },
  { id: 3, name: 'Wild North', days: 10, price: 1150, image: Deux, stops: ['Diego Suarez', 'Ankarana', 'Ambanja'] },
]

const chat = [
  { q: 'Can I change the plan once it is booked?', a: 'Yes. Small changes are free up to a few days before departure, and we handle the rebooking for you.' },
  { q: 'How long does it take to get my itinerary?', a: 'A first draft arrives within 48 hours of our first talk. Then we refine it together.' },
  { q: 'Do you plan trips for families and groups?', a: 'Of course. We adapt pace, stays and activities to children, seniors and groups of any size.' },
  { q: 'Is planning free?', a: 'Your first draft is free and without commitment. A planning fee applies only if you want us to book and manage the whole trip, and it is deducted from your booking.' },
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

/* -------------------------- Composants --------------------------- */

// Nombre qui s'anime doucement quand sa valeur change (GSAP)
function AnimatedNumber({ value }) {
  const ref = useRef(null)
  const shown = useRef(value)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion()) { el.textContent = value; shown.current = value; return }
    const counter = { v: shown.current }
    const tween = gsap.to(counter, {
      v: value, duration: 0.5, ease: 'power2.out',
      onUpdate: () => { shown.current = counter.v; el.textContent = Math.round(counter.v) },
    })
    return () => tween.kill()
  }, [value])

  return <span ref={ref}>{value}</span>
}

// Hero : texte + route dessinée à l'écran
function Hero() {
  const pins = [
    { x: 40, y: 360, label: 'Arrival' },
    { x: 160, y: 200, label: 'Highlands' },
    { x: 320, y: 160, label: 'Coast' },
    { x: 480, y: 70, label: 'Island' },
  ]
  const d = 'M40 360 C 120 300, 60 220, 160 200 S 300 250, 320 160 S 400 60, 480 70'

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-center">
      <div>
        <span data-hero className={BADGE}>Travel Planning</span>
        <h1 data-hero className={`${STATEMENT_TITLE} mt-5`}>Your Trip, Designed Around You</h1>
        <p data-hero className={`${SECTION_SUBTITLE} mt-5 md:mt-6`}>
          Tell us what you love. We build the route, the stays and the little details, day by day, so you can just enjoy the journey.
        </p>
        <div data-hero className="mt-7 flex flex-wrap items-center gap-4">
          <a href="#builder" className={`bg-[#084838] hover:bg-[#0a5c47] text-white ${BUTTON}`}>Sketch My Trip</a>
          <a href="/contact" className="inline-flex items-center gap-2 text-sm md:text-base font-medium text-slate-800 hover:gap-3 transition-all">Talk to a planner <ArrowIcon /></a>
        </div>
      </div>

      <div data-hero className="rounded-3xl bg-white p-4 md:p-6">
        <svg viewBox="0 0 540 420" className="w-full h-auto" role="img" aria-label="A winding route between four stops">
          <path d={d} fill="none" stroke="#084838" strokeOpacity="0.25" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" />
          <path data-route d={d} fill="none" stroke="#C49849" strokeWidth="5" strokeLinecap="round" />
          {pins.map((p) => (
            <g key={p.label} data-pin>
              <circle cx={p.x} cy={p.y} r="16" fill="#084838" />
              <circle cx={p.x} cy={p.y} r="6" fill="#fff" />
              <text x={p.x} y={p.y + (p.y > 300 ? -26 : 36)} textAnchor="middle" fontSize="18" fill="#084838">{p.label}</text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  )
}

// Créateur de voyage : réglages à gauche, ébauche et budget à droite
function Builder() {
  const [styleId, setStyleId] = useState('relax')
  const [days, setDays] = useState(7)
  const [travelers, setTravelers] = useState(2)
  const listRef = useRef(null)
  const first = useRef(true)

  const style = styles.find((s) => s.id === styleId)
  const count = Math.min(7, Math.max(3, Math.round(days / 2)))
  const plan = style.stops.slice(0, count).map((stop, i) => ({ stop, day: 1 + Math.round((i * (days - 1)) / (count - 1)) }))
  const low = Math.round((style.perDay * days * 0.85) / 10) * 10
  const high = Math.round((style.perDay * days * 1.2) / 10) * 10

  // Les étapes réapparaissent en cascade quand le style change
  useLayoutEffect(() => {
    if (first.current) { first.current = false; return }
    if (!listRef.current || prefersReducedMotion()) return
    gsap.from(listRef.current.children, { x: -20, opacity: 0, duration: 0.4, ease: 'power3.out', stagger: 0.06, clearProps: 'transform,opacity' })
  }, [styleId])

  const round = "w-10 h-10 rounded-full border border-[#084838] text-[#084838] flex items-center justify-center hover:bg-[#084838]/10 transition"

  return (
    <div id="builder" className={`${SECTION_GAP} scroll-mt-8`}>
      <div className="mb-8 md:mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-12">
        <h2 className={`${SECTION_TITLE} lg:max-w-[52%]`}>Sketch Your Trip In 30 Seconds</h2>
        <p className={`${SECTION_SUBTITLE} lg:max-w-md`}>A quick idea of the route and the budget. Our planners then turn it into a real itinerary.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-4 md:gap-6 items-start">
        {/* Réglages */}
        <div className="rounded-3xl bg-white p-6 md:p-10">
          <p className="text-sm md:text-base text-slate-600">Travel style</p>
          <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Travel style">
            {styles.map((s) => (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={styleId === s.id}
                onClick={() => setStyleId(s.id)}
                className={`rounded-full px-5 py-2 text-sm md:text-base font-medium transition ${styleId === s.id ? 'bg-[#084838] text-white' : 'border border-slate-300 text-slate-700 hover:border-slate-500'}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="mt-8 flex items-end justify-between">
            <label htmlFor="trip-days" className="text-sm md:text-base text-slate-600">Trip length</label>
            <p className="text-3xl md:text-4xl leading-none text-slate-800 tabular-nums">{days} <span className="text-base text-slate-600">days</span></p>
          </div>
          <input id="trip-days" type="range" min="3" max="21" value={days} onChange={(e) => setDays(Number(e.target.value))} className="mt-4 w-full accent-[#084838]" />
          <div className={`mt-1 flex justify-between ${META_TEXT} text-slate-500`}><span>3</span><span>21</span></div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <span className="text-sm md:text-base text-slate-600">Travelers</span>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => setTravelers((n) => Math.max(1, n - 1))} aria-label="Fewer travelers" className={round}><MinusIcon /></button>
              <span className="w-6 text-center text-lg font-medium tabular-nums">{travelers}</span>
              <button type="button" onClick={() => setTravelers((n) => Math.min(12, n + 1))} aria-label="More travelers" className={round}><PlusIcon /></button>
            </div>
          </div>
        </div>

        {/* Ébauche */}
        <div className="lg:sticky lg:top-8 rounded-3xl bg-[#084838] text-white p-6 md:p-10">
          <p className="text-sm md:text-base text-white/70">Your draft route</p>
          <ul ref={listRef} className="mt-4 flex flex-col gap-2">
            {plan.map((p) => (
              <li key={p.stop} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <span className="shrink-0 rounded-full bg-[#C49849] px-2.5 py-1 text-xs tabular-nums">Day {p.day}</span>
                <span className="text-sm md:text-base">{p.stop}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-6 border-t border-white/25">
            <p className="text-sm text-white/70">Estimated budget per person</p>
            <p className="mt-1 text-3xl md:text-5xl font-medium leading-none">$<AnimatedNumber value={low} /> – $<AnimatedNumber value={high} /></p>
            <p className="mt-2 text-sm text-white/70">For {travelers} {travelers === 1 ? 'traveler' : 'travelers'}: about ${(low * travelers).toLocaleString()} – ${(high * travelers).toLocaleString()}</p>
          </div>

          <a href="/contact" className={`mt-6 block text-center bg-[#C49849] hover:bg-[#b08339] text-white ${BUTTON}`}>Get My Custom Plan</a>
          <p className="mt-3 text-xs text-white/60 leading-relaxed">Rough estimate including stays, transport and activities. The final quote depends on season and choices.</p>
        </div>
      </div>
    </div>
  )
}

// Méthode : cartes qui s'empilent au défilement (sticky)
function Process() {
  return (
    <div className={SECTION_GAP}>
      <div className="mb-8 md:mb-12 text-center">
        <h2 className={SECTION_TITLE}>How We Plan Your Trip</h2>
        <p className={`mt-4 mx-auto ${SECTION_SUBTITLE}`}>Four steps, one dedicated planner from start to finish.</p>
      </div>

      <div>
        {process.map((p, i) => (
          <article
            key={p.id}
            style={{ top: `${88 + i * 22}px` }}
            className={`sticky mb-6 rounded-3xl p-6 md:p-12 shadow-sm min-h-[240px] md:min-h-[280px] grid grid-cols-1 md:grid-cols-[120px_1fr_auto] gap-4 md:gap-10 items-center ${p.tone}`}
          >
            <span className="text-6xl md:text-8xl font-medium leading-none opacity-60 tabular-nums">{String(p.id).padStart(2, '0')}</span>
            <div>
              <h3 className="text-2xl md:text-4xl font-medium tracking-tight">{p.title}</h3>
              <p className="mt-3 max-w-xl text-sm md:text-lg leading-relaxed opacity-85">{p.text}</p>
            </div>
            <span className="self-start md:self-center rounded-full border border-current px-4 py-2 text-sm">{p.deliverable}</span>
          </article>
        ))}
      </div>
    </div>
  )
}

// Exemples d'itinéraires
function Samples() {
  return (
    <div className={SECTION_GAP}>
      <div className="mb-8 md:mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-12">
        <h2 className={`${SECTION_TITLE} lg:max-w-[52%]`}>Ideas To Start From</h2>
        <p className={`${SECTION_SUBTITLE} lg:max-w-md`}>Every trip is adapted to you. These are only starting points.</p>
      </div>

      <div data-stagger className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {samples.map((s) => (
          <article key={s.id} className="flex flex-col overflow-hidden rounded-3xl bg-white">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img src={s.image} alt={s.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
              <span className={`${BADGE} absolute left-4 top-4`}>{s.days} days</span>
            </div>
            <div className="flex flex-col flex-1 p-5 md:p-6">
              <h3 className="text-xl md:text-2xl font-medium text-slate-900">{s.name}</h3>
              <ol className="mt-4 flex items-center gap-2 text-sm text-slate-600 flex-wrap">
                {s.stops.map((stop, i) => (
                  <li key={stop} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C49849]" />{stop}
                    {i < s.stops.length - 1 && <span className="w-6 border-t border-dashed border-slate-400" />}
                  </li>
                ))}
              </ol>
              <div className="mt-auto pt-6 flex items-center justify-between">
                <p className="text-sm text-slate-600">From <span className="text-2xl font-medium text-slate-900">${s.price}</span> / person</p>
                <a href="/contact" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#084838] hover:gap-2.5 transition-all">Adapt it <ArrowIcon /></a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

// FAQ : conversation en bulles (questions à droite, réponses à gauche)
function Chat() {
  return (
    <div className={SECTION_GAP}>
      <div className="mb-8 md:mb-12 text-center">
        <h2 className={SECTION_TITLE}>Let&apos;s Talk It Through</h2>
        <p className={`mt-4 mx-auto ${SECTION_SUBTITLE}`}>The questions we hear most, answered like a chat with your planner.</p>
      </div>

      <div data-stagger className="mx-auto max-w-3xl flex flex-col gap-4 md:gap-5">
        {chat.flatMap((c, i) => [
          <p key={`q${i}`} className="self-end max-w-[88%] rounded-3xl rounded-br-md bg-[#C49849] px-5 py-3 text-sm md:text-lg text-white">{c.q}</p>,
          <div key={`a${i}`} className="self-start max-w-[92%] flex items-end gap-3">
            <span className="shrink-0 w-9 h-9 rounded-full bg-[#084838] text-white text-sm font-medium flex items-center justify-center" aria-hidden="true">N</span>
            <p className="rounded-3xl rounded-bl-md bg-white px-5 py-4 text-sm md:text-lg leading-relaxed text-slate-700">{c.a}</p>
          </div>,
        ])}
      </div>
    </div>
  )
}

// CTA : décrire son voyage idéal
function Cta() {
  const [status, setStatus] = useState('idle') // 'idle' | 'sent'

  const handleSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))

    // TODO : envoyer `data` à ton API ou à un service d'emails (EmailJS, Formspree...)
    console.log('Trip idea:', data)

    setStatus('sent')
    form.reset()
  }

  return (
    <div className={`${SECTION_GAP} grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center rounded-3xl bg-[#084838] text-white p-6 md:p-14`}>
      <div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.15] tracking-tight">Describe Your Dream Trip</h2>
        <p className="mt-4 max-w-md text-sm md:text-lg text-white/75 leading-relaxed">A few lines are enough. We come back within one working day with a first idea and no obligation.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor="trip-idea" className="sr-only">Your dream trip</label>
        <textarea id="trip-idea" name="idea" rows={4} required placeholder="When, where, with whom, and what you would love to do…" className="w-full rounded-3xl bg-white px-6 py-4 text-sm md:text-base text-slate-800 placeholder:text-slate-500 resize-y focus:outline-none" />
        <div className="flex flex-col sm:flex-row gap-2 rounded-3xl sm:rounded-full bg-white p-2 sm:pl-6">
          <label htmlFor="trip-email" className="sr-only">Your email</label>
          <input id="trip-email" name="email" type="email" required placeholder="Your email" className="flex-1 min-w-0 bg-transparent px-4 py-2 sm:px-0 text-sm md:text-base text-slate-800 placeholder:text-slate-500 focus:outline-none" />
          <button type="submit" className={`shrink-0 bg-[#C49849] hover:bg-[#b08339] text-white ${BUTTON}`}>Send My Idea</button>
        </div>
        {status === 'sent' && <p role="status" className="text-sm md:text-base text-[#E6C58A]">Thank you! A planner will get back to you soon.</p>}
      </form>
    </div>
  )
}

function TravelPlanning() {
  const contentRef = useRef(null)

  useLayoutEffect(() => {
    // Pas d'animation si l'utilisateur a demandé moins de mouvement
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      // Entrée du hero
      gsap.from('[data-hero]', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12 })

      // La route se dessine, puis les étapes apparaissent une à une
      const path = contentRef.current.querySelector('[data-route]')
      if (path) {
        const length = path.getTotalLength()
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
        gsap.to(path, { strokeDashoffset: 0, duration: 2.6, ease: 'power2.inOut', delay: 0.6 })
        gsap.from('[data-pin]', { scale: 0, opacity: 0, transformOrigin: '50% 50%', duration: 0.6, ease: 'back.out(2)', stagger: 0.7, delay: 0.5 })
      }

      // Chaque section apparaît en remontant (sauf la méthode, dont les cartes s'empilent)
      Array.from(contentRef.current.children).slice(1).forEach((el) => {
        gsap.from(el, { y: 50, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
      })

      // Cartes et bulles en cascade
      gsap.utils.toArray('[data-stagger]').forEach((box) => {
        gsap.from(box.children, { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.14, scrollTrigger: { trigger: box, start: 'top 85%', once: true } })
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
      <div ref={contentRef} className={`${SECTION_WIDTH} mt-6 md:mt-10`}>
        <Hero />
        <Builder />
        <Process />
        <Samples />
        <Chat />
        <Cta />
      </div>
    </section>
    <Footer />
    </>
  )
}

export default TravelPlanning