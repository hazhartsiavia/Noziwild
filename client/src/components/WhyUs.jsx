import React from 'react'
import NosyLonjo from "../assets/images/NosyLonjo.png";
import Ambanja from "../assets/images/Ambanja.png";

/* Constantes partagées : mêmes valeurs que dans les autres sections */
const SECTION_WIDTH = "w-[90vw] lg:max-w-[90vw] xl:max-w-[95vw]"
const SECTION_TITLE = "text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-slate-900 leading-[1.15] tracking-tight"
const SECTION_SUBTITLE = "text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl"

/* ---------------------------- Icônes ----------------------------- */

// Carré rouge avec une icône blanche
const IconBox = ({ children }) => (
  <div className="size-11 shrink-0 bg-[#C49849] rounded-lg flex items-center justify-center mb-5 text-white">
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  </div>
)

const RouteIcon = () => (
  <IconBox>
    <circle cx="6" cy="19" r="3" />
    <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
    <circle cx="18" cy="5" r="3" />
  </IconBox>
)

const LuggageIcon = () => (
  <IconBox>
    <path d="M6 20a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2" />
    <path d="M8 18V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14" />
    <path d="M10 20v2" />
    <path d="M14 20v2" />
  </IconBox>
)

const HotelIcon = () => (
  <IconBox>
    <path d="M10 22v-6.57" />
    <path d="M14 15.43V22" />
    <path d="M15 16a5 5 0 0 0-6 0" />
    <path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01" />
    <rect x="4" y="2" width="16" height="20" rx="2" />
  </IconBox>
)

const CompassIcon = () => (
  <IconBox>
    <circle cx="12" cy="12" r="10" />
    <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />
  </IconBox>
)

/* ---------------------------- Données ---------------------------- */

const section = {
  badge: 'Our Promise',
  title: 'Why Choose Us ?',
  text: 'Local expertise, honest prices and stress-free planning, from the first idea to the last sunset.',
}

// Une carte avec `image` s'affiche en large (60%), les autres en étroit (40%)
const features = [
  {
    id: 1,
    title: 'Numerous Routes',
    text: 'Explore a wide choice of routes across the island, from northern bays to the highlands, and pick the one that fits your pace.',
    icon: RouteIcon,
    image: NosyLonjo, // à remplacer
    imageAlt: 'A quiet coastal route',
  },
  {
    id: 2,
    title: 'Easy Booking',
    text: 'Book in a few clicks with clear prices and flexible dates, with a team ready to help before, during and after your trip.',
    icon: LuggageIcon,
  },
  {
    id: 3,
    title: 'Handpicked Accommodation',
    text: 'Stay in carefully selected hotels, lodges and guesthouses, chosen for their comfort, their location and their warm welcome.',
    icon: HotelIcon,
  },
  {
    id: 4,
    title: 'Best Tour Guidance',
    text: 'Travel with experienced local guides who share the stories, the food and the hidden places you would never find alone.',
    icon: CompassIcon,
    image: Ambanja, // à remplacer
    imageAlt: 'A guide leading a small group',
  },
]

// 2 rangées de 2 cartes
const rows = [features.slice(0, 2), features.slice(2, 4)]

/* -------------------------- Composants --------------------------- */

function FeatureCard({ feature }) {
  const IconComponent = feature.icon
  const hasImage = Boolean(feature.image)

  const body = (
    <div className="flex flex-col mt-2">
      <IconComponent />
      <h3 className="text-base md:text-lg font-medium text-slate-900">{feature.title}</h3>
      <p className="mt-2.5 text-sm md:text-base leading-relaxed text-slate-600">{feature.text}</p>
    </div>
  )

  // Carte large : image + texte côte à côte
  if (hasImage) {
    return (
      <div className="md:w-[60%] md:min-h-60 border border-slate-500 rounded-xl hover:shadow-sm transition-all duration-300 p-5 flex flex-col md:flex-row gap-5">
        <img
          src={feature.image}
          alt={feature.imageAlt}
          className="w-full h-48 md:h-auto md:w-[45%] object-cover rounded-2xl"
        />
        {body}
      </div>
    )
  }

  // Carte étroite : texte seul
  return (
    <div className="md:w-[40%] border border-slate-500 rounded-xl hover:shadow-sm transition-all duration-300 px-6 py-6 md:pt-7">
      {body}
    </div>
  )
}

function WhyUs() {
  return (
    <section className="w-full py-12 md:py-10 flex flex-col items-center">
      <div className={SECTION_WIDTH}>

        {/* En-tête */}
        <div className="text-start mb-8 md:mb-12">
          <span className="inline-block text-xs sm:text-sm uppercase tracking-wide text-slate-800 bg-[#C49849] rounded-full px-5 py-2">
            {section.badge}
          </span>
          <h2 className={`${SECTION_TITLE} mt-5 md:mt-6`}>{section.title}</h2>
          <p className={`${SECTION_SUBTITLE} mt-3 md:mt-4`}>{section.text}</p>
        </div>

        {/* 2 rangées de cartes */}
        <div className="flex flex-col gap-5">
          {rows.map((row, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-5">
              {row.map((feature) => (
                <FeatureCard key={feature.id} feature={feature} />
              ))}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default WhyUs