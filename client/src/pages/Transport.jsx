import React, { useState } from 'react'
import Deux from "../assets/images/2.jpg";
import Ambanja from "../assets/images/Ambanja.png";
import NosyLonjo from "../assets/images/NosyLonjo.png";
import NosyIranja from "../assets/images/NosyIranja.png";
import Ramena from "../assets/images/Ramena.png";
import Tana from "../assets/images/Tana.png";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/* Constantes partagées : mêmes valeurs que dans About, Explore, Choose, Trips et Blog */
const SECTION_WIDTH = "w-[90vw] lg:max-w-[90vw] xl:max-w-[95vw]"
const SECTION_TITLE = "text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-slate-900 leading-[1.15] tracking-tight"
const SECTION_SUBTITLE = "text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl"
const META_TEXT = "text-xs sm:text-sm"
const STATEMENT_TITLE = "text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-medium uppercase leading-[1.15] tracking-tight text-slate-900"
const ON_IMAGE_TITLE = "text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-white leading-[1.15] tracking-tight"
const SECTION_GAP = "mt-[50px] md:mt-[100px]"
const GOLD = "bg-[#C49849]"

/* ---------------------------- Données ---------------------------- */

const hero = {
  title: 'Getting There Is Part of the Journey',
  text: 'Private 4x4s, shared shuttles, domestic flights, boats and trains: we choose the right way to move between every stop, and we book it all for you.',
  ctaLabel: 'Plan My Transfers',
  ctaHref: '#contact',
  label: 'Our Fleet',
  cardTitle: 'Every Transfer, Handled',
  image: Deux, // à remplacer par ta photo
  imageAlt: 'A 4x4 driving along a scenic road',
  stats: [
    { id: 1, value: '6', label: 'Ways to Travel' },
    { id: 2, value: '24/7', label: 'Assistance on Trip' },
    { id: 3, value: '100%', label: 'Licensed Drivers' },
  ],
}

// category : 'land' | 'air' | 'sea'
const categories = [
  { id: 'all', label: 'All' },
  { id: 'land', label: 'Land' },
  { id: 'air', label: 'Air' },
  { id: 'sea', label: 'Sea' },
]

const transports = [
  {
    id: 1, category: 'land', name: 'Private 4x4',
    image: Tana, capacity: '1–6 travelers', duration: 'Flexible',
    text: 'Your own vehicle and driver-guide. Stop wherever you like, at your own pace.',
    perks: ['Door-to-door pickup', 'Air conditioning', 'English-speaking driver'],
  },
  {
    id: 2, category: 'land', name: 'Shared Minibus',
    image: Ambanja, capacity: '8–15 travelers', duration: 'Fixed schedule',
    text: 'A comfortable and affordable option on the main routes, ideal for solo travelers and groups.',
    perks: ['Reserved seats', 'Luggage included', 'Best price'],
  },
  {
    id: 3, category: 'air', name: 'Domestic Flight',
    image: NosyLonjo, capacity: '1 seat or more', duration: '1–2 h',
    text: 'Skip long road days. We book the seats and organize the airport transfers on both ends.',
    perks: ['Ticket booking', 'Airport transfers', 'Flexible dates'],
  },
  {
    id: 4, category: 'sea', name: 'Speedboat',
    image: NosyIranja, capacity: '2–10 travelers', duration: '30 min – 2 h',
    text: 'Fast and fun crossings to nearby islands, with life jackets and a skilled captain.',
    perks: ['Safety equipment', 'Island hopping', 'Private or shared'],
  },
  {
    id: 5, category: 'sea', name: 'Sailing Boat',
    image: Ramena, capacity: '2–8 travelers', duration: 'Half or full day',
    text: 'A slower, scenic way to reach hidden beaches, with snorkeling stops and a picnic on board.',
    perks: ['Snorkeling gear', 'Lunch on board', 'Sunset option'],
  },
  {
    id: 6, category: 'land', name: 'Scenic Train',
    image: Deux, capacity: 'Per seat', duration: 'Half or full day',
    text: 'Watch villages and landscapes roll by on a slow ride you will not forget.',
    perks: ['Window seats', 'Station transfers', 'Local snacks'],
  },
]

const steps = [
  { id: 1, title: 'Tell Us Your Plan', text: 'Share your dates, destinations and group size. Not sure yet? We suggest a route.' },
  { id: 2, title: 'We Pick the Best Mix', text: 'Our team combines road, air and sea so the trip stays smooth, safe and well paced.' },
  { id: 3, title: 'Confirm & Pay Online', text: 'You receive a clear quote with everything included, and confirm in a few clicks.' },
  { id: 4, title: 'Travel With Support', text: 'Meet your driver or captain on the day. Our team is one call away the whole time.' },
]

const included = [
  { id: 1, title: 'Trained Drivers', text: 'Experienced, licensed and familiar with every road.' },
  { id: 2, title: 'Insured Vehicles', text: 'Regularly serviced vehicles with full insurance.' },
  { id: 3, title: 'Fair, Fixed Prices', text: 'No surprises: fuel, tolls and fees are in the quote.' },
  { id: 4, title: '24/7 Support', text: 'A real person to help if your plans change.' },
]

const faqs = [
  { id: 1, q: 'Can I choose my own transport?', a: 'Yes. Tell us what you prefer and we adapt the plan. If you have no preference, we recommend the best option for each leg.' },
  { id: 2, q: 'Are meals and fuel included?', a: 'Fuel, driver and tolls are always included in the quote. Meals are only included when the trip description says so.' },
  { id: 3, q: 'How much luggage can I bring?', a: 'One suitcase and one small bag per person is the standard. Domestic flights have stricter weight limits, and we tell you the exact allowance when you book.' },
  { id: 4, q: 'Is it safe to travel by road?', a: 'Our drivers are selected and trained by us, and we avoid night driving on difficult routes. We adapt schedules to road and weather conditions.' },
  { id: 5, q: 'Can I change or cancel a booking?', a: 'You can change dates free of charge up to 7 days before departure, subject to availability. Cancellation terms depend on the service and are shown in your quote.' },
  { id: 6, q: 'Do you offer airport pickup?', a: 'Yes. A driver waits for you at arrivals with a sign, even if your flight is delayed.' },
]

const cta = {
  title: 'Ready to Hit the Road?',
  text: 'Tell us where you want to go and we will handle the rest.',
  label: 'Get a Free Quote',
  href: '#contact',
  image: Tana,
}

/* ---------------------------- Icônes ----------------------------- */

const Svg = ({ children, className = "w-5 h-5 md:w-6 md:h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

const UsersIcon = () => (
  <Svg className="w-4 h-4">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
)

const ClockIcon = () => (
  <Svg className="w-4 h-4">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </Svg>
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

function TransportCard({ item }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white">
      <div className="aspect-[16/10] overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
      </div>
      <div className="flex flex-col flex-1 p-5 md:p-6">
        <h3 className="text-xl md:text-2xl font-medium text-slate-900">{item.name}</h3>
        <div className={`mt-3 flex flex-wrap gap-x-5 gap-y-1 ${META_TEXT} text-slate-600`}>
          <span className="flex items-center gap-1.5"><UsersIcon />{item.capacity}</span>
          <span className="flex items-center gap-1.5"><ClockIcon />{item.duration}</span>
        </div>
        <p className="mt-4 text-sm md:text-base leading-relaxed text-slate-600">{item.text}</p>
        <ul className="mt-5 flex flex-col gap-2 text-sm text-slate-700">
          {item.perks.map((perk) => (
            <li key={perk} className="flex items-center gap-2"><CheckIcon />{perk}</li>
          ))}
        </ul>
        <a
          href="#contact"
          className="mt-6 pt-5 border-t border-slate-900/10 inline-flex items-center gap-2 text-sm md:text-base font-medium text-slate-800 hover:gap-3 transition-all"
        >
          Ask for this option <ArrowIcon />
        </a>
      </div>
    </article>
  )
}

function TransportTypes() {
  const [category, setCategory] = useState('all')
  const list = category === 'all' ? transports : transports.filter((t) => t.category === category)

  return (
    <div className={SECTION_GAP}>
      <div className="mb-8 md:mb-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 lg:gap-12">
        <h2 className={`${SECTION_TITLE} lg:max-w-[52%]`}>Choose How You Travel</h2>
        <p className={`hidden md:block ${SECTION_SUBTITLE} lg:max-w-lg`}>
          Each option has its own pace and charm. Mix them freely across your trip.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2 md:gap-3" role="tablist" aria-label="Transport categories">
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {list.map((item) => <TransportCard key={item.id} item={item} />)}
      </div>
    </div>
  )
}

function HowItWorks() {
  return (
    <div className={SECTION_GAP}>
      <h2 className={`${SECTION_TITLE} text-center mb-10 md:mb-16`}>How It Works</h2>
      <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {steps.map((step) => (
          <li key={step.id} className="rounded-2xl bg-white p-6 md:p-7">
            <span className={`w-12 h-12 rounded-full ${GOLD} flex items-center justify-center text-white text-lg font-medium`}>
              {step.id}
            </span>
            <h3 className="mt-6 text-xl md:text-2xl font-medium text-slate-900 leading-snug">{step.title}</h3>
            <p className="mt-3 text-sm md:text-base leading-relaxed text-slate-600">{step.text}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Included() {
  return (
    <div className={`${SECTION_GAP} rounded-3xl bg-slate-900 text-white p-6 md:p-12`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 lg:gap-12">
        <h2 className={`${ON_IMAGE_TITLE} lg:max-w-[45%]`}>Included in Every Transfer</h2>
        <p className="text-sm md:text-lg text-white/70 leading-relaxed lg:max-w-lg">
          Comfort and safety are not options. They come with every vehicle, boat and seat we book.
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
        <p className={`mt-4 md:mt-6 ${SECTION_SUBTITLE}`}>
          Can&apos;t find your answer? Our team replies within a few hours.
        </p>
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
              {isOpen && (
                <p className="px-5 md:px-6 pb-5 md:pb-6 -mt-1 text-sm md:text-base leading-relaxed text-slate-600">{f.a}</p>
              )}
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
      <img src={cta.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
      <div className="relative flex flex-col justify-end p-6 md:p-12 max-w-2xl">
        <h2 className={ON_IMAGE_TITLE}>{cta.title}</h2>
        <p className="mt-4 text-sm md:text-lg text-white/85 leading-relaxed">{cta.text}</p>
        <a
          href={cta.href}
          className="mt-6 md:mt-8 self-start inline-flex items-center gap-3 rounded-full bg-white hover:bg-white/90 transition text-slate-900 pl-6 pr-2.5 py-2.5 font-medium"
        >
          {cta.label}
          <span className={`w-10 h-10 rounded-full ${GOLD} flex items-center justify-center text-white`}><ArrowIcon /></span>
        </a>
      </div>
    </div>
  )
}

function Transport() {
  return (
    <>
    <section className="w-full pt-0 pb-12 bg-[#D5E8E2] flex flex-col items-center">
      <Navbar />
      <div className={`${SECTION_WIDTH} mt-8 md:mt-12`}>

        {/* Titre + texte + bouton */}
        <h1 className={`${STATEMENT_TITLE} max-w-5xl`}>{hero.title}</h1>
        <div className="mt-8 md:mt-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-12">
          <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl">{hero.text}</p>
          <a
            href={hero.ctaHref}
            className="inline-flex items-center gap-5 self-start rounded-full bg-slate-800 hover:bg-slate-700 transition text-white pl-6 pr-2.5 py-2.5 md:pl-7 md:py-3"
          >
            <span className="text-lg md:text-xl font-medium">{hero.ctaLabel}</span>
            <span className={`w-11 h-11 md:w-14 md:h-14 rounded-full ${GOLD} flex items-center justify-center text-white`}><ArrowIcon /></span>
          </a>
        </div>

        {/* Grande carte avec chiffres */}
        <div className="relative mt-10 md:mt-16 overflow-hidden rounded-3xl bg-slate-900 text-white min-h-[480px] md:min-h-[560px]">
          <img src={hero.image} alt={hero.imageAlt} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-black/80" />
          <div className="relative min-h-[inherit] flex flex-col p-5 md:p-8">
            <p className="flex items-center gap-2 text-lg md:text-xl font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-white" aria-hidden="true" />
              {hero.label}
            </p>
            <div className="mt-auto pt-24">
              <h2 className={`${ON_IMAGE_TITLE} text-left md:text-center`}>{hero.cardTitle}</h2>
              <div className="mt-6 md:mt-10 grid grid-cols-3 gap-3 md:gap-5">
                {hero.stats.map((s) => (
                  <div key={s.id} className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md p-4 md:p-5">
                    <p className="text-2xl md:text-5xl leading-none">{s.value}</p>
                    <p className="mt-2 md:mt-3 text-xs md:text-base text-white/80 leading-snug">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <TransportTypes />
        <HowItWorks />
        <Included />
        <Faq />
        <Cta />

      </div>
    </section>
    <Footer />
    </>
  )
}

export default Transport