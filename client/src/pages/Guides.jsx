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

/* ---------------------------- Données ---------------------------- */

const services = [
  { id: 1, name: 'Cultural Guide', image: Tana, text: 'Markets, history, food and daily life explained by someone who grew up there. Half or full day, at your pace.', tags: ['Half / full day', '1–10 travelers', 'Food stops'] },
  { id: 2, name: 'Wildlife & Nature Guide', image: Deux, text: 'Spot lemurs, birds and chameleons with a naturalist who knows exactly where and when to look.', tags: ['Park entry handled', 'Small groups', 'Binoculars'] },
  { id: 3, name: 'Adventure & Trek Guide', image: NosyIranja, text: 'Hikes, canyons and coastal trails led by trained, first-aid certified guides, adapted to your level.', tags: ['1–5 days', 'Safety gear', 'Porters on request'] },
  { id: 4, name: 'Trip Companion', image: NosyLonjo, text: 'A Noziwild host who welcomes you, handles logistics and stays reachable from arrival to departure.', tags: ['Airport welcome', 'Daily check-in', '24/7 help'] },
]

const guides = [
  { id: 1, name: 'Hery Andria', role: 'Wildlife Guide', image: Tana, langs: 'English · French · Malagasy', years: 12, bio: 'Hery leads small-group wildlife walks and knows exactly when and where to find the island’s most unusual animals.', specialties: ['Lemurs', 'Birdwatching', 'Night walks'] },
  { id: 2, name: 'Lina Rakoto', role: 'Cultural Specialist', image: Ramena, langs: 'English · French · Italian', years: 9, bio: 'Lina shares the history, food and traditions of the island and connects travelers with the people who keep them alive.', specialties: ['Cuisine', 'Crafts', 'Village life'] },
  { id: 3, name: 'Tojo Rabe', role: 'Adventure Guide', image: NosyIranja, langs: 'English · French · German', years: 8, bio: 'Tojo designs treks that match your level, with the right pace, the right stops and safety always first.', specialties: ['Trekking', 'Canyons', 'Coastal trails'] },
  { id: 4, name: 'Mika Ravao', role: 'Trip Companion', image: Ambanja, langs: 'English · French · Spanish', years: 6, bio: 'Mika takes care of every detail so you can simply enjoy the trip, and is one call away whenever you need.', specialties: ['Logistics', 'Families', 'Custom trips'] },
]

// true = inclus, false = non inclus
const compare = {
  columns: ['Essential', 'Guided', 'Full Companion'],
  rows: [
    { label: 'Digital travel guide', values: [true, true, true] },
    { label: 'Emergency phone line', values: [true, true, true] },
    { label: 'Local guide on chosen days', values: [false, true, true] },
    { label: 'Daily check-in', values: [false, true, true] },
    { label: 'Same guide for the whole trip', values: [false, false, true] },
    { label: 'Airport welcome & farewell', values: [false, false, true] },
  ],
}

const day = [
  { time: '08:00', title: 'Pickup At Your Hotel', text: 'Meet your guide, get a quick overview of the day and adjust the plan to your mood and the weather.', image: Ambanja },
  { time: '10:00', title: 'First Discovery', text: 'A market, a trail or a village, depending on your guide. This is where the stories start.', image: Tana },
  { time: '13:00', title: 'Lunch With Locals', text: 'A family table or a small restaurant your guide loves, far from the tourist menus.', image: Ramena },
  { time: '15:30', title: 'Slow Afternoon', text: 'Swim, walk or simply relax. The pace is yours and your guide adapts.', image: NosyLonjo },
  { time: '18:00', title: 'Back For Sunset', text: 'A tip for tonight’s dinner, a photo at the best spot and a plan for tomorrow.', image: NosyIranja },
]

// Ajoute autant de témoignages que tu veux : les boutons prev/next et la barre de progression les font défiler en boucle
const testimonials = [
  { id: 1, text: 'Our guide made the whole trip. He knew every path, every family and every story. We would not have found half of it alone.', name: 'Emma & Tom', origin: 'Travelers from Lyon', trip: 'Driver-Guide · 8 days', image: Ambanja, rating: 5 },
  { id: 2, text: 'Lina showed us a side of the island we never expected. The food, the people, the little workshops. Truly unforgettable.', name: 'Giulia R.', origin: 'Traveler from Milan', trip: 'Cultural Guide · 5 days', image: Ramena, rating: 5 },
  { id: 3, text: 'The trek was challenging but perfectly paced. We always felt safe, and the views were worth every step.', name: 'Markus B.', origin: 'Traveler from Munich', trip: 'Trek Guide · 3 days', image: NosyIranja, rating: 5 },
  { id: 4, text: 'Having one person to call for everything made our family trip stress-free. The kids still talk about their guide.', name: 'Sophie L.', origin: 'Traveler from Montréal', trip: 'Trip Companion · 10 days', image: Tana, rating: 5 },
  { id: 5, text: 'We saw lemurs on the first morning thanks to Hery. He knew exactly where to go and when. Amazing.', name: 'Daniel & Ana', origin: 'Travelers from Madrid', trip: 'Wildlife Guide · 4 days', image: Deux, rating: 4 },
]

const faqs = [
  { q: 'Do I need a guide for my whole trip?', a: 'No. Many travelers book a guide only for key days, like a national park or a trek, and explore freely the rest of the time.' },
  { q: 'Can I choose my guide?', a: 'Yes. Tell us your interests and language and we suggest the best match. You can also request a guide you already know.' },
  { q: 'What languages do your guides speak?', a: 'English and French are covered on all trips. Italian, German and Spanish are available on request.' },
  { q: 'What if I have a problem during the trip?', a: 'Every trip includes our support line. If needed, a team member reaches you or arranges help on the spot.' },
  { q: 'Are tips included?', a: 'No, tips are always optional. If you enjoyed the day, a small tip to your guide is much appreciated.' },
]

/* ---------------------------- Icônes ----------------------------- */

const Svg = ({ children, className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)
const CheckIcon = () => <Svg className="w-5 h-5 text-[#C49849]"><path d="M20 6 9 17l-5-5" /></Svg>
const ArrowIcon = () => <Svg className="w-5 h-5"><path d="M5 12h14M13 6l6 6-6 6" /></Svg>
const StarIcon = () => (
  <svg className="w-4 h-4 text-[#F5B800] fill-current" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
  </svg>
)

/* -------------------------- Composants --------------------------- */

// Petite animation d'entrée à chaque changement de contenu (carrousels, onglets). Ignore le 1er rendu.
function useSwap(ref, dep) {
  const first = useRef(true)
  useLayoutEffect(() => {
    if (first.current) { first.current = false; return }
    if (!ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(ref.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', clearProps: 'transform,opacity' })
  }, [dep]) // eslint-disable-line react-hooks/exhaustive-deps
}

// Hero coupé en deux : texte à gauche, photos inclinées à droite
function Hero() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16 items-center">
      <div>
        <span data-hero className={`${BADGE}`}>Guides & Support</span>
        <h1 data-hero className={`${STATEMENT_TITLE} mt-6`}>Local Experts, Real Stories</h1>
        <p data-hero className={`mt-6 md:mt-8 ${SECTION_SUBTITLE}`}>
          A good guide turns a nice trip into a story you tell for years. Choose a local expert for a day, or have a Noziwild companion at your side all the way.
        </p>
        <div data-hero className="mt-8 flex flex-wrap items-center gap-4">
          <a href="/contact" className={`bg-[#084838] hover:bg-[#0a5c47] text-white ${BUTTON}`}>Find My Guide</a>
          <a href="#guides" className="inline-flex items-center gap-2 text-sm md:text-base font-medium text-slate-800 hover:gap-3 transition-all">
            Meet the team <ArrowIcon />
          </a>
        </div>
      </div>

      <div className="relative w-full max-w-[520px] aspect-[4/3] mx-auto lg:ml-auto">
        <div data-hero-photo className="absolute left-0 top-0 w-[52%] -rotate-6 rounded-xl bg-white p-2 md:p-3 shadow-sm">
          <img src={Tana} alt="Wildlife guide on a forest trail" className="w-full aspect-[4/5] object-cover rounded-md" />
        </div>
        <div data-hero-photo className="absolute right-0 top-[12%] w-[52%] rotate-6 rounded-xl bg-white p-2 md:p-3 shadow-sm">
          <img src={Ramena} alt="Guide with travelers on the coast" className="w-full aspect-[4/5] object-cover rounded-md" />
        </div>
        <div data-hero-photo className="absolute left-[8%] bottom-0 flex items-center gap-3 rounded-2xl bg-[#084838] text-white px-5 py-3">
          <div className="flex gap-0.5"><StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon /></div>
          <span className="text-sm font-medium">98% happy travelers</span>
        </div>
      </div>
    </div>
  )
}

// Bande de chiffres simple
function StatsStrip() {
  const countProps = (value) => {
    const m = /^(\d+)(\+?)$/.exec(value)
    return m ? { 'data-count': m[1], 'data-suffix': m[2] } : {}
  }
  const stats = [['40+', 'Certified guides'], ['5', 'Languages spoken'], ['12+', 'Years of experience'], ['24/7', 'Trip support']]
  return (
    <ul data-stagger className="mt-12 md:mt-20 grid grid-cols-2 md:grid-cols-4 border-y border-[#084838]/15">
      {stats.map(([value, label], i) => (
        <li key={label} className={`py-6 md:py-8 px-2 md:px-6 ${i > 0 ? 'md:border-l md:border-[#084838]/15' : ''}`}>
          <p className="text-3xl md:text-5xl text-slate-800 leading-none" {...countProps(value)}>{value}</p>
          <p className="mt-2 md:mt-3 text-sm md:text-base text-slate-600">{label}</p>
        </li>
      ))}
    </ul>
  )
}

// Services en grille "bento" : images plein cadre avec texte dessus
const bentoLayout = [
  'lg:row-span-2 min-h-[380px] lg:min-h-[560px]',
  'lg:col-span-2 min-h-[280px]',
  'min-h-[280px]',
  'min-h-[280px]',
]

function Services() {
  return (
    <div className={SECTION_GAP}>
      <div className="mb-8 md:mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-12">
        <h2 className={`${SECTION_TITLE} lg:max-w-[52%]`}>Four Ways To Be Guided</h2>
        <p className={`${SECTION_SUBTITLE} lg:max-w-md`}>Whatever your style, there is a guide for it.</p>
      </div>

      <div data-stagger className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {services.map((s, i) => (
          <article key={s.id} className={`group relative overflow-hidden rounded-3xl bg-[#084838] text-white flex ${bentoLayout[i]}`}>
            <img src={s.image} alt={s.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

            <div className="relative flex flex-col justify-between w-full p-5 md:p-7">
              <span className="self-start rounded-full bg-white/90 text-slate-900 text-sm font-medium px-3 py-1">
                {String(s.id).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-2xl md:text-3xl font-medium tracking-tight">{s.name}</h3>
                <p className="mt-2 text-sm md:text-base text-white/85 leading-relaxed max-w-md">{s.text}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {s.tags.map((t) => (
                    <li key={t} className="rounded-full border border-white/40 bg-white/10 backdrop-blur-sm px-3 py-1 text-xs md:text-sm">{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

// Choix d'un guide : liste défilante (scroll + boutons prev/next) à gauche, fiche à droite
function GuideShowcase() {
  const total = guides.length
  const [active, setActive] = useState(0)
  const listRef = useRef(null)
  const itemRefs = useRef([])
  const g = guides[active]
  const cardRef = useRef(null)
  useSwap(cardRef, active)

  const goPrev = () => setActive((i) => (i - 1 + total) % total)
  const goNext = () => setActive((i) => (i + 1) % total)

  // Garde le guide sélectionné visible dans la liste (vertical sur grand écran, horizontal sur mobile)
  useEffect(() => {
    const list = listRef.current
    const item = itemRefs.current[active]
    if (!list || !item) return
    list.scrollTo({
      top: item.offsetTop - list.clientHeight / 2 + item.clientHeight / 2,
      left: item.offsetLeft - list.clientWidth / 2 + item.clientWidth / 2,
      behavior: 'smooth',
    })
  }, [active])

  const arrowClass =
    "w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-[#084838] text-[#084838] " +
    "hover:bg-[#084838]/10 active:bg-[#084838]/20 transition " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#084838]"

  return (
    <div id="guides" className={`${SECTION_GAP} scroll-mt-8`}>
      <h2 className={`${SECTION_TITLE} mb-8 md:mb-12`}>Meet Your Guide</h2>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 lg:gap-8">

        {/* Colonne de gauche : liste défilante + navigation */}
        <div className="flex flex-col gap-4">
          <div className="relative lg:flex-1 lg:min-h-[280px]">
            <div
              ref={listRef}
              role="tablist"
              aria-label="Guides"
              className="relative flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-hidden pb-2 lg:pb-0 lg:pr-2
                         lg:absolute lg:inset-0 lg:overflow-y-auto snap-x lg:snap-none
                         [scrollbar-width:thin] [scrollbar-color:#084838_transparent]"
            >
              {guides.map((item, i) => (
                <button
                  key={item.id}
                  ref={(el) => (itemRefs.current[i] = el)}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  onClick={() => setActive(i)}
                  className={`snap-start shrink-0 w-[240px] lg:w-auto flex items-center gap-3 rounded-2xl p-3 text-left transition ${
                    i === active ? 'bg-[#084838] text-white' : 'bg-white text-slate-800 hover:bg-white/70'
                  }`}
                >
                  <img src={item.image} alt="" className="w-14 h-14 rounded-full object-cover" />
                  <span>
                    <span className="block font-medium">{item.name}</span>
                    <span className={`block text-sm ${i === active ? 'text-white/70' : 'text-slate-600'}`}>{item.role}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button type="button" onClick={goPrev} aria-label="Previous guide" className={arrowClass}>
              <span className="rotate-180"><ArrowIcon /></span>
            </button>
            <span className={`${META_TEXT} tabular-nums text-slate-700`} aria-hidden="true">
              {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
            <button type="button" onClick={goNext} aria-label="Next guide" className={arrowClass}>
              <ArrowIcon />
            </button>
          </div>
        </div>

        {/* Fiche du guide */}
        <article ref={cardRef} aria-live="polite" className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] overflow-hidden rounded-3xl bg-white">
          <div className="min-h-[280px] md:min-h-[440px] relative">
            <img src={g.image} alt={g.name} className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="p-6 md:p-10 flex flex-col">
            <span className={`${BADGE} self-start`}>{g.years} years experience</span>
            <h3 className="mt-5 text-2xl md:text-4xl font-medium tracking-tight text-slate-900">{g.name}</h3>
            <p className="mt-1 text-base md:text-lg text-slate-700">{g.role}</p>
            <p className="mt-5 text-sm md:text-base leading-relaxed text-slate-600">{g.bio}</p>
            <p className={`mt-5 ${META_TEXT} text-slate-500 uppercase tracking-wide`}>Languages</p>
            <p className="mt-1 text-sm md:text-base text-slate-800">{g.langs}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {g.specialties.map((t) => <li key={t} className="rounded-full bg-[#D5E8E2] px-4 py-1.5 text-sm text-slate-700">{t}</li>)}
            </ul>
            <a href="/contact" className={`mt-8 self-start bg-[#C49849] hover:bg-[#b08339] text-white ${BUTTON}`}>
              Request {g.name.split(' ')[0]}
            </a>
          </div>
        </article>
      </div>
    </div>
  )
}

// Tableau comparatif des formules
function Compare() {
  const cols = compare.columns
  return (
    <div className={SECTION_GAP}>
      <div className="mb-8 md:mb-12 text-center">
        <h2 className={SECTION_TITLE}>Compare Support Levels</h2>
        <p className={`mt-4 mx-auto ${SECTION_SUBTITLE}`}>Pick the level that fits your trip. You can upgrade at any time before departure.</p>
      </div>
      <div className="overflow-x-auto rounded-3xl bg-white">
        <table className="w-full min-w-[560px] text-left">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="p-4 md:p-6" />
              {cols.map((c, i) => (
                <th key={c} className={`p-4 md:p-6 text-base md:text-xl font-medium text-center ${i === 1 ? 'bg-[#084838] text-white' : 'text-slate-900'}`}>
                  {c}
                  {i === 1 && <span className="block mt-1 text-xs font-normal text-[#E6C58A]">Most popular</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compare.rows.map((row) => (
              <tr key={row.label} className="border-b border-slate-100 last:border-0">
                <td className="p-4 md:p-6 text-sm md:text-base text-slate-700">{row.label}</td>
                {row.values.map((v, i) => (
                  <td key={i} className={`p-4 md:p-6 ${i === 1 ? 'bg-[#084838]/5' : ''}`}>
                    <span className="flex justify-center">{v ? <CheckIcon /> : <span className="text-slate-300">—</span>}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Une journée type : étapes horizontales cliquables + carte de détail
function DayTimeline() {
  const total = day.length
  const [active, setActive] = useState(0)
  const step = day[active]
  const stepRef = useRef(null)
  useSwap(stepRef, active)

  return (
    <div className={SECTION_GAP}>
      <div className="mb-8 md:mb-12 text-center">
        <h2 className={SECTION_TITLE}>A Day With Your Guide</h2>
        <p className={`mt-4 mx-auto ${SECTION_SUBTITLE}`}>Every day is different, but here is what a typical one can feel like. Tap a time to see more.</p>
      </div>

      {/* Frise horizontale */}
      <div className="relative overflow-x-auto pb-2">
        <ol className="relative grid grid-cols-5 min-w-[520px]" role="tablist" aria-label="A day with your guide">
          <span className="absolute left-[10%] right-[10%] top-[11px] h-px bg-[#084838]/25" aria-hidden="true" />
          {day.map((d, i) => (
            <li key={d.time} className="relative">
              <button
                type="button"
                role="tab"
                aria-selected={i === active}
                onClick={() => setActive(i)}
                className="w-full flex flex-col items-center gap-3 text-center"
              >
                <span
                  className={`relative w-6 h-6 rounded-full ring-4 ring-[#D5E8E2] transition ${
                    i === active ? 'bg-[#C49849] scale-125' : i < active ? 'bg-[#C49849]/60' : 'bg-slate-300'
                  }`}
                />
                <span className={`text-sm md:text-lg tabular-nums transition ${i === active ? 'font-medium text-slate-900' : 'text-slate-600'}`}>{d.time}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      {/* Carte de l'étape */}
      <article key={step.time} ref={stepRef} aria-live="polite" className="mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-[1fr_1.1fr] overflow-hidden rounded-3xl bg-white">
        <div className="relative min-h-[240px] md:min-h-[360px]">
          <img src={step.image} alt={step.title} className="absolute inset-0 w-full h-full object-cover" />
        </div>
        <div className="p-6 md:p-12 flex flex-col">
          <span className={`${BADGE} self-start`}>Step {active + 1} of {total} · {step.time}</span>
          <h3 className="mt-5 text-2xl md:text-4xl font-medium tracking-tight text-slate-900">{step.title}</h3>
          <p className="mt-4 text-sm md:text-lg leading-relaxed text-slate-600 max-w-md">{step.text}</p>
          <button
            type="button"
            onClick={() => setActive((i) => (i + 1) % total)}
            className={`mt-8 self-start inline-flex items-center gap-2 bg-[#084838] hover:bg-[#0a5c47] text-white ${BUTTON}`}
          >
            {active === total - 1 ? 'Start again' : 'Next step'} <ArrowIcon />
          </button>
        </div>
      </article>
    </div>
  )
}

// Témoignages : grande carte verte (photo + citation) avec barre de progression et boutons prev/next
function Testimonials() {
  const total = testimonials.length
  const [active, setActive] = useState(0)
  const goPrev = () => setActive((i) => (i - 1 + total) % total)
  const goNext = () => setActive((i) => (i + 1) % total)
  const t = testimonials[active]
  const textRef = useRef(null)
  useSwap(textRef, active)

  const arrowClass =
    "w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-white/40 text-white " +
    "hover:bg-white/10 active:bg-white/20 transition " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"

  return (
    <div className={SECTION_GAP}>

      {/* Titre + note moyenne */}
      <div className="mb-8 md:mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 lg:gap-12">
        <div>
          <p className="mb-3 text-xs sm:text-sm md:text-base uppercase tracking-wide text-slate-700">Testimonials</p>
          <h2 className={SECTION_TITLE}>What Travelers Say About Us</h2>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-5xl md:text-6xl leading-none text-slate-900">4.9</p>
          <div>
            <div className="flex gap-0.5"><StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon /></div>
            <p className={`mt-1 ${META_TEXT} text-slate-600`}>Average rating from 300+ travelers</p>
          </div>
        </div>
      </div>

      {/* Carte */}
      <figure className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] overflow-hidden rounded-3xl bg-[#084838] text-white">
        <div className="relative min-h-[280px] lg:min-h-[500px]">
          <img key={t.id} src={t.image} alt={`${t.name}, ${t.origin}`} className="absolute inset-0 w-full h-full object-cover" />
          <span className={`${BADGE} absolute left-5 bottom-5`}>{t.trip}</span>
        </div>

        <div className="flex flex-col p-6 md:p-12">
          <div ref={textRef} aria-live="polite">
            <div className="flex items-center justify-between gap-4">
              <p className="text-6xl md:text-8xl leading-none text-[#C49849]" aria-hidden="true">“</p>
              <div className="flex gap-0.5" aria-label={`${t.rating} out of 5`}>
                {Array.from({ length: t.rating }).map((_, i) => <StarIcon key={i} />)}
              </div>
            </div>
            <blockquote className="-mt-2 md:-mt-4 text-xl md:text-3xl leading-snug tracking-tight">
              {t.text}
            </blockquote>
            <figcaption className="mt-6 md:mt-8">
              <span className="block text-base md:text-lg font-medium">{t.name}</span>
              <span className="block text-sm text-white/70">{t.origin}</span>
            </figcaption>
          </div>

          {/* Navigation : barre de progression cliquable + flèches */}
          <div className="mt-auto pt-10 flex items-center gap-4 md:gap-6">
            <div className="flex-1 flex items-center gap-2" role="tablist" aria-label="Testimonials">
              {testimonials.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`Show testimonial ${i + 1}`}
                  onClick={() => setActive(i)}
                  className={`h-1.5 flex-1 rounded-full transition ${i === active ? 'bg-[#C49849]' : 'bg-white/25 hover:bg-white/40'}`}
                />
              ))}
            </div>
            <span className="text-sm tabular-nums text-white/70" aria-hidden="true">
              {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={goPrev} aria-label="Previous testimonial" className={arrowClass}>
                <span className="rotate-180"><ArrowIcon /></span>
              </button>
              <button type="button" onClick={goNext} aria-label="Next testimonial" className={arrowClass}>
                <ArrowIcon />
              </button>
            </div>
          </div>
        </div>
      </figure>
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

// CTA final : "Follow the adventure" (newsletter + mosaïque de photos)
const followList = [
  { id: 1, label: 'Cultural Tours', paths: ['M3 21h18', 'M5 21V10', 'M9 21V10', 'M15 21V10', 'M19 21V10', 'M12 3 3 9h18z'] },
  { id: 2, label: 'Wildlife Walks', paths: ['M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'] },
  { id: 3, label: 'Mountain Treks', paths: ['m8 3 4 8 5-5 5 15H2L8 3z'] },
  { id: 4, label: 'Sea Trips', paths: ['M2 8c1 1 2 1 3 0s2-1 3 0 2 1 3 0 2-1 3 0 2 1 3 0 2-1 3 0', 'M2 14c1 1 2 1 3 0s2-1 3 0 2 1 3 0 2-1 3 0 2 1 3 0 2-1 3 0'] },
]

const photoCell = "overflow-hidden rounded-3xl h-[200px] sm:h-[260px] lg:h-[320px]"

function Photo({ src, alt = '', className = '' }) {
  return (
    <div className={`${photoCell} ${className}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
    </div>
  )
}

function Cta() {
  const [status, setStatus] = useState('idle') // 'idle' | 'sent'

  const handleSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const { email } = Object.fromEntries(new FormData(form))

    // TODO : envoyer `email` à ton API ou à un service de newsletter (Mailchimp, Brevo...)
    console.log('Newsletter:', email)

    setStatus('sent')
    form.reset()
  }

  return (
    <div className={SECTION_GAP}>

      {/* Titre + formulaire d'inscription */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-12">
        <div>
          <p className="mb-2 text-xs sm:text-sm md:text-base uppercase tracking-wide text-slate-700">Stay connected</p>
          <h2 className={SECTION_TITLE}>Follow The Adventure</h2>
        </div>

        <div className="w-full lg:max-w-xl">
          <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-full bg-white p-2 pl-6">
            <label htmlFor="newsletter-email" className="sr-only">Your email address</label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Your Email Address"
              className="flex-1 min-w-0 bg-transparent text-sm md:text-base text-slate-800 placeholder:text-slate-500 focus:outline-none"
            />
            <button type="submit" className={`shrink-0 bg-[#C49849] hover:bg-[#b08339] text-white ${BUTTON}`}>
              Subscribe
            </button>
          </form>
          {status === 'sent' && (
            <p role="status" className={`mt-3 pl-6 ${META_TEXT} md:text-base text-emerald-700`}>
              Thank you! You are on the list.
            </p>
          )}
        </div>
      </div>

      {/* Mosaïque : ligne 1 */}
      <div data-stagger className="mt-10 md:mt-16 grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <Photo src={Tana} alt="Wildlife in the forest" />

        <ul className="col-span-2 lg:col-span-1 order-first lg:order-none flex flex-col justify-center gap-4 lg:gap-5 lg:px-4">
          {followList.map((item) => (
            <li key={item.id} className="flex items-center gap-4 text-lg md:text-xl text-slate-800">
              <span className="shrink-0 w-10 h-10 rounded-full bg-[#C49849] flex items-center justify-center text-white">
                <Svg className="w-5 h-5">{item.paths.map((d) => <path key={d} d={d} />)}</Svg>
              </span>
              {item.label}
            </li>
          ))}
        </ul>

        <Photo src={Ramena} alt="Boat trip along the coast" />
        <Photo src={NosyLonjo} alt="Traveler looking at the view" />
        <Photo src={Deux} alt="Travelers on a mountain road" className="col-span-2 lg:col-span-1" />
      </div>

      {/* Mosaïque : ligne 2 */}
      <div data-stagger className="mt-4 md:mt-6 grid grid-cols-2 lg:grid-cols-[1fr_1.5fr_1fr_1.4fr] gap-4 md:gap-6">
        <Photo src={Ambanja} alt="Traveler jumping with joy" />
        <Photo src={NosyIranja} alt="Island landscape" className="lg:order-none" />
        <Photo src={Tana} alt="Highlands landscape" className="col-span-2 lg:col-span-1" />

        <div className="col-span-2 lg:col-span-1 flex flex-col justify-center lg:pl-8">
          <p className="text-slate-800 leading-tight">
            <span className="text-5xl md:text-6xl">10+</span>{' '}
            <span className="text-2xl md:text-3xl font-medium">Years Of Travel Experience</span>
          </p>
          <div className="mt-6 flex items-center gap-4">
            <img src={Ambanja} alt="" className="shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full object-cover" />
            <p className="text-sm md:text-base text-slate-600 leading-relaxed">
              Our guides have walked these trails for over a decade. Tell us your plans and we will take care of the rest.
            </p>
          </div>
          <a href="/contact" className={`mt-6 self-start bg-[#084838] hover:bg-[#0a5c47] text-white ${BUTTON}`}>
            Find My Guide
          </a>
        </div>
      </div>

    </div>
  )
}

function Guides() {
  const contentRef = useRef(null)

  useLayoutEffect(() => {
    // Pas d'animation si l'utilisateur a demandé moins de mouvement
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      // Entrée du hero
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-hero]', { y: 40, opacity: 0, duration: 0.9, stagger: 0.12 })
        .from('[data-hero-photo]', { opacity: 0, duration: 0.9, stagger: 0.2 }, '-=0.6')

      // Chaque section apparaît en remontant quand elle entre dans l'écran
      Array.from(contentRef.current.children).slice(1).forEach((el) => {
        if (el.hasAttribute('data-stagger')) return
        gsap.from(el, {
          y: 50, opacity: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })

      // Les grilles de cartes / photos arrivent l'une après l'autre
      gsap.utils.toArray('[data-stagger]').forEach((grid) => {
        gsap.from(grid.children, {
          y: 40, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12,
          scrollTrigger: { trigger: grid, start: 'top 88%', once: true },
        })
      })

      // Chiffres qui comptent jusqu'à leur valeur
      gsap.utils.toArray('[data-count]').forEach((el) => {
        const target = Number(el.dataset.count)
        const suffix = el.dataset.suffix || ''
        const counter = { value: 0 }
        el.textContent = `0${suffix}`
        gsap.to(counter, {
          value: target, duration: 1.6, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          onUpdate: () => { el.textContent = `${Math.round(counter.value)}${suffix}` },
        })
      })
    }, contentRef)

    // Recalcule les positions une fois les images chargées
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
      <div ref={contentRef} className={`${SECTION_WIDTH} mt-8 md:mt-16`}>
        <Hero />
        <StatsStrip />
        <Services />
        <GuideShowcase />
        <Compare />
        <DayTimeline />
        <Testimonials />
        <Faq />
        <Cta />
      </div>
    </section>
    <Footer />
    </>
  )
}

export default Guides