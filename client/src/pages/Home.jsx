import React, { useEffect, useRef, useState } from 'react'
import Ramena from '../assets/images/Ramena.png'
import NosyIranja from '../assets/images/NosyIranja.png'
import NosyLonjo from '../assets/images/NosyLonjo.png'
import Ambanja from '../assets/images/Ambanja.png'
import Deux from '../assets/images/2.jpg'
import Tana from '../assets/images/Tana.png'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { destinations } from './destinationsData'

/* Constantes partagées par toutes les sections */
const W = 'w-[90vw] lg:max-w-[95vw]'
const H2 = 'text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium leading-[1.1] tracking-tight text-slate-900'
const BTN = 'inline-flex items-center justify-center text-sm md:text-base font-medium px-6 py-3 rounded-full active:scale-95 transition'

/* ================= Apparition en fondu au défilement ================= */

// Fait apparaître le contenu en fondu quand il entre à l'écran
function Reveal({ children, className = '' }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); io.disconnect() }
    }, { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition duration-700 ease-out motion-reduce:transition-none ${
        shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 motion-reduce:opacity-100 motion-reduce:translate-y-0'
      } ${className}`}
    >
      {children}
    </div>
  )
}

/* ================= Barre d'informations au-dessus de la Navbar ================= */

// Barre d'informations au-dessus de la Navbar
function TopBar() {
  return (
    <div className="w-full bg-[#D5E8E2] flex justify-center pt-4">
      <div className={`${W} flex flex-wrap items-center justify-between gap-x-8 gap-y-1 rounded-3xl sm:rounded-full bg-[#084838] text-white px-5 md:px-8 py-3 text-xs md:text-sm`}>
        <span>Antananarivo, Madagascar</span>
        <span className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <a href="mailto:info@noziwild.com" className="hover:underline">info@noziwild.com</a>
          <span className="hidden sm:block w-px h-4 bg-white/40" aria-hidden="true" />
          <a href="tel:+261340000000" className="hover:underline">+261 34 00 000 00</a>
        </span>
      </div>
    </div>
  )
}

/* ================= Hero : panneau vert + photo, barre de demande de devis ================= */

const GREEN = 'bg-[#084838]'
const BUTTON = 'text-sm md:text-base font-medium px-6 py-3 rounded-full active:scale-95 transition'
const LABEL = 'block mb-1.5 text-xs md:text-sm text-white/70'
const CONTROL =
  'w-full bg-transparent text-sm md:text-base text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C49849] rounded [color-scheme:dark]'
const OPTION = 'text-slate-900'

const locations = ['Nosy Be', 'Nosy Iranja', 'Ramena', 'Antananarivo', 'Ambanja', 'Not sure yet']
const activities = ['Sea & Islands', 'Wildlife & Nature', 'Culture & Cities', 'Adventure & Treks', 'Food & Markets']

const Icon = ({ children }) => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

const socials = [
  { id: 1, label: 'Facebook', href: '#', icon: <Icon><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></Icon> },
  { id: 2, label: 'Instagram', href: '#', icon: <Icon><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></Icon> },
  { id: 3, label: 'YouTube', href: '#', icon: <Icon><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></Icon> },
]

/* Les attributs data-* sont ceux utilisés par les animations GSAP de Home.jsx */
function Hero() {
  return (
    <section data-hero-section className="relative overflow-hidden rounded-[2rem] grid grid-cols-1 lg:grid-cols-2 lg:min-h-[780px]">
      {/* Panneau vert */}
      <div className={`${GREEN} text-white flex flex-col justify-between gap-12 px-6 py-10 sm:px-10 md:px-14 md:py-16`}>
        <div className="my-auto">
          <p data-hero className="text-xs md:text-sm uppercase tracking-[0.2em] text-[#E6C58A]">Your journey begins here</p>
          <h1 className="mt-5 text-4xl sm:text-5xl xl:text-7xl font-bold uppercase leading-[1.05] tracking-tight">
            {['Madagascar Journeys', 'Crafted For You'].map((line) => (
              <span key={line} className="block overflow-hidden pb-1"><span data-line className="block">{line}</span></span>
            ))}
          </h1>
          <p data-hero className="mt-6 max-w-xl text-sm md:text-lg text-white/85 leading-relaxed">
            Private trips built around you, with local guides, handpicked stays and a free quote within one working day.
          </p>

          {/* Barre de demande : envoie les choix vers la page contact */}
          <form
            data-hero action="/contact" method="get"
            className="mt-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end rounded-3xl border border-white/15 bg-white/10 backdrop-blur-sm p-4 md:p-5"
          >
            <input type="hidden" name="type" value="quote" />
            <div>
              <label htmlFor="hero-location" className={LABEL}>Location</label>
              <select id="hero-location" name="destination" defaultValue="" className={CONTROL}>
                <option value="" disabled className={OPTION}>Where to next?</option>
                {locations.map((l) => <option key={l} value={l} className={OPTION}>{l}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="hero-activity" className={LABEL}>Activities</label>
              <select id="hero-activity" name="activity" defaultValue="" className={CONTROL}>
                <option value="" disabled className={OPTION}>Select activities</option>
                {activities.map((a) => <option key={a} value={a} className={OPTION}>{a}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="hero-date" className={LABEL}>Travel date</label>
              <input id="hero-date" name="date" type="date" className={CONTROL} />
            </div>
            <span data-magnetic className="inline-block sm:col-span-2 xl:col-span-1">
              <button type="submit" className={`w-full bg-[#C49849] hover:bg-[#b08339] text-white ${BUTTON}`}>Get My Quote</button>
            </span>
          </form>
        </div>

        <div data-hero className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm md:text-base">
          <span className="text-white/85">Free quote, no obligation</span>
          <ul className="flex items-center gap-4">
            {socials.map((s) => (
              <li key={s.id}>
                <a href={s.href} aria-label={s.label} className="block text-white/80 hover:text-white transition">{s.icon}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Photo */}
      <div className="relative min-h-[380px] lg:min-h-full overflow-hidden bg-[#084838]">
        <img data-kb src={NosyIranja} alt="Turquoise water and a white sandbank" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-5 right-5 md:bottom-8 md:right-8 flex items-center gap-4 text-white">
          <img src={Ambanja} alt="" className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover border-4 border-white/80" />
          <p className="text-base md:text-xl font-medium leading-snug">Handcrafted<br />Journeys</p>
        </div>
      </div>
    </section>
  )
}

/* ================= Every Way To Discover Madagascar ================= */

/* Adaptez les liens à vos routes */
const offers = [
  { title: 'Circuits', text: 'Ready-made routes across the island.', image: Tana, href: '/circuits', cls: 'lg:col-span-2 lg:row-span-2' },
  { title: 'Excursions', text: 'Day trips and short escapes.', image: Ramena, href: '/excursions', cls: '' },
  { title: 'Long stay', text: 'Live the island for weeks.', image: Deux, href: '/long-stay', cls: '' },
  { title: 'Tailor-made stays', text: 'Designed around your wishes.', image: Ambanja, href: '/tailor-made', cls: 'lg:col-span-2' },
  { title: 'Cruise excursions', text: 'Timed around your ship.', image: NosyLonjo, href: '/cruise-excursions', cls: 'lg:col-span-2' },
  { title: 'Destinations', text: 'Explore all five regions.', image: NosyIranja, href: '/destinations', cls: 'lg:col-span-2' },
]

function Offers() {
  return (
    <section className="w-full bg-[#D5E8E2] flex flex-col items-center py-16 md:py-28">
      <div className={W}>
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2 className={`${H2} max-w-2xl`}>Every Way To Discover Madagascar</h2>
            <p className="text-base md:text-lg text-slate-700 max-w-sm">From a single excursion to a month on the island.</p>
          </div>
        </Reveal>

        <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[220px] md:auto-rows-[250px] gap-4 md:gap-5">
          {offers.map((o) => (
            <li key={o.title} className={o.cls}>
              <a href={o.href} className="group relative block h-full overflow-hidden rounded-[1.5rem] md:rounded-[2rem] text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-800">
                <img src={o.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-7 flex items-end justify-between gap-3">
                  <div>
                    <h3 className="text-xl md:text-3xl font-medium">{o.title}</h3>
                    <p className="mt-1 text-sm text-white/80">{o.text}</p>
                  </div>
                  <span aria-hidden="true" className="shrink-0 w-10 h-10 rounded-full bg-white/90 text-slate-900 flex items-center justify-center transition group-hover:bg-[#C49849] group-hover:text-white">→</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ================= Places You Will Not Forget ================= */

// destinations : tableau d'objets { slug, name, region, image } (voir destinationsData.js)
function FeaturedDestinations({ destinations = [], limit = 6 }) {
  const items = destinations.slice(0, limit)

  return (
    <section className="w-full bg-[#D5E8E2] flex flex-col items-center pb-16 md:pb-28">
      <div className={`${W} grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-10 lg:gap-20`}>
        <Reveal className="lg:sticky lg:top-6 self-start">
          <p className="text-sm md:text-base text-slate-700 mb-3">Featured destinations</p>
          <h2 className={H2}>Places You Will Not Forget</h2>
          <p className="mt-4 text-base md:text-lg text-slate-700 max-w-md leading-relaxed">Bays, baobabs, rainforest and royal hills. Start with these, then explore the full map.</p>
          <a href="/destinations" className={`${BTN} bg-slate-800 hover:bg-slate-700 text-white mt-8`}>All destinations</a>
        </Reveal>

        <ul className="grid grid-cols-2 gap-4 md:gap-6">
          {items.map((d, n) => (
            <li key={d.slug} className={n % 2 === 1 ? 'mt-8 md:mt-14' : ''}>
              <a href={`/destinations/${d.slug}`} className="group relative block aspect-[3/4] overflow-hidden rounded-[1.5rem] md:rounded-[2rem] text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-800">
                <img src={d.image} alt={d.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
                  <p className="text-xs text-white/75">{d.region}</p>
                  <h3 className="text-lg md:text-2xl font-medium">{d.name}</h3>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ================= Chiffres, Explore, Trips, Why us, Testimonials, appel à devis ================= */

const GAP = 'mt-20 md:mt-32'
const EYEBROW = 'mb-3 text-xs sm:text-sm uppercase tracking-[0.2em] text-slate-700'
const GOLD = 'bg-[#C49849] hover:bg-[#b08339] text-white'
const quoteHref = (k, v) => `/contact?type=quote&${k}=${encodeURIComponent(v)}`

const Arrow = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)
const Star = () => (
  <svg className="w-4 h-4 text-[#F5B800] fill-current" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
)

/* ---------------------------- Données ---------------------------- */

const stats = [
  { value: '12+', label: 'years of local expertise' },
  { value: '300+', label: 'happy travelers' },
  { value: '40+', label: 'local partners' },
  { value: '4.9/5', label: 'average rating' },
]

const themes = [
  { name: 'Sea & Islands', image: NosyIranja, text: 'Sandbanks, catamarans and water so clear you can count the fish.', spots: ['Nosy Iranja', 'Nosy Be', 'Ramena'] },
  { name: 'Wildlife & Nature', image: Tana, text: 'Lemurs at sunrise, night walks and forests found nowhere else on Earth.', spots: ['Andasibe', 'Lokobe', 'Ankarana'] },
  { name: 'Culture & Cities', image: Ambanja, text: 'Markets, royal hills and workshops, guided by people who live there.', spots: ['Antananarivo', 'Ambanja', 'Diego Suarez'] },
  { name: 'Adventure & Treks', image: Deux, text: 'Canyons, baobab roads and coastal trails for the ones who want more.', spots: ['Isalo', 'Baobab avenue', 'Tsingy'] },
  { name: 'Food & Markets', image: Ramena, text: 'Street stalls, family tables and fresh seafood on the beach.', spots: ['Street food walk', 'Cooking class', 'Spice farm'] },
]

const trips = [
  { name: 'Highlands & Coast', days: 7, image: Tana, text: 'From lemur forests to a quiet bay, a slow week that mixes culture, nature and the sea.', tags: ['Andasibe forest', 'Village stays', 'Ramena sunsets'], months: ['Oct', 'Nov', 'Dec'] },
  { name: 'Island Escape', days: 5, image: NosyIranja, text: 'White sand, turquoise water and days that end on a boat.' },
  { name: 'Wild North', days: 10, image: Deux, text: 'Baobabs, canyons and empty beaches, for the ones who want more.' },
]

const promises = [
  { title: 'Local first', text: 'Local guides, family-run stays and small restaurants. Your trip supports the people who make the place special.' },
  { title: 'Slow by design', text: 'Fewer stops, more time. We leave room for a long lunch, a detour or a swim you did not plan.' },
  { title: 'Honest quotes', text: 'One clear quote with everything in it. No hidden fees, no surprises at the end.' },
  { title: 'Always reachable', text: 'A real person before, during and after your trip. Message us at any hour and we answer.' },
]

const quotes = [
  { text: 'They planned every detail, yet the trip never felt planned. It felt like we were visiting friends.', name: 'Emma & Tom', origin: 'Lyon' },
  { text: 'Our guide showed us a side of the island we never expected. The food, the people, the little workshops.', name: 'Giulia R.', origin: 'Milan' },
  { text: 'When our flight was cancelled, they had a new plan before we finished our coffee. Impressive.', name: 'Markus B.', origin: 'Munich' },
  { text: 'Having one person to call for everything made our family trip stress-free. The kids still talk about it.', name: 'Sophie L.', origin: 'Montréal' },
]

/* -------------------------- Composants --------------------------- */

function Stats() {
  return (
    <ul className={`${W} mt-10 md:mt-14 grid grid-cols-2 md:grid-cols-4 gap-6`}>
      {stats.map((s) => (
        <li key={s.label} className="border-t border-[#084838]/25 pt-4">
          <p className="text-4xl md:text-6xl font-medium leading-none text-[#084838]">{s.value}</p>
          <p className="mt-2 text-sm md:text-base text-slate-700">{s.label}</p>
        </li>
      ))}
    </ul>
  )
}

/* Panneaux qui s'ouvrent : un par univers de voyage */
function Themes() {
  const [active, setActive] = useState(0)
  const desktop = () => window.matchMedia('(min-width: 1024px)').matches

  return (
    <section className={`${W} ${GAP}`}>
      <Reveal>
        <p className={EYEBROW}>Explore</p>
        <h2 className={`${H2} max-w-3xl`}>Find The Island That Fits You</h2>
      </Reveal>
      <div className="mt-10 flex flex-col lg:flex-row gap-3 lg:h-[560px]" role="tablist" aria-label="Ways to explore">
        {themes.map((t, i) => {
          const on = i === active
          return (
            <button key={t.name} type="button" role="tab" aria-selected={on} onClick={() => setActive(i)} onMouseEnter={() => desktop() && setActive(i)}
              className={`group relative overflow-hidden rounded-3xl text-left text-white transition-all duration-700 ease-in-out motion-reduce:transition-none ${on ? 'h-[440px] lg:h-auto lg:flex-[4]' : 'h-[84px] lg:h-auto lg:flex-1'}`}>
              <img src={t.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              <span className={`absolute inset-0 ${on ? 'bg-gradient-to-t from-black/80 via-black/20 to-transparent' : 'bg-[#084838]/60'}`} />
              <span className={`absolute left-5 top-1/2 -translate-y-1/2 text-lg font-medium lg:hidden ${on ? 'opacity-0' : ''}`}>{t.name}</span>
              <span className={`absolute inset-x-0 bottom-6 hidden lg:flex justify-center ${on ? 'opacity-0' : ''}`}>
                <span className="[writing-mode:vertical-rl] rotate-180 text-xl font-medium">{t.name}</span>
              </span>
              <span className={`absolute inset-x-0 bottom-0 block p-5 md:p-8 transition-all duration-500 ${on ? 'opacity-100 translate-y-0 delay-300' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <span className="flex flex-wrap gap-2">{t.spots.map((s) => <span key={s} className="rounded-full border border-white/40 bg-white/10 backdrop-blur-sm px-3 py-1 text-xs md:text-sm">{s}</span>)}</span>
                <span className="mt-4 block text-3xl md:text-5xl font-medium tracking-tight">{t.name}</span>
                <span className="mt-3 block max-w-lg text-sm md:text-lg text-white/85">{t.text}</span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

/* Circuits phares : une grande carte, deux petites. Devis uniquement. */
function Trips() {
  const [big, ...rest] = trips
  const card = 'group relative overflow-hidden rounded-3xl bg-[#084838] text-white flex focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-800'
  const shade = 'absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent'
  const img = 'absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105'

  return (
    <section className={`${W} ${GAP}`}>
      <Reveal>
        <p className={EYEBROW}>Signature trips</p>
        <h2 className={`${H2} max-w-3xl`}>Trips We Love To Send You On</h2>
        <p className="mt-4 text-base md:text-lg text-slate-600 max-w-2xl">Ready-made starting points. We adapt every one to your dates, pace and budget, and send you a free quote.</p>
      </Reveal>
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-4 md:gap-6">
        <a href={quoteHref('trip', big.name)} className={`${card} min-h-[480px] lg:min-h-[640px] lg:row-span-2`}>
          <img src={big.image} alt={big.name} className={img} /><span className={shade} />
          <span className="relative flex w-full flex-col justify-end p-6 md:p-10">
            <span className="self-start bg-[#C49849] text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm">{big.days} days</span>
            <span className="mt-4 block text-3xl md:text-5xl font-medium tracking-tight">{big.name}</span>
            <span className="mt-3 block max-w-md text-sm md:text-base text-white/85">{big.text}</span>
            <span className="mt-4 flex flex-wrap gap-2">{big.tags.map((h) => <span key={h} className="rounded-full border border-white/40 bg-white/10 backdrop-blur-sm px-3 py-1 text-xs md:text-sm">{h}</span>)}</span>
            <span className="mt-5 flex flex-wrap items-center gap-2 text-sm text-white/80">Best months: {big.months.map((m) => <span key={m} className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-900">{m}</span>)}</span>
            <span className="mt-6 flex items-center justify-between border-t border-white/25 pt-5">
              <span className="text-white/85">Free quote, no obligation</span>
              <span className="w-11 h-11 rounded-full bg-[#C49849] flex items-center justify-center transition group-hover:translate-x-1"><Arrow /></span>
            </span>
          </span>
        </a>
        {rest.map((t) => (
          <a key={t.name} href={quoteHref('trip', t.name)} className={`${card} min-h-[310px]`}>
            <img src={t.image} alt={t.name} className={img} /><span className={shade} />
            <span className="relative flex w-full flex-col justify-end p-5 md:p-8">
              <span className="text-sm text-white/80">{t.days} days · Free quote</span>
              <span className="mt-1 block text-2xl md:text-3xl font-medium tracking-tight">{t.name}</span>
              <span className="mt-2 block text-sm text-white/80">{t.text}</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}

const whyIcons = [
  ['M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z', 'M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3 2'],
  ['M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z', 'M14 3v5h5', 'm9 14 2 2 4-4'],
  ['M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z'],
]

/* Grande photo, quatre cartes qui la chevauchent */
function WhyUs() {
  return (
    <section className={`${W} ${GAP}`}>
      <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] min-h-[460px] md:min-h-[540px]">
        <img src={Tana} alt="Highland landscape near Antananarivo" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#084838]/85 via-[#084838]/50 to-[#084838]/30" />
        <Reveal className="relative p-6 sm:p-10 md:p-16 max-w-3xl text-white">
          <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-[#E6C58A]">Why Noziwild</p>
          <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-medium leading-[1.05] tracking-tight">Travel With People Who Know The Island</h2>
        </Reveal>
      </div>

      <ul className="relative z-10 -mt-24 md:-mt-28 px-3 md:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {promises.map((p, i) => (
          <li key={p.title} className="rounded-3xl bg-white p-6 md:p-8 shadow-xl shadow-[#084838]/10">
            <span className="w-12 h-12 rounded-full bg-[#084838] text-[#E6C58A] flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {whyIcons[i].map((d) => <path key={d} d={d} />)}
              </svg>
            </span>
            <h3 className="mt-5 text-xl md:text-2xl font-medium tracking-tight text-slate-900">{p.title}</h3>
            <p className="mt-3 text-sm md:text-base text-slate-600 leading-relaxed">{p.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* Note globale + quatre avis en cartes */
function Testimonials() {
  const initials = (name) => name.split(/[\s&.]+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('')

  return (
    <section className={`${W} ${GAP} grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-5 md:gap-6`}>
      <div className="rounded-[2rem] bg-[#084838] text-white p-8 md:p-10 flex flex-col justify-between gap-12">
        <div>
          <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-[#E6C58A]">Kind words</p>
          <h2 className="mt-4 text-4xl md:text-5xl font-medium leading-[1.05] tracking-tight">Loved By Travelers</h2>
        </div>
        <div>
          <p className="text-7xl md:text-8xl font-medium leading-none">4.9<span className="text-3xl text-white/60">/5</span></p>
          <div className="mt-4 flex gap-0.5" aria-label="4.9 out of 5 stars">{[0, 1, 2, 3, 4].map((n) => <Star key={n} />)}</div>
          <p className="mt-3 text-sm md:text-base text-white/75">Average rating from 300+ travelers</p>
        </div>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        {quotes.map((q) => (
          <li key={q.name}>
            <figure className="flex h-full flex-col rounded-[2rem] bg-white p-6 md:p-8">
              <div className="flex gap-0.5" aria-hidden="true">{[0, 1, 2, 3, 4].map((n) => <Star key={n} />)}</div>
              <blockquote className="mt-4 text-base md:text-lg text-slate-700 leading-relaxed">“{q.text}”</blockquote>
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

/* ================= Appel à devis ================= */

function QuoteCta() {
  const [sent, setSent] = useState(false)
  const input = 'w-full rounded-full border border-slate-300 bg-white px-5 py-3 text-sm md:text-base text-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700 transition'

  const submit = (e) => {
    e.preventDefault()
    // TODO : envoyer les données à votre API ou service d'emails (EmailJS, Formspree...)
    console.log('Quote request:', Object.fromEntries(new FormData(e.currentTarget)))
    setSent(true)
    e.currentTarget.reset()
  }

  return (
    <section className={`${W} ${GAP} relative overflow-hidden rounded-[2rem] text-white`}>
      <img src={Ramena} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#084838]/95 via-[#084838]/75 to-black/40" />
      <div className="relative grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16 items-center px-6 py-14 md:px-16 md:py-24">
        <div>
          <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-[#E6C58A]">Ready when you are</p>
          <h2 className="mt-5 text-4xl sm:text-5xl md:text-7xl font-medium leading-[1.05] tracking-tight">Your Island Story Starts Here</h2>
          <p className="mt-6 max-w-lg text-sm md:text-lg text-white/85">Tell us a little about your dream trip. A real planner answers within one working day, with a first idea and a free quote.</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href="/contact" className={`${BTN} ${GOLD}`}>Talk To A Planner</a>
            <a href="tel:+261340000000" className={`${BTN} border border-white/50 hover:bg-white/10`}>+261 34 00 000 00</a>
          </div>
        </div>
        <form onSubmit={submit} className="rounded-3xl bg-white p-5 md:p-8 text-slate-800">
          <h3 className="text-xl md:text-2xl font-medium text-slate-900">Get your free quote</h3>
          <div className="mt-5 flex flex-col gap-3">
            <label htmlFor="q-name" className="sr-only">Your name</label>
            <input id="q-name" name="name" required autoComplete="name" placeholder="Your name" className={input} />
            <label htmlFor="q-email" className="sr-only">Your email</label>
            <input id="q-email" name="email" type="email" required autoComplete="email" placeholder="Your email" className={input} />
            <label htmlFor="q-when" className="sr-only">When and how long</label>
            <input id="q-when" name="when" placeholder="When and for how long?" className={input} />
            <button type="submit" className={`${BTN} bg-[#084838] hover:bg-[#0a5c47] text-white`}>Request My Quote</button>
          </div>
          {sent && <p role="status" className="mt-4 text-sm md:text-base text-emerald-700">Thank you! A planner will send your quote soon.</p>}
        </form>
      </div>
    </section>
  )
}

/* ================= Page ================= */

function Home() {
  return (
    <>
      
      <main className="w-full bg-[#D5E8E2] pb-16 md:pb-24 flex flex-col items-center">
        <Navbar />
        <div className="w-[90vw] lg:max-w-[95vw] mt-4 md:mt-4">
          <Hero />
        </div>

        <Stats />
        <Offers />
        <FeaturedDestinations destinations={Object.values(destinations)} />
        <Themes />
        <Trips />
        <WhyUs />
        <Testimonials />
        <QuoteCta />
      </main>
      <Footer />
    </>
  )
}

export default Home