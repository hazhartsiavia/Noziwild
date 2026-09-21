import React, { useState, useRef, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import NosyLonjo from "../assets/images/NosyLonjo.png";
import Ambanja from "../assets/images/Ambanja.png";
import NosyIranja from "../assets/images/NosyIranja.png";

gsap.registerPlugin(ScrollTrigger)

/* Constantes partagées : mêmes valeurs que dans les autres sections */
const SECTION_WIDTH = "w-[90vw] lg:max-w-[90vw] xl:max-w-[95vw]"
const SECTION_TITLE = "text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-slate-900 leading-[1.15] tracking-tight"
const SECTION_SUBTITLE = "text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed w-[100%] text-end"

const AUTOPLAY_MS = 5000 // change de témoignage toutes les 5 s, jusqu'au premier clic du visiteur

/* ---------------------------- Données ---------------------------- */

const section = {
  title: 'What Our Travelers Say ?',
  text: 'Real stories from the people who trusted us with their journey.',
}

// Ajoute autant de témoignages que tu veux (les avis ci-dessous sont des exemples inventés).
// `src` : idéalement le portrait du voyageur ou une photo de son voyage.
const testimonials = [
  {
    quote:
      "Every detail of our trip was taken care of. The guide knew the northern bays like the back of his hand, and we found places we would never have discovered alone. We are already planning our return!",
    name: 'Camille Laurent',
    designation: 'Traveler from France',
    src: NosyLonjo,
  },
  {
    quote:
      "From the first message to the last sunset, the team was friendly and always available. Booking was simple, the stays were beautiful and the whole journey felt effortless. Highly recommended!",
    name: 'Daniel Foster',
    designation: 'Adventure Traveler',
    src: Ambanja,
  },
  {
    quote:
      "We travelled as a family and everyone found something to love. The pace was perfect, the guides were wonderful with the kids, and the islands were even more beautiful than in the photos.",
    name: 'Aina Rasoa',
    designation: 'Family Trip',
    src: NosyIranja,
  },
]

// Chiffres clés de la 3e colonne (valeurs d'exemple à remplacer : `value` = nombre, le "+" est ajouté tout seul)
const stats = [
  { id: 1, value: 120, label: 'Destinations across the island' },
  { id: 2, value: 5000, label: 'Happy travelers' },
  { id: 3, value: 15, label: 'Years of experience' },
  { id: 4, value: 40, label: 'Local expert guides' },
]

const formatStat = (number) => `+${Math.round(number).toLocaleString('en-US')}`

/* ---------------------------- Utilitaires ---------------------------- */

// Espace entre les cartes empilées, selon la largeur du conteneur (même calcul que l'original)
function calculateGap(width) {
  const minWidth = 1024
  const maxWidth = 1456
  const minGap = 60
  const maxGap = 86

  if (width <= minWidth) return minGap
  if (width >= maxWidth) return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth))

  return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth))
}

const ChevronLeft = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
)

const ChevronRight = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
  </svg>
)

/* -------------------------- Composant --------------------------- */

function Testimonials() {
  const total = testimonials.length

  const [activeIndex, setActiveIndex] = useState(0) // pilote les cartes (image)
  const [shownIndex, setShownIndex] = useState(0)   // pilote le texte (change après son fondu de sortie)
  const [autoplay, setAutoplay] = useState(true)

  const rootRef = useRef(null)
  const imageContainerRef = useRef(null)
  const imageRefs = useRef([])
  const textRef = useRef(null)
  const statsRef = useRef(null)

  const hasPlacedRef = useRef(false)
  const prevIndexRef = useRef(0)
  const placeRef = useRef(null)

  // Visiteur qui a demandé de réduire les animations : pas de mouvement, pas d'autoplay
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const dur = (seconds) => (reduceMotion ? 0 : seconds)

  const current = testimonials[shownIndex]

  const go = (direction) => {
    setAutoplay(false) // le visiteur prend la main : on arrête l'autoplay
    setActiveIndex((index) => (index + direction + total) % total)
  }

  /* Cartes empilées en 3D + fondu de sortie du texte */
  useGSAP(() => {
    const place = (duration) => {
      const container = imageContainerRef.current
      if (!container) return

      const gap = calculateGap(container.offsetWidth)
      const maxStickUp = gap * 0.8 // 80% de l'espace calculé

      imageRefs.current.forEach((img, index) => {
        if (!img) return

        const offset = (index - activeIndex + total) % total
        const stickUp = `-${(maxStickUp / img.offsetHeight) * 100}%`

        let vars
        let zIndex
        if (offset === 0) {
          // carte active : devant, au centre
          vars = { x: '0%', y: '0%', rotateY: 0, scale: 1 }
          zIndex = total
        } else if (offset === 1) {
          // carte suivante : derrière, à droite
          vars = { x: '20%', y: stickUp, rotateY: -15, scale: 0.85 }
          zIndex = total - offset
        } else if (offset === total - 1) {
          // carte précédente : derrière, à gauche
          vars = { x: '-20%', y: stickUp, rotateY: 15, scale: 0.85 }
          zIndex = total - offset
        } else {
          // s'il y a plus de 3 témoignages, les autres restent cachées derrière la carte active
          vars = { x: '0%', y: stickUp, rotateY: 0, scale: 0.75 }
          zIndex = 0
        }

        gsap.to(img, {
          ...vars,
          zIndex,
          opacity: 1,
          duration,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      })
    }

    // Première fois : on place les cartes sans animation
    const isFirst = !hasPlacedRef.current
    hasPlacedRef.current = true
    place(isFirst ? 0 : dur(0.8))
    placeRef.current = place

    // Changement de témoignage : le texte s'efface, puis on affiche le nouveau
    if (prevIndexRef.current !== activeIndex) {
      prevIndexRef.current = activeIndex

      gsap.killTweensOf(textRef.current)
      gsap.to(textRef.current, {
        opacity: 0,
        y: -20,
        duration: dur(0.3),
        ease: 'power2.in',
        onComplete: () => setShownIndex(activeIndex),
      })
    }
  }, { dependencies: [activeIndex], scope: rootRef })

  /* Apparition du nouveau texte : nom + poste + citation, puis les mots un par un */
  useGSAP(() => {
    const words = gsap.utils.toArray('.quote-word', textRef.current)

    gsap.fromTo(
      textRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: dur(0.3), ease: 'power2.out' }
    )
    gsap.from(words, {
      opacity: 0,
      y: 10,
      stagger: reduceMotion ? 0 : 0.02,
      duration: dur(0.2),
      ease: 'power2.out',
    })
  }, { dependencies: [shownIndex], scope: rootRef })

  /* Chiffres clés : ils comptent de 0 à leur valeur, une seule fois, quand la colonne arrive à l'écran */
  useGSAP(() => {
    if (reduceMotion) return // on garde les valeurs finales

    const nodes = gsap.utils.toArray('.stat-value', statsRef.current)

    nodes.forEach((node) => {
      const end = Number(node.dataset.value)
      const counter = { value: 0 }
      node.textContent = formatStat(0)

      gsap.to(counter, {
        value: end,
        duration: 1.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: node, start: 'top 90%', once: true },
        onUpdate: () => { node.textContent = formatStat(counter.value) },
      })
    })
  }, { scope: rootRef })

  /* Autoplay : s'arrête au premier clic sur une flèche */
  useEffect(() => {
    if (!autoplay || reduceMotion) return
    const id = setInterval(() => {
      setActiveIndex((index) => (index + 1) % total)
    }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [autoplay, reduceMotion, total])

  /* Redimensionnement de la fenêtre : on recalcule les positions sans animation */
  useEffect(() => {
    const onResize = () => placeRef.current?.(0)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const arrowClass =
    "w-10 h-10 rounded-full bg-[#141414] text-slate-100 flex items-center justify-center " +
    "hover:bg-[#C49849] hover:text-white transition-colors " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]"

  return (
    <section className="w-full mt-[15px] md:mt-10 py-12 md:py-[80px] flex flex-col items-center bg-[#D5E8E2]">
      <div ref={rootRef} className={SECTION_WIDTH}>

        {/* En-tête (supprime ce bloc pour garder uniquement les témoignages) */}
        <div className="text-end mb-10 md:mb-20">
          <h2 className={SECTION_TITLE}>{section.title}</h2>
          <p className={`${SECTION_SUBTITLE} mt-3 md:mt-4`}>{section.text}</p>
        </div>

        <div className="max-w-[90vw] lg:max-w-[80vw] md:mt-[20px] mx-auto grid gap-12 md:gap-10 lg:gap-20 md:grid-cols-3">

          {/* Cartes empilées en 3D */}
          <div ref={imageContainerRef} className="relative w-full h-96 [perspective:1000px]">
            {testimonials.map((testimonial, index) => (
              <img
                key={testimonial.name}
                ref={(element) => { imageRefs.current[index] = element }}
                src={testimonial.src}
                alt={testimonial.name}
                draggable={false}
                className="absolute inset-0 w-full h-full object-cover rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
              />
            ))}
          </div>

          {/* Texte + flèches */}
          <div className="flex flex-col justify-between">
            <div ref={textRef} aria-live="polite">
              <h3 className="text-2xl font-medium text-slate-900 mb-1">{current.name}</h3>
              <p className="text-sm text-slate-500 mb-8">{current.designation}</p>
              <p className="text-base md:text-lg leading-relaxed text-slate-600">
                {current.quote.split(' ').map((word, i) => (
                  <React.Fragment key={`${shownIndex}-${i}`}>
                    <span className="quote-word inline-block">{word}</span>{' '}
                  </React.Fragment>
                ))}
              </p>
            </div>

            <div className="flex gap-4 pt-12 md:pt-0">
              <button type="button" onClick={() => go(-1)} aria-label="Previous testimonial" className={arrowClass}>
                <ChevronLeft />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next testimonial" className={arrowClass}>
                <ChevronRight />
              </button>
            </div>
          </div>

          {/* Chiffres clés */}
          <div
            ref={statsRef}
            className="grid grid-cols-2 md:grid-cols-1 gap-x-6 gap-y-8 md:gap-y-0
                       md:border-l md:border-slate-400 md:pl-6 lg:pl-10 md:divide-y md:divide-slate-200"
          >
            {stats.map((stat) => (
              <div key={stat.id} className="md:py-6 md:first:pt-0 md:last:pb-0">
                <p
                  className="stat-value text-3xl md:text-4xl lg:text-5xl leading-none text-slate-800 tabular-nums"
                  data-value={stat.value}
                >
                  {formatStat(stat.value)}
                </p>
                <p className="mt-2 text-sm md:text-base leading-snug text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}

export default Testimonials