import React, { useState } from 'react'
import NosyLonjo from "../assets/images/NosyLonjo.png";
import Deux from "../assets/images/2.jpg";
import Ambanja from "../assets/images/Ambanja.png";
import NosyIranja from "../assets/images/NosyIranja.png";

/* ------------------------------------------------------------------
   Échelle typographique PARTAGÉE
   ⚠ À garder strictement identique dans Explore.jsx et Choose.jsx
------------------------------------------------------------------- */
const SECTION_WIDTH = "w-[95vw] lg:max-w-[90vw]"
const SECTION_TITLE = "text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-slate-900 leading-[1.15] tracking-tight"
const SECTION_SUBTITLE = "text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-md md:max-w-3xl"
const CARD_TITLE = "text-3xl md:text-4xl font-medium tracking-tight leading-[1.1] break-words"
const META_TEXT = "text-xs sm:text-sm"
const BUTTON = "text-sm font-medium px-5 py-2.5 rounded-full"

// Grande carte (slider)
const tours = [
  {
    id: 1,
    image: NosyLonjo,
    rating: 4.9,
    date: '22 Mar',
    duration: '5 Days - 7 Nights',
    tagline: 'Wonders of the North',
    title: 'Antsiranana',
    stops: ['Diego Suarez', 'Nosy Lonjo', 'Ramena'],
    price: 'USD 899',
    note: 'Book your own flights and meet us in Antsiranana — depart from Nosy Be after the trip.',
  },
  {
    id: 2,
    image: Deux,
    rating: 4.7,
    date: '05 Apr',
    duration: '4 Days - 3 Nights',
    tagline: 'Wild landscapes and hidden trails',
    title: 'Deux',
    stops: ['Stop one', 'Stop two', 'Stop three'],
    price: 'USD 749',
    note: 'Book your own flights and meet us at the starting point — depart from the same city after the trip.',
  },
  {
    id: 3,
    image: Ambanja,
    rating: 4.8,
    date: '18 Apr',
    duration: '6 Days - 5 Nights',
    tagline: 'Cocoa country and secret bays',
    title: 'Baie de Sakalava',
    stops: ['Ambanja', 'Nosy Be', 'Baie de Sakalava'],
    price: 'USD 1,050',
    note: 'Book your own flights and meet us in Ambanja — depart from Nosy Be after the trip.',
  },
  {
    id: 4,
    image: NosyIranja,
    rating: 4.9,
    date: '02 May',
    duration: '5 Days - 4 Nights',
    tagline: 'Turquoise water and white sand',
    title: 'Nosy Iranja',
    stops: ['Nosy Be', 'Nosy Iranja', 'Nosy Tanikely'],
    price: 'USD 980',
    note: 'Book your own flights and meet us in Nosy Be — depart from Nosy Be after the trip.',
  },
]

// Deux petites cartes du bas
const destinations = [
  { id: 1, image: NosyIranja, guests: '12,485', title: 'Nosy Iranja', tours: 78, departures: 190, cta: 'Visit Iranja' },
  { id: 2, image: Ambanja, guests: '7,451', title: 'Ambanja', tours: 49, departures: 121, cta: 'Visit Ambanja' },
]

const Dot = () => <span className="w-[3px] h-[3px] rounded-full bg-white/40 shrink-0" />

const ArrowIcon = ({ direction = 'right' }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {direction === 'right'
      ? <path d="M5 12h14M13 6l6 6-6 6" />
      : <path d="M19 12H5M11 6l-6 6 6 6" />}
  </svg>
)

function DestinationCard({ item }) {
  return (
    <div className="relative overflow-hidden rounded-2xl min-h-[240px] md:min-h-[265px] text-white">
      <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black from-20% via-black/60 to-transparent to-85%" />

      <div className="relative h-full min-h-[inherit] p-5 md:p-6 flex flex-col">
        <p className={`${META_TEXT} font-medium`}>{item.guests} guests travelled</p>
        <h3 className={`mt-3 ${CARD_TITLE}`}>{item.title}</h3>
        <p className={`mt-1.5 flex items-center gap-2 ${META_TEXT} font-medium`}>
          {item.tours} tours <Dot /> {item.departures} departures
        </p>

        <button className={`mt-auto self-start bg-white text-slate-900 ${BUTTON} hover:bg-slate-100 active:scale-95 transition`}>
          {item.cta}
        </button>
      </div>
    </div>
  )
}

function Explore() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const tour = tours[currentIndex]

  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + tours.length) % tours.length)
  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % tours.length)

  return (
    <div className="flex flex-col items-center py-8 md:py-12 mt-[50px] md:mt-[100px]">

      {/* Titre de section */}
      <div className={`${SECTION_WIDTH} mb-8 md:mb-12`}>
        <h2 className={`${SECTION_TITLE} mb-3 md:mb-5`}>
          Typical Travel Experiences
        </h2>
        <p className={SECTION_SUBTITLE}>
          Choose from a variety your travel style and let us help you create a personalized itinerary that suits your preferences.
        </p>
      </div>

      {/* Galerie en bento */}
      <div className={`${SECTION_WIDTH} flex flex-col gap-2`}>

        {/* Grande carte */}
        <div className="relative overflow-hidden rounded-2xl text-white min-h-[560px] sm:min-h-[480px] md:min-h-[414px]">
          <img
            src={tour.image}
            alt={tour.title}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Fondu noir à gauche, l'image se révèle vers la droite */}
          <div className="absolute inset-0 bg-black/40 md:bg-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black from-35% via-black/75 md:via-black/60 to-transparent to-90%" />

          <div className="relative min-h-[inherit] p-6 sm:p-8 md:px-10 md:py-11 flex flex-col">

            {/* Note, date, durée */}
            <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${META_TEXT} font-medium`}>
              <span className="flex items-center gap-1.5 text-emerald-400">
                {tour.rating} Rate
                <span className="flex items-center gap-[3px]" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className={`w-[7px] h-[7px] rounded-full ${i < Math.floor(tour.rating) ? 'bg-emerald-400' : 'bg-white/30'}`}
                    />
                  ))}
                </span>
              </span>
              <Dot />
              <span>on {tour.date}</span>
              <Dot />
              <span>{tour.duration}</span>
            </div>

            {/* Titre */}
            <div className="mt-6 sm:mt-7 max-w-full sm:max-w-[70%] md:max-w-[45%]">
              <p className="text-sm sm:text-base font-medium">{tour.tagline}</p>
              <h3 className={`mt-1.5 ${CARD_TITLE}`}>
                {tour.title}
              </h3>
              <p className={`mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 ${META_TEXT} font-semibold`}>
                {tour.stops.map((stop, i) => (
                  <React.Fragment key={stop}>
                    {i > 0 && <Dot />}
                    <span>{stop}</span>
                  </React.Fragment>
                ))}
              </p>
            </div>

            {/* Prix + infos vol */}
            <ul className={`mt-6 flex flex-col gap-3 max-w-full sm:max-w-[70%] md:max-w-[38%] ${META_TEXT} font-medium`}>
              <li className="flex items-center gap-3">
                <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2.5" y="6" width="19" height="12" rx="4" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
                Joining price from {tour.price}
              </li>
              <li className="flex items-start gap-3">
                <svg className="shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                </svg>
                {tour.note}
              </li>
            </ul>

            {/* Bouton + conditions */}
            <div className="mt-auto pt-6 flex flex-col items-start gap-2.5">
              <button className={`bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition text-white ${BUTTON}`}>
                Join the Tour
              </button>
              <span className="text-[11px] font-semibold">*T&amp;C Apply</span>
            </div>

            {/* Navigation */}
            <div className="absolute bottom-6 right-6 md:bottom-7 md:right-10 flex items-center gap-3">
              <button
                onClick={handlePrev}
                aria-label="Previous tour"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-white/70 text-white hover:bg-white/15 active:bg-white/25 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <ArrowIcon direction="left" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next tour"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-white/70 text-white hover:bg-white/15 active:bg-white/25 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <ArrowIcon direction="right" />
              </button>
            </div>
          </div>
        </div>

        {/* Rangée du bas : 2 destinations + "See more" */}
        <div className="grid grid-cols-2 md:grid-cols-[1fr_1fr_0.7fr] gap-2">

          {destinations.map((item) => (
            <DestinationCard key={item.id} item={item} />
          ))}

          <div className="col-span-2 md:col-span-1 rounded-2xl border border-slate-200 bg-white p-5 md:p-6 flex flex-col min-h-[240px] md:min-h-[265px]">

            <span className="text-3xl" aria-hidden="true">
              🌍
            </span>

            <h3 className={`mt-4 text-slate-800 ${CARD_TITLE}`}>
              See more Destination
            </h3>

            <p className={`mt-3 ${META_TEXT} text-slate-500`}>
              Your pick from 1.5k+ destinations.
            </p>

            <button className={`mt-auto md:mt-5 lg:mt-auto self-start border border-slate-300 text-slate-800 ${BUTTON} hover:bg-slate-50 active:scale-95 transition`}>
              See more
            </button>

          </div>

        </div>
      </div>
    </div>
  )
}

export default Explore