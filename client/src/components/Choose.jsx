import React, { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Tana from "../assets/images/Tana.png";

gsap.registerPlugin(ScrollTrigger)

function Choose() {
  const sectionRef = useRef(null)
  const bgRef = useRef(null)

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
          start: "top 30%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, { scope: sectionRef });

  return (
    <div ref={sectionRef} className="relative w-full mt-[50px] md:mt-[150px] min-h-[100vh] overflow-hidden py-20">
      <div ref={bgRef} className="absolute inset-0 z-0 bg-white" />

      {/* Conteneur global en colonne pour empiler les blocs */}
      <div className="relative flex flex-col items-center gap-2 w-full">

        {/* Bloc 1 : titre + bouton */}
        <div className="flex w-[95vw] max-h-[150px] lg:max-w-[90vw] items-center justify-between">
          <div className="flex-col gap-2">
            <h2 className="text-[14px] lg:text-[18px] font-medium text-slate-900">
              DISCOVER OUR MOST POPULAR CIRCUITS
            </h2>
            <h1 className="text-[36px] lg:text-[45px] font-medium text-slate-900 mb-4">
              BEST CIRCUITS FOR YOU
            </h1>
          </div>
          <button className="hidden md:flex items-center gap-2.5 bg-[#C49849] text-zinc-50 hover:text-zinc-200 text-sm font-medium pl-5 pr-2 py-2 rounded-full cursor-pointer border-0">
            View All circuits
          </button>
        </div>

        {/* Bloc 2 : ton nouveau conteneur */}
        <div className="w-[95vw] lg:max-w-[90vw]">
            <div
                    className="
                      grid
                      grid-cols-1 grid-rows-2
                      lg:grid-cols-2 lg:grid-rows-1
                      w-full
                      md:h-[1050px] lg:h-[70vh]
                      
                      
                    "
                  >
                    {/* RIGHT */}
                    <div
                      className="
                        h-full
                        min-h-0
                        overflow-hidden
                        bg-[#123C32]
                        relative
                        rounded-t-3xl lg:rounded-l-3xl lg:rounded-tr-none
                        
                      "
                    >
                      <img
                        src={Tana}
                        alt="Lemurien de Madagascar"
                        className="
                          absolute inset-0
                          w-full h-full
                          object-cover
                          object-center
                        "
                      />
                    </div>
                    {/* LEFT */}
                    <div
                      className="
                        h-full
                        py-10 
                        overflow-hidden
                        bg-[#123C32]
                        flex flex-col justify-center items-start
                        lg:rounded-r-3xl
                        rounded-b-3xl md:rounded-b-none
                        py-20 lg:py-5 ld:gap-20
                      "
                    >
                      <div className="w-full px-10 lg:mx-0 md:mt-0 flex flex-col items-start">
                        {/* Badge */}
                        <a
                          href="https://noziwild.com"
                          className="
                            inline-flex items-center gap-2
                            bg-white
                            border border-[#C49849]
                            rounded-full
                            p-1 pr-3
                            text-sm
                          "
                        >
                          <span className="bg-[#C49849] text-white text-xs px-3 py-1 rounded-full">
                            Noziwild
                          </span>
            
                          <p className="flex items-center gap-2 text-[#C49849]">
                            <span className="text-sm">
                              MADAGASCAR
                            </span>
            
                            <svg
                              width="6"
                              height="9"
                              viewBox="0 0 6 9"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="m1 1 4 3.5L1 8"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </p>
                        </a>
            
                        {/* Title */}
                        <h1
                          className="
                            text-white
                            text-3xl
                            md:text-4xl
                            lg:text-[45px]/[1.1]
                            font-semibold
                            mt-5
                            max-w-full
                            pr-2 lg:pr-0
                            md:leading-[1.2]
                          "
                        >
                          Noziwild Madagascar, Explore the Untamed Beauty of the Island
                        </h1>
            
                        {/* Description */}
                        <p
                          className="
                            text-white/75
                            text-base leading-7
                            max-w-full
                            pr-2 lg:pr-8 lg:max-w-full
                            mt-5
                          "
                        >
                          Go Beyond the Ordinary: Embark on a Journey to Madagascar&apos;s
                          Untamed Beauty, Where Adventure Meets Serenity
                        </p>
                      </div>
                    </div>
            
                    
                  </div>
          {/* ton contenu ici : cartes de circuitsd, grille, etc. */}
        </div>

      </div>
    </div>
  )
}

export default Choose