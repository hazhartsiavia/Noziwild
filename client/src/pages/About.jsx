import React, { useState } from 'react'
import Deux from "../assets/images/2.jpg";
import Ambanja from "../assets/images/Ambanja.png";
import NosyLonjo from "../assets/images/NosyLonjo.png";
import NosyIranja from "../assets/images/NosyIranja.png";
import Ramena from "../assets/images/Ramena.png";
import Tana from "../assets/images/Tana.png";
import Icone from "../assets/icone.png";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/* Constantes partagées : mêmes valeurs que dans Explore, Choose, Trips et Blog */
const SECTION_WIDTH = "w-[90vw] lg:max-w-[90vw] xl:max-w-[95vw]"
const SECTION_TITLE = "text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-slate-900 leading-[1.15] tracking-tight"
const SECTION_SUBTITLE = "text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl"
const META_TEXT = "text-xs sm:text-sm"

// Propres à cette section
const STATEMENT_TITLE = "text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-medium uppercase leading-[1.15] tracking-tight text-slate-900"
// Même échelle que SECTION_TITLE, en blanc pour être posé sur l'image
const ON_IMAGE_TITLE = "text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-white leading-[1.15] tracking-tight"

/* ---------------------------- Données ---------------------------- */

const content = {
  title: 'Creating Unforgettable Journeys, Together',
  text: 'From the first idea to the last sunset, our team plans every detail so you can simply enjoy the journey.',
  helpLabel: 'Need Help?',
  helpHref: '#contact',
  label: 'Our Promise',
  cardTitle: 'Why Choose Us?',
  image: Deux, // à remplacer par ta photo
  imageAlt: 'A traveler jumping with a backpack',
}

// Avatars de la pastille "Need Help?" : mets `image` pour afficher une vraie photo
const team = [
  { name: 'Ava', image: null, bg: 'bg-rose-200' },
  { name: 'Marc', image: null, bg: 'bg-amber-200' },
  { name: 'Lea', image: null, bg: 'bg-stone-300' },
]

/* ---------------------------- Icônes ----------------------------- */

const Icon = ({ children }) => (
  <svg
    className="w-9 h-9 md:w-12 md:h-12 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
)

const RouteIcon = () => (
  <Icon>
    <circle cx="6" cy="19" r="3" />
    <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
    <circle cx="18" cy="5" r="3" />
  </Icon>
)

const LuggageIcon = () => (
  <Icon>
    <path d="M6 20a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2" />
    <path d="M8 18V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14" />
    <path d="M10 20v2" />
    <path d="M14 20v2" />
  </Icon>
)

const HotelIcon = () => (
  <Icon>
    <path d="M10 22v-6.57" />
    <path d="M14 15.43V22" />
    <path d="M15 16a5 5 0 0 0-6 0" />
    <path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01" />
    <rect x="4" y="2" width="16" height="20" rx="2" />
  </Icon>
)

const CompassIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="10" />
    <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />
  </Icon>
)

const features = [
  { id: 1, title: 'Numerous Routes', icon: RouteIcon },
  { id: 2, title: 'Easy Booking', icon: LuggageIcon },
  { id: 3, title: 'Accommodation', icon: HotelIcon },
  { id: 4, title: 'Best Tour Guidance', icon: CompassIcon },
]

/* ------------------- Section "Our Mission" : icônes + données ------------------- */

// Petites icônes blanches pour les pastilles (vision / mission / valeurs)
const SmallIcon = ({ children }) => (
  <svg
    className="w-5 h-5 md:w-6 md:h-6"
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
)

const FlagIcon = () => (
  <SmallIcon>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" x2="4" y1="22" y2="15" />
  </SmallIcon>
)

const EyeIcon = () => (
  <SmallIcon>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </SmallIcon>
)

const GemIcon = () => (
  <SmallIcon>
    <path d="M6 3h12l4 6-10 13L2 9Z" />
    <path d="M11 3 8 9l4 13 4-13-3-6" />
    <path d="M2 9h20" />
  </SmallIcon>
)

const mission = {
  title: 'Our Mission & What We Believe In',
  text: 'We design journeys around the people who take them, with honest advice, fair prices and local knowledge you can trust.',
  // Les 2 photos "polaroid" (à remplacer)
  photos: [
    { src: Ambanja, alt: 'A smiling traveler exploring a town' },
    { src: NosyLonjo, alt: 'Two friends planning their trip with a map' },
  ],
  // Grande image (à remplacer)
  image: NosyIranja,
  imageAlt: 'A traveler walking along a coastal path',
  stats: [
    { id: 1, value: '160+', label: 'Destinations Worldwide' },
    { id: 2, value: '12+', label: 'Years Travel Expertise' },
  ],
  pillars: [
    { id: 1, label: 'Our Vision', icon: FlagIcon },
    { id: 2, label: 'Our Mission', icon: EyeIcon },
    { id: 3, label: 'Our Value', icon: GemIcon },
  ],
}

/* ------------------- Section "Travel Experts" : données ------------------- */

// Ajoute autant d'experts que tu veux : les boutons prev/next les font défiler en boucle.
// (il en faut au moins 3 pour afficher les deux cartes latérales)
const expertsSection = {
  title: 'Meet Our Travel Experts',
  startIndex: 1, // l'expert affiché au centre au chargement
}

const experts = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Local Experience Curator',
    image: Ambanja,
    bio: 'Sarah builds trips around the places locals actually love, from family-run guesthouses to quiet beaches away from the crowds.',
    phone: '+261 34 00 000 01',
    email: 'sarah@example.com',
  },
  {
    id: 2,
    name: 'James Carter',
    role: 'Adventure Guide',
    image: NosyLonjo,
    bio: 'Lorem ipsum dolor sit amet consectetur. Pharetra proin eget iaculis nulla commodo sem vitae. Odio vulputate pellentesque id leo.',
    phone: '+261 34 00 000 02',
    email: 'james@example.com',
  },
  {
    id: 3,
    name: 'Mark Rivera',
    role: 'Senior Travel Consultant',
    image: NosyIranja,
    bio: 'With more than ten years of planning experience, Mark turns a rough idea into a smooth, well-paced itinerary.',
    phone: '+261 34 00 000 03',
    email: 'mark@example.com',
  },
  {
    id: 4,
    name: 'Lina Rakoto',
    role: 'Cultural Tour Specialist',
    image: Ramena,
    bio: 'Lina shares the history, food and traditions of the island, and connects travelers with the people who keep them alive.',
    phone: '+261 34 00 000 04',
    email: 'lina@example.com',
  },
  {
    id: 5,
    name: 'Hery Andria',
    role: 'Wildlife Guide',
    image: Tana,
    bio: 'Hery leads small-group wildlife walks and knows exactly when and where to find the island’s most unusual animals.',
    phone: '+261 34 00 000 05',
    email: 'hery@example.com',
  },
]

/* -------------------------- Composants --------------------------- */

const ArrowIcon = ({ direction = 'right' }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {direction === 'right'
      ? <path d="M5 12h14M13 6l6 6-6 6" />
      : <path d="M19 12H5M11 6l-6 6 6 6" />}
  </svg>
)

// Badge circulaire "Talk to a Travel Expert"
function TalkBadge() {
  return (
    <div className="relative shrink-0 w-24 h-24 md:w-32 md:h-32 text-slate-700" aria-hidden="true">
      {/* Texte circulaire : tourne lentement (20s par tour). Change la durée ici. */}
      <svg
        viewBox="0 0 140 140"
        className="absolute inset-0 w-full h-full animate-spin [animation-duration:20s] motion-reduce:animate-none"
      >
        <defs>
          <path id="talk-circle" d="M70,70 m-52,0 a52,52 0 1,1 104,0 a52,52 0 1,1 -104,0" />
        </defs>
        <text fontSize="10" fill="currentColor" letterSpacing="0.5">
          <textPath href="#talk-circle" textLength="326" lengthAdjust="spacing">
            Talk to a Travel Expert / Talk to a Travel Expert /
          </textPath>
        </text>
      </svg>

      {/* Icône au centre : reste fixe */}
      <span className="absolute inset-0 m-auto w-[48%] h-[48%] rounded-full flex items-center justify-center text-white">
        <img src={Icone} alt="" className="w-[64px] h-[64px] object-contain" />
      </span>
    </div>
  )
}

// Pastille "Need Help?" + avatars
function HelpPill() {
  return (
    <a
      href={content.helpHref}
      className="inline-flex items-center gap-5 md:gap-8 self-start rounded-full bg-slate-800 hover:bg-slate-700 transition text-white pl-6 pr-2.5 py-2.5 md:pl-7 md:py-3"
    >
      <span className="text-lg md:text-xl font-medium">{content.helpLabel}</span>
      <span className="flex items-center">
        {team.map((person) => (
          <span
            key={person.name}
            className={`-ml-3 first:ml-0 w-11 h-11 md:w-14 md:h-14 rounded-full overflow-hidden ring-2 ring-slate-800 flex items-center justify-center text-slate-800 font-medium ${person.bg}`}
          >
            {person.image
              ? <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
              : person.name.charAt(0)}
          </span>
        ))}
      </span>
    </a>
  )
}

function FeatureCard({ feature }) {
  const IconComponent = feature.icon
  return (
    <div className="flex flex-row md:flex-col items-center md:items-start justify-between gap-3 md:min-h-[145px] rounded-xl border border-white/20 bg-white/10 backdrop-blur-md p-4 md:p-5 text-white">
      <h3 className="text-sm md:text-base font-medium leading-snug">{feature.title}</h3>
      <IconComponent />
    </div>
  )
}

// Deux photos inclinées avec cadre blanc
function Polaroids() {
  const [first, second] = mission.photos
  const frame = "absolute w-[50%] bg-white rounded-lg md:rounded-xl p-1.5 md:p-2.5 lg:p-3 shadow-sm"
  const photo = "w-full aspect-square object-cover rounded-sm md:rounded-md"

  return (
    <div className="relative w-full max-w-[440px] aspect-[3/2]">
      <div className={`${frame} left-0 top-0 -rotate-6`}>
        <img src={first.src} alt={first.alt} className={photo} />
      </div>
      <div className={`${frame} left-[44%] top-[14%] rotate-6`}>
        <img src={second.src} alt={second.alt} className={photo} />
      </div>
    </div>
  )
}

function MissionSection() {
  return (
    <div className="mt-[50px] md:mt-[100px]">

      {/* Titre + texte (le texte est masqué sur mobile) */}
      <div className="mb-8 md:mb-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 lg:gap-12">
        <h2 className={`${SECTION_TITLE} lg:max-w-[52%]`}>{mission.title}</h2>
        <p className={`hidden md:block ${SECTION_SUBTITLE} lg:max-w-lg`}>{mission.text}</p>
      </div>

      {/* 2 colonnes sur mobile, 3 dès l'écran moyen */}
      <div className="grid grid-cols-2 md:grid-cols-[1fr_1fr_auto] lg:grid-cols-[1fr_1.4fr_auto] gap-4 md:gap-8 lg:gap-14">

        {/* Photos + chiffres */}
        <div className="flex flex-col justify-between gap-6 md:gap-8">
          <Polaroids />

          <div className="flex flex-col gap-3 md:flex-row md:gap-8 lg:gap-12">
            {mission.stats.map((stat) => (
              <div key={stat.id} className="flex items-center gap-3 md:block">
                <p className="text-3xl md:text-5xl lg:text-6xl leading-none text-slate-800">{stat.value}</p>
                <p className="md:mt-3 text-sm md:text-base lg:text-lg leading-snug text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Grande image */}
        <div className="relative min-h-[280px] md:min-h-[375px] lg:min-h-[394px] overflow-hidden rounded-2xl md:rounded-3xl">
          <img
            src={mission.image}
            alt={mission.imageAlt}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Pastilles vision / mission / valeurs (masquées sur mobile) */}
        <ul className="hidden md:flex flex-col justify-center gap-3 lg:gap-4">
          {mission.pillars.map((pillar) => {
            const PillarIcon = pillar.icon
            return (
              <li
                key={pillar.id}
                className="flex items-center gap-3 lg:gap-4 rounded-full bg-white p-2.5 lg:p-3 pr-6 lg:pr-12"
              >
                <span className="shrink-0 w-11 h-11 lg:w-[62px] lg:h-[62px] rounded-full bg-[#C49849] flex items-center justify-center text-white">
                  <PillarIcon />
                </span>
                <span className="text-sm lg:text-lg leading-snug text-slate-700">{pillar.label}</span>
              </li>
            )
          })}
        </ul>

      </div>
    </div>
  )
}

// Petite carte d'un expert voisin : cliquer dessus l'affiche au centre
function ExpertSideCard({ expert, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Show ${expert.name}`}
      className="group block w-full text-left"
    >
      <div className="aspect-[17/10] overflow-hidden rounded-xl">
        <img
          src={expert.image}
          alt={expert.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <h3 className="mt-4 md:mt-8 text-lg md:text-2xl font-medium leading-snug text-slate-900">
        {expert.name}
      </h3>
      <p className="mt-1 md:mt-3 text-sm md:text-base text-slate-600">{expert.role}</p>
    </button>
  )
}

function ExpertsSection() {
  const total = experts.length
  const [active, setActive] = useState(expertsSection.startIndex % total)

  // Défilement en boucle : après le dernier expert, on revient au premier
  const at = (index) => experts[(index + total) % total]
  const goPrev = () => setActive((i) => (i - 1 + total) % total)
  const goNext = () => setActive((i) => (i + 1) % total)

  const current = at(active)
  const hasSides = total >= 3

  const arrowClass =
    "w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-slate-700 text-slate-800 " +
    "hover:bg-slate-800/10 active:bg-slate-800/20 transition " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-800"

  return (
    <div className="mt-[50px] md:mt-[100px]">

      <h2 className={`${SECTION_TITLE} text-center mb-10 md:mb-16`}>{expertsSection.title}</h2>

      <div
        className={`grid gap-x-4 gap-y-10 ${
          hasSides
            ? 'grid-cols-2 lg:grid-cols-[1fr_1.9fr_1fr] lg:gap-x-0'
            : 'grid-cols-1 max-w-3xl mx-auto'
        }`}
      >
        {/* Expert précédent */}
        {hasSides && (
          <div className="lg:pr-14">
            <ExpertSideCard expert={at(active - 1)} onSelect={goPrev} />
          </div>
        )}

        {/* Expert mis en avant (au centre sur grand écran, en premier sur mobile) */}
        <article
          aria-live="polite"
          className={
            hasSides
              ? 'col-span-2 lg:col-span-1 order-first lg:order-none lg:border-x lg:border-slate-900/15 lg:px-14'
              : ''
          }
        >
          <div className="aspect-[3/2] md:aspect-[2/1] overflow-hidden rounded-xl">
            <img src={current.image} alt={current.name} className="w-full h-full object-cover" />
          </div>

          <hr className="mt-6 md:mt-9 border-slate-900/15" />

          <div className="mt-6 md:mt-8 flex flex-wrap items-center gap-x-4 gap-y-1">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight leading-tight text-slate-900">
              {current.name}
            </h3>
            <span className="hidden sm:block w-px h-5 bg-slate-500" aria-hidden="true" />
            <p className="text-sm md:text-base text-slate-700">{current.role}</p>
          </div>

          <p className="mt-4 md:mt-5 text-sm sm:text-base md:text-lg leading-relaxed text-slate-600 max-w-xl">
            {current.bio}
          </p>

          <div className="mt-5 md:mt-6 flex flex-col gap-2 text-sm sm:text-base font-medium text-slate-800">
            <a href={`tel:${current.phone.replace(/\s/g, '')}`} className="w-fit hover:underline underline-offset-4">
              {current.phone}
            </a>
            <a href={`mailto:${current.email}`} className="w-fit hover:underline underline-offset-4">
              {current.email}
            </a>
          </div>
        </article>

        {/* Expert suivant */}
        {hasSides && (
          <div className="lg:pl-14">
            <ExpertSideCard expert={at(active + 1)} onSelect={goNext} />
          </div>
        )}
      </div>

      {/* Navigation prev / next */}
      <div className="mt-10 md:mt-14 flex items-center justify-center gap-4 md:gap-5">
        <button type="button" onClick={goPrev} aria-label="Previous expert" className={arrowClass}>
          <ArrowIcon direction="left" />
        </button>

        <span className={`${META_TEXT} tabular-nums text-slate-700`} aria-hidden="true">
          {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>

        <button type="button" onClick={goNext} aria-label="Next expert" className={arrowClass}>
          <ArrowIcon direction="right" />
        </button>
      </div>

    </div>
  )
}

function About() {
  return (
    <>
    <section className="w-full pt-0 pb-12 bg-[#D5E8E2] flex flex-col items-center">
        <Navbar />
      <div className={`${SECTION_WIDTH} mt-8 md:mt-12`}>
        {/* Titre + texte + aide */}
        <h2 className={`${STATEMENT_TITLE} max-w-5xl`}>{content.title}</h2>

        <div className="mt-8 md:mt-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-12">
          <div className="flex items-center gap-5 md:gap-6 max-w-2xl">
            <div className="hidden sm:block"><TalkBadge /></div>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed">
              {content.text}
            </p>
          </div>

          <HelpPill />
        </div>

        {/* Carte "Our Promise" */}
        <div className="relative mt-10 md:mt-16 overflow-hidden rounded-3xl bg-slate-900 text-white min-h-[520px] md:min-h-[625px]">
          <img
            src={content.image}
            alt={content.imageAlt}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-black/80" />

          <div className="relative min-h-[inherit] flex flex-col p-5 md:p-8">
            <p className="flex items-center gap-2 text-lg md:text-xl font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-white" aria-hidden="true" />
              {content.label}
            </p>

            <div className="mt-auto pt-24">
              <h2 className={`${ON_IMAGE_TITLE} text-left md:text-center`}>
                {content.cardTitle}
              </h2>

              <div className="mt-6 md:mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                {features.map((feature) => (
                  <FeatureCard key={feature.id} feature={feature} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section "Our Mission" */}
        <MissionSection />

        {/* Section "Travel Experts" */}
        <ExpertsSection />

      </div>
    </section>
    <Footer />
    </>
  )
}

export default About