import React from 'react'
import Reveal from './Reveal'
import Tana from '../assets/images/Tana.png'
import Ramena from '../assets/images/Ramena.png'
import Deux from '../assets/images/2.jpg'
import Ambanja from '../assets/images/Ambanja.png'
import NosyLonjo from '../assets/images/NosyLonjo.png'
import NosyIranja from '../assets/images/NosyIranja.png'

const W = 'w-[90vw] lg:max-w-[95vw]'
const H2 = 'text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-medium leading-[1.1] tracking-tight text-slate-900'

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

export default Offers
