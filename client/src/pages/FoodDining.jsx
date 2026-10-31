import React, { useLayoutEffect, useRef, useState } from 'react'
import Deux from "../assets/images/2.jpg";
import Ambanja from "../assets/images/Ambanja.jpg";
import NosyLonjo from "../assets/images/NosyLonjo.jpg";
import Ramena from "../assets/images/Ramena.jpg";
import Tana from "../assets/images/Tana.jpg";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AddToTrip from '../components/AddToTrip'
import { sendRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { Trans, useLanguage, useT } from '../i18n/LanguageContext';
import { formatPrice } from '../utils/format';
import { localize } from '../i18n/localize';
import OffersStatus from '../components/OffersStatus'
import { useOffers } from '../utils/useOffers'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePhoto } from '../sitePhotos'
import { A } from '../i18n/router'

gsap.registerPlugin(ScrollTrigger)

/* Constantes partagées : mêmes valeurs que dans les autres pages */
const SECTION_WIDTH = "w-[90vw] lg:max-w-[90vw] xl:max-w-[95vw]"
const SECTION_TITLE = "text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-forest leading-[1.15] tracking-tight"
const SECTION_SUBTITLE = "text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl"
const META_TEXT = "text-xs sm:text-sm"
const STATEMENT_TITLE = "text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-medium uppercase leading-[1.15] tracking-tight text-forest"
const BADGE = "inline-block bg-[#C49849] text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm"
const BUTTON = "text-sm font-medium px-5 py-2.5 rounded-full md:px-6 md:py-3 active:scale-95 transition"
const SECTION_GAP = "mt-[60px] md:mt-[120px]"

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------------------------- Données ---------------------------- */
// Textes affichés : locales/<langue>/food.json, posés sur ces données par localize()

const DISHES = [
  { id: 1, name: 'Romazava', image: Ambanja, spice: 'Mild', where: 'Family tables in the highlands', text: 'The national dish: tender zebu beef simmered with fresh greens, ginger and tomato.' },
  { id: 2, name: 'Ravitoto', image: Tana, spice: 'Medium', where: 'Local eateries in Antananarivo', text: 'Pounded cassava leaves slow-cooked with pork and garlic, served with steaming rice.' },
  { id: 3, name: 'Zebu Skewers', image: Deux, spice: 'Hot', where: 'Street stalls at dusk', text: 'Grilled over charcoal and served with a fiery side of homemade chili sauce.' },
  { id: 4, name: 'Coconut Prawns', image: Ramena, spice: 'Mild', where: 'Beachfront restaurants', text: 'Fresh prawns in a creamy coconut sauce with a hint of vanilla.' },
  { id: 5, name: 'Vanilla Flan', image: NosyLonjo, spice: 'Sweet', where: 'Guesthouses and cafés', text: 'Silky custard made with real Malagasy vanilla, a gentle end to any meal.' },
]

// Prix donnés en exemple, à adapter
const MENU_TABS = [
  { id: 'all', label: 'All' },
  { id: 'tour', label: 'Tours' },
  { id: 'class', label: 'Classes' },
  { id: 'meal', label: 'Meals' },
]

// Expériences (balades, cours, repas) : dans la base, gérées depuis /admin/offers/food

const CLASS_STEPS = [
  { id: 1, title: 'Visit the market', text: 'Choose fresh vegetables, herbs and spices with your host.' },
  { id: 2, title: 'Cook together', text: 'Learn three classic dishes step by step, hands on.' },
  { id: 3, title: 'Eat what you made', text: 'Sit down together and enjoy the meal you prepared.' },
]

// Envoyé à l'équipe en anglais ; libellé affiché : food.ctaChoices (même ordre)
const ctaChoices = ['Food Tour', 'Cooking Class', 'Private Dinner']

/* ---------------------------- Icônes ----------------------------- */

const Svg = ({ children, className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)
const ArrowIcon = () => <Svg className="w-5 h-5"><path d="M5 12h14M13 6l6 6-6 6" /></Svg>
const ForkIcon = () => (
  <Svg className="w-8 h-8 md:w-10 md:h-10">
    <path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10" /><path d="M17 21V3c-2.5 1.5-4 4.5-4 8h4" />
  </Svg>
)

/* -------------------------- Composants --------------------------- */

// Badge à texte circulaire qui tourne (GSAP)
function SpinBadge() {
  const t = useT('food')
  return (
    <div className="relative w-full aspect-square rounded-full bg-[#084838] text-white" aria-hidden="true">
      <svg data-spin viewBox="0 0 140 140" className="absolute inset-0 w-full h-full">
        <defs>
          <path id="food-circle" d="M70,70 m-52,0 a52,52 0 1,1 104,0 a52,52 0 1,1 -104,0" />
        </defs>
        <text fontSize="10" fill="currentColor" letterSpacing="0.5">
          <textPath href="#food-circle" textLength="326" lengthAdjust="spacing">
            {t('spinBadge')}
          </textPath>
        </text>
      </svg>
      <span className="absolute inset-0 m-auto w-[44%] h-[44%] rounded-full bg-[#C49849] flex items-center justify-center"><ForkIcon /></span>
    </div>
  )
}

const heroStats = [
  { id: 1, value: '20+' },
  { id: 2, value: '6' },
  { id: 3, value: '100%' },
]

// Hero : texte + chiffres à gauche, "assiettes" rondes serrées et badge qui tourne à droite
function Hero() {
  const photo = usePhoto()
  const t = useT('food')
  const alts = t('alts')
  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-10 items-center">
      <div>
        <span data-hero className={BADGE}>{t('badge')}</span>
        <h1 data-hero className={`${STATEMENT_TITLE} mt-5`}>{t('title')}</h1>
        <p data-hero className={`${SECTION_SUBTITLE} mt-5 md:mt-6`}>
          {t('intro')}
        </p>
        <div data-hero className="mt-7 flex flex-wrap items-center gap-4">
          <A href="#experiences" className={`bg-[#084838] hover:bg-[#0a5c47] text-white ${BUTTON}`}>{t('seeExperiences')}</A>
          <A href="#dishes" className="inline-flex items-center gap-2 text-sm md:text-base font-medium text-slate-800 hover:gap-3 transition-all">
            {t('discover')} <ArrowIcon />
          </A>
        </div>

        <ul data-hero className="mt-8 md:mt-10 flex flex-wrap gap-x-8 md:gap-x-12 gap-y-4 border-t border-[#084838]/20 pt-6">
          {heroStats.map((st, i) => (
            <li key={st.id} className={i > 0 ? 'sm:pl-8 md:pl-12 sm:border-l sm:border-[#084838]/20' : ''}>
              <p className="text-2xl md:text-4xl leading-none text-slate-800">{st.value}</p>
              <p className={`mt-1 ${META_TEXT} text-slate-600`}>{t('heroStats')[i]}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Assiettes : plus grandes et plus proches pour remplir l'espace */}
      <div className="relative w-full max-w-[600px] aspect-[6/5] mx-auto lg:ml-auto">
        <div data-plate className="absolute left-0 top-[4%] w-[66%]">
          <div data-bob><img src={photo('food.plate.1')} alt={alts[0]} className="w-full aspect-square object-cover rounded-full" /></div>
        </div>
        <div data-plate className="absolute right-0 top-0 w-[34%]">
          <div data-bob><img src={photo('food.plate.2')} alt={alts[1]} className="w-full aspect-square object-cover rounded-full ring-8 ring-[#D5E8E2]" /></div>
        </div>
        <div data-plate className="absolute right-[2%] bottom-[2%] w-[40%]">
          <div data-bob><img src={photo('food.plate.3')} alt={alts[2]} className="w-full aspect-square object-cover rounded-full ring-8 ring-[#D5E8E2]" /></div>
        </div>
        <div data-plate className="absolute right-[38%] bottom-0 w-[22%]"><SpinBadge /></div>
      </div>
    </section>
  )
}

// Plats signature : panneaux qui s'ouvrent au survol / au clic
function Dishes() {
  const photo = usePhoto()
  const t = useT('food')
  const dishes = localize(DISHES, t('dishes'))
  const [active, setActive] = useState(0)
  const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches

  return (
    <div id="dishes" className={`${SECTION_GAP} scroll-mt-8`}>
      <div className="mb-8 md:mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-12">
        <h2 className={`${SECTION_TITLE} lg:max-w-[52%]`}>{t('dishesTitle')}</h2>
        <p className={`${SECTION_SUBTITLE} lg:max-w-md`}>{t('dishesText')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:h-[560px]" role="tablist" aria-label={t('dishesTitle')}>
        {dishes.map((d, i) => {
          const isActive = i === active
          return (
            <button
              key={d.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(i)}
              onMouseEnter={() => { if (isDesktop()) setActive(i) }}
              className={`group relative overflow-hidden rounded-3xl text-left text-white transition-all duration-700 ease-in-out ${
                isActive ? 'h-[440px] lg:h-auto lg:flex-[4]' : 'h-[84px] lg:h-auto lg:flex-[1]'
              }`}
            >
              <img src={photo(`food.dish.${i + 1}`)} alt={d.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              <span className={`absolute inset-0 transition-colors duration-500 ${isActive ? 'bg-gradient-to-t from-black/80 via-black/20 to-transparent' : 'bg-black/45'}`} />

              {/* Nom quand le panneau est fermé */}
              <span className={`absolute left-5 top-1/2 -translate-y-1/2 text-lg font-medium lg:hidden transition-opacity duration-300 ${isActive ? 'opacity-0' : 'opacity-100'}`}>
                {d.name}
              </span>
              <span className={`absolute inset-x-0 bottom-6 hidden lg:flex justify-center transition-opacity duration-300 ${isActive ? 'opacity-0' : 'opacity-100'}`}>
                <span className="[writing-mode:vertical-rl] rotate-180 text-xl font-medium tracking-wide">{d.name}</span>
              </span>

              {/* Contenu quand le panneau est ouvert */}
              <span className={`absolute inset-x-0 bottom-0 block p-5 md:p-8 transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0 delay-300' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <span className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs md:text-sm font-medium text-slate-900">{t('spice', { level: d.spice })}</span>
                  <span className="rounded-full border border-white/40 bg-white/10 backdrop-blur-sm px-3 py-1 text-xs md:text-sm">{d.where}</span>
                </span>
                <span className="mt-4 block text-3xl md:text-5xl font-medium tracking-tight">{d.name}</span>
                <span className="mt-3 block max-w-lg text-sm md:text-lg text-white/85 leading-relaxed">{d.text}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Offre de la base -> forme utilisée par la liste
const toExperience = (o) => ({ id: o.id, category: o.category, name: o.title, duration: o.duration, price: o.price, image: o.image, text: o.text })

// Expériences : filtres, liste de lignes à droite, grand aperçu à gauche qui change au survol
function Menu({ experiences, status }) {
  const tr = useT('food')
  const { lang } = useLanguage()
  const menuTabs = localize(MENU_TABS, tr('menuTabs'))
  const [category, setCategory] = useState('all')
  const [activeId, setActiveId] = useState(null)
  const previewRef = useRef(null)
  const first = useRef(true)

  const list = category === 'all' ? experiences : experiences.filter((e) => e.category === category)
  const current = list.find((e) => e.id === activeId) || list[0]

  // L'aperçu apparaît en fondu à chaque changement
  useLayoutEffect(() => {
    if (first.current) { first.current = false; return }
    if (!previewRef.current || prefersReducedMotion()) return
    gsap.fromTo(previewRef.current, { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out', clearProps: 'transform,opacity' })
  }, [current?.id])

  const tab = (active) =>
    `rounded-full px-5 py-2 text-sm md:text-base font-medium transition ${active ? 'bg-[#084838] text-white' : 'bg-white text-slate-700 hover:bg-white/70'}`

  return (
    <div id="experiences" className={`${SECTION_GAP} scroll-mt-8`}>
      <div className="mb-6 md:mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-12">
        <h2 className={`${SECTION_TITLE} lg:max-w-[52%]`}>{tr('menuTitle')}</h2>
        <p className={`${SECTION_SUBTITLE} lg:max-w-md`}>{tr('menuText')}</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2 md:gap-3" role="tablist" aria-label={tr('menuTabsLabel')}>
        {menuTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={category === t.id}
            onClick={() => { setCategory(t.id); setActiveId(null) }}
            className={tab(category === t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <OffersStatus status={status} empty={!current} />
      {current && (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-6 lg:gap-10 items-start">

        {/* Aperçu (grand écran) */}
        <div className="hidden lg:block lg:sticky lg:top-8 relative overflow-hidden rounded-3xl bg-[#084838] text-white h-[520px]">
          <div ref={previewRef} className="absolute inset-0">
            <img src={current.image} alt={current.name} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8">
              <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-slate-900">{current.duration}</span>
              <h3 className="mt-4 text-4xl font-medium tracking-tight">{current.name}</h3>
              <p className="mt-3 max-w-md text-base text-white/85 leading-relaxed">{current.text}</p>
              <div className="mt-6 flex items-center justify-between gap-4">
                <p className="text-white/80"><Trans text={tr('fromPerPerson')} values={{ price: <span className="text-3xl font-medium text-white">{formatPrice(current.price, lang)}</span> }} /></p>
                <AddToTrip variant="gold" item={{ kind: 'food', ref: String(current.id), title: current.name, image: current.image, link: '/food-dining', details: current.duration, price: current.price, unit: 'person' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Liste */}
        <ul className="flex flex-col gap-2 md:gap-3">
          {list.map((e, i) => {
            const isActive = e.id === current.id
            return (
              <li key={e.id}>
                <div
                  onMouseEnter={() => setActiveId(e.id)}
                  onFocus={() => setActiveId(e.id)}
                  className={`group flex items-center gap-4 md:gap-5 rounded-2xl p-3 md:p-4 transition ${isActive ? 'bg-white' : 'hover:bg-white/60'}`}
                >
                  <img src={e.image} alt="" className="lg:hidden shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover" />
                  <span className="hidden lg:block w-8 text-sm tabular-nums text-[#9a742f]">{String(i + 1).padStart(2, '0')}</span>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-2xl font-medium text-forest leading-snug">{e.name}</h3>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-slate-600">
                      <span className="rounded-full border border-slate-400 px-2.5 py-0.5 text-xs md:text-sm text-slate-700">{e.duration}</span>
                      <span className="lg:hidden">{e.text}</span>
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-xl md:text-3xl font-medium text-slate-900 tabular-nums">{formatPrice(e.price, lang)}</p>
                    <p className={`${META_TEXT} text-slate-500`}>{tr('perPerson')}</p>
                  </div>

                  <AddToTrip variant="icon" item={{ kind: 'food', ref: String(e.id), title: e.name, image: e.image, link: '/food-dining', details: e.duration, price: e.price, unit: 'person' }} />
                </div>
              </li>
            )
          })}
        </ul>
      </div>
      )}

      <p className={`mt-8 ${META_TEXT} text-slate-500`}>{tr('groups')}</p>
    </div>
  )
}

// Régimes alimentaires : bande simple avec pastilles
function Diets() {
  const t = useT('food')
  return (
    <div className={`${SECTION_GAP} flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-16 border-y border-[#084838]/20 py-8 md:py-10`}>
      <h2 className="text-2xl md:text-4xl font-medium text-forest tracking-tight lg:max-w-xs">{t('dietsTitle')}</h2>
      <ul className="flex flex-wrap gap-2 md:gap-3">
        {t('diets').map((d) => (
          <li key={d} className="rounded-full border border-[#084838] px-4 md:px-5 py-2 text-sm md:text-base text-[#084838]">{d}</li>
        ))}
      </ul>
    </div>
  )
}

// Cours de cuisine : photo avec parallaxe + étapes
function CookingClass({ experiences }) {
  const photo = usePhoto()
  const t = useT('food')
  const { lang } = useLanguage()
  const classSteps = localize(CLASS_STEPS, t('classSteps'))
  const facts = t('classFacts')
  // Le cours de cuisine de la liste des expériences : même élément dans « Mon voyage »
  const lesson = experiences.find((e) => e.category === 'class')
  return (
    <div className={`${SECTION_GAP} grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center`}>
      <div className="relative overflow-hidden rounded-3xl aspect-[4/5] md:aspect-[5/4] lg:aspect-[4/5] bg-[#084838]">
        <img data-parallax src={photo('food.class')} alt={t('classAlt')} className="absolute left-0 -top-[10%] w-full h-[120%] object-cover" />
        <span className={`${BADGE} absolute left-5 top-5`}>{t('mostLoved')}</span>
      </div>

      <div>
        <p className="mb-3 text-xs sm:text-sm md:text-base uppercase tracking-wide text-slate-700">{t('handsOn')}</p>
        <h2 className={SECTION_TITLE}>{t('classTitle')}</h2>
        <p className={`mt-5 ${SECTION_SUBTITLE}`}>{t('classText')}</p>

        <ol className="mt-8 flex flex-col gap-5">
          {classSteps.map((s) => (
            <li key={s.id} className="flex items-start gap-4">
              <span className="shrink-0 w-9 h-9 rounded-full bg-[#C49849] text-white flex items-center justify-center text-sm font-medium">{s.id}</span>
              <div>
                <h3 className="text-lg md:text-xl font-medium text-forest">{s.title}</h3>
                <p className="mt-1 text-sm md:text-base text-slate-600 leading-relaxed">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <ul className="mt-8 grid grid-cols-3 gap-3 md:gap-5 max-w-md">
          {[['3 h', facts[0]], ['8', facts[1]], [formatPrice(lesson?.price ?? 45, lang), facts[2]]].map(([v, l]) => (
            <li key={l} className="rounded-2xl bg-white p-4 text-center">
              <p className="text-2xl md:text-3xl leading-none text-slate-800">{v}</p>
              <p className={`mt-2 ${META_TEXT} text-slate-600`}>{l}</p>
            </li>
          ))}
        </ul>

        {lesson && (
          <AddToTrip variant="green" className="mt-8" item={{ kind: 'food', ref: String(lesson.id), title: lesson.name, image: lesson.image, link: '/food-dining', details: lesson.duration, price: lesson.price, unit: 'person' }} />
        )}
      </div>
    </div>
  )
}

// FAQ nouvelle version : liste de questions à gauche, grande réponse sur carte verte à droite
function Faq() {
  const t = useT('food')
  const faqs = t('faqs')
  const [active, setActive] = useState(0)
  const answerRef = useRef(null)
  const first = useRef(true)

  // La réponse glisse en douceur à chaque changement de question
  useLayoutEffect(() => {
    if (first.current) { first.current = false; return }
    if (!answerRef.current || prefersReducedMotion()) return
    gsap.fromTo(answerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', clearProps: 'transform,opacity' })
  }, [active])

  return (
    <div className={SECTION_GAP}>
      <div className="mb-8 md:mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-12">
        <h2 className={`${SECTION_TITLE} lg:max-w-[52%]`}>{t('faqTitle')}</h2>
        <p className={`${SECTION_SUBTITLE} lg:max-w-md`}>{t('faqText')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 lg:gap-16 items-start">
        <ol className="border-t border-[#084838]/20">
          {faqs.map((f, i) => {
            const isActive = i === active
            return (
              <li key={f.q} className="border-b border-[#084838]/20">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-expanded={isActive}
                  className="w-full flex items-start gap-4 md:gap-6 py-5 md:py-6 text-left"
                >
                  <span className={`text-sm md:text-base tabular-nums pt-1 ${isActive ? 'text-[#9a742f]' : 'text-slate-500'}`}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={`flex-1 text-lg md:text-2xl leading-snug transition ${isActive ? 'font-medium text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}>{f.q}</span>
                  <span className={`shrink-0 mt-1 transition-transform duration-300 ${isActive ? 'rotate-90 text-[#084838]' : 'text-slate-400'}`}><ArrowIcon /></span>
                </button>
                {/* Mobile : la réponse s'ouvre sous la question */}
                {isActive && <p className="lg:hidden pb-6 pl-10 text-sm md:text-base text-slate-600 leading-relaxed">{f.a}</p>}
              </li>
            )
          })}
        </ol>

        {/* Grand écran : réponse sur carte verte */}
        <div className="hidden lg:block lg:sticky lg:top-8 rounded-3xl bg-[#084838] text-white p-10 min-h-[340px]">
          <div ref={answerRef}>
            <span className={BADGE}>{t('question', { n: String(active + 1).padStart(2, '0') })}</span>
            <h3 className="mt-6 text-2xl font-medium leading-snug">{faqs[active].q}</h3>
            <p className="mt-5 text-lg text-white/80 leading-relaxed">{faqs[active].a}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// CTA : carte verte avec petit formulaire (choix de l'expérience + email)
function Cta() {
  // Connecté : nom et email pré-remplis (la clé recrée le champ quand la session est connue)
  const { user } = useAuth()
  const t = useT('food')
  const [pick, setPick] = useState(ctaChoices[0])
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'sent' | 'error'
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const { email } = Object.fromEntries(new FormData(form))

    setStatus('sending')
    try {
      await sendRequest('food', { email, subject: pick })
      setStatus('sent')
      form.reset()
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <div className={`${SECTION_GAP} grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center rounded-3xl bg-[#084838] text-white p-6 md:p-14`}>
      <div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.15] tracking-tight">{t('ctaTitle')}</h2>
        <p className="mt-4 text-sm md:text-lg text-white/75 leading-relaxed max-w-md">
          {t('ctaText')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl bg-white/10 border border-white/20 p-5 md:p-8">
        <fieldset>
          <legend className="text-sm md:text-base text-white/80">{t('mood')}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {ctaChoices.map((c, i) => (
              <button
                key={c}
                type="button"
                aria-pressed={pick === c}
                onClick={() => setPick(c)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${pick === c ? 'bg-[#C49849] text-white' : 'border border-white/40 text-white hover:bg-white/10'}`}
              >
                {t('ctaChoices')[i]}
              </button>
            ))}
          </div>
        </fieldset>

        <label htmlFor="food-email" className="mt-6 block text-sm md:text-base text-white/80">{t('email')}</label>
        <div className="mt-2 flex flex-col sm:flex-row gap-2 rounded-3xl sm:rounded-full bg-white p-2 sm:pl-6">
          <input id="food-email" name="email" key={`e-${user?.id}`} defaultValue={user?.email} type="email" required autoComplete="email" placeholder="name@example.com" className="flex-1 min-w-0 bg-transparent px-4 py-2 sm:px-0 text-sm md:text-base text-slate-800 placeholder:text-slate-500 focus:outline-none" />
          <button type="submit" disabled={status === 'sending'} className={`shrink-0 bg-[#C49849] hover:bg-[#b08339] text-white disabled:opacity-60 disabled:cursor-wait ${BUTTON}`}>{status === 'sending' ? t('sending') : t('send')}</button>
        </div>

        {status === 'sent' && <p role="status" className="mt-4 text-sm md:text-base text-[#E6C58A]">{t('thanks')}</p>}
        {status === 'error' && <p role="alert" className="mt-4 text-sm md:text-base text-red-300">{error}</p>}
      </form>
    </div>
  )
}

function FoodDining() {
  const contentRef = useRef(null)
  const { offers, status } = useOffers('food')
  const experiences = offers.map(toExperience)

  useLayoutEffect(() => {
    // Pas d'animation si l'utilisateur a demandé moins de mouvement
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      // Entrée du hero : textes puis assiettes qui apparaissent en grossissant
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-hero]', { y: 40, opacity: 0, duration: 0.9, stagger: 0.12 })
        .from('[data-plate]', { scale: 0.7, opacity: 0, duration: 1, stagger: 0.15 }, '-=0.6')

      // Flottement doux des assiettes
      gsap.to('[data-bob]', {
        y: (i) => (i % 2 ? 8 : -8), duration: (i) => 2.8 + (i % 3) * 0.6,
        ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.2,
      })

      // Le badge circulaire tourne lentement
      gsap.to('[data-spin]', { rotation: 360, duration: 24, ease: 'none', repeat: -1, transformOrigin: '50% 50%' })

      // Parallaxe de la photo du cours de cuisine
      gsap.utils.toArray('[data-parallax]').forEach((img) => {
        gsap.fromTo(img, { yPercent: -6 }, {
          yPercent: 6, ease: 'none',
          scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })

      // Chaque section apparaît en remontant quand elle entre dans l'écran
      Array.from(contentRef.current.children).slice(1).forEach((el) => {
        gsap.from(el, {
          y: 50, opacity: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })
    }, contentRef)

    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)

    return () => {
      window.removeEventListener('load', refresh)
      ctx.revert()
    }
  }, [])

  return (
    <>
    <section className="w-full pt-0 pb-12 md:pb-20 bg-[#D5E8E2] flex flex-col items-center">
      <Navbar />
      <div ref={contentRef} className={`${SECTION_WIDTH} mt-6 md:mt-10`}>
        <Hero />
        <Dishes />
        <Menu experiences={experiences} status={status} />
        <Diets />
        <CookingClass experiences={experiences} />
        <Faq />
        <Cta />
      </div>
    </section>
    <Footer />
    </>
  )
}

export default FoodDining