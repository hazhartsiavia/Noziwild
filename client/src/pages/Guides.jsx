import React, { useLayoutEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import Video from '../assets/videos/video.mp4'
import { Compass, Languages, Users, ShieldCheck, Binoculars, ChevronDown } from 'lucide-react'
import Footer from '../components/Footer'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ------------------------------------------------------------------
   DONNÉES
------------------------------------------------------------------- */

const posts = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=85",
    tagColor: "#3f7d4a",
    tagLabel: "Faune & flore",
    author: "https://i.pravatar.cc/100?img=47",
    title: ["Sur les traces", "des lémuriens"],
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1544006659-f0b21884ce1d?auto=format&fit=crop&w=800&q=85",
    tagColor: "#08bdd0",
    tagLabel: "Langues",
    author: "https://i.pravatar.cc/100?img=32",
    title: ["Comprendre", "le malgache en", "quelques mots"],
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=85",
    tagColor: "#8500ee",
    tagLabel: "Portrait",
    author: "https://i.pravatar.cc/100?img=68",
    title: ["Rencontre avec", "un guide du Nord"],
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1516815231560-8f41ec531527?auto=format&fit=crop&w=800&q=85",
    tagColor: "#ffae00",
    tagLabel: "Sécurité",
    author: null,
    title: ["Voyager", "accompagné,", "en confiance"],
  },
]

const SLIDER_COUNT = 4
const ACTIVE_SLIDE = 2

const recentGuides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=85",
    title: ["Hery, guide", "naturaliste"],
    featured: true,
    span: "md:col-span-7",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&w=1200&q=85",
    title: ["Fara, accompagnatrice", "multi-jours"],
    featured: true,
    span: "md:col-span-5",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=85",
    title: ["Tojo,", "interprète"],
    featured: false,
    span: "md:col-span-2",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1544006659-f0b21884ce1d?auto=format&fit=crop&w=900&q=85",
    title: ["Nirina, guide", "de plongée", "certifiée"],
    featured: false,
    span: "md:col-span-4",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1516815231560-8f41ec531527?auto=format&fit=crop&w=900&q=85",
    title: ["Solo, guide", "de randonnée"],
    featured: false,
    span: "md:col-span-3",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&w=900&q=85",
    title: ["Mialy, cheffe", "d'équipe terrain"],
    featured: false,
    span: "md:col-span-3",
  },
]

const guideTypes = [
  {
    id: "local",
    icon: Compass,
    title: "Guide local francophone",
    tagline: "Le bon interlocuteur, du premier au dernier jour",
    duration: "1 jour à 3 semaines",
    price: "70 000 Ar / jour",
    description:
      "Un guide qui connaît sa région dans le détail : itinéraires, bonnes adresses, contacts locaux, et une vraie conversation en français tout au long du séjour.",
    image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "naturaliste",
    icon: Binoculars,
    title: "Guide naturaliste",
    tagline: "Faune, flore et parcs nationaux",
    duration: "Demi-journée à 5 jours",
    price: "90 000 Ar / jour",
    description:
      "Spécialisé dans les parcs et réserves, il repère lémuriens, caméléons et oiseaux là où un œil non averti ne verrait rien.",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "accompagnateur",
    icon: Users,
    title: "Accompagnateur multi-jours",
    tagline: "Un référent unique sur tout le circuit",
    duration: "3 à 21 jours",
    price: "85 000 Ar / jour",
    description:
      "Présent du premier au dernier kilomètre, il coordonne logement, transport et activités pour que vous n'ayez qu'à profiter du voyage.",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "interprete",
    icon: Languages,
    title: "Interprète & médiateur culturel",
    tagline: "Comprendre, échanger, être compris",
    duration: "À la demi-journée",
    price: "50 000 Ar / demi-journée",
    description:
      "Utile pour les échanges avec les communautés locales, un marché, une cérémonie traditionnelle ou une rencontre organisée.",
    image: "https://images.unsplash.com/photo-1544006659-f0b21884ce1d?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "securite",
    icon: ShieldCheck,
    title: "Accompagnement sécurité",
    tagline: "Pour les zones isolées ou les treks engagés",
    duration: "1 à 10 jours",
    price: "100 000 Ar / jour",
    description:
      "Formé aux premiers secours et aux itinéraires reculés, il encadre les treks en montagne, en forêt ou dans les zones peu fréquentées.",
    image: "https://images.unsplash.com/photo-1516815231560-8f41ec531527?auto=format&fit=crop&w=1200&q=85",
  },
]

/* ------------------------------------------------------------------
   PLAY BUTTON (cohérence visuelle avec Transport / Hébergement)
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
   GUIDE CARD
------------------------------------------------------------------- */

function GuideCard({ guide }) {
  return (
    <div
      className={`recent-guide group relative overflow-hidden h-[280px] md:h-[330px] ${guide.span || ""}`}
    >
      <img
        src={guide.image}
        alt={guide.title.join(" ")}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,.35)_0%,rgba(0,0,0,0)_30%)]" />

      {guide.featured && (
        <span className="absolute top-0 right-0 z-10 bg-[#C49849] text-white text-xs font-semibold px-4 py-2">
          Profil vérifié
        </span>
      )}

      <h3 className="absolute top-4 left-4 z-10 text-white text-lg font-extrabold leading-snug">
        {guide.title.map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < guide.title.length - 1 && <br />}
          </React.Fragment>
        ))}
      </h3>

      <PlayButton />
    </div>
  )
}

/* ------------------------------------------------------------------
   RECENT GUIDES (portraits de guides / équipe terrain)
------------------------------------------------------------------- */

function RecentGuides() {
  const topRow = recentGuides.slice(0, 2)
  const bottomRow = recentGuides.slice(2)

  return (
    <section
      className="recent-guides-section relative bg-white px-6 sm:px-8 lg:pl-20 lg:pr-14 py-16 lg:py-20 overflow-hidden"
    >
      <div className="recent-guides-header max-w-[720px]">
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-none mb-5">
          Notre équipe sur le terrain
        </h2>

        <p className="text-[#6b7280] text-[15px] leading-relaxed mb-5">
          Chaque guide est originaire de la région qu'il fait découvrir,
          formé aux premiers secours et référencé après vérification de
          son expérience.
        </p>

        <button
          type="button"
          className="flex items-center gap-3 text-xs font-semibold tracking-wide text-[#9ca3af] hover:text-[#6b7280] transition"
        >
          VOIR TOUTE L'ÉQUIPE

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

      <div className="recent-guide-row mt-10 grid grid-cols-1 md:grid-cols-12 gap-4">
        {topRow.map((guide) => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>

      <div className="recent-guide-row mt-4 grid grid-cols-1 md:grid-cols-12 gap-4">
        {bottomRow.map((guide) => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------
   GUIDE SELECTOR (équivalent du TransportSelector / AccommodationSelector)
------------------------------------------------------------------- */

function GuideSelector() {
  const [activeId, setActiveId] = useState(guideTypes[0].id)

  const handleSelect = (id) => {
    if (id === activeId) return

    gsap.to(".guide-selected-content", {
      opacity: 0,
      x: -20,
      duration: 0.15,
      ease: "power2.in",
      onComplete: () => {
        setActiveId(id)

        requestAnimationFrame(() => {
          gsap.fromTo(
            ".guide-selected-content",
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
    <section className="guide-section bg-white px-6 sm:px-8 lg:pl-20 lg:pr-14 py-16 lg:pb-20 lg:pt-0">
      <div className="guide-header w-full mb-10">
        <p className="w-full text-end text-xs font-semibold tracking-wide text-[#9ca3af] uppercase mb-3">
          Nos accompagnements
        </p>

        <h2 className="w-full text-end text-4xl sm:text-5xl font-black tracking-tight leading-none mb-5">
          Choisissez votre accompagnement
        </h2>

        <p className="text-[#6b7280] w-full text-end text-[15px] leading-relaxed">
          Guide local, naturaliste, accompagnateur multi-jours, interprète
          ou encadrement sécurité : sélectionnez une formule pour voir son
          rôle, sa durée et son tarif.
        </p>
      </div>

      <div className="guide-box grid grid-cols-1 lg:grid-cols-2 w-full min-h-[560px] overflow-hidden border border-[#eee]">
        {/* LEFT */}
        <div className="relative bg-white flex flex-col justify-center items-start py-10 px-6 md:px-10">
          <div className="guide-list w-full flex flex-col gap-3">
            {guideTypes.map((t) => {
              const Icon = t.icon
              const isActive = activeId === t.id

              return (
                <div
                  key={t.id}
                  className={`guide-item border transition-colors ${
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
          {guideTypes.map((t) => (
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

          {guideTypes.map((t) => (
            activeId === t.id && (
              <div
                key={t.id}
                className="guide-selected-content absolute bottom-6 left-6 right-6 text-white"
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
   BARRE DE RECHERCHE — adaptée à l'accompagnement
   (Destination / Date / Langue / Nombre de personnes)
------------------------------------------------------------------- */

function SearchBar() {
  return (
    <div className="search-bar bg-white/95 backdrop-blur-sm w-full flex flex-col sm:flex-row items-stretch sm:items-end gap-4 p-5 shadow-[0_20px_50px_rgba(0,0,0,.15)]">
      <label className="flex-1 min-w-[140px]">
        <span className="block text-xs font-semibold text-[#9ca3af] mb-1">
          Région à explorer
        </span>
        <input
          type="text"
          placeholder="Andasibe, Isalo, Diego…"
          className="w-full border-b border-[#e5e7eb] focus:border-[#C49849] outline-none py-2 text-[#202020] placeholder:text-[#9ca3af]"
        />
      </label>

      <label className="min-w-[130px]">
        <span className="block text-xs font-semibold text-[#9ca3af] mb-1">
          Date de départ
        </span>
        <input
          type="date"
          className="w-full border-b border-[#e5e7eb] focus:border-[#C49849] outline-none py-2 text-[#202020]"
        />
      </label>

      <label className="min-w-[140px]">
        <span className="block text-xs font-semibold text-[#9ca3af] mb-1">
          Langue souhaitée
        </span>
        <select
          defaultValue="Français"
          className="w-full border-b border-[#e5e7eb] focus:border-[#C49849] outline-none py-2 text-[#202020] bg-transparent"
        >
          <option>Français</option>
          <option>Anglais</option>
          <option>Malgache</option>
          <option>Italien</option>
        </select>
      </label>

      <label className="min-w-[90px]">
        <span className="block text-xs font-semibold text-[#9ca3af] mb-1">
          Personnes
        </span>
        <input
          type="number"
          min="1"
          defaultValue={2}
          className="w-full border-b border-[#e5e7eb] focus:border-[#C49849] outline-none py-2 text-[#202020]"
        />
      </label>

      <button
        type="button"
        className="shrink-0 bg-[#C49849] hover:bg-[#b3873f] transition-colors text-white font-semibold px-6 py-3 flex items-center justify-center gap-2"
      >
        Trouver un guide
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------
   PAGE
------------------------------------------------------------------- */

export default function Guides() {
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

      gsap.from(".search-bar", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        delay: 0.25,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".search-bar",
          start: "top 92%",
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
         RECENT GUIDES
      ============================================================ */

      gsap.from(".recent-guides-header", {
        y: 70,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".recent-guides-section",
          start: "top 75%",
          toggleActions: "play none none none",
        },
      })

      gsap.from(".recent-guide-row:first-of-type .recent-guide", {
        y: 90,
        opacity: 0,
        scale: 0.97,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".recent-guide-row:first-of-type",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      })

      gsap.from(".recent-guide-row:last-of-type .recent-guide", {
        y: 80,
        opacity: 0,
        scale: 0.97,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".recent-guide-row:last-of-type",
          start: "top 90%",
          toggleActions: "play none none none",
        },
      })

      /* ============================================================
         GUIDE SECTION
      ============================================================ */

      gsap.from(".guide-header", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".guide-section",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      })

      gsap.from(".guide-box", {
        y: 90,
        opacity: 0,
        scale: 0.98,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".guide-box",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      })

      gsap.from(".guide-item", {
        x: -50,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".guide-list",
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
                Andasibe, Madagascar
              </h2>

              <p className="hero-description max-w-[490px] text-[17px] leading-[1.65] font-semibold">
                Un guide qui connaît la forêt mieux que quiconque, à vos côtés
                du premier au dernier pas.
              </p>

              <div className="hero-readmore mt-[70px] flex items-center gap-4 text-sm font-bold cursor-pointer group">
                <span>RENCONTRER L'ÉQUIPE</span>

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
                Voir plus loin
                <br />
                que ce que
                <br />
                vous verriez seul
              </h1>

              <p className="main-description mt-5 text-xl max-w-[560px]">
                Nos guides et accompagnateurs connaissent leur région de
                l'intérieur : ils ouvrent des portes que le voyage en solo
                ne peut pas ouvrir.
              </p>

              <div className="main-search mt-10">
                <SearchBar />
              </div>

              {/* Featured posts */}

              <section className="mt-16 lg:mt-[72px]">
                <h3 className="featured-title text-xl font-extrabold mb-6">
                  Récits et conseils de terrain
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

        <RecentGuides />

        <GuideSelector />

        <Footer />
      </div>
    </>
  )
}