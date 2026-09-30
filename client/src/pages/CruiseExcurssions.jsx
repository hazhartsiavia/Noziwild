import React, { useState } from 'react'
import Ramena from '../assets/images/Ramena.png'
import NosyIranja from '../assets/images/NosyIranja.png'
import NosyLonjo from '../assets/images/NosyLonjo.png'
import Ambanja from '../assets/images/Ambanja.png'
import Deux from '../assets/images/2.jpg'
import Tana from '../assets/images/Tana.png'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const W = 'w-[90vw] lg:max-w-[95vw]'
const GOLD = 'bg-[#C49849] hover:bg-[#a9813a]'
const BTN = 'inline-flex items-center justify-center text-sm md:text-base font-medium px-6 py-3 rounded-full active:scale-95 transition'
const H2 = 'text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight text-slate-900'

/* ---------------------------- Données ---------------------------- */
/* hours = durée totale, transferts depuis et vers le quai compris */

const ports = [
  { id: 'nosybe', name: 'Nosy Be', sub: 'Port of Hell-Ville', text: 'Islands, lemur forest and ylang-ylang country.', image: NosyIranja },
  { id: 'diego', name: 'Diego Suarez', sub: 'Antsiranana', text: 'A vast bay, red rock formations and mountain rainforest.', image: Ramena },
]

const excursions = [
  { id: 1, port: 'nosybe', title: 'Nosy Iranja By Speedboat', hours: 7, price: 110, tag: 'Sea', image: NosyLonjo, text: 'Walk the white sandbar, swim and snorkel with turtles.' },
  { id: 2, port: 'nosybe', title: 'Nosy Tanikely Snorkel', hours: 4.5, price: 70, tag: 'Sea', image: NosyIranja, text: 'Calm reef snorkelling in a marine park, with a beach stop.' },
  { id: 3, port: 'nosybe', title: 'Lokobe Forest And Hell-Ville', hours: 4, price: 65, tag: 'Nature', image: Ambanja, text: 'Look for lemurs with a guide, then browse the town market.' },
  { id: 4, port: 'nosybe', title: 'Ylang-Ylang And Mount Passot', hours: 3.5, price: 50, tag: 'Culture', image: Tana, text: 'A working distillery and a sunset-worthy viewpoint over crater lakes.' },
  { id: 5, port: 'diego', title: 'Emerald Sea And Sugar Loaf', hours: 5, price: 75, tag: 'Sea', image: Ramena, text: 'A boat across Diego Bay with swimming in shallow, bright water.' },
  { id: 6, port: 'diego', title: 'Red Tsingy And Old Town', hours: 6, price: 90, tag: 'Culture', image: Deux, text: 'Sculpted red rock formations, then a walk through Diego Suarez.' },
  { id: 7, port: 'diego', title: 'Amber Mountain Rainforest', hours: 8, price: 120, tag: 'Nature', image: Ambanja, text: 'Waterfalls, crater lakes and chameleons in a cool mountain park.' },
]

const promises = [
  { title: 'Back before all-aboard', text: 'Every timing includes transfers to and from the pier, and we plan a safety margin.' },
  { title: 'Met at the pier', text: 'Your guide waits at the gangway exit with a name sign, ready to go.' },
  { title: 'Private or small group', text: 'Choose a private vehicle for your family or a small shared group.' },
]

const timeline = [
  { time: '08:00', text: 'Ship arrives in port' },
  { time: '08:30', text: 'Meet your guide at the pier' },
  { time: '09:00', text: 'Excursion begins' },
  { time: '14:00', text: 'Back at the pier' },
  { time: '16:30', text: 'All aboard' },
]

const faqs = [
  { q: 'What if my ship is late?', a: 'Tell us your ship and arrival time when booking. We follow the schedule and adjust the start of your excursion.' },
  { q: 'Can I book once I am on board?', a: 'Booking ahead is safer, since vehicles and guides are limited on busy port days.' },
  { q: 'Do you handle groups?', a: 'Yes. We can arrange private groups from a family up to a large party. Contact us with your numbers.' },
]

const fmt = (h) => (Number.isInteger(h) ? `${h} h` : `${Math.floor(h)} h 30`)

/* -------------------------- Composants --------------------------- */

function Hero() {
  return (
    <>
      <Navbar />
      <section className={`${W} relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-slate-900 text-white min-h-[520px] md:min-h-[78vh] flex items-end`}>
        <img src={Ramena} alt="Boats moored in the bay" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-slate-950/10" />
        <div className="relative p-6 sm:p-10 md:p-16 max-w-4xl">
          <p className="text-sm md:text-base text-white/80">For cruise passengers</p>
          <h1 className="mt-3 text-5xl sm:text-6xl md:text-7xl xl:text-[96px] font-semibold leading-[0.95] tracking-tight">See The Best Of Madagascar In One Port Day</h1>
          <p className="mt-6 text-base md:text-xl text-white/90 max-w-2xl">Excursions timed around your ship, with transfers from the pier and a guaranteed margin before all-aboard.</p>
          <a href="#plan" className={`${BTN} ${GOLD} text-white mt-8`}>Plan my port day</a>
        </div>
      </section>
    </>
  )
}

function ExcursionCard({ item, ashore }) {
  const fits = item.hours <= ashore
  const spare = Math.round((ashore - item.hours) * 60)
  const pct = Math.min(100, (item.hours / ashore) * 100)
  return (
    <li className={`flex flex-col rounded-[2rem] bg-white p-3 transition ${fits ? '' : 'opacity-55'}`}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
        <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
        <span className="absolute left-3 top-3 bg-[#C49849] text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm">{item.tag}</span>
        <span className="absolute right-3 top-3 bg-white/90 text-slate-900 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full">{fmt(item.hours)}</span>
      </div>
      <div className="flex flex-1 flex-col px-3 pt-5 pb-3">
        <h3 className="text-xl md:text-2xl font-medium leading-snug text-slate-900">{item.title}</h3>
        <p className="mt-2 text-sm md:text-base text-slate-600 leading-relaxed">{item.text}</p>

        <div className="mt-5" aria-hidden="true">
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden"><div className="h-full rounded-full bg-[#C49849]" style={{ width: `${pct}%` }} /></div>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-slate-600">
          {fits ? `Back on the pier with ${spare} min to spare` : 'Needs a longer stop in port'}
        </p>

        <div className="mt-auto pt-5 flex items-center justify-between gap-3">
          <p className="text-slate-600 text-sm">From <span className="text-2xl font-semibold text-slate-900">€{item.price}</span></p>
          <a href={`/contact?place=${encodeURIComponent(item.title)}&type=cruise`} className={`${BTN} bg-slate-800 hover:bg-slate-700 text-white`}>Reserve</a>
        </div>
      </div>
    </li>
  )
}

function CruiseExcursions() {
  const [port, setPort] = useState('nosybe')
  const [ashore, setAshore] = useState(6)

  const list = excursions
    .filter((e) => e.port === port)
    .sort((a, b) => (a.hours <= ashore ? 0 : 1) - (b.hours <= ashore ? 0 : 1) || a.hours - b.hours)
  const fitting = list.filter((e) => e.hours <= ashore).length

  return (
    <>
      <main className="w-full bg-[#D5E8E2] pb-16 md:pb-24 flex flex-col items-center">
        <Hero />

        {/* Planificateur */}
        <section id="plan" className={`${W} mt-16 md:mt-28 scroll-mt-6`}>
          <h2 className={H2}>Plan Your Port Day</h2>
          <p className="mt-3 text-base md:text-lg text-slate-700 max-w-2xl">Pick your port, then tell us how long you have ashore. We show what fits.</p>

          <ul className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            {ports.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setPort(p.id)}
                  aria-pressed={port === p.id}
                  className={`group relative block w-full aspect-[16/9] md:aspect-[2/1] overflow-hidden rounded-[2rem] text-left text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-800 ${port === p.id ? 'ring-4 ring-[#C49849]' : ''}`}
                >
                  <img src={p.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                    <p className="text-sm text-white/80">{p.sub}</p>
                    <h3 className="text-3xl md:text-4xl font-semibold">{p.name}</h3>
                    <p className="mt-1 text-sm md:text-base text-white/85">{p.text}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-[2rem] bg-white p-6 md:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <label htmlFor="ashore" className="text-base md:text-xl font-medium text-slate-900">Time you have ashore</label>
              <p className="text-3xl md:text-4xl font-semibold text-slate-900" aria-live="polite">{fmt(ashore)}</p>
            </div>
            <input
              id="ashore" type="range" min="3" max="10" step="0.5" value={ashore}
              onChange={(e) => setAshore(Number(e.target.value))}
              className="mt-5 w-full accent-[#C49849]"
            />
            <div className="flex justify-between text-xs md:text-sm text-slate-500"><span>3 h</span><span>10 h</span></div>
            <p className="mt-3 text-sm text-slate-600">Between docking and all-aboard, transfers included.</p>
          </div>

          <p role="status" className="mt-8 mb-5 text-sm md:text-base text-slate-700">{fitting} of {list.length} excursions fit your stop in {ports.find((p) => p.id === port).name}</p>
          <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-7">
            {list.map((item) => <ExcursionCard key={item.id} item={item} ashore={ashore} />)}
          </ul>
        </section>

        {/* Engagements */}
        <section className={`${W} mt-16 md:mt-28 rounded-[2rem] md:rounded-[3rem] bg-slate-900 text-white p-6 sm:p-10 md:p-14`}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight max-w-2xl">Built Around Your Ship’s Schedule</h2>
          <ul className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {promises.map((p) => (
              <li key={p.title} className="border-t border-white/25 pt-5">
                <h3 className="text-xl md:text-2xl font-medium">{p.title}</h3>
                <p className="mt-2 text-sm md:text-base text-white/75 leading-relaxed">{p.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Chronologie d'une escale */}
        <section className={`${W} mt-16 md:mt-28`}>
          <h2 className={H2}>A Port Day, Hour By Hour</h2>
          <p className="mt-3 text-sm md:text-base text-slate-600">Example schedule. Your times follow your ship.</p>
          <ol className="mt-10 grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-0 relative">
            <span aria-hidden="true" className="hidden md:block absolute left-0 right-0 top-[9px] h-px bg-slate-900/25" />
            {timeline.map((t) => (
              <li key={t.time} className="relative md:pr-6">
                <span className="block w-[18px] h-[18px] rounded-full bg-[#C49849] border-4 border-[#D5E8E2] relative" />
                <p className="mt-4 text-2xl md:text-3xl font-semibold text-slate-900">{t.time}</p>
                <p className="mt-1 text-sm md:text-base text-slate-700">{t.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Questions */}
        <section className={`${W} mt-16 md:mt-28 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8 lg:gap-16`}>
          <h2 className={H2}>Good To Know</h2>
          <div className="rounded-[2rem] bg-white px-6 md:px-10">
            {faqs.map((f) => (
              <details key={f.q} className="group border-b border-slate-200 last:border-b-0 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base md:text-xl text-slate-800">
                  {f.q}
                  <span aria-hidden="true" className="shrink-0 w-8 h-8 rounded-full bg-[#C49849] text-white flex items-center justify-center group-open:rotate-45 transition">+</span>
                </summary>
                <p className="mt-3 pr-12 text-sm md:text-base text-slate-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Groupe */}
        <section className={`${W} mt-16 md:mt-28 relative overflow-hidden rounded-[2rem] md:rounded-[3rem] text-white min-h-[380px] flex items-center`}>
          <img src={NosyIranja} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-950/65" />
          <div className="relative p-8 md:p-16 max-w-3xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight">Travelling with a group or the whole ship?</h2>
            <p className="mt-4 text-sm md:text-lg text-white/85">Send us your ship, date and group size. We build a private programme and reply within one working day.</p>
            <a href="/contact?type=cruise-group" className={`${BTN} ${GOLD} text-white mt-8`}>Request a private programme</a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default CruiseExcursions