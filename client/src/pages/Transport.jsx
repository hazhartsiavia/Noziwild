import React, { useRef, useState, useLayoutEffect } from 'react'
import Navbar from '../components/Navbar'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Ramena from '../assets/images/Ramena.png'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'


gsap.registerPlugin(ScrollTrigger)

const SECTION_WIDTH = "w-[95vw] lg:max-w-[95vw]"
const SECTION_TITLE = "text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-slate-900 leading-[1.15] tracking-tight"
const META_TEXT = "text-xs sm:text-sm"

const PAGE_TITLE = "text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold uppercase leading-none tracking-tight"
const BADGE = "inline-block bg-[#C49849] text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm"

const TRANSPORTS = [
  {
    company: "4X4 & TOUT-TERRAIN",
    heading: "Explorez sans limites",
    quote:
      "Nos 4x4 sont parfaitement entretenus et équipés pour les pistes les plus exigeantes. Que ce soit pour rejoindre des sites isolés ou traverser des terrains difficiles, le véhicule et l'assistance ont toujours été à la hauteur du voyage.",
    name: "DANIEL R.",
    location: "Nosy Be",
    rating: "4.9",
    photo:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop",
  },
  {
    company: "LOCATION DE BATEAUX",
    heading: "Naviguez à votre rythme",
    quote:
      "La réservation du bateau s'est faite en quelques minutes, avec un skipper local disponible pour la journée. Nous avons pu enchaîner trois îles sans jamais nous soucier de la logistique.",
    name: "JONAS M.",
    location: "Nosy Komba",
    rating: "4.8",
    photo:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop",
  },
  {
    company: "LOCATION DE QUADS",
    heading: "Sensations garanties",
    quote:
      "Une sortie en quad organisée du début à la fin : matériel récent, briefing sécurité clair, et un guide qui connaît chaque sentier de la région. Idéal pour sortir des routes classiques.",
    name: "CARA L.",
    location: "Diego Suarez",
    rating: "5.0",
    photo:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop",
  },
]

function CustomerStoriesCarousel() {
  const trackRef = useRef(null)
  const containerRef = useRef(null)
  const headerRef = useRef(null)
  const cardsRef = useRef([])
  const [index, setIndex] = useState(0)

  cardsRef.current = []
  const addCardRef = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el)
    }
  }

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Le fond / conteneur s'anime tout de suite au chargement
      gsap.from(containerRef.current, {
        opacity: 0,
        scale: 0.98,
        duration: 0.8,
        ease: "power3.out",
      })

      // Etat de départ explicite pour éviter tout flash / conflit d'immediateRender
      gsap.set(headerRef.current.children, { y: 30, opacity: 0 })
      gsap.set(cardsRef.current, { y: 40, opacity: 0 })

      // 2. Le contenu attend un petit scroll — seuil réduit + fallback fiable
      const contentTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top-=20", // seuil réduit : plus facilement atteignable
          toggleActions: "play none none none", // reste visible même si on remonte
          invalidateOnRefresh: true,
          // markers: true, // décommente pour debug visuel
        },
        defaults: { ease: "power3.out" },
      })

      contentTl
        .to(headerRef.current.children, {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.15,
        })
        .to(
          cardsRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.15,
          },
          "-=0.3"
        )

      // Recalcule les positions une fois que tout (images/fonts) est bien chargé
      requestAnimationFrame(() => ScrollTrigger.refresh())
      window.addEventListener("load", () => ScrollTrigger.refresh())
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const scrollToIndex = (i) => {
    const clamped = Math.max(0, Math.min(TRANSPORTS.length - 1, i))
    setIndex(clamped)
    const track = trackRef.current
    if (track) {
      const card = track.children[clamped]
      if (card) {
        track.scrollTo({ left: card.offsetLeft - 10, behavior: "smooth" })
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className={`${SECTION_WIDTH} relative overflow-hidden rounded-3xl pr-0 p-10 bg-[#123C32] text-white min-h-[360px]`}
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(20,30,20,0.35), rgba(20,30,20,0.55)), url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=1600&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        ref={headerRef}
        className="md:ml-30 lg:ml-50 mt-10 flex flex-wrap items-end justify-between gap-6 mb-8"
      >
        <div>
          <span className={BADGE}>NOZIWILD TRANSPORT</span>
          <h2 className="text-white font-sans text-4xl sm:text-5xl leading-tight max-w-2xl mt-4">
            Trusted by travelers.
            <br />
            Proven in every destination.
          </h2>
        </div>

        <div className=" xl:mr-10 flex gap-2 bg-white/90 rounded-full p-1 shrink-0">
          <button
            onClick={() => scrollToIndex(index - 1)}
            disabled={index === 0}
            aria-label="Previous story"
            className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-700 disabled:text-neutral-300 hover:bg-neutral-100 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scrollToIndex(index + 1)}
            disabled={index === TRANSPORTS.length - 1}
            aria-label="Next story"
            className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-900 disabled:text-neutral-300 hover:bg-neutral-100 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex md:ml-30 lg:ml-50 gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {TRANSPORTS.map((t) => (
          <article
            key={t.name}
            ref={addCardRef}
            className="snap-start shrink-0 w-[85%] sm:w-[640px] bg-white rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-[240px_1fr] text-neutral-900"
          >
            <div
              className="relative h-56 sm:h-full bg-neutral-200 bg-cover bg-center"
              style={{ backgroundImage: `url(${t.photo})` }}
            >
              <div className="absolute top-4 left-4 flex items-center gap-1.5 text-white font-semibold">
                <span className="text-red-500 text-lg">🌾</span>
                umbrella
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <div className="text-sm font-mono tracking-wide">- {t.name}</div>
                <div className="text-sm opacity-90">{t.location}</div>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex flex-col">
              <div className="flex items-center gap-2 text-xs font-mono tracking-wide text-neutral-500 mb-4">
                <span className="w-1.5 h-1.5 bg-neutral-900 rounded-full" />
                {t.company}
              </div>
              <h3 className="text-2xl sm:text-3xl font-sans mb-4">{t.heading}</h3>
              <p className="text-neutral-600 leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <a
                href="#"
                className="text-sm font-mono tracking-wide underline underline-offset-4 mb-auto"
              >
                RÉSERVER CE SERVICE
              </a>
              <div className="mt-8">
                <div className="text-5xl font-sans">{t.rating}</div>
                <div className="text-xs font-mono tracking-wide text-neutral-500 mt-1">
                  AVIS CLIENTS
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function TransportHero() {
  return (
    <>
      <Navbar />
      <section className={`${SECTION_WIDTH} flex items-center overflow-hidden`}>
        <CustomerStoriesCarousel />
      </section>
    </>
  )
}

function Transport() {

  return (
    <main
      className="relative overflow-hidden w-full bg-[#D5E8E2] pt-0 pb-16 md:pb-24 flex flex-col items-center"
    >
      <div className="absolute inset-0 bg-[#D5E8E2]" />

      <div className="relative z-10 w-full flex flex-col items-center">
        <TransportHero />

      </div>
    </main>
  )
}

export default Transport