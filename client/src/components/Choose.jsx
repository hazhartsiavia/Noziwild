import React, { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import RecommendedImg from "../assets/images/Tana.png";
import MonumentImg from "../assets/images/NosyIranja.png";
import StatueImg from "../assets/images/NosyLonjo.png";
import BoatImg from "../assets/images/Ramena.png";

gsap.registerPlugin(ScrollTrigger)

const recommendedTours = [
  {
    id: 1,
    image: MonumentImg,
    rating: 5.00,
    reviews: 325,
    title: "An ancient monument guarding the pyramids",
    duration: "10 Nights - 11 Days",
    price: "300.04",
  },
  {
    id: 2,
    image: StatueImg,
    rating: 5.00,
    reviews: 325,
    title: "Where golden temples meet tropical bliss",
    duration: "8 Nights - 9 Days",
    price: "299.47",
  },
  {
    id: 3,
    image: BoatImg,
    rating: 5.00,
    reviews: 325,
    title: "From parisian streets to countryside dreams",
    duration: "5 Nights - 6 Days",
    price: "900.91",
  },
  {
    id: 4,
    image: RecommendedImg,
    rating: 5.00,
    reviews: 325,
    title: "A hidden bay wrapped in turquoise waters",
    duration: "7 Nights - 8 Days",
    price: "450.20",
  },
  {
    id: 5,
    image: RecommendedImg,
    rating: 5.00,
    reviews: 325,
    title: "A hidden bay wrapped in turquoise waters",
    duration: "7 Nights - 8 Days",
    price: "450.20",
  },
]

const VISIBLE_COUNT = 4

function RecommendedCard({ tour }) {
  return (
    <div className="flex items-center gap-4">
      <img
        src={tour.image}
        alt={tour.title}
        className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover flex-shrink-0"
      />
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-[#F5B800] fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
          <span className="text-white text-sm font-medium">
            {tour.rating.toFixed(2)} ({tour.reviews})
          </span>
        </div>
        <h3 className="text-white text-base md:text-lg font-semibold leading-snug">
          {tour.title}
        </h3>
        <hr className="border-white/20" />
        <div className="flex items-center justify-between text-white/90 text-sm">
          <span>{tour.duration}</span>
          <span>From $ {tour.price} USD</span>
        </div>
      </div>
    </div>
  )
}

function Choose() {
  const sectionRef = useRef(null)
  const bgRef = useRef(null)
  const [startIndex, setStartIndex] = useState(0)

  useGSAP(() => {
    gsap.fromTo(
      bgRef.current,
      { backgroundColor: "#FFFFFF" },
      {
        backgroundColor: "#D5E8E2",
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 20%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, { scope: sectionRef });

  const maxStart = Math.max(0, recommendedTours.length - VISIBLE_COUNT)
  const visibleTours = recommendedTours.slice(startIndex, startIndex + VISIBLE_COUNT)

  const canGoPrev = startIndex > 0
  const canGoNext = startIndex < maxStart

  const handlePrev = () => setStartIndex((prev) => Math.max(0, prev - 1))
  const handleNext = () => setStartIndex((prev) => Math.min(maxStart, prev + 1))

  return (
    <div ref={sectionRef} className="relative w-full mt-[50px] md:mt-[100px] min-h-[100vh] overflow-hidden py-20">
      <div ref={bgRef} className="absolute inset-0 z-0 bg-white" />

      {/* Conteneur global en colonne pour empiler les blocs */}
      <div className="relative flex flex-col items-center gap-8 w-full">

        {/* Bloc 1 : titre + bouton */}
        <div className="flex w-[95vw] max-h-[150px] lg:max-w-[90vw] items-center justify-between">
          <div className="flex-col gap-2">
            <h2 className="text-[14px] lg:text-[18px] font-medium text-slate-900">
              DISCOVER OUR MOST POPULAR TOURS
            </h2>
            <h1 className="text-[36px] lg:text-[45px] font-medium text-slate-900 mb-4">
              BEST TOURS FOR YOU
            </h1>
          </div>
          <button className="hidden md:flex items-center gap-2.5 bg-[#C49849] text-zinc-50 hover:text-zinc-200 text-sm font-medium pl-5 pr-2 py-2 rounded-full cursor-pointer border-0">
            View All TOURS
          </button>
        </div>

        {/* Bloc 2 : image + cartes recommandées */}
        <div className="w-[95vw] lg:max-w-[90vw]">
          <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-[600px] rounded-3xl overflow-hidden">

            {/* LEFT : image + overlay titre */}
           <div className="relative min-h-[300px] lg:min-h-full">
                <img
                    src={RecommendedImg}
                    alt="Recommended for you"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 via-30% to-transparent to-70%" />
                <h2 className="absolute bottom-6 left-6 text-white text-2xl md:text-3xl font-medium z-10">
                    Recommended For You
                </h2>
            </div>

            {/* RIGHT : liste des cartes + navigation */}
            <div className="relative bg-[#123C32] flex flex-col justify-center gap-8 py-10 px-6 md:px-10">
              {visibleTours.map((tour) => (
                <RecommendedCard key={tour.id} tour={tour} />
              ))}

              {/* Flèches de navigation */}
              {recommendedTours.length > VISIBLE_COUNT && (
                <div className="flex items-center justify-end gap-3 mt-2">
                  <button
                    onClick={handlePrev}
                    disabled={!canGoPrev}
                    aria-label="Précédent"
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!canGoNext}
                    aria-label="Suivant"
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default Choose