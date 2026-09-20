import React, { useEffect, useRef, useState } from 'react'
import NosyLonjo from "../assets/images/NosyLonjo.png";
import Deux from "../assets/images/2.jpg";
import Ambanja from "../assets/images/Ambanja.png";
import NosyIranja from "../assets/images/NosyIranja.png";
import Ramena from "../assets/images/Ramena.png";
import Tana from "../assets/images/Tana.png";

/* Constantes partagées : mêmes valeurs que dans Explore.jsx et Choose.jsx */
const SECTION_WIDTH = "w-[90vw] lg:max-w-[80vw]"
const SECTION_TITLE = "text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-slate-900 leading-[1.15] tracking-tight"
const META_TEXT = "text-xs sm:text-sm"

const GAP_PX = 20 // = gap-5

const trips = [
  { id: 1, image: NosyLonjo, location: 'Antsiranana', title: 'Explore The Iconic Scenic Routes Of The North', discount: 10, rating: 5.0, reviews: 325, duration: '8 Nights - 9 Days', price: '400.93' },
  { id: 2, image: Ambanja, location: 'Ambanja', title: 'Uncover The Beauty Of Sakalava Bay Coastlines', discount: 20, rating: 5.0, reviews: 333, duration: '11 Nights - 12 Days', price: '680.18' },
  { id: 3, image: NosyIranja, location: 'Nosy Be', title: 'Beauty Of Nosy Iranja’s Beaches And Islands', discount: 12, rating: 5.0, reviews: 340, duration: '10 Nights - 11 Days', price: '190.80' },
  { id: 4, image: Ramena, location: 'Ramena', title: 'Uncover The Rich Cultural Mosaic Of Diego Suarez', discount: 10, rating: 5.0, reviews: 333, duration: '9 Nights - 10 Days', price: '399.96' },
  { id: 5, image: Tana, location: 'Antananarivo', title: 'Discover The Highlands And The Heart Of The Capital', discount: 15, rating: 5.0, reviews: 298, duration: '6 Nights - 7 Days', price: '320.50' },
  { id: 6, image: Deux, location: 'Madagascar', title: 'Wild Landscapes And Hidden Trails Off The Beaten Path', discount: 8, rating: 5.0, reviews: 210, duration: '7 Nights - 8 Days', price: '275.00' },
]

const ArrowIcon = ({ direction = 'right' }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {direction === 'right'
      ? <path d="M5 12h14M13 6l6 6-6 6" />
      : <path d="M19 12H5M11 6l-6 6 6 6" />}
  </svg>
)

function TripCard({ trip }) {
  return (
    <a
      href="#"
      className="group snap-start shrink-0 grow-0
                 basis-full
                 sm:basis-[calc((100%-1.25rem)/2)]
                 md:basis-[calc((100%-2.5rem)/3)]
                 lg:basis-[calc((100%-3.75rem)/4)]
                 flex flex-col overflow-hidden rounded-xl bg-white text-slate-800"
    >
      {/* Image + badge */}
      <div className="relative aspect-[5/2] sm:aspect-[16/9] lg:aspect-[3/2] overflow-hidden">
        <img
          src={trip.image}
          alt={trip.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className={`absolute top-3 left-3 bg-[#C49849] text-white ${META_TEXT} font-medium px-3 py-1.5 rounded-sm`}>
          {trip.discount}% OFF
        </span>
      </div>

      {/* Contenu */}
      <div className="flex flex-col flex-1 p-5 md:p-6">
        <p className="text-sm sm:text-base text-slate-700">{trip.location}</p>
        <h3 className="mt-2 text-base sm:text-lg font-medium leading-snug line-clamp-2">
          {trip.title}
        </h3>

        {/* Note + durée (la note est masquée sur mobile) */}
        <div className={`mt-auto pt-5 flex items-center justify-between gap-3 ${META_TEXT} text-slate-700`}>
          <span className="hidden sm:flex items-center gap-1.5">
            <svg className="w-4 h-4 text-[#F5B800] fill-current" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
            {trip.rating.toFixed(2)} ({trip.reviews})
          </span>
          <span>{trip.duration}</span>
        </div>

        <hr className="mt-3 border-slate-200" />

        <p className="mt-3 text-sm sm:text-base">
          From <span className="font-medium">$ {trip.price} USD</span>
        </p>
      </div>
    </a>
  )
}

function Trips() {
  const trackRef = useRef(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  const updateArrows = () => {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    updateArrows()
    window.addEventListener('resize', updateArrows)
    return () => window.removeEventListener('resize', updateArrows)
  }, [])

  // Défilement d'une carte à la fois
  const scrollByCard = (direction) => {
    const el = trackRef.current
    if (!el || !el.firstElementChild) return
    const step = el.firstElementChild.offsetWidth + GAP_PX
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: direction * step, behavior: smooth ? 'smooth' : 'auto' })
  }

  const arrowClass =
    "w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-slate-700 text-slate-800 " +
    "hover:bg-slate-800/10 active:bg-slate-800/20 transition disabled:opacity-30 disabled:cursor-not-allowed " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-800"

  return (
    <section className="w-full mt-[50px] md:mt-[0px] py-12 md:py-20 bg-white flex flex-col items-center">

      {/* En-tête : titre + flèches */}
      <div className={`${SECTION_WIDTH} mb-8 md:mb-12 flex items-start sm:items-center justify-between gap-4`}>
        <div>
          <p className="mb-2 text-xs sm:text-sm md:text-base uppercase tracking-wide text-slate-700">
            Explore our trips
          </p>
          <h2 className={SECTION_TITLE}>Hot Deals On Selected Trips</h2>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <button onClick={() => scrollByCard(-1)} disabled={!canPrev} aria-label="Previous trips" className={arrowClass}>
            <ArrowIcon direction="left" />
          </button>
          <button onClick={() => scrollByCard(1)} disabled={!canNext} aria-label="Next trips" className={arrowClass}>
            <ArrowIcon direction="right" />
          </button>
        </div>
      </div>

      {/* Carrousel : 4 cartes (lg), 3 (md), 2 (sm), 1 (mobile) */}
      <div className={SECTION_WIDTH}>
        <div
          ref={trackRef}
          onScroll={updateArrows}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </div>

    </section>
  )
}

export default Trips