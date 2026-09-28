import React, { useLayoutEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import Video from '../assets/videos/video.mp4'
import { Car, Ship, Zap, Mountain, Bike, ChevronDown } from 'lucide-react'
import NoziwildCar from '../assets/images/NoziwildCar.png'
import NoziwildBoat from '../assets/images/NoziwildBoat.png'
import Footer from '../components/Footer'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ------------------------------------------------------------------
   DONNÉES
------------------------------------------------------------------- */

const advantages = [
  {
    title: "TRANSPORT ADAPTÉ",
    text: "Des véhicules choisis selon votre itinéraire et vos besoins.",
    value: "100%",
  },
  {
    title: "CONFORT & SÉCURITÉ",
    text: "Un transport pensé pour voyager sereinement à chaque étape.",
    value: "24/7",
  },
  {
    title: "EXPÉRIENCE LOCALE",
    text: "Des solutions adaptées aux routes et aux réalités de Madagascar.",
    value: "+10",
  },
  {
    title: "LIBERTÉ DE VOYAGE",
    text: "Plus de flexibilité pour construire votre aventure à votre rythme.",
    value: "∞",
  },
];

const posts = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=85",
    tagColor: "#ff0050",
    tagLabel: "Experience",
    author: "https://i.pravatar.cc/100?img=47",
    title: ["Japan Like", "You've Never", "Seen It"],
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=800&q=85",
    tagColor: "#08bdd0",
    tagLabel: "Inspiration",
    author: "https://i.pravatar.cc/100?img=32",
    title: ["Africa's People", "and Culture"],
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=85",
    tagColor: "#8500ee",
    tagLabel: "Culture",
    author: "https://i.pravatar.cc/100?img=12",
    title: ["India's People,", "Places and", "Events"],
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=800&q=85",
    tagColor: "#ffae00",
    tagLabel: "Places",
    author: null,
    title: ["Thailand's", "Diverse Island"],
  },
]

const SLIDER_COUNT = 4
const ACTIVE_SLIDE = 1

const recentVideos = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=85",
    title: ["New Zealand's", "Vast Land"],
    featured: true,
    span: "md:col-span-7",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=85",
    title: ["New York City", "Views"],
    featured: true,
    span: "md:col-span-5",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=85",
    title: ["Discovering", "Greece"],
    featured: false,
    span: "md:col-span-2",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1516815231560-8f41ec531527?auto=format&fit=crop&w=900&q=85",
    title: ["The Most", "Beautiful Island", "in the World"],
    featured: false,
    span: "md:col-span-4",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=85",
    title: ["My Vietnam Trip"],
    featured: false,
    span: "md:col-span-3",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=900&q=85",
    title: ["A Castle On an", "Island"],
    featured: false,
    span: "md:col-span-3",
  },
]

const transportTypes = [
  {
    id: "car",
    icon: Car,
    title: "Voiture 4x4",
    tagline: "Liberté et confort sur la route",
    duration: "1 à 8 jours",
    price: "80 000 Ar / jour",
    description:
      "Parcourez le Nord de Madagascar à votre rythme, avec chauffeur ou en autonomie, sur des circuits adaptés à tous les terrains.",
    image: NoziwildCar,
  },
  {
    id: "boat",
    icon: Ship,
    title: "Bateau",
    tagline: "Îles, lagons et eaux turquoise",
    duration: "Demi-journée à 3 jours",
    price: "120 000 Ar / trajet",
    description:
      "Traversez la côte et rejoignez les îles environnantes à bord de nos bateaux, pour une expérience maritime unique.",
    image: NoziwildBoat,
  },
  {
    id: "moto",
    icon: Zap,
    title: "Moto",
    tagline: "Pistes et sensations fortes",
    duration: "2h à 1 journée",
    price: "60 000 Ar / jour",
    description:
      "Explorez les pistes reculées et les petits villages à moto, pour les amateurs de sensations et de liberté.",
    image: NoziwildCar,
  },
  {
    id: "quad",
    icon: Mountain,
    title: "Quad",
    tagline: "Hors des sentiers battus",
    duration: "1h à demi-journée",
    price: "90 000 Ar / session",
    description:
      "Affrontez dunes, pistes sablonneuses et reliefs accidentés à bord de nos quads, encadrés par un guide local.",
    image: NoziwildBoat,
  },
  {
    id: "bike",
    icon: Bike,
    title: "Bicyclette",
    tagline: "Balades à votre rythme",
    duration: "1h à 1 journée",
    price: "20 000 Ar / jour",
    description:
      "Découvrez les environs à vélo, une manière simple et écologique d'explorer villages et paysages côtiers.",
    image: NoziwildCar,
  },
]

function TransportAdvantages() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".advantage-card");

      gsap.fromTo(
        cards,
        {
          y: 70,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full px-5 sm:px-8 lg:px-10 py-16 lg:py-24"
    >
      <div className="mx-auto max-w-[1440px] overflow-hidden rounded-[28px] bg-[#F5F3EF]">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 p-8 sm:p-12 lg:p-16 xl:p-[64px]">

          {/* =========================
              COLONNE GAUCHE
          ========================= */}
          <div className="flex flex-col justify-end min-h-[420px] lg:min-h-[560px]">

            <div className="max-w-xl">
              <p className="mb-8 text-xs sm:text-sm font-medium tracking-[0.18em] text-[#5B5B5B]">
                VOS AVANTAGES
              </p>

              <h2 className="text-4xl sm:text-5xl lg:text-[56px] xl:text-[64px] font-medium leading-[0.98] tracking-[-0.04em] text-[#0F0F0F]">
                Voyager à Madagascar,
                <br />
                simplement.
              </h2>

              <p className="mt-8 max-w-lg text-base sm:text-lg leading-relaxed text-[#5B5B5B]">
                Profitez de solutions de transport pensées pour vous
                accompagner confortablement et librement tout au long
                de votre voyage.
              </p>
            </div>
          </div>

          {/* =========================
              GRILLE DROITE
          ========================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {advantages.map((advantage, index) => (
              <article
                key={index}
                className="advantage-card group relative flex min-h-[250px] flex-col justify-between rounded-[24px] bg-white p-7 sm:p-8 lg:p-9"
              >
                {/* petit numéro */}
                <span className="text-xs font-medium tracking-[0.15em] text-[#8A8A8A]">
                  0{index + 1}
                </span>

                <div>
                  <h3 className="max-w-[260px] text-sm sm:text-base font-medium uppercase tracking-[0.12em] leading-[1.35] text-[#5B5B5B]">
                    {advantage.title}
                  </h3>

                  <p className="mt-4 max-w-[300px] text-sm leading-relaxed text-[#777]">
                    {advantage.text}
                  </p>
                </div>

                <div className="mt-8 flex items-end justify-between">
                  <span className="text-4xl sm:text-5xl font-light tracking-[-0.04em] text-[#111]">
                    {advantage.value}
                  </span>

                  <span className="text-xl text-[#111] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                    ↗
                  </span>
                </div>
              </article>
            ))}

          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------
   PLAY BUTTON
------------------------------------------------------------------- */

function PlayButton() {
  return (
    <span className="absolute bottom-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white transition-transform duration-300 group-hover:scale-110">
      <span
        className="ml-[3px] w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-l-[11px] border-l-white"
        aria-hidden="true"
      />
    </span>
  )
}

/* ------------------------------------------------------------------
   VIDEO CARD
------------------------------------------------------------------- */

function VideoCard({ video }) {
  return (
    <div
      className={`recent-video group relative overflow-hidden h-[280px] md:h-[330px] ${video.span || ""}`}
    >
      <img
        src={video.image}
        alt={video.title.join(" ")}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,.35)_0%,rgba(0,0,0,0)_30%)]" />

      {video.featured && (
        <span className="absolute top-0 right-0 z-10 bg-[#3156e8] text-white text-xs font-semibold px-4 py-2">
          Featured
        </span>
      )}

      <h3 className="absolute top-4 left-4 z-10 text-white text-lg font-extrabold leading-snug">
        {video.title.map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < video.title.length - 1 && <br />}
          </React.Fragment>
        ))}
      </h3>

      <PlayButton />
    </div>
  )
}

/* ------------------------------------------------------------------
   RECENT VIDEOS
------------------------------------------------------------------- */

function RecentVideos() {
  const topRow = recentVideos.slice(0, 2)
  const bottomRow = recentVideos.slice(2)

  return (
    <section
      className="recent-videos-section relative bg-white px-6 sm:px-8 lg:pl-20 lg:pr-14 py-16 lg:py-20 overflow-hidden"
    >
      <div className="recent-videos-header max-w-[720px]">
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-none mb-5">
          Recent Videos
        </h2>

        <p className="text-[#6b7280] text-[15px] leading-relaxed mb-5">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Suspendisse varius enim in eros elementum tristique.
          Duis cursus, mi quis viverra ornare, eros dolor interdum nulla,
          ut commodo diam libero vitae erat.
        </p>

        <button
          type="button"
          className="flex items-center gap-3 text-xs font-semibold tracking-wide text-[#9ca3af] hover:text-[#6b7280] transition"
        >
          VIEW ALL

          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#d1d5db]">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                d="M9 6l6 6-6 6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>

      <div className="hidden lg:block absolute top-0 right-4 pointer-events-none">
        <svg
          width="60"
          height="40"
          viewBox="0 0 60 40"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 36 L48 4"
            stroke="#09b8ce"
            strokeWidth="4"
            strokeLinecap="round"
          />

          <path
            d="M32 4 H48 V20"
            stroke="#09b8ce"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>

        <span className="block w-2 h-2 rounded-full bg-[#3156e8] mt-4 ml-11" />
        <span className="block w-2.5 h-2.5 rounded-full bg-[#3156e8] mt-6 ml-14" />
      </div>

      <div className="recent-video-row mt-10 grid grid-cols-1 md:grid-cols-12 gap-4">
        {topRow.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

      <div className="recent-video-row mt-4 grid grid-cols-1 md:grid-cols-12 gap-4">
        {bottomRow.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------
   TRANSPORT SELECTOR
------------------------------------------------------------------- */

function TransportSelector() {
  const [activeId, setActiveId] = useState(transportTypes[0].id)

  const handleSelect = (id) => {
    if (id === activeId) return

    gsap.to(".transport-selected-content", {
      opacity: 0,
      x: -20,
      duration: 0.15,
      ease: "power2.in",
      onComplete: () => {
        setActiveId(id)

        requestAnimationFrame(() => {
          gsap.fromTo(
            ".transport-selected-content",
            {
              opacity: 0,
              x: 20,
            },
            {
              opacity: 1,
              x: 0,
              duration: 0.45,
              ease: "power3.out",
            }
          )
        })
      },
    })
  }

  return (
    <section className="transport-section bg-white px-6 sm:px-8 lg:pl-20 lg:pr-14 py-16 lg:pb-20 lg:pt-0">
      <div className="transport-header w-full mb-10">
        <p className="w-full text-end text-xs font-semibold tracking-wide text-[#9ca3af] uppercase mb-3">
          Nos transports
        </p>

        <h2 className="w-full text-end text-4xl sm:text-5xl font-black tracking-tight leading-none mb-5">
          Choisissez votre transport
        </h2>

        <p className="text-[#6b7280] w-full text-end text-[15px] leading-relaxed">
          Voiture, bateau, moto, quad ou bicyclette : sélectionnez un mode de
          transport pour voir son tarif, sa durée, et un aperçu en image.
        </p>
      </div>

      <div className="transport-box grid grid-cols-1 lg:grid-cols-2 w-full min-h-[560px] overflow-hidden border border-[#eee]">
        {/* LEFT */}
        <div className="relative bg-white flex flex-col justify-center items-start py-10 px-6 md:px-10">
          <div className="transport-list w-full flex flex-col gap-3">
            {transportTypes.map((t) => {
              const Icon = t.icon
              const isActive = activeId === t.id

              return (
                <div
                  key={t.id}
                  className={`transport-item border transition-colors ${
                    isActive
                      ? "border-[#C49849] bg-white"
                      : "border-transparent bg-white/60 hover:bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(t.id)}
                    aria-expanded={isActive}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          isActive
                            ? "bg-[#C49849] text-white"
                            : "bg-[#C49849]/10 text-[#C49849]"
                        }`}
                      >
                        <Icon size={18} />
                      </span>

                      <span className="min-w-0">
                        <span className="block text-[#202020] font-medium truncate">
                          {t.title}
                        </span>

                        <span className="block text-[#9ca3af] text-xs mt-0.5">
                          {t.duration} · Dès {t.price}
                        </span>
                      </span>
                    </span>

                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-[#9ca3af] transition-transform duration-300 ${
                        isActive ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isActive
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-[#6b7280] text-sm leading-relaxed">
                        {t.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative min-h-[300px] lg:min-h-full overflow-hidden">
          {transportTypes.map((t) => (
            <img
              key={t.id}
              src={t.image}
              alt={t.title}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-out ${
                activeId === t.id ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,.55)_0%,rgba(0,0,0,0)_50%)]" />

          {transportTypes.map((t) => (
            activeId === t.id && (
              <div
                key={t.id}
                className="transport-selected-content absolute bottom-6 left-6 right-6 text-white"
              >
                <p className="text-2xl font-semibold">
                  {t.title}
                </p>

                <p className="text-white/80 text-sm mt-1">
                  {t.tagline} — Dès {t.price}
                </p>
              </div>
            )
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------
   PAGE
------------------------------------------------------------------- */

export default function Transport() {
  const pageRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      /* ============================================================
         HERO — apparition initiale
      ============================================================ */

      const heroTimeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      })

      heroTimeline
        .from(".hero-video", {
          scale: 1.12,
          duration: 1.8,
          ease: "power2.out",
        })
        .from(
          ".hero-title",
          {
            y: 70,
            opacity: 0,
            duration: 1,
          },
          "-=1.1"
        )
        .from(
          ".hero-description",
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.6"
        )
        .from(
          ".hero-readmore",
          {
            y: 20,
            opacity: 0,
            duration: 0.7,
          },
          "-=0.4"
        )
        .from(
          ".hero-dots span",
          {
            scale: 0,
            opacity: 0,
            stagger: 0.1,
            duration: 0.4,
            ease: "back.out(2)",
          },
          "-=0.5"
        )

      /* ============================================================
         HERO — léger mouvement au scroll
      ============================================================ */

      gsap.to(".hero-video", {
        yPercent: 8,
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      })

      gsap.to(".hero-content", {
        y: -80,
        opacity: 0.75,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      })

      /* ============================================================
         MAIN TITLE
      ============================================================ */

      gsap.from(".main-title", {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        scrollTrigger: {
          trigger: ".main-title",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      })

      gsap.from(".main-description", {
        y: 35,
        opacity: 0,
        duration: 0.9,
        delay: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".main-description",
          start: "top 88%",
          toggleActions: "play none none none",
        },
      })

      /* ============================================================
         FEATURED POSTS
      ============================================================ */

      gsap.from(".featured-title", {
        y: 35,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".featured-title",
          start: "top 90%",
          toggleActions: "play none none none",
        },
      })

      gsap.from(".featured-card", {
        y: 80,
        opacity: 0,
        scale: 0.96,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".featured-grid",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      })

      /* ============================================================
         RECENT VIDEOS
      ============================================================ */

      gsap.from(".recent-videos-header", {
        y: 70,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".recent-videos-section",
          start: "top 75%",
          toggleActions: "play none none none",
        },
      })

      gsap.from(".recent-video-row:first-of-type .recent-video", {
        y: 90,
        opacity: 0,
        scale: 0.97,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".recent-video-row:first-of-type",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      })

      gsap.from(".recent-video-row:last-of-type .recent-video", {
        y: 80,
        opacity: 0,
        scale: 0.97,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".recent-video-row:last-of-type",
          start: "top 90%",
          toggleActions: "play none none none",
        },
      })

      /* ============================================================
         TRANSPORT SECTION
      ============================================================ */

      gsap.from(".transport-header", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".transport-section",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      })

      gsap.from(".transport-box", {
        y: 90,
        opacity: 0,
        scale: 0.98,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".transport-box",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      })

      gsap.from(".transport-item", {
        x: -50,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".transport-list",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      })

      /* ============================================================
         FOOTER
      ============================================================ */

      gsap.from("footer", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "footer",
          start: "top 90%",
          toggleActions: "play none none none",
        },
      })

      /* ============================================================
         HOVER — FEATURED CARDS
      ============================================================ */

      const cards = gsap.utils.toArray(".featured-card")

      cards.forEach((card) => {
        const image = card.querySelector("img")

        card.addEventListener("mouseenter", () => {
          gsap.to(image, {
            scale: 1.08,
            duration: 0.7,
            ease: "power3.out",
          })
        })

        card.addEventListener("mouseleave", () => {
          gsap.to(image, {
            scale: 1,
            duration: 0.7,
            ease: "power3.out",
          })
        })
      })

      /* ============================================================
         REFRESH
      ============================================================ */

      ScrollTrigger.refresh()
    }, pageRef)

    return () => ctx.revert()
  }, [])

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="true"
      />

      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      <div
        ref={pageRef}
        className="font-['Montserrat'] bg-white text-[#202020] overflow-x-hidden"
      >
        <Navbar />

        <main className="grid grid-cols-1 lg:grid-cols-[35%_65%] min-h-screen">

          {/* ========================================================
              HERO
          ======================================================== */}

          <section
            className="hero-section relative min-h-[600px] lg:min-h-screen overflow-hidden lg:rounded-tr-[110px]"
          >
            <video
              src={Video}
              className="hero-video absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />

            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_45%,rgba(0,0,0,.45)_100%)]" />

            <div className="hero-content absolute z-10 left-6 right-6 sm:left-16 sm:right-12 bottom-10 text-white">
              <h2 className="hero-title text-[30px] sm:text-[35px] leading-[1.1] font-extrabold mb-5">
                Siwa Oasis, Egypt
              </h2>

              <p className="hero-description max-w-[490px] text-[17px] leading-[1.65] font-semibold">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Suspendisse varius.
              </p>

              <div className="hero-readmore mt-[70px] flex items-center gap-4 text-sm font-bold cursor-pointer group">
                <span>READ MORE</span>

                <span className="text-2xl leading-none transition-transform duration-300 group-hover:translate-x-2">
                  ›
                </span>
              </div>
            </div>

            <div className="hero-dots absolute right-6 sm:right-0 bottom-10 flex gap-2">
              {Array.from({ length: SLIDER_COUNT }).map((_, i) => (
                <span
                  key={i}
                  className={`w-[17px] h-[17px] rounded-full ${
                    i === ACTIVE_SLIDE
                      ? "bg-white"
                      : "bg-white/55"
                  }`}
                />
              ))}
            </div>
          </section>

          {/* ========================================================
              CONTENT
          ======================================================== */}

          <section className="relative overflow-hidden px-6 sm:px-8 lg:pl-20 lg:pr-14 pt-16 lg:pt-[115px] pb-8">
            <div className="max-w-[1100px]">

              <h1 className="main-title text-[42px] sm:text-[52px] lg:text-[clamp(48px,4.3vw,78px)] leading-[1.01] tracking-[-2px] lg:tracking-[-3px] font-black max-w-[760px]">
                Explore
                <br />
                Madagascar
                <br />
                at your own pace
              </h1>

              <p className="main-description mt-5 text-xl">
                Thoughtfully designed journeys to take you between land,
                sea, and unforgettable discoveries.
              </p>

              {/* Featured posts */}

              <section className="mt-16 lg:mt-[72px]">
                <h3 className="featured-title text-xl font-extrabold mb-6">
                  Featured Posts
                </h3>

                <div className="featured-grid grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
                  {posts.map((post) => (
                    <article
                      key={post.id}
                      className="featured-card group relative h-[280px] sm:h-[230px] xl:h-[255px] overflow-hidden rounded-md"
                    >
                      <img
                        src={post.image}
                        alt={post.tagLabel}
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_30%,rgba(0,0,0,.75)_100%)]" />

                      <span
                        className="absolute top-[13px] left-[13px] z-10 text-white text-[13px] font-semibold px-[11px] py-2 rounded-sm"
                        style={{
                          background: post.tagColor,
                        }}
                      >
                        {post.tagLabel}
                      </span>

                      {post.author && (
                        <img
                          src={post.author}
                          alt=""
                          className="absolute top-[13px] right-[13px] z-10 w-[35px] h-[35px] rounded-full border-2 border-white object-cover"
                        />
                      )}

                      <div className="absolute z-10 left-[13px] right-[10px] bottom-[15px] text-white text-[21px] leading-[1.08] font-extrabold">
                        {post.title.map((line, i) => (
                          <React.Fragment key={i}>
                            {line}
                            {i < post.title.length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </section>
        </main>

        <RecentVideos />

        <TransportSelector />
        <TransportAdvantages/>

        <Footer />
      </div>
    </>
  )
}
