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
const BADGE = "inline-block bg-[#C49849] text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm"
const BUTTON = "text-sm font-medium px-5 py-2.5 rounded-full md:px-6 md:py-3 active:scale-95 transition"
const SECTION_GAP = "mt-[60px] md:mt-[120px]"

/* ---------------------------- Données ---------------------------- */

const activities = [
  { id: 1, name: 'Birdwatching', type: 'Land', image: Tana, duration: '3–5 h', level: 'Easy', group: '2–8', price: 35, text: 'Walk quiet trails at sunrise with a naturalist and spot rare birds you will not see anywhere else.' },
  { id: 2, name: 'Nature & Adventure', type: 'Land', image: Deux, duration: 'Full day', level: 'Moderate', group: '2–10', price: 55, text: 'Hikes, viewpoints and hidden waterfalls, led by guides who know every path and every shortcut.' },
  { id: 3, name: 'Cruise Boat Excursions', type: 'Sea', image: NosyIranja, duration: 'Half or full day', level: 'Easy', group: '4–20', price: 45, text: 'Cross the bay to quiet islands and white-sand beaches, with lunch and swimming stops on the way.' },
  { id: 4, name: 'Catamaran Cruise', type: 'Sea', image: Ramena, duration: 'Full day', level: 'Easy', group: '2–12', price: 85, text: 'Sail in comfort along the coast, snorkel in clear water and watch the sunset from the deck.' },
  { id: 5, name: 'Wildlife & Flora Discovery', type: 'Land', image: Ambanja, duration: '2–4 h', level: 'Easy', group: '2–10', price: 30, text: 'Meet lemurs, chameleons and orchids in the wild, with a guide who explains what you are seeing.' },
]

const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
// 0 = possible, 1 = bon, 2 = idéal (exemples, à adapter à tes vraies saisons)
const seasons = [
  { name: 'Birdwatching', values: [0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 1] },
  { name: 'Nature & Adventure', values: [0, 0, 0, 1, 2, 2, 2, 2, 2, 1, 0, 0] },
  { name: 'Cruise Boat Excursions', values: [0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0] },
  { name: 'Catamaran Cruise', values: [0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0] },
  { name: 'Wildlife & Flora Discovery', values: [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1] },
]

const moments = [Ramena, NosyIranja, Tana, NosyLonjo, Deux, Ambanja]

const faqs = [
  { q: 'Can I book just one activity?', a: 'Yes. You can book a single activity or combine several in one stay. We help you plan the order and the timing.' },
  { q: 'Are the activities suitable for children?', a: 'Most of them are. Birdwatching, boat excursions and wildlife walks work well for families. Tell us the ages and we adapt the plan.' },
  { q: 'What should I bring?', a: 'Comfortable shoes, a hat, sunscreen and a bottle of water. For sea activities, bring a swimsuit and a towel. We send a detailed list after booking.' },
  { q: 'What happens if the weather is bad?', a: 'Safety comes first. If conditions are not right, we move your activity to another day or offer a refund.' },
  { q: 'Is the equipment provided?', a: 'Yes. Binoculars, life jackets and snorkeling gear are provided on the activities that need them.' },
]

/* ---------------------------- Icônes ----------------------------- */

const Svg = ({ children, className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)
const ClockIcon = () => <Svg><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></Svg>
const UsersIcon = () => <Svg><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></Svg>
const LevelIcon = () => <Svg><path d="M4 20v-4M9 20v-8M14 20V8M19 20V4" /></Svg>
const ArrowIcon = () => <Svg className="w-5 h-5"><path d="M5 12h14M13 6l6 6-6 6" /></Svg>

/* -------------------------- Composants --------------------------- */

// Hero : grande image avec l'index des activités (comme un menu)
function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#084838] text-white min-h-[540px] md:min-h-[620px] flex">
      <img src={NosyLonjo} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/20" />

      <div className="relative w-full grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-12 items-end p-6 md:p-12">
        <div>
          <span data-hero className={BADGE}>Activities</span>
          <h1 data-hero className="mt-5 text-5xl sm:text-6xl md:text-7xl font-medium uppercase leading-[1.1] tracking-tight">
            Do More Than Look
          </h1>
          <p data-hero className="mt-5 md:mt-6 max-w-xl text-sm md:text-lg text-white/85 leading-relaxed">
            Birds at sunrise, a catamaran at sunset and a jungle walk in between. Pick your favorites and we organize everything.
          </p>
          <div data-hero className="mt-8 flex flex-wrap items-center gap-4">
            <a href="#activities" className={`bg-[#C49849] hover:bg-[#b08339] text-white ${BUTTON}`}>See All Activities</a>
            <a href="/contact" className="inline-flex items-center gap-2 text-sm md:text-base font-medium hover:gap-3 transition-all">
              Plan my stay <ArrowIcon />
            </a>
          </div>
        </div>

        <nav data-hero aria-label="Activities index">
          <ol className="flex flex-col gap-2 md:gap-3">
            {activities.map((a) => (
              <li key={a.id}>
                <a
                  href="#activities"
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-5 py-3 md:py-4 hover:bg-white/20 transition"
                >
                  <span className="flex items-center gap-4">
                    <span className="text-sm tabular-nums text-[#E6C58A]">{String(a.id).padStart(2, '0')}</span>
                    <span className="text-base md:text-lg font-medium">{a.name}</span>
                  </span>
                  <ArrowIcon />
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  )
}

// Carrousel horizontal : cartes hautes avec défilement, boutons prev/next et barre de progression
function ActivityCarousel() {
  const trackRef = useRef(null)
  const [pos, setPos] = useState({ progress: 0, start: true, end: false })

  const update = () => {
    const el = trackRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setPos({ progress: max > 0 ? el.scrollLeft / max : 0, start: el.scrollLeft <= 4, end: el.scrollLeft >= max - 4 })
  }

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const scrollByCard = (dir) => {
    const el = trackRef.current
    const card = el?.firstElementChild
    if (!card) return
    el.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: 'smooth' })
  }

  const arrowClass =
    "w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-[#084838] text-[#084838] transition " +
    "hover:bg-[#084838]/10 active:bg-[#084838]/20 disabled:opacity-30 disabled:pointer-events-none " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#084838]"

  return (
    <div id="activities" className={`${SECTION_GAP} scroll-mt-8`}>
      <div className="mb-8 md:mb-12 flex items-end justify-between gap-6">
        <div>
          <p className="mb-3 text-xs sm:text-sm md:text-base uppercase tracking-wide text-slate-700">Our activities</p>
          <h2 className={SECTION_TITLE}>Pick Your Adventure</h2>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <button type="button" onClick={() => scrollByCard(-1)} disabled={pos.start} aria-label="Previous activities" className={arrowClass}>
            <span className="rotate-180"><ArrowIcon /></span>
          </button>
          <button type="button" onClick={() => scrollByCard(1)} disabled={pos.end} aria-label="Next activities" className={arrowClass}>
            <ArrowIcon />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={update}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {activities.map((a) => (
          <a
            key={a.id}
            href="/contact"
            className="group relative snap-start shrink-0 w-[82%] sm:w-[46%] lg:w-[31.5%] xl:w-[24%] h-[480px] md:h-[540px] overflow-hidden rounded-3xl bg-[#084838] text-white flex"
          >
            <img src={a.image} alt={a.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

            <div className="relative flex flex-col justify-between w-full p-5 md:p-6">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/90 text-slate-900 text-sm font-medium px-3 py-1">{String(a.id).padStart(2, '0')}</span>
                <span className="rounded-full border border-white/40 bg-white/10 backdrop-blur-sm text-xs md:text-sm px-3 py-1">{a.type}</span>
              </div>

              <div>
                <h3 className="text-2xl md:text-3xl font-medium leading-tight tracking-tight">{a.name}</h3>
                <p className="mt-3 text-sm text-white/85 leading-relaxed">{a.text}</p>
                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs md:text-sm text-white/90">
                  <li className="flex items-center gap-1.5"><ClockIcon />{a.duration}</li>
                  <li className="flex items-center gap-1.5"><LevelIcon />{a.level}</li>
                  <li className="flex items-center gap-1.5"><UsersIcon />{a.group}</li>
                </ul>
                <div className="mt-5 pt-4 border-t border-white/25 flex items-center justify-between">
                  <p className="text-sm text-white/80">From <span className="text-xl md:text-2xl font-medium text-white">${a.price}</span> / person</p>
                  <span className="w-10 h-10 rounded-full bg-[#C49849] flex items-center justify-center transition group-hover:translate-x-1"><ArrowIcon /></span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Barre de progression */}
      <div className="mt-6 h-1.5 rounded-full bg-[#084838]/20 overflow-hidden" aria-hidden="true">
        <div className="h-full rounded-full bg-[#084838] transition-all duration-300" style={{ width: `${25 + pos.progress * 75}%` }} />
      </div>
    </div>
  )
}

// Meilleure période : tableau visuel activité x mois
function BestTime() {
  const cell = ['bg-[#084838]/10', 'bg-[#C49849]/40', 'bg-[#C49849]']
  return (
    <div className={SECTION_GAP}>
      <div className="mb-8 md:mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-12">
        <h2 className={`${SECTION_TITLE} lg:max-w-[52%]`}>Best Time For Each Activity</h2>
        <p className={`${SECTION_SUBTITLE} lg:max-w-md`}>Plan your dates around the season you love most.</p>
      </div>

      <div className="overflow-x-auto rounded-3xl bg-white p-4 md:p-8">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[200px_repeat(12,1fr)] md:grid-cols-[260px_repeat(12,1fr)] gap-1.5 md:gap-2 items-center">
            <span />
            {months.map((m, i) => <span key={i} className={`text-center ${META_TEXT} text-slate-600`}>{m}</span>)}

            {seasons.map((row) => (
              <React.Fragment key={row.name}>
                <span className="pr-3 text-sm md:text-base font-medium text-slate-800">{row.name}</span>
                {row.values.map((v, i) => (
                  <span key={i} className={`h-8 md:h-10 rounded-md ${cell[v]}`} title={['Possible', 'Good', 'Ideal'][v]} />
                ))}
              </React.Fragment>
            ))}
          </div>

          <ul className={`mt-6 flex flex-wrap gap-x-6 gap-y-2 ${META_TEXT} text-slate-600`}>
            {[['Possible', 0], ['Good', 1], ['Ideal', 2]].map(([label, v]) => (
              <li key={label} className="flex items-center gap-2"><span className={`w-4 h-4 rounded ${cell[v]}`} />{label}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// Bande de photos qui défile toute seule (GSAP), pause au survol
function Moments() {
  const trackRef = useRef(null)
  const tweenRef = useRef(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      tweenRef.current = gsap.to(trackRef.current, { xPercent: -50, duration: 45, ease: 'none', repeat: -1 })
    }, trackRef)
    return () => ctx.revert()
  }, [])

  const items = [...moments, ...moments]

  return (
    <div className={SECTION_GAP}>
      <h2 className={`${SECTION_TITLE} text-center mb-8 md:mb-12`}>Moments From The Trip</h2>
      <div
        className="overflow-x-auto motion-safe:overflow-hidden rounded-3xl"
        onMouseEnter={() => tweenRef.current?.pause()}
        onMouseLeave={() => tweenRef.current?.resume()}
      >
        <div ref={trackRef} className="flex w-max">
          {items.map((src, i) => (
            <div key={i} className="shrink-0 mr-4 w-[240px] md:w-[340px] aspect-[4/3] overflow-hidden rounded-2xl">
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// FAQ : questions en cartes blanches à gauche, titre à droite
function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <div className={`${SECTION_GAP} grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8 lg:gap-16`}>
      <div className="lg:order-2">
        <h2 className={SECTION_TITLE}>Frequently Asked Questions</h2>
        <p className={`mt-4 md:mt-6 ${SECTION_SUBTITLE}`}>Can&apos;t find your answer? Our team replies within a few hours.</p>
      </div>

      <div className="flex flex-col gap-3 lg:order-1">
        {faqs.map((f, i) => {
          const isOpen = open === i
          return (
            <div key={f.q} className="rounded-2xl bg-white">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 text-left p-5 md:p-6"
              >
                <span className="text-base md:text-xl font-medium text-slate-900">{f.q}</span>
                <Svg className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                  <path d="M12 5v14M5 12h14" />
                </Svg>
              </button>
              {isOpen && <p className="px-5 md:px-6 pb-5 md:pb-6 -mt-1 text-sm md:text-base leading-relaxed text-slate-600">{f.a}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// CTA : carte verte avec texte et photos empilées
function Cta() {
  const frame = "absolute w-[46%] rounded-xl bg-white p-1.5 md:p-2.5 shadow-md"
  const photo = "w-full aspect-[4/5] object-cover rounded-md"

  return (
    <div className={`${SECTION_GAP} grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden rounded-3xl bg-[#084838] text-white p-6 md:p-12`}>
      <div className="flex flex-col justify-center">
        <p className="mb-3 text-xs sm:text-sm md:text-base uppercase tracking-wide text-white/70">Ready to explore?</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.15] tracking-tight">Book Your Next Adventure</h2>
        <p className="mt-4 text-sm md:text-lg text-white/75 leading-relaxed max-w-md">
          Tell us your dates and what you love. We build a day-by-day plan and send you a clear quote within one working day.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="/contact" className={`bg-[#C49849] hover:bg-[#b08339] text-white ${BUTTON}`}>Book An Activity</a>
          <a href="tel:+261340000000" className={`border border-white/40 hover:bg-white/10 text-white ${BUTTON}`}>+261 34 00 000 00</a>
        </div>
      </div>

      <div className="relative min-h-[320px] md:min-h-[400px]" aria-hidden="true">
        <div className={`${frame} left-[2%] top-[6%] -rotate-6`}><img src={Ramena} alt="" className={photo} /></div>
        <div className={`${frame} left-[28%] top-0 rotate-3 z-10`}><img src={Tana} alt="" className={photo} /></div>
        <div className={`${frame} right-[2%] top-[14%] rotate-6 z-20`}><img src={NosyIranja} alt="" className={photo} /></div>
      </div>
    </div>
  )
}

function Activities() {
  const contentRef = useRef(null)

  useLayoutEffect(() => {
    // Pas d'animation si l'utilisateur a demandé moins de mouvement
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      // Entrée du hero
      gsap.from('[data-hero]', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12 })

      // Chaque section apparaît en remontant quand elle entre dans l'écran
      Array.from(contentRef.current.children).slice(1).forEach((el) => {
        gsap.from(el, {
          y: 50, opacity: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })

      // Les cartes du carrousel arrivent l'une après l'autre
      gsap.from('#activities a', {
        y: 40, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: '#activities', start: 'top 80%', once: true },
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
      <div ref={contentRef} className={`${SECTION_WIDTH} mt-8 md:mt-12`}>
        <Hero />
        <ActivityCarousel />
        <BestTime />
        <Moments />
        <Faq />
        <Cta />
      </div>
    </section>
    <Footer />
    </>
  )
}

export default Activities