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
const SELECT = 'w-full h-12 rounded-full border border-slate-300 bg-white px-5 text-base text-slate-800 focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700'

/* ---------------------------- Données ---------------------------- */
/* length : 'half' | 'day' | 'multi' — href : page de détail si elle existe, sinon contact */

const regions = ['All regions', 'North', 'Highlands', 'West', 'East']
const lengths = [
  { label: 'Any length', value: 'any' },
  { label: 'Half day', value: 'half' },
  { label: 'Full day', value: 'day' },
  { label: '2 days or more', value: 'multi' },
]

const excursions = [
  { id: 1, title: 'Cocoa And Spice Valley Day', place: 'Ambanja', region: 'North', length: 'day', duration: '1 day', group: 'Up to 8', level: 'Easy', price: 85, image: Ambanja, text: 'Follow cocoa from tree to drying rack and meet growers along the Sambirano river.', href: '/destinations/ambanja/sambirano-valley' },
  { id: 2, title: 'Sail The Bay Of Ramena', place: 'Diego Suarez', region: 'North', length: 'half', duration: 'Half day', group: 'Up to 10', level: 'Easy', price: 60, image: Ramena, text: 'A morning on the water with swimming stops in the Emerald Sea.', href: '/contact?place=Sail%20The%20Bay%20Of%20Ramena' },
  { id: 3, title: 'Ankify To Nosy Be Crossing', place: 'Ambanja', region: 'North', length: 'half', duration: '3 hours', group: 'Up to 12', level: 'Easy', price: 45, image: NosyIranja, text: 'A scenic drive and a speedboat crossing, with lunch by the water.', href: '/destinations/ambanja/ankify-jetty' },
  { id: 4, title: 'Nosy Iranja Sandbar Day', place: 'Nosy Be', region: 'North', length: 'day', duration: '1 day', group: 'Up to 12', level: 'Easy', price: 95, image: NosyLonjo, text: 'Walk the white sandbar, snorkel with turtles and climb to the lighthouse.', href: '/contact?place=Nosy%20Iranja%20Sandbar%20Day' },
  { id: 5, title: 'Antananarivo And Ambohimanga', place: 'Antananarivo', region: 'Highlands', length: 'day', duration: '1 day', group: 'Up to 8', level: 'Easy', price: 70, image: Tana, text: 'The old town, the Rova and the sacred royal hill north of the capital.', href: '/contact?place=Antananarivo%20And%20Ambohimanga' },
  { id: 6, title: 'Baobab Avenue At Sunset', place: 'Morondava', region: 'West', length: 'half', duration: 'Half day', group: 'Up to 10', level: 'Easy', price: 50, image: Deux, text: 'Arrive before the crowds and watch the light turn the trunks orange.', href: '/contact?place=Baobab%20Avenue%20At%20Sunset' },
  { id: 7, title: 'Manongarivo Forest Trek', place: 'Ambanja', region: 'North', length: 'multi', duration: '2 days', group: 'Up to 6', level: 'Active', price: 140, image: NosyLonjo, text: 'Guided trails through a protected reserve, with optional camping.', href: '/destinations/ambanja/manongarivo-reserve' },
  { id: 8, title: 'Andasibe Indri And Night Walk', place: 'Andasibe', region: 'East', length: 'multi', duration: '2 days', group: 'Up to 8', level: 'Moderate', price: 180, image: Ambanja, text: 'Track the indri at dawn and spot nocturnal lemurs after dark.', href: '/contact?place=Andasibe%20Indri%20And%20Night%20Walk' },
]

const steps = [
  { title: 'Hotel pick-up', text: 'Your driver and guide collect you in the morning.' },
  { title: 'Guided visit', text: 'Unhurried stops, with time for photos and questions.' },
  { title: 'Lunch with locals', text: 'A simple meal in a village or by the water.' },
  { title: 'Back by late afternoon', text: 'Dropped at your hotel in time to rest.' },
]

const stops = [
  { day: 'Day 1', text: 'Ambanja, then the boat from Ankify to Nosy Be' },
  { day: 'Day 2', text: 'Full day on Nosy Iranja, sandbar and turtles' },
  { day: 'Day 3', text: 'Nosy Lonjo in the morning, return in the afternoon' },
]

/* -------------------------- Composants --------------------------- */

function Hero({ region, setRegion, length, setLength }) {
  return (
    <>
      <Navbar />
      <section className={`${W} relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-slate-900 text-white min-h-[460px] md:min-h-[70vh] flex items-center`}>
        <img src={Ramena} alt="Boats on the bay near Ramena" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-slate-950/55" />
        <div className="relative w-full px-6 sm:px-10 md:px-16 pb-16 text-center flex flex-col items-center">
          <h1 className="text-6xl sm:text-7xl md:text-8xl xl:text-[120px] font-semibold leading-[0.95] tracking-tight">Excursions</h1>
          <p className="mt-5 text-base md:text-xl text-white/90 max-w-2xl">From a morning on the water to a three-day escape. Choose how long you have, we handle the rest.</p>
        </div>
      </section>

      {/* Barre de recherche flottante */}
      <form
        onSubmit={(e) => { e.preventDefault(); document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }) }}
        className={`${W} relative z-10 -mt-10 md:-mt-12 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end rounded-[2rem] bg-white p-5 md:p-7 shadow-lg`}
      >
        <div>
          <label htmlFor="region" className="block mb-2 text-sm md:text-base text-slate-700">Region</label>
          <select id="region" value={region} onChange={(e) => setRegion(e.target.value)} className={SELECT}>
            {regions.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="length" className="block mb-2 text-sm md:text-base text-slate-700">Length</label>
          <select id="length" value={length} onChange={(e) => setLength(e.target.value)} className={SELECT}>
            {lengths.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <button type="submit" className={`${BTN} ${GOLD} text-white h-12 md:px-8`}>Find excursions</button>
      </form>
    </>
  )
}

function Row({ item }) {
  return (
    <li className="grid grid-cols-1 md:grid-cols-[300px_1fr_auto] lg:grid-cols-[360px_1fr_auto] gap-4 md:gap-8 rounded-[2rem] bg-white p-3 md:p-4 md:items-stretch">
      <a href={item.href} className="group relative block aspect-[4/3] md:aspect-auto md:min-h-[220px] overflow-hidden rounded-[1.5rem]">
        <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 bg-[#C49849] text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm">{item.duration}</span>
      </a>

      <div className="px-2 md:px-0 md:py-4 flex flex-col justify-center">
        <p className="flex items-center gap-3 text-xs sm:text-sm text-slate-600">
          <span>{item.place}</span><span className="w-px h-4 bg-slate-500" /><span>{item.level}</span><span className="w-px h-4 bg-slate-500" /><span>{item.group} guests</span>
        </p>
        <h3 className="mt-3 text-xl md:text-3xl font-medium leading-snug text-slate-900">
          <a href={item.href} className="hover:underline">{item.title}</a>
        </h3>
        <p className="mt-3 text-sm md:text-base text-slate-600 leading-relaxed max-w-xl">{item.text}</p>
      </div>

      <div className="px-2 pb-3 md:p-4 md:pr-6 flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4 md:border-l md:border-slate-200 md:pl-8">
        <p className="text-slate-600 text-sm md:text-right">From<br className="hidden md:block" /> <span className="text-2xl md:text-3xl font-semibold text-slate-900">€{item.price}</span><span className="block text-xs">per person</span></p>
        <a href={item.href} className={`${BTN} bg-slate-800 hover:bg-slate-700 text-white`}>View details</a>
      </div>
    </li>
  )
}

function Excursions() {
  const [region, setRegion] = useState('All regions')
  const [length, setLength] = useState('any')

  const visible = excursions.filter(
    (e) => (region === 'All regions' || e.region === region) && (length === 'any' || e.length === length)
  )

  return (
    <>
      <main className="w-full bg-[#D5E8E2] pb-16 md:pb-24 flex flex-col items-center">
        <Hero region={region} setRegion={setRegion} length={length} setLength={setLength} />

        {/* Résultats */}
        <section id="results" className={`${W} mt-16 md:mt-24 scroll-mt-6`}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-8">
            <h2 className={H2}>Choose Your Excursion</h2>
            <p role="status" className="text-sm md:text-base text-slate-700">{visible.length} {visible.length === 1 ? 'excursion' : 'excursions'} found</p>
          </div>

          {visible.length > 0 ? (
            <ul className="flex flex-col gap-5">{visible.map((item) => <Row key={item.id} item={item} />)}</ul>
          ) : (
            <div className="rounded-[2rem] bg-white p-10 text-center">
              <p className="text-lg text-slate-700">No excursion matches this search yet.</p>
              <button type="button" onClick={() => { setRegion('All regions'); setLength('any') }} className={`${BTN} bg-slate-800 hover:bg-slate-700 text-white mt-5`}>Show all excursions</button>
            </div>
          )}
        </section>

        {/* Une journée type */}
        <section className={`${W} mt-16 md:mt-28 rounded-[2rem] md:rounded-[3rem] bg-slate-900 text-white p-6 sm:p-10 md:p-14`}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight max-w-2xl">A Day Trip, Start To Finish</h2>
          <ol className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <li key={s.title} className="border-t border-white/25 pt-5">
                <span className="text-[#C49849] text-lg font-semibold">{i + 1}</span>
                <h3 className="mt-2 text-xl font-medium">{s.title}</h3>
                <p className="mt-2 text-sm md:text-base text-white/75 leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Escapade de plusieurs jours */}
        <section className={`${W} mt-16 md:mt-28 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center`}>
          <div className="relative aspect-[4/3] lg:aspect-[4/5] overflow-hidden rounded-[2rem] md:rounded-[3rem]">
            <img src={NosyIranja} alt="Nosy Iranja sandbar" className="absolute inset-0 w-full h-full object-cover" />
            <span className="absolute left-5 top-5 bg-[#C49849] text-white text-sm font-medium px-3 py-1.5 rounded-sm">3 days</span>
          </div>
          <div>
            <h2 className={H2}>Three Days On The Islands</h2>
            <p className="mt-4 text-base md:text-lg text-slate-700 leading-relaxed max-w-xl">Our most requested multi-day escape links the mainland to the islands around Nosy Be, with every transfer arranged.</p>
            <ul className="mt-8 flex flex-col divide-y divide-slate-900/15 border-y border-slate-900/15">
              {stops.map((s) => (
                <li key={s.day} className="flex gap-6 py-4 text-base md:text-lg text-slate-800">
                  <span className="w-16 shrink-0 font-medium">{s.day}</span>
                  <span>{s.text}</span>
                </li>
              ))}
            </ul>
            <a href="/contact?place=Three%20Days%20On%20The%20Islands" className={`${BTN} ${GOLD} text-white mt-8`}>Ask for this escape</a>
          </div>
        </section>

        {/* Appel à l'action */}
        <section className={`${W} mt-16 md:mt-28 relative overflow-hidden rounded-[2rem] md:rounded-[3rem] text-white min-h-[380px] flex items-center`}>
          <img src={Deux} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-950/65" />
          <div className="relative p-8 md:p-16 max-w-3xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight">Want an excursion made for you?</h2>
            <p className="mt-4 text-sm md:text-lg text-white/85">Tell us your dates and interests. A travel expert replies within one working day.</p>
            <a href="/contact" className={`${BTN} ${GOLD} text-white mt-8`}>Plan my excursion</a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default Excursions