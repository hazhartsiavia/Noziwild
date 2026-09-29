import React, { useLayoutEffect, useRef, useState } from 'react'
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

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------------------------- Données ---------------------------- */

const categories = [
  { id: 'all', label: 'All Tickets' },
  { id: 'parks', label: 'Parks & Reserves' },
  { id: 'sea', label: 'Sea & Boats' },
  { id: 'sites', label: 'Sites & Museums' },
  { id: 'events', label: 'Events & Shows' },
]

// Prix donnés en exemple, à adapter à tes vrais tarifs
const tickets = [
  { id: 1, category: 'parks', name: 'Andasibe-Mantadia Park', place: 'Andasibe', price: 35, image: Tana, perks: ['Entry + local guide', 'Half day'] },
  { id: 2, category: 'parks', name: 'Lokobe Reserve', place: 'Nosy Be', price: 25, image: Ambanja, perks: ['Entry + guide', 'Pirogue included'] },
  { id: 3, category: 'sea', name: 'Marine Park Snorkel Trip', place: 'Nosy Be', price: 30, image: Ramena, perks: ['Boat + snorkel gear', 'Lunch option'] },
  { id: 4, category: 'sea', name: 'Catamaran Sunset Cruise', place: 'Nosy Be', price: 65, image: NosyIranja, perks: ['Drinks on board', '3 hours'] },
  { id: 5, category: 'sites', name: 'Avenue Of The Baobabs', place: 'Morondava', price: 15, image: Deux, perks: ['Site entry', 'Sunset slot'] },
  { id: 6, category: 'sites', name: 'Royal Hill Visit', place: 'Antananarivo', price: 12, image: Tana, perks: ['Entry + guide', 'Skip the queue'] },
  { id: 7, category: 'events', name: 'Folk Music Night', place: 'Antananarivo', price: 20, image: NosyLonjo, perks: ['Reserved seat', 'Evening'] },
  { id: 8, category: 'events', name: 'Local Festival Pass', place: 'Varies by date', price: 18, image: Ambanja, perks: ['Entry + transport tip', 'Dates on request'] },
]

const steps = [
  { id: 1, title: 'Pick your experience', text: 'Choose a park, boat trip, site or event and tell us the date.' },
  { id: 2, title: 'We reserve for you', text: 'We book your slot, pay fees locally and confirm within hours.' },
  { id: 3, title: 'Show your e-ticket', text: 'Your QR ticket arrives on your phone. Just scan at the entrance.' },
]

const benefits = [
  'Skip-the-line slots where available',
  'Confirmation within a few hours',
  'Free date change up to 48 h before',
  'Local guide or driver arranged on request',
]

const faqs = [
  { q: 'Are the tickets refundable?', a: 'Most can be moved to another date for free up to 48 hours before. Refund terms are shown in your quote before you pay.' },
  { q: 'Do I need to print my ticket?', a: 'No. You receive an e-ticket with a QR code. Keep it on your phone and show it at the entrance.' },
  { q: 'Can you book for a group?', a: 'Yes. For groups of 8 or more we can arrange a private time slot and a guide for the whole group.' },
  { q: 'What if my chosen date is sold out?', a: 'We suggest the closest available dates or a similar experience nearby, and hold it for you while you decide.' },
  { q: 'Are park fees and guides included?', a: 'Each ticket tells you exactly what is included. Park fees and mandatory local guides are included wherever they apply.' },
  { q: 'Can you book events far in advance?', a: 'Yes, as soon as organizers open ticket sales. Tell us the dates you travel and we watch for you.' },
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
      {cells.map((on, i) => <span key={i} className={`aspect-square rounded-[2px] ${on ? 'bg-[#084838]' : 'bg-transparent'}`} />)}
    </div>
  )
}

// Hero : un grand billet avec souche détachable
function Hero() {
  const notch = "absolute w-8 h-8 rounded-full bg-[#D5E8E2]"
  return (
    <section data-ticket>
      <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_290px] overflow-hidden rounded-3xl bg-[#084838] text-white">
        <div className="p-6 md:p-14">
          <span data-hero className={BADGE}>Tickets & Reservations</span>
          <h1 data-hero className="mt-6 text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-medium uppercase leading-[1.1] tracking-tight">
            Skip The Queue, Keep The Magic
          </h1>
          <p data-hero className="mt-6 max-w-xl text-sm md:text-lg text-white/80 leading-relaxed">
            Parks, boat trips, sites and events, reserved for you in advance. No lines, no guesswork, just your e-ticket on your phone.
          </p>
          <div data-hero className="mt-8 flex flex-wrap items-center gap-4">
            <a href="#tickets" className={`bg-[#C49849] hover:bg-[#b08339] text-white ${BUTTON}`}>Browse Tickets</a>
            <a href="/contact" className="inline-flex items-center gap-2 text-sm md:text-base font-medium hover:gap-3 transition-all">Ask for something else <ArrowIcon /></a>
          </div>
        </div>

        {/* Souche */}
        <div className="relative flex flex-col items-center justify-center gap-4 p-6 md:p-8 border-t-2 lg:border-t-0 lg:border-l-2 border-dashed border-white/35">
          <span className={`${notch} -top-4 -left-4`} />
          <span className={`${notch} -top-4 -right-4 lg:top-auto lg:right-auto lg:-bottom-4 lg:-left-4`} />
          <p className="text-xs tracking-[0.3em] text-[#E6C58A]">ADMIT ONE</p>
          <Qr className="w-36 md:w-44" />
          <p className="text-xs text-white/70 tabular-nums">No. 0001 · E-TICKET</p>
        </div>
      </div>
    </section>
  )
}

// Carte en forme de billet : photo, infos, souche avec prix
function TicketCard({ t }) {
  const notch = "absolute -left-[9px] w-4 h-4 rounded-full bg-[#D5E8E2]"
  return (
    <article className="flex overflow-hidden rounded-2xl bg-white">
      <img src={t.image} alt={t.name} className="w-[30%] sm:w-[34%] object-cover" />
      <div className="flex-1 min-w-0 p-4 md:p-5">
        <p className={`flex items-center gap-1.5 ${META_TEXT} text-slate-600`}><PinIcon />{t.place}</p>
        <h3 className="mt-1 text-lg md:text-2xl font-medium leading-snug text-slate-900">{t.name}</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {t.perks.map((p) => <li key={p} className="rounded-full bg-[#D5E8E2] px-3 py-1 text-xs text-slate-700">{p}</li>)}
        </ul>
      </div>
      <div className="relative shrink-0 w-[100px] md:w-[130px] flex flex-col items-center justify-center gap-1.5 border-l-2 border-dashed border-slate-300 p-3 text-center">
        <span className={`${notch} -top-2`} />
        <span className={`${notch} -bottom-2`} />
        <p className={`${META_TEXT} text-slate-500`}>From</p>
        <p className="text-2xl md:text-3xl font-medium text-slate-900 tabular-nums">${t.price}</p>
        <a href="/contact" className="mt-1 rounded-full bg-[#084838] hover:bg-[#0a5c47] text-white text-xs md:text-sm font-medium px-3 py-1.5 transition">Reserve</a>
      </div>
    </article>
  )
}

function Browse() {
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
        <h2 className={`${SECTION_TITLE} lg:max-w-[52%]`}>Find Your Ticket</h2>
        <p className={`${SECTION_SUBTITLE} lg:max-w-md`}>Prices are per person and shown from the lowest season.</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2 md:gap-3" role="tablist" aria-label="Ticket categories">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={category === c.id}
            onClick={() => setCategory(c.id)}
            className={`rounded-full px-5 py-2 text-sm md:text-base font-medium transition ${category === c.id ? 'bg-[#084838] text-white' : 'bg-white text-slate-700 hover:bg-white/70'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div ref={gridRef} className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {list.map((t) => <TicketCard key={t.id} t={t} />)}
      </div>
    </div>
  )
}

// Comment ça marche : 3 étapes reliées par une ligne pointillée
function HowItWorks() {
  return (
    <div className={SECTION_GAP}>
      <h2 className={`${SECTION_TITLE} text-center mb-10 md:mb-16`}>Three Steps To Your Ticket</h2>
      <ol data-stagger className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
        <span className="hidden md:block absolute left-[17%] right-[17%] top-8 border-t-2 border-dashed border-[#084838]/30" aria-hidden="true" />
        {steps.map((s) => (
          <li key={s.id} className="relative flex flex-col items-center text-center">
            <span className="w-16 h-16 rounded-full bg-[#C49849] text-white text-2xl font-medium flex items-center justify-center ring-8 ring-[#D5E8E2]">{s.id}</span>
            <h3 className="mt-6 text-xl md:text-2xl font-medium text-slate-900">{s.title}</h3>
            <p className="mt-2 max-w-xs text-sm md:text-base text-slate-600 leading-relaxed">{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

// Téléphone avec e-ticket + avantages
function AppSection() {
  return (
    <div className={`${SECTION_GAP} grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center`}>
      <div className="mx-auto w-[280px] md:w-[300px]">
        <div data-bob className="rounded-[2.5rem] border-[10px] border-[#084838] bg-white p-4 shadow-xl">
          <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-slate-200" />
          <div className="rounded-2xl bg-[#D5E8E2] p-4 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#084838] px-3 py-1 text-xs text-white"><CheckIcon /> Confirmed</span>
            <p className="mt-3 text-lg font-medium text-slate-900">Catamaran Sunset Cruise</p>
            <p className={`${META_TEXT} text-slate-600`}>Sat 12 · 16:30 · 2 guests</p>
            <Qr className="mx-auto mt-4 w-40" />
            <p className={`mt-3 ${META_TEXT} text-slate-600`}>Show this code at the entrance</p>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs sm:text-sm md:text-base uppercase tracking-wide text-slate-700">Why book with us</p>
        <h2 className={SECTION_TITLE}>Your Tickets, Always In Your Pocket</h2>
        <ul className="mt-8 flex flex-col gap-4">
          {benefits.map((b) => (
            <li key={b} className="flex items-center gap-4 text-base md:text-xl text-slate-800">
              <span className="shrink-0 w-8 h-8 rounded-full bg-[#084838] text-white flex items-center justify-center"><CheckIcon /></span>
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
  return (
    <div className={SECTION_GAP}>
      <div className="mb-8 md:mb-12 text-center">
        <h2 className={SECTION_TITLE}>Quick Answers</h2>
        <p className={`mt-4 mx-auto ${SECTION_SUBTITLE}`}>Everything you may want to know before you book.</p>
      </div>
      <div data-stagger className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {faqs.map((f, i) => (
          <article key={f.q} className="rounded-2xl bg-white p-6 md:p-7">
            <span className="w-9 h-9 rounded-full bg-[#C49849] text-white text-sm font-medium flex items-center justify-center">{i + 1}</span>
            <h3 className="mt-4 text-lg md:text-xl font-medium text-slate-900 leading-snug">{f.q}</h3>
            <p className="mt-2 text-sm md:text-base text-slate-600 leading-relaxed">{f.a}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

// CTA : bandeau en forme de billet
function Cta() {
  const notch = "absolute w-8 h-8 rounded-full bg-[#D5E8E2]"
  return (
    <div className={`${SECTION_GAP} relative overflow-hidden rounded-3xl bg-[#C49849] text-white grid grid-cols-1 md:grid-cols-[1fr_auto]`}>
      <div className="p-6 md:p-12">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.15] tracking-tight">Ready When You Are</h2>
        <p className="mt-3 max-w-xl text-sm md:text-lg text-white/90 leading-relaxed">Send us your dates and the places you want to see. We reserve everything and confirm within one working day.</p>
      </div>
      <div className="relative flex items-center justify-center p-6 md:p-12 border-t-2 md:border-t-0 md:border-l-2 border-dashed border-white/50">
        <span className={`${notch} -top-4 -left-4 md:left-[-16px]`} />
        <span className={`${notch} -top-4 -right-4 md:top-auto md:right-auto md:-bottom-4 md:-left-4`} />
        <a href="/contact" className={`inline-flex items-center gap-3 bg-[#084838] hover:bg-[#0a5c47] text-white ${BUTTON}`}>Reserve My Tickets <ArrowIcon /></a>
      </div>
    </div>
  )
}

function TicketsReservations() {
  const contentRef = useRef(null)

  useLayoutEffect(() => {
    // Pas d'animation si l'utilisateur a demandé moins de mouvement
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      // Le billet du hero tombe et se stabilise, puis les textes arrivent
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-ticket]', { y: -70, rotation: -2, opacity: 0, duration: 1.1, transformOrigin: '50% 0%' })
        .from('[data-hero]', { y: 30, opacity: 0, duration: 0.8, stagger: 0.1 }, '-=0.6')

      // Le téléphone flotte doucement
      gsap.to('[data-bob]', { y: -10, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 })

      // Chaque section apparaît en remontant
      Array.from(contentRef.current.children).slice(1).forEach((el) => {
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
      <div ref={contentRef} className={`${SECTION_WIDTH} mt-6 md:mt-10`}>
        <Hero />
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