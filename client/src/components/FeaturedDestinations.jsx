import React from 'react'
import Reveal from './Reveal'

const W = 'w-[90vw] lg:max-w-[95vw]'
const H2 = 'text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-medium leading-[1.1] tracking-tight text-slate-900'
const BTN = 'inline-flex items-center justify-center text-sm md:text-base font-medium px-6 py-3 rounded-full active:scale-95 transition'

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

export default FeaturedDestinations
