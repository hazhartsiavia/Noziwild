import React, { useState } from 'react'
import Deux from "../assets/images/2.jpg";
import Ambanja from "../assets/images/Ambanja.png";
import NosyLonjo from "../assets/images/NosyLonjo.png";
import NosyIranja from "../assets/images/NosyIranja.png";
import Ramena from "../assets/images/Ramena.png";
import Tana from "../assets/images/Tana.png";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/* Constantes partagées : mêmes valeurs que dans les autres pages */
const SECTION_WIDTH = "w-[90vw] lg:max-w-[90vw] xl:max-w-[95vw]"
const SECTION_TITLE = "text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-slate-900 leading-[1.15] tracking-tight"
const SECTION_SUBTITLE = "text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl"
const META_TEXT = "text-xs sm:text-sm"
const PAGE_TITLE = "text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold uppercase leading-none tracking-tight"
const ON_IMAGE_TITLE = "text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-white leading-[1.15] tracking-tight"
const BADGE = "inline-block bg-[#C49849] text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm"
const BUTTON = "text-sm font-medium px-5 py-2.5 rounded-full"
const SECTION_GAP = "mt-[50px] md:mt-[100px]"

/* ---------------------------- Données ---------------------------- */

const intro = {
  label: 'Where To Stay',
  title: 'Sleep Well, Wake Up Somewhere Special',
  text: 'From beachfront bungalows to family-run guesthouses, every Noziwild stay is visited, tested and chosen for its comfort, its welcome and its setting.',
  stats: [
    { id: 1, value: '80+', label: 'Handpicked Stays' },
    { id: 2, value: '25+', label: 'Destinations Covered' },
    { id: 3, value: '4.8/5', label: 'Average Guest Rating' },
  ],
}

const categories = [
  { id: 'all', label: 'All Stays' },
  { id: 'hotel', label: 'Hotels' },
  { id: 'lodge', label: 'Eco Lodges' },
  { id: 'bungalow', label: 'Beach Bungalows' },
  { id: 'guesthouse', label: 'Guesthouses' },
]

const stays = [
  { id: 1, category: 'bungalow', name: 'Ramena Sea Bungalows', place: 'Ramena, Diego Suarez', image: Ramena, price: 65, rating: 4.8, amenities: ['Sea view', 'Breakfast', 'Snorkeling'] },
  { id: 2, category: 'hotel', name: 'Nosy Iranja Retreat', place: 'Nosy Iranja', image: NosyIranja, price: 140, rating: 4.9, amenities: ['Infinity pool', 'Spa', 'Restaurant'] },
  { id: 3, category: 'lodge', name: 'Ambanja Cocoa Lodge', place: 'Ambanja', image: Ambanja, price: 75, rating: 4.7, amenities: ['Garden', 'Farm visits', 'Solar power'] },
  { id: 4, category: 'guesthouse', name: 'Maison Tana', place: 'Antananarivo', image: Tana, price: 40, rating: 4.6, amenities: ['Family-run', 'Breakfast', 'Free Wi-Fi'] },
  { id: 5, category: 'bungalow', name: 'Lonjo Beach Huts', place: 'Nosy Be', image: NosyLonjo, price: 90, rating: 4.8, amenities: ['Beachfront', 'Kayaks', 'Dinner on request'] },
  { id: 6, category: 'lodge', name: 'Baobab Safari Camp', place: 'Northern Madagascar', image: Deux, price: 110, rating: 4.7, amenities: ['Guided walks', 'Full board', 'Stargazing'] },
]

const featured = {
  label: 'Guest Favorite',
  name: 'Nosy Iranja Retreat',
  place: 'Nosy Iranja',
  text: 'A quiet island hideaway with a private stretch of white sand, an infinity pool facing the sunset and a kitchen that cooks the morning’s catch.',
  image: NosyIranja,
  details: ['12 rooms and suites', 'Boat transfer included', 'Best from April to November'],
}

const criteria = [
  { id: 1, title: 'Visited By Our Team', text: 'We sleep there before we recommend it. No stay is listed without a real visit.' },
  { id: 2, title: 'Local & Responsible', text: 'We favor owners from the region, fair jobs and low-impact ways of running a stay.' },
  { id: 3, title: 'Honest Prices', text: 'Clear rates with taxes and breakfast shown, so the quote is the price you pay.' },
]

const included = [
  { id: 1, title: 'Free Cancellation', text: 'On most stays, up to 7 days before arrival.' },
  { id: 2, title: 'Airport & Port Pickup', text: 'Book your transfer with the stay.' },
  { id: 3, title: 'Local Tips', text: 'Restaurants, walks and hidden spots from our experts.' },
  { id: 4, title: '24/7 Support', text: 'A real person if anything goes wrong.' },
]

const faqs = [
  { id: 1, q: 'Are the prices per person or per room?', a: 'Prices shown are per room, per night, starting from the lowest season. Your quote shows the exact total for your dates and group.' },
  { id: 2, q: 'Is breakfast included?', a: 'On most of our stays, yes. Each stay lists what is included, and we tell you clearly when meals cost extra.' },
  { id: 3, q: 'Can you find something for a family or large group?', a: 'Yes. Tell us how many people are traveling and we suggest family rooms, connected rooms or a private villa.' },
  { id: 4, q: 'Can I change my dates after booking?', a: 'In most cases you can, up to 7 days before arrival and subject to availability. The exact terms are in your quote.' },
  { id: 5, q: 'Do the stays have electricity and Wi-Fi?', a: 'Most do, but some remote lodges run on solar power with limited connection. We always say so in advance so you can choose.' },
]

/* ---------------------------- Icônes ----------------------------- */

const Svg = ({ children, className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

const PinIcon = () => (
  <Svg>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Svg>
)

const StarIcon = () => (
  <svg className="w-4 h-4 text-[#F5B800] fill-current" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
  </svg>
)

const CheckIcon = () => (
  <Svg className="w-4 h-4 shrink-0 text-[#C49849]">
    <path d="M20 6 9 17l-5-5" />
  </Svg>
)

const ArrowIcon = () => (
  <Svg className="w-5 h-5">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
)

const PlusIcon = ({ open }) => (
  <Svg className={`w-5 h-5 shrink-0 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)

/* -------------------------- Composants --------------------------- */

function Hero() {
  return (
    <section className={`${SECTION_WIDTH} relative flex items-center overflow-hidden rounded-3xl bg-slate-900 text-white min-h-[240px] md:min-h-[360px]`}>
      <img src={NosyLonjo} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-slate-950/60" />
      <div className="relative w-full max-w-5xl mx-auto px-6 md:px-10 py-16">
        <h1 className={PAGE_TITLE}>Accommodation</h1>
        <hr className="my-6 md:my-8 border-white/30" />
        <nav aria-label="Breadcrumb" className="text-sm md:text-base font-medium">
          <a href="/" className="hover:underline underline-offset-4">Home</a> <span aria-hidden="true">/</span> Accommodation
        </nav>
      </div>
    </section>
  )
}

function Intro() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-16 items-center">
      <div>
        <p className="mb-3 text-xs sm:text-sm md:text-base uppercase tracking-wide text-slate-700">{intro.label}</p>
        <h2 className={SECTION_TITLE}>{intro.title}</h2>
        <p className={`mt-5 md:mt-6 ${SECTION_SUBTITLE}`}>{intro.text}</p>
      </div>
      <div className="grid grid-cols-3 gap-3 md:gap-5">
        {intro.stats.map((s) => (
          <div key={s.id} className="rounded-2xl bg-white p-4 md:p-6">
            <p className="text-2xl md:text-4xl lg:text-5xl leading-none text-slate-800">{s.value}</p>
            <p className="mt-2 md:mt-3 text-xs md:text-base leading-snug text-slate-600">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function StayCard({ stay }) {
  return (
    <article className="group flex flex-col rounded-xl bg-white p-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-md">
        <img src={stay.image} alt={stay.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-800">
          <StarIcon /> {stay.rating}
        </span>
      </div>
      <div className="flex flex-col flex-1 px-3 pt-5 pb-4">
        <p className={`flex items-center gap-1.5 ${META_TEXT} text-slate-600`}><PinIcon />{stay.place}</p>
        <h3 className="mt-2 text-xl md:text-2xl leading-snug text-slate-900">{stay.name}</h3>
        <ul className="mt-4 flex flex-wrap gap-2">
          {stay.amenities.map((a) => (
            <li key={a} className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700">{a}</li>
          ))}
        </ul>
        <div className="mt-auto pt-6 flex items-center justify-between gap-3">
          <p className="text-slate-600 text-sm">From <span className="text-xl md:text-2xl font-medium text-slate-900">${stay.price}</span> / night</p>
          <a href="/contact" className={`bg-slate-800 hover:bg-slate-700 active:scale-95 transition text-white ${BUTTON}`}>Enquire</a>
        </div>
      </div>
    </article>
  )
}

function Stays() {
  const [category, setCategory] = useState('all')
  const list = category === 'all' ? stays : stays.filter((s) => s.category === category)

  return (
    <div className={SECTION_GAP}>
      <h2 className={`${SECTION_TITLE} text-center mb-8 md:mb-12`}>Find Your Perfect Stay</h2>

      <div className="mb-8 flex flex-wrap justify-center gap-2 md:gap-3" role="tablist" aria-label="Accommodation categories">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={category === c.id}
            onClick={() => setCategory(c.id)}
            className={`rounded-full px-5 py-2 text-sm md:text-base font-medium transition ${
              category === c.id ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 hover:bg-white/70'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-9">
        {list.map((stay) => <StayCard key={stay.id} stay={stay} />)}
      </div>
    </div>
  )
}

function Featured() {
  return (
    <div className={`${SECTION_GAP} relative overflow-hidden rounded-3xl bg-slate-900 text-white min-h-[480px] md:min-h-[560px]`}>
      <img src={featured.image} alt={featured.name} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-black/10" />
      <div className="relative min-h-[inherit] flex flex-col justify-end p-5 md:p-10 max-w-2xl">
        <span className={`${BADGE} self-start`}>{featured.label}</span>
        <h2 className={`${ON_IMAGE_TITLE} mt-5`}>{featured.name}</h2>
        <p className="mt-2 flex items-center gap-1.5 text-sm md:text-base text-white/80"><PinIcon />{featured.place}</p>
        <p className="mt-4 text-sm md:text-lg text-white/85 leading-relaxed">{featured.text}</p>
        <ul className="mt-5 flex flex-col gap-2 text-sm md:text-base">
          {featured.details.map((d) => <li key={d} className="flex items-center gap-2"><CheckIcon />{d}</li>)}
        </ul>
        <a href="/contact" className={`mt-6 self-start bg-[#C49849] hover:bg-[#b08339] active:scale-95 transition text-white ${BUTTON} md:px-6 md:py-3`}>
          Check Availability
        </a>
      </div>
    </div>
  )
}

function Criteria() {
  return (
    <div className={SECTION_GAP}>
      <h2 className={`${SECTION_TITLE} text-center mb-10 md:mb-16`}>How We Choose Our Stays</h2>
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {criteria.map((c) => (
          <li key={c.id} className="rounded-2xl bg-white p-6 md:p-8">
            <span className="w-12 h-12 rounded-full bg-[#C49849] flex items-center justify-center text-white text-lg font-medium">{c.id}</span>
            <h3 className="mt-6 text-xl md:text-2xl font-medium text-slate-900 leading-snug">{c.title}</h3>
            <p className="mt-3 text-sm md:text-base leading-relaxed text-slate-600">{c.text}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Included() {
  return (
    <div className={`${SECTION_GAP} rounded-3xl bg-slate-900 text-white p-6 md:p-12`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 lg:gap-12">
        <h2 className={`${ON_IMAGE_TITLE} lg:max-w-[45%]`}>Peace Of Mind, Included</h2>
        <p className="text-sm md:text-lg text-white/70 leading-relaxed lg:max-w-lg">
          Book with Noziwild and enjoy extras you would not get on your own.
        </p>
      </div>
      <div className="mt-8 md:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {included.map((item) => (
          <div key={item.id} className="rounded-xl border border-white/20 bg-white/10 p-4 md:p-5 md:min-h-[160px]">
            <h3 className="text-sm md:text-lg font-medium leading-snug">{item.title}</h3>
            <p className="mt-2 md:mt-3 text-xs md:text-sm text-white/70 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Faq() {
  const [open, setOpen] = useState(1)

  return (
    <div className={`${SECTION_GAP} grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8 lg:gap-16`}>
      <div>
        <h2 className={SECTION_TITLE}>Frequently Asked Questions</h2>
        <p className={`mt-4 md:mt-6 ${SECTION_SUBTITLE}`}>Something else on your mind? Our team replies within one working day.</p>
      </div>
      <div className="flex flex-col gap-3">
        {faqs.map((f) => {
          const isOpen = open === f.id
          return (
            <div key={f.id} className="rounded-2xl bg-white">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : f.id)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 text-left p-5 md:p-6"
              >
                <span className="text-base md:text-xl font-medium text-slate-900">{f.q}</span>
                <PlusIcon open={isOpen} />
              </button>
              {isOpen && <p className="px-5 md:px-6 pb-5 md:pb-6 -mt-1 text-sm md:text-base leading-relaxed text-slate-600">{f.a}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Cta() {
  return (
    <div className={`${SECTION_GAP} relative overflow-hidden rounded-3xl min-h-[380px] md:min-h-[460px] flex`}>
      <img src={Ramena} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
      <div className="relative flex flex-col justify-end p-6 md:p-12 max-w-2xl">
        <h2 className={ON_IMAGE_TITLE}>Not Sure Where To Stay?</h2>
        <p className="mt-4 text-sm md:text-lg text-white/85 leading-relaxed">
          Tell us your dates, budget and travel style. We will suggest the stays that fit.
        </p>
        <a
          href="/contact"
          className="mt-6 md:mt-8 self-start inline-flex items-center gap-3 rounded-full bg-white hover:bg-white/90 transition text-slate-900 pl-6 pr-2.5 py-2.5 font-medium"
        >
          Get A Free Suggestion
          <span className="w-10 h-10 rounded-full bg-[#C49849] flex items-center justify-center text-white"><ArrowIcon /></span>
        </a>
      </div>
    </div>
  )
}

function Accommodation() {
  return (
    <>
    <section className="w-full pt-0 pb-12 md:pb-20 bg-[#D5E8E2] flex flex-col items-center">
      <Navbar />
      <Hero />
      <div className={`${SECTION_WIDTH} ${SECTION_GAP}`}>
        <Intro />
        <Stays />
        <Featured />
        <Criteria />
        <Included />
        <Faq />
        <Cta />
      </div>
    </section>
    <Footer />
    </>
  )
}

export default Accommodation