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
const STATEMENT_TITLE = "text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-medium uppercase leading-[1.15] tracking-tight text-slate-900"
const BADGE = "inline-block bg-[#C49849] text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm"
const BUTTON = "text-sm font-medium px-5 py-2.5 rounded-full md:px-6 md:py-3 active:scale-95 transition"
const SECTION_GAP = "mt-[60px] md:mt-[120px]"

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------------------------- Données ---------------------------- */

const dishes = [
  { id: 1, name: 'Romazava', image: Ambanja, spice: 'Mild', where: 'Family tables in the highlands', text: 'The national dish: tender zebu beef simmered with fresh greens, ginger and tomato.' },
  { id: 2, name: 'Ravitoto', image: Tana, spice: 'Medium', where: 'Local eateries in Antananarivo', text: 'Pounded cassava leaves slow-cooked with pork and garlic, served with steaming rice.' },
  { id: 3, name: 'Zebu Skewers', image: Deux, spice: 'Hot', where: 'Street stalls at dusk', text: 'Grilled over charcoal and served with a fiery side of homemade chili sauce.' },
  { id: 4, name: 'Coconut Prawns', image: Ramena, spice: 'Mild', where: 'Beachfront restaurants', text: 'Fresh prawns in a creamy coconut sauce with a hint of vanilla.' },
  { id: 5, name: 'Vanilla Flan', image: NosyLonjo, spice: 'Sweet', where: 'Guesthouses and cafés', text: 'Silky custard made with real Malagasy vanilla, a gentle end to any meal.' },
]

// Prix donnés en exemple, à adapter
const menuTabs = [
  { id: 'all', label: 'All' },
  { id: 'tour', label: 'Tours' },
  { id: 'class', label: 'Classes' },
  { id: 'meal', label: 'Meals' },
]

const experiences = [
  { id: 1, category: 'tour', name: 'Street Food Walk', duration: '3 hours', price: 25, image: Deux, text: 'Taste six local snacks with a guide, from fried treats to sweet fruit.' },
  { id: 2, category: 'tour', name: 'Spice & Vanilla Farm', duration: 'Half day', price: 40, image: Ambanja, text: 'Meet the growers and learn how vanilla and pepper are made.' },
  { id: 3, category: 'class', name: 'Cooking Class', duration: '3 hours', price: 45, image: Tana, text: 'Shop at the market, then cook and eat three classic dishes.' },
  { id: 4, category: 'meal', name: 'Local Family Lunch', duration: '2 hours', price: 30, image: NosyLonjo, text: 'Share a home-cooked meal and stories around the table.' },
  { id: 5, category: 'meal', name: 'Seafood On The Beach', duration: '2 hours', price: 38, image: Ramena, text: 'Grilled catch of the day with your feet almost in the sand.' },
  { id: 6, category: 'meal', name: 'Sunset Dinner', duration: '2 hours', price: 55, image: NosyIranja, text: 'A table set for two or for the group, with the best view we know.' },
]

const diets = ['Vegetarian', 'Vegan', 'Halal', 'Gluten-free', 'Nut allergy', 'Kids menu']

const classSteps = [
  { id: 1, title: 'Visit the market', text: 'Choose fresh vegetables, herbs and spices with your host.' },
  { id: 2, title: 'Cook together', text: 'Learn three classic dishes step by step, hands on.' },
  { id: 3, title: 'Eat what you made', text: 'Sit down together and enjoy the meal you prepared.' },
]

const faqs = [
  { q: 'Can you cater to my diet or allergies?', a: 'Yes. Vegetarian, vegan, halal, gluten-free and allergy needs are all possible. Tell us when you book and we brief every restaurant and host in advance.' },
  { q: 'Is street food safe to eat?', a: 'We only take you to stalls we know and trust, where food is cooked fresh in front of you. Your guide explains what to pick and what to skip.' },
  { q: 'Can children join the experiences?', a: 'Of course. Most of our food experiences are family friendly, and we can adjust spice levels and add a kids menu.' },
  { q: 'What about drinking water and drinks?', a: 'Bottled water is always included. Local drinks like fresh juices and rum are available at extra cost, and we tell you what is worth trying.' },
  { q: 'How far ahead should I book?', a: 'A few days ahead is enough for most experiences. For sunset dinners and cooking classes in high season, we recommend booking one to two weeks before.' },
]

const ctaChoices = ['Food Tour', 'Cooking Class', 'Private Dinner']

/* ---------------------------- Icônes ----------------------------- */

const Svg = ({ children, className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)
const ArrowIcon = () => <Svg className="w-5 h-5"><path d="M5 12h14M13 6l6 6-6 6" /></Svg>
const ForkIcon = () => (
  <Svg className="w-8 h-8 md:w-10 md:h-10">
    <path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10" /><path d="M17 21V3c-2.5 1.5-4 4.5-4 8h4" />
  </Svg>
)

/* -------------------------- Composants --------------------------- */

// Badge à texte circulaire qui tourne (GSAP)
function SpinBadge() {
  return (
    <div className="relative w-full aspect-square rounded-full bg-[#084838] text-white" aria-hidden="true">
      <svg data-spin viewBox="0 0 140 140" className="absolute inset-0 w-full h-full">
        <defs>
          <path id="food-circle" d="M70,70 m-52,0 a52,52 0 1,1 104,0 a52,52 0 1,1 -104,0" />
        </defs>
        <text fontSize="10" fill="currentColor" letterSpacing="0.5">
          <textPath href="#food-circle" textLength="326" lengthAdjust="spacing">
            Local flavors • Fresh seafood • Home cooking •
          </textPath>
        </text>
      </svg>
      <span className="absolute inset-0 m-auto w-[44%] h-[44%] rounded-full bg-[#C49849] flex items-center justify-center"><ForkIcon /></span>
    </div>
  )
}

const heroStats = [
  { id: 1, value: '20+', label: 'local tables' },
  { id: 2, value: '6', label: 'dining experiences' },
  { id: 3, value: '100%', label: 'diets welcome' },
]

// Hero : texte + chiffres à gauche, "assiettes" rondes serrées et badge qui tourne à droite
function Hero() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-10 items-center">
      <div>
        <span data-hero className={BADGE}>Food & Dining</span>
        <h1 data-hero className={`${STATEMENT_TITLE} mt-5`}>Taste The Island</h1>
        <p data-hero className={`${SECTION_SUBTITLE} mt-5 md:mt-6`}>
          Sizzling street stalls, family kitchens and fresh seafood on the beach. We take you where locals eat, and book the table for you.
        </p>
        <div data-hero className="mt-7 flex flex-wrap items-center gap-4">
          <a href="#experiences" className={`bg-[#084838] hover:bg-[#0a5c47] text-white ${BUTTON}`}>See Experiences</a>
          <a href="#dishes" className="inline-flex items-center gap-2 text-sm md:text-base font-medium text-slate-800 hover:gap-3 transition-all">
            Discover the dishes <ArrowIcon />
          </a>
        </div>

        <ul data-hero className="mt-8 md:mt-10 flex flex-wrap gap-x-8 md:gap-x-12 gap-y-4 border-t border-[#084838]/20 pt-6">
          {heroStats.map((st, i) => (
            <li key={st.id} className={i > 0 ? 'sm:pl-8 md:pl-12 sm:border-l sm:border-[#084838]/20' : ''}>
              <p className="text-2xl md:text-4xl leading-none text-slate-800">{st.value}</p>
              <p className={`mt-1 ${META_TEXT} text-slate-600`}>{st.label}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Assiettes : plus grandes et plus proches pour remplir l'espace */}
      <div className="relative w-full max-w-[600px] aspect-[6/5] mx-auto lg:ml-auto">
        <div data-plate className="absolute left-0 top-[4%] w-[66%]">
          <div data-bob><img src={Ambanja} alt="A traditional Malagasy dish" className="w-full aspect-square object-cover rounded-full" /></div>
        </div>
        <div data-plate className="absolute right-0 top-0 w-[34%]">
          <div data-bob><img src={Ramena} alt="Fresh seafood" className="w-full aspect-square object-cover rounded-full ring-8 ring-[#D5E8E2]" /></div>
        </div>
        <div data-plate className="absolute right-[2%] bottom-[2%] w-[40%]">
          <div data-bob><img src={NosyLonjo} alt="Sweet vanilla dessert" className="w-full aspect-square object-cover rounded-full ring-8 ring-[#D5E8E2]" /></div>
        </div>
        <div data-plate className="absolute right-[38%] bottom-0 w-[22%]"><SpinBadge /></div>
      </div>
    </section>
  )
}

// Plats signature : panneaux qui s'ouvrent au survol / au clic
function Dishes() {
  const [active, setActive] = useState(0)
  const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches

  return (
    <div id="dishes" className={`${SECTION_GAP} scroll-mt-8`}>
      <div className="mb-8 md:mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-12">
        <h2 className={`${SECTION_TITLE} lg:max-w-[52%]`}>Signature Dishes</h2>
        <p className={`${SECTION_SUBTITLE} lg:max-w-md`}>Five flavors you should not leave without trying.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:h-[560px]" role="tablist" aria-label="Signature dishes">
        {dishes.map((d, i) => {
          const isActive = i === active
          return (
            <button
              key={d.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(i)}
              onMouseEnter={() => { if (isDesktop()) setActive(i) }}
              className={`group relative overflow-hidden rounded-3xl text-left text-white transition-all duration-700 ease-in-out ${
                isActive ? 'h-[440px] lg:h-auto lg:flex-[4]' : 'h-[84px] lg:h-auto lg:flex-[1]'
              }`}
            >
              <img src={d.image} alt={d.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              <span className={`absolute inset-0 transition-colors duration-500 ${isActive ? 'bg-gradient-to-t from-black/80 via-black/20 to-transparent' : 'bg-black/45'}`} />

              {/* Nom quand le panneau est fermé */}
              <span className={`absolute left-5 top-1/2 -translate-y-1/2 text-lg font-medium lg:hidden transition-opacity duration-300 ${isActive ? 'opacity-0' : 'opacity-100'}`}>
                {d.name}
              </span>
              <span className={`absolute inset-x-0 bottom-6 hidden lg:flex justify-center transition-opacity duration-300 ${isActive ? 'opacity-0' : 'opacity-100'}`}>
                <span className="[writing-mode:vertical-rl] rotate-180 text-xl font-medium tracking-wide">{d.name}</span>
              </span>

              {/* Contenu quand le panneau est ouvert */}
              <span className={`absolute inset-x-0 bottom-0 block p-5 md:p-8 transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0 delay-300' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <span className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs md:text-sm font-medium text-slate-900">Spice: {d.spice}</span>
                  <span className="rounded-full border border-white/40 bg-white/10 backdrop-blur-sm px-3 py-1 text-xs md:text-sm">{d.where}</span>
                </span>
                <span className="mt-4 block text-3xl md:text-5xl font-medium tracking-tight">{d.name}</span>
                <span className="mt-3 block max-w-lg text-sm md:text-lg text-white/85 leading-relaxed">{d.text}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Expériences : filtres, liste de lignes à droite, grand aperçu à gauche qui change au survol
function Menu() {
  const [category, setCategory] = useState('all')
  const [activeId, setActiveId] = useState(experiences[0].id)
  const previewRef = useRef(null)
  const first = useRef(true)

  const list = category === 'all' ? experiences : experiences.filter((e) => e.category === category)
  const current = list.find((e) => e.id === activeId) || list[0]

  // L'aperçu apparaît en fondu à chaque changement
  useLayoutEffect(() => {
    if (first.current) { first.current = false; return }
    if (!previewRef.current || prefersReducedMotion()) return
    gsap.fromTo(previewRef.current, { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out', clearProps: 'transform,opacity' })
  }, [current.id])

  const tab = (active) =>
    `rounded-full px-5 py-2 text-sm md:text-base font-medium transition ${active ? 'bg-[#084838] text-white' : 'bg-white text-slate-700 hover:bg-white/70'}`

  return (
    <div id="experiences" className={`${SECTION_GAP} scroll-mt-8`}>
      <div className="mb-6 md:mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-12">
        <h2 className={`${SECTION_TITLE} lg:max-w-[52%]`}>Dining Experiences</h2>
        <p className={`${SECTION_SUBTITLE} lg:max-w-md`}>From a quick street snack to a candlelit dinner. Prices are per person.</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2 md:gap-3" role="tablist" aria-label="Experience types">
        {menuTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={category === t.id}
            onClick={() => { setCategory(t.id); setActiveId(null) }}
            className={tab(category === t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-6 lg:gap-10 items-start">

        {/* Aperçu (grand écran) */}
        <div className="hidden lg:block lg:sticky lg:top-8 relative overflow-hidden rounded-3xl bg-[#084838] text-white h-[520px]">
          <div ref={previewRef} className="absolute inset-0">
            <img src={current.image} alt={current.name} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8">
              <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-slate-900">{current.duration}</span>
              <h3 className="mt-4 text-4xl font-medium tracking-tight">{current.name}</h3>
              <p className="mt-3 max-w-md text-base text-white/85 leading-relaxed">{current.text}</p>
              <div className="mt-6 flex items-center justify-between gap-4">
                <p className="text-white/80">From <span className="text-3xl font-medium text-white">${current.price}</span> / person</p>
                <a href="/contact" className={`bg-[#C49849] hover:bg-[#b08339] text-white ${BUTTON}`}>Book This</a>
              </div>
            </div>
          </div>
        </div>

        {/* Liste */}
        <ul className="flex flex-col gap-2 md:gap-3">
          {list.map((e, i) => {
            const isActive = e.id === current.id
            return (
              <li key={e.id}>
                <a
                  href="/contact"
                  onMouseEnter={() => setActiveId(e.id)}
                  onFocus={() => setActiveId(e.id)}
                  className={`group flex items-center gap-4 md:gap-5 rounded-2xl p-3 md:p-4 transition ${isActive ? 'bg-white' : 'hover:bg-white/60'}`}
                >
                  <img src={e.image} alt="" className="lg:hidden shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover" />
                  <span className="hidden lg:block w-8 text-sm tabular-nums text-[#9a742f]">{String(i + 1).padStart(2, '0')}</span>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-2xl font-medium text-slate-900 leading-snug">{e.name}</h3>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-slate-600">
                      <span className="rounded-full border border-slate-400 px-2.5 py-0.5 text-xs md:text-sm text-slate-700">{e.duration}</span>
                      <span className="lg:hidden">{e.text}</span>
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-xl md:text-3xl font-medium text-slate-900 tabular-nums">${e.price}</p>
                    <p className={`${META_TEXT} text-slate-500`}>per person</p>
                  </div>

                  <span className={`hidden md:flex shrink-0 w-10 h-10 rounded-full items-center justify-center transition ${isActive ? 'bg-[#084838] text-white translate-x-0' : 'bg-[#084838]/10 text-[#084838] group-hover:bg-[#084838] group-hover:text-white'}`}>
                    <ArrowIcon />
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>

      <p className={`mt-8 ${META_TEXT} text-slate-500`}>Groups of 6 or more get a private table.</p>
    </div>
  )
}

// Régimes alimentaires : bande simple avec pastilles
function Diets() {
  return (
    <div className={`${SECTION_GAP} flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-16 border-y border-[#084838]/20 py-8 md:py-10`}>
      <h2 className="text-2xl md:text-4xl font-medium text-slate-900 tracking-tight lg:max-w-xs">Every Diet Is Welcome</h2>
      <ul className="flex flex-wrap gap-2 md:gap-3">
        {diets.map((d) => (
          <li key={d} className="rounded-full border border-[#084838] px-4 md:px-5 py-2 text-sm md:text-base text-[#084838]">{d}</li>
        ))}
      </ul>
    </div>
  )
}

// Cours de cuisine : photo avec parallaxe + étapes
function CookingClass() {
  return (
    <div className={`${SECTION_GAP} grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center`}>
      <div className="relative overflow-hidden rounded-3xl aspect-[4/5] md:aspect-[5/4] lg:aspect-[4/5] bg-[#084838]">
        <img data-parallax src={Tana} alt="Cooking together" className="absolute left-0 -top-[10%] w-full h-[120%] object-cover" />
        <span className={`${BADGE} absolute left-5 top-5`}>Most loved</span>
      </div>

      <div>
        <p className="mb-3 text-xs sm:text-sm md:text-base uppercase tracking-wide text-slate-700">Hands-on</p>
        <h2 className={SECTION_TITLE}>Learn To Cook Like A Local</h2>
        <p className={`mt-5 ${SECTION_SUBTITLE}`}>Take the recipes home with you. No experience needed, just an appetite.</p>

        <ol className="mt-8 flex flex-col gap-5">
          {classSteps.map((s) => (
            <li key={s.id} className="flex items-start gap-4">
              <span className="shrink-0 w-9 h-9 rounded-full bg-[#C49849] text-white flex items-center justify-center text-sm font-medium">{s.id}</span>
              <div>
                <h3 className="text-lg md:text-xl font-medium text-slate-900">{s.title}</h3>
                <p className="mt-1 text-sm md:text-base text-slate-600 leading-relaxed">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <ul className="mt-8 grid grid-cols-3 gap-3 md:gap-5 max-w-md">
          {[['3 h', 'duration'], ['8', 'guests max'], ['$45', 'per person']].map(([v, l]) => (
            <li key={l} className="rounded-2xl bg-white p-4 text-center">
              <p className="text-2xl md:text-3xl leading-none text-slate-800">{v}</p>
              <p className={`mt-2 ${META_TEXT} text-slate-600`}>{l}</p>
            </li>
          ))}
        </ul>

        <a href="/contact" className={`mt-8 inline-block bg-[#084838] hover:bg-[#0a5c47] text-white ${BUTTON}`}>Reserve A Seat</a>
      </div>
    </div>
  )
}

// FAQ nouvelle version : liste de questions à gauche, grande réponse sur carte verte à droite
function Faq() {
  const [active, setActive] = useState(0)
  const answerRef = useRef(null)
  const first = useRef(true)

  // La réponse glisse en douceur à chaque changement de question
  useLayoutEffect(() => {
    if (first.current) { first.current = false; return }
    if (!answerRef.current || prefersReducedMotion()) return
    gsap.fromTo(answerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', clearProps: 'transform,opacity' })
  }, [active])

  return (
    <div className={SECTION_GAP}>
      <div className="mb-8 md:mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-12">
        <h2 className={`${SECTION_TITLE} lg:max-w-[52%]`}>Good To Know Before You Eat</h2>
        <p className={`${SECTION_SUBTITLE} lg:max-w-md`}>Pick a question. Can&apos;t find yours? Our team replies within a few hours.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 lg:gap-16 items-start">
        <ol className="border-t border-[#084838]/20">
          {faqs.map((f, i) => {
            const isActive = i === active
            return (
              <li key={f.q} className="border-b border-[#084838]/20">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-expanded={isActive}
                  className="w-full flex items-start gap-4 md:gap-6 py-5 md:py-6 text-left"
                >
                  <span className={`text-sm md:text-base tabular-nums pt-1 ${isActive ? 'text-[#9a742f]' : 'text-slate-500'}`}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={`flex-1 text-lg md:text-2xl leading-snug transition ${isActive ? 'font-medium text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}>{f.q}</span>
                  <span className={`shrink-0 mt-1 transition-transform duration-300 ${isActive ? 'rotate-90 text-[#084838]' : 'text-slate-400'}`}><ArrowIcon /></span>
                </button>
                {/* Mobile : la réponse s'ouvre sous la question */}
                {isActive && <p className="lg:hidden pb-6 pl-10 text-sm md:text-base text-slate-600 leading-relaxed">{f.a}</p>}
              </li>
            )
          })}
        </ol>

        {/* Grand écran : réponse sur carte verte */}
        <div className="hidden lg:block lg:sticky lg:top-8 rounded-3xl bg-[#084838] text-white p-10 min-h-[340px]">
          <div ref={answerRef}>
            <span className={BADGE}>Question {String(active + 1).padStart(2, '0')}</span>
            <h3 className="mt-6 text-2xl font-medium leading-snug">{faqs[active].q}</h3>
            <p className="mt-5 text-lg text-white/80 leading-relaxed">{faqs[active].a}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// CTA : carte verte avec petit formulaire (choix de l'expérience + email)
function Cta() {
  const [pick, setPick] = useState(ctaChoices[0])
  const [status, setStatus] = useState('idle') // 'idle' | 'sent'

  const handleSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const { email } = Object.fromEntries(new FormData(form))

    // TODO : envoyer { pick, email } à ton API ou à un service d'emails (EmailJS, Formspree...)
    console.log('Food request:', { pick, email })

    setStatus('sent')
    form.reset()
  }

  return (
    <div className={`${SECTION_GAP} grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center rounded-3xl bg-[#084838] text-white p-6 md:p-14`}>
      <div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.15] tracking-tight">Let&apos;s Plan Your Food Trip</h2>
        <p className="mt-4 text-sm md:text-lg text-white/75 leading-relaxed max-w-md">
          Tell us what you feel like eating. We book the tables, the guides and the tastings, and send a clear plan within one working day.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl bg-white/10 border border-white/20 p-5 md:p-8">
        <fieldset>
          <legend className="text-sm md:text-base text-white/80">What are you in the mood for?</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {ctaChoices.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={pick === c}
                onClick={() => setPick(c)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${pick === c ? 'bg-[#C49849] text-white' : 'border border-white/40 text-white hover:bg-white/10'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </fieldset>

        <label htmlFor="food-email" className="mt-6 block text-sm md:text-base text-white/80">Your email</label>
        <div className="mt-2 flex flex-col sm:flex-row gap-2 rounded-3xl sm:rounded-full bg-white p-2 sm:pl-6">
          <input id="food-email" name="email" type="email" required autoComplete="email" placeholder="name@example.com" className="flex-1 min-w-0 bg-transparent px-4 py-2 sm:px-0 text-sm md:text-base text-slate-800 placeholder:text-slate-500 focus:outline-none" />
          <button type="submit" className={`shrink-0 bg-[#C49849] hover:bg-[#b08339] text-white ${BUTTON}`}>Send Request</button>
        </div>

        {status === 'sent' && <p role="status" className="mt-4 text-sm md:text-base text-[#E6C58A]">Thank you! We will get back to you soon.</p>}
      </form>
    </div>
  )
}

function FoodDining() {
  const contentRef = useRef(null)

  useLayoutEffect(() => {
    // Pas d'animation si l'utilisateur a demandé moins de mouvement
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      // Entrée du hero : textes puis assiettes qui apparaissent en grossissant
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-hero]', { y: 40, opacity: 0, duration: 0.9, stagger: 0.12 })
        .from('[data-plate]', { scale: 0.7, opacity: 0, duration: 1, stagger: 0.15 }, '-=0.6')

      // Flottement doux des assiettes
      gsap.to('[data-bob]', {
        y: (i) => (i % 2 ? 8 : -8), duration: (i) => 2.8 + (i % 3) * 0.6,
        ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.2,
      })

      // Le badge circulaire tourne lentement
      gsap.to('[data-spin]', { rotation: 360, duration: 24, ease: 'none', repeat: -1, transformOrigin: '50% 50%' })

      // Parallaxe de la photo du cours de cuisine
      gsap.utils.toArray('[data-parallax]').forEach((img) => {
        gsap.fromTo(img, { yPercent: -6 }, {
          yPercent: 6, ease: 'none',
          scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })

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
      <div ref={contentRef} className={`${SECTION_WIDTH} mt-6 md:mt-10`}>
        <Hero />
        <Dishes />
        <Menu />
        <Diets />
        <CookingClass />
        <Faq />
        <Cta />
      </div>
    </section>
    <Footer />
    </>
  )
}

export default FoodDining