import React, { useState, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import NosyLonjo from "../assets/images/NosyLonjo.png";
import Deux from "../assets/images/2.jpg";
import Ambanja from "../assets/images/Ambanja.png";
import NosyIranja from "../assets/images/NosyIranja.png";

gsap.registerPlugin(ScrollTrigger);

const cards = [
  { id: 1, image: NosyLonjo, title: 'Antsiranana', description: 'Discover the beauty of Nosy Lonjo Antsiranana.' },
  { id: 2, image: Deux, title: 'Deux', description: 'Discover the beauty of Deux.' },
  { id: 3, image: Ambanja, title: 'Baie de Sakalava', description: 'Discover the beauty of Baie de Sakalava.' },
  { id: 4, image: NosyIranja, title: 'Nosy Iranja', description: 'Discover the beauty of Nosy Iranja.' },
  { id: 5, image: NosyIranja, title: 'Nosy Iranja', description: 'Discover the beauty of Nosy Iranja.' },
]

function Explore() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const rootRef = useRef(null)
  const imageWrapperRef = useRef(null)
  const imageRef = useRef(null)
  const previewRef = useRef(null)

  const selectedImage = cards[currentIndex]
  const nextIndex = (currentIndex + 1) % cards.length
  const previewImage = cards[nextIndex]

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % cards.length)
  }

  useGSAP(() => {
    gsap.fromTo(
      imageRef.current,
      { scale: 0.25 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: imageWrapperRef.current,
          start: "top bottom",
          end: "top center",
          scrub: true,
        },
      }
    );

    gsap.set(".overlay-item", { opacity: 0, y: 20, filter: "blur(8px)" });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: imageWrapperRef.current,
        start: "top top",
        toggleActions: "play none none none",
      },
    });

    tl.to(".overlay-item", {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.7,
      stagger: 0.1,
      ease: "power2.out",
    });
  }, { scope: rootRef });

  // Fondu à chaque changement (image principale + mini-preview)
  useGSAP(() => {
    gsap.fromTo(
      imageRef.current,
      { opacity: 0.4 },
      { opacity: 1, duration: 0.4, ease: "power2.out" }
    );
    gsap.fromTo(
      previewRef.current,
      { opacity: 0, scale: 0.96 },
      { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
    );
  }, { dependencies: [currentIndex], scope: rootRef })

  return (
    <div ref={rootRef} className="px-0 md:px-4 flex flex-col items-center py-2">

      {/* Titre */}
      <div className="text-center mb-5 px-4">
        <h1 className="text-2xl sm:text-3xl md:text-[50px] font-medium text-slate-900 mb-4">
          Typical Travel Experiences
        </h1>
        <p className="text-sm md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Choose from a variety your travel style and let us help you create a personalized itinerary that suits your preferences.
        </p>
      </div>

      {/* Galerie */}
      <div className="w-full max-w-[90vw] md:max-w-[95vw] flex flex-col items-center space-y-4">

        {/* Image principale */}
        <div ref={imageWrapperRef} className="relative w-full overflow-hidden rounded-lg">
          <div
            ref={imageRef}
            className="relative group"
            style={{ transformOrigin: "center center", willChange: "transform" }}
          >
            <img
              src={selectedImage.image}
              alt={selectedImage.title}
              className="w-full h-[70vh] sm:h-[80vh] md:h-[95vh] object-cover rounded-t-3xl"
            />
            <div className="absolute inset-0 rounded-t-3xl bg-black/50 p-4 sm:p-6 md:p-10 text-white flex flex-col">

              {/* Titre + description */}
              <div className="md:space-y-4">
                <h2 className="overlay-item text-xl sm:text-2xl md:text-4xl lg:text-5xl font-medium">
                  {selectedImage.title}
                </h2>
                <p className="overlay-item mt-1 text-xs sm:text-sm text-white/80 max-w-[90%] sm:max-w-none">
                  {selectedImage.description}
                </p>
                <hr className="overlay-item w-[140px] sm:w-[200px] my-2 border-white/30" />
              </div>

              {/* Bloc bas : preview + prix/bouton, empilés sur mobile */}
              <div className="mt-auto flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-0">

                {/* Mini-preview = PROCHAINE image + navigation */}
                <div className="overlay-item flex flex-col gap-2 md:gap-3 order-2 md:order-1">
                  <span className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                    💞 Public favorite destination
                  </span>

                  <img
                    ref={previewRef}
                    src={previewImage.image}
                    alt={previewImage.title}
                    onClick={handleNext}
                    className="w-[110px] h-[70px] sm:w-[160px] sm:h-[100px] md:w-[220px] md:h-[130px] object-cover rounded-xl cursor-pointer"
                  />

                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={handlePrev}
                      aria-label="Précédent"
                      className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-full border border-white/50 text-white hover:bg-white/10 transition"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNext}
                      aria-label="Suivant"
                      className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-full border border-white/50 text-white hover:bg-white/10 transition"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Prix + bouton */}
                <div className="overlay-item flex flex-col items-start md:items-end gap-2 sm:gap-3 order-1 md:order-2">
                  <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-white/80">
                    Starting at 200$
                  </h1>
                  <button className="bg-white text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition text-sm sm:text-base">
                    Explore Now
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Explore