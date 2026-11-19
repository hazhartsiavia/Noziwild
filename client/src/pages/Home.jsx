import React, { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowUpRight, Compass, Minus, Plus, Route, Sparkles, Sun } from 'lucide-react'
import Ramena from '../assets/images/Ramena.jpg'
import NosyIranja from '../assets/images/NosyIranja.jpg'
import NosyLonjo from '../assets/images/NosyLonjo.jpg'
import Ambanja from '../assets/images/Ambanja.jpg'
import Deux from '../assets/images/2.jpg'
import Tana from '../assets/images/Tana.jpg'
import Icone from '../assets/logo/icon.svg'
import Footer from '../components/Footer'
import Testimonials from '../components/Testimonials'
import TripStrip from '../components/TripStrip'
import WaysOverview from '../components/WaysOverview'
import AboutUs from '../components/AboutUs'
import ServicesList from '../components/ServicesList'
import { slugify } from './destinationsData'
import { Hero, Preloader, shouldPlayPreloader } from './HomeHero'
import './homeTrips.css'
import './homeRegions.css'
import './homeBottom.css'
import { useLanguage, useT } from '../i18n/LanguageContext'
import { monthName } from '../utils/format'
import { usePhoto } from '../sitePhotos'
import { A } from '../i18n/router'

gsap.registerPlugin(ScrollTrigger)

const quoteHref = (k, v) => `/contact?type=quote&${k}=${encodeURIComponent(v)}`

/* ---------------------------- Données ---------------------------- */
// Les textes affichés viennent de locales/<langue>/home.json (mêmes listes, même ordre) ;
// les textes anglais ci-dessous servent d'identifiants (adresses des lieux, clés React).

// Les 4 façons de voyager (section WaysOverview)
const ways = [
  { title: 'Circuits', text: 'Ready-made routes across the island', href: '/circuits', icon: Route, slot: 'home.ways.1', image: Tana },
  { title: 'Excursions', text: 'Day trips and short escapes', href: '/excursions', icon: Sun, slot: 'home.ways.2', image: Ramena },
  { title: 'Long Stay', text: 'Live the island for weeks', href: '/long-stay', icon: Compass, slot: 'home.ways.3', image: NosyIranja },
  { title: 'Tailor-Made', text: 'A trip designed around you', href: '/tailor-made', icon: Sparkles, slot: 'home.ways.4', image: Ambanja },
]

// Les quatre raisons de « Pourquoi Noziwild » : titres de la page À propos (about.json → features), chacun
// avec un texte déjà présent sur le site, sur le même sujet (même langue, mêmes mots partout)
const reasons = [
  { id: 'routes', text: ['home', 'tripsText'] },
  { id: 'booking', text: ['home', 'servicesText'] },
  { id: 'stays', text: ['accommodation', 'intro.text'] },
  { id: 'guides', text: ['guides', 'intro'] },
]

// Mêmes régions que la page Destinations (version courte)
const regions = [
  {
    id: 'north', name: 'The North', tagline: 'Emerald bays, spice islands and dry forests', slot: 'region.north', image: NosyIranja, months: [4, 11],
    text: 'Sail the bay of Diego Suarez, hike the sharp limestone of Ankarana and finish on the islands around Nosy Be.',
    places: [{ name: 'Ramena Beach', slot: 'region.north.1', image: Ramena }, { name: 'Nosy Iranja', slot: 'region.north.2', image: NosyIranja }, { name: 'Ambanja', slot: 'region.north.3', image: Ambanja }],
  },
  {
    id: 'highlands', name: 'The Highlands', tagline: 'Royal hills, rice terraces and cool mornings', slot: 'region.highlands', image: Tana, months: [5, 10],
    text: 'Start in Antananarivo, climb to the royal hill of Ambohimanga and ride south through the terraced valleys to Antsirabe.',
    places: [{ name: 'Antananarivo', slot: 'region.highlands.1', image: Tana }, { name: 'Ambohimanga', slot: 'region.highlands.2', image: Deux }, { name: 'Antsirabe', slot: 'region.highlands.3', image: Ambanja }],
  },
  {
    id: 'west', name: 'The West', tagline: 'Baobab avenues and stone forests', slot: 'region.west', image: Deux, months: [5, 10],
    text: 'Drive the famous Baobab Avenue at sunset, then cross the river to walk the Tsingy of Bemaraha.',
    places: [{ name: 'Baobab Avenue', slot: 'region.west.1', image: Deux }, { name: 'Morondava', slot: 'region.west.2', image: NosyLonjo }, { name: 'Tsingy de Bemaraha', slot: 'region.west.3', image: Ambanja }],
  },
  {
    id: 'south', name: 'The South', tagline: 'Canyons, white sand and coastal villages', slot: 'region.south', image: NosyLonjo, months: [4, 11],
    text: 'Hike the sandstone canyons of Isalo, swim in natural pools and end the trip on the Vezo coast.',
    places: [{ name: 'Isalo', slot: 'region.south.1', image: NosyLonjo }, { name: 'Ifaty coast', slot: 'region.south.2', image: Ramena }, { name: 'Fort Dauphin', slot: 'region.south.3', image: NosyIranja }],
  },
  {
    id: 'east', name: 'The East', tagline: 'Rainforest, lemurs and island beaches', slot: 'region.east', image: Ambanja, months: [9, 12],
    text: 'Listen for the indri at dawn in Andasibe, then take a boat to Ile Sainte-Marie or into the Masoala peninsula.',
    places: [{ name: 'Andasibe', slot: 'region.east.1', image: Ambanja }, { name: 'Ile Sainte-Marie', slot: 'region.east.2', image: NosyIranja }, { name: 'Masoala', slot: 'region.east.3', image: Tana }],
  },
]

const trips = [
  { name: 'Highlands & Coast', days: 7, slot: 'home.trips.1', image: Tana, text: 'From lemur forests to a quiet bay, a slow week that mixes culture, nature and the sea.', tags: ['Andasibe forest', 'Village stays', 'Ramena sunsets'], months: [10, 11, 12] },
  { name: 'Island Escape', days: 5, slot: 'home.trips.2', image: NosyIranja, text: 'White sand, turquoise water and days that end on a boat.' },
  { name: 'Wild North', days: 10, slot: 'home.trips.3', image: Deux, text: 'Baobabs, canyons and empty beaches, for the ones who want more.' },
]

// Services (section ServicesList) : page, texte d'intro de la page (ns + clé), photo de la page, offres (kind)
const services = [
  { title: 'Accommodation', href: '/accommodation', ns: 'accommodation', textKey: 'intro.text', slot: 'hosting.hero', kind: 'stay' },
  { title: 'Transport', href: '/transport', ns: 'transport', textKey: 'typesText', slot: 'transport.hero', kind: 'transport' },
  { title: 'Guides', href: '/guides', ns: 'guides', textKey: 'intro', slot: 'guides.hero.1', kind: 'guide' },
  { title: 'Food & Dining', href: '/food-dining', ns: 'food', textKey: 'intro', slot: 'food.class', kind: 'food' },
  { title: 'Equipment Rentals', href: '/equipment-rentals', ns: 'equipment', textKey: 'intro', slot: 'gear.cta', kind: 'gear' },
  { title: 'Photography', href: '/photography', ns: 'photography', textKey: 'intro', slot: 'photo.hero.1', kind: 'session' },
  { title: 'Cruise Excursions', href: '/cruise-excursions', ns: 'cruise', textKey: 'intro', slot: 'cruise.hero', kind: 'cruise' },
]

/* ----------------------- Hook utilitaire GSAP ---------------------- */
/* Même hook que la page Destinations : respecte prefers-reduced-motion
   et nettoie tout au démontage. */

function useGsap(scope, setup, deps = []) {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia(scope)
    mm.add('(prefers-reduced-motion: no-preference)', () => setup())
    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/* -------------------------- Petits composants --------------------------- */

// Badge circulaire "Talk to a Travel Expert" (identique à la page About)
function TalkBadge() {
  const t = useT('home')
  return (
    <div className="relative shrink-0 w-24 h-24 md:w-32 md:h-32 text-slate-700" aria-hidden="true">
      <svg viewBox="0 0 140 140" className="absolute inset-0 w-full h-full animate-spin [animation-duration:20s] motion-reduce:animate-none">
        <defs>
          <path id="home-talk-circle" d="M70,70 m-52,0 a52,52 0 1,1 104,0 a52,52 0 1,1 -104,0" />
        </defs>
        <text fontSize="10" fill="currentColor" letterSpacing="0.5">
          <textPath href="#home-talk-circle" textLength="326" lengthAdjust="spacing">
            {t('talkBadge')}
          </textPath>
        </text>
      </svg>
      <span className="absolute inset-0 m-auto w-[48%] h-[48%] flex items-center justify-center">
        <img src={Icone} alt="" className="w-[64px] h-[64px] object-contain" />
      </span>
    </div>
  )
}

/* -------------------------- Sections --------------------------- */

/* Pourquoi Noziwild (homeBottom.css) : en-tête, puis nos quatre engagements en cartes pleine largeur qui
   s'empilent au défilement (chacune monte et se pose sur la précédente, comme les étapes de la page
   Sur mesure) : les quatre points de la page À propos. Chaque carte : numéro, titre et texte à gauche, deux photos droites, décalées et
   superposées à droite (admin > Pages & photos, emplacements home.why.1 à home.why.8).
   Ordinateur : la section reste à l'écran pendant l'empilement ; à la fin, tout tient dans un écran. */
function Intro() {
  const root = useRef(null)
  const t = useT('home')
  const about = useT('about')
  const texts = { home: t, accommodation: useT('accommodation'), guides: useT('guides') }
  const photo = usePhoto()

  useLayoutEffect(() => {
    if (!root.current) return undefined
    const mm = gsap.matchMedia(root.current)
    const section = root.current
    const wrapper = section.parentElement
    const cards = gsap.utils.toArray(section.querySelectorAll('.nzw__card'))
    const back = (card) => card.querySelector('.nzw__photo--back')
    const front = (card) => card.querySelector('.nzw__photo--front')

    // Le titre s'éclaire mot à mot pendant qu'il monte dans l'écran, puis le texte et le trait
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({ scrollTrigger: { trigger: wrapper, start: 'top 85%', end: 'top 15%', scrub: 0.6 } })
        .fromTo('.nzw__label', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 }, 0)
        .fromTo('.nzw__tw', { opacity: 0.15 }, { opacity: 1, duration: 0.2, stagger: 0.06, ease: 'none' }, 0.1)
        .fromTo('.nzw__intro', { opacity: 0.15, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, 0.6)
        .fromTo('.nzw__rule', { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left', duration: 0.8, ease: 'power2.inOut' }, 0.4)
    })

    // Ordinateur : la section tient l'écran et y reste (sticky, homeBottom.css → .nzw-pin). Les cartes montent
    // du bas une à une et se posent sous le titre de la précédente ; à la fin, en-tête et quatre cartes sont
    // visibles ensemble. Les deux photos de chaque carte s'écartent pendant qu'elle monte.
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const spacer = wrapper.querySelector('.nzw__spacer')
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: () => `+=${spacer.offsetHeight}`,
          scrub: 0.6,
          invalidateOnRefresh: true,
          // après un recalcul, chaque carte reprend sa position (GSAP ne replace que la première d'une série)
          onRefresh: (self) => self.animation?.progress(1).progress(self.progress),
        },
      })
      tl.fromTo(back(cards[0]), { xPercent: 18 }, { xPercent: 0, duration: 0.6, ease: 'power2.out' }, 0)
        .fromTo(front(cards[0]), { xPercent: -18 }, { xPercent: 0, duration: 0.6, ease: 'power2.out' }, 0)
      cards.slice(1).forEach((card, n) => {
        const at = 0.4 + n
        tl.fromTo(card, { y: () => window.innerHeight }, { y: 0, duration: 1, ease: 'power2.out' }, at)
          .fromTo(back(card), { xPercent: 18 }, { xPercent: 0, duration: 0.8, ease: 'power2.out' }, at + 0.2)
          .fromTo(front(card), { xPercent: -18 }, { xPercent: 0, duration: 0.8, ease: 'power2.out' }, at + 0.2)
      })
      // tout en place : un temps d'arrêt avant que la page reparte
      tl.to({}, { duration: 0.6 })
    })

    // Téléphone et tablette : les cartes montent en arrivant puis restent accrochées (sticky), la suivante se
    // pose dessus ; leurs photos s'écartent pendant qu'elles montent
    mm.add('(max-width: 1023px) and (prefers-reduced-motion: no-preference)', () => {
      cards.forEach((card) => {
        gsap.fromTo(card, { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 92%', once: true } })
        gsap.timeline({ scrollTrigger: { trigger: card, start: 'top bottom', end: 'top 35%', scrub: 0.6 } })
          .fromTo(back(card), { xPercent: 18 }, { xPercent: 0, ease: 'power2.out' }, 0)
          .fromTo(front(card), { xPercent: -18 }, { xPercent: 0, ease: 'power2.out' }, 0)
      })
    })
    return () => mm.revert()
  }, [])

  // Titre découpé en mots (ils s'éclairent un à un au défilement)
  const title = t('introTitle').split(' ')

  return (
    <div className="nzw-pin">
    <section ref={root} className="nzw" aria-labelledby="nzw-title">
      <p className="nzw__label"><Sparkles aria-hidden="true" />{t('introLabel')}</p>
      <div className="nzw__head">
        <h2 id="nzw-title" className="nzw__title">
          {title.map((w, i) => <React.Fragment key={i}><span className="nzw__tw">{w}</span>{i < title.length - 1 && ' '}</React.Fragment>)}
        </h2>
        <p className="nzw__intro">{t('introText')}</p>
      </div>
      <span className="nzw__rule" aria-hidden="true" />

      {/* Les quatre raisons : cartes qui s'empilent (chaque carte est un peu plus bas que la précédente) */}
      <ol className="nzw__cards">
        {reasons.map((reason, i) => {
          const p = { title: about('features')[i], text: texts[reason.text[0]](reason.text[1]) }
          return (
            <li key={reason.id} className={`nzw__card nzw__card--${i + 1}`} style={{ '--i': i }}>
              <span className="nzw__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <div className="nzw__card-body">
                <h3 className="nzw__card-title">{p.title}</h3>
                <p className="nzw__card-text">{p.text}</p>
              </div>
              {/* Deux photos droites, décalées et superposées */}
              <div className="nzw__photos" aria-hidden="true">
                <img src={photo(`home.why.${i * 2 + 1}`)} alt="" loading="lazy" className="nzw__photo nzw__photo--back" />
                <img src={photo(`home.why.${i * 2 + 2}`)} alt="" loading="lazy" className="nzw__photo nzw__photo--front" />
              </div>
            </li>
          )
        })}
      </ol>
    </section>
    {/* Défilement pendant lequel la section reste à l'écran (ordinateur) */}
    <div className="nzw__spacer" aria-hidden="true" />
    </div>
  )
}

/* Les régions (homeRegions.css), d'après deux modèles Webflow :
   - entrée : la photo de la région occupe tout l'écran puis rétrécit en grande carte à droite (section figée
     pendant le défilement), pendant que le titre et la liste des régions apparaissent à gauche ;
   - ensuite : la liste des 5 régions en accordéon (la région ouverte montre son accroche, son texte, ses lieux
     à voir et un lien) et, à droite, la photo de la région ouverte avec « 01 / 05 », son nom et sa saison.
   Téléphone, tablette ou animations réduites : même mise en page, sans l'entrée plein écran. */
function Regions() {
  const photo = usePhoto()
  const root = useRef(null)
  const t = useT('home')
  const { lang } = useLanguage()
  const [active, setActive] = useState(0)
  const texts = t('regions')
  const region = regions[active]
  const tr = texts[active]
  const season = (r, style) => `${monthName(r.months[0], lang, style)} → ${monthName(r.months[1], lang, style)}`

  useLayoutEffect(() => {
    if (!root.current) return undefined
    const mm = gsap.matchMedia(root.current)
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const section = root.current
      const media = section.querySelector('.nzr__media')
      const slot = section.querySelector('.nzr__slot')
      // Position finale de la photo : la case de droite, en pixels dans la section
      const box = () => {
        const s = section.getBoundingClientRect()
        const b = slot.getBoundingClientRect()
        return { top: b.top - s.top, left: b.left - s.left, width: b.width, height: b.height }
      }
      const spacer = section.parentElement.querySelector('.nzr__spacer')
      const words = media.querySelectorAll('.nzr__statement-w')
      // La section est figée par le navigateur (position: sticky, voir homeRegions.css → .nzr-pin) et non par
      // GSAP : pas d'à-coup quand la photo arrive en haut. On suit le défilement de l'enveloppe, qui ne bouge pas,
      // sur la hauteur du bloc vide placé sous la section (.nzr__spacer).
      gsap.timeline({
        scrollTrigger: {
          trigger: section.parentElement,
          start: 'top top',
          end: () => `+=${spacer.offsetHeight}`,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
        // 1. Photo plein écran : la petite invitation, puis la phrase mot à mot au milieu (flou → net),
        //    un instant à l'écran, puis tout s'efface
        .fromTo('.nzr__statement', { '--nzr-veil': 0 }, { '--nzr-veil': 1, duration: 0.3, ease: 'none' }, 0)
        .fromTo('.nzr__kicker', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }, 0)
        .fromTo(words, { opacity: 0, filter: 'blur(12px)', yPercent: 40 }, {
          opacity: 1, filter: 'blur(0px)', yPercent: 0, duration: 0.35, ease: 'power2.out', stagger: { amount: 0.7 },
        }, 0.15)
        .to('.nzr__statement', { opacity: 0, y: -40, duration: 0.3, ease: 'power2.in' }, 1.45)
        // 2. La photo se pose dans la case de droite.
        //    Départ : tout l'écran (la section est centrée et moins large que l'écran : on déborde de chaque côté)
        .fromTo(media, {
          top: 0,
          left: () => -(document.documentElement.clientWidth - section.offsetWidth) / 2,
          width: () => document.documentElement.clientWidth,
          height: () => window.innerHeight,
          borderRadius: 0,
        }, {
          top: () => box().top, left: () => box().left, width: () => box().width, height: () => box().height, borderRadius: 18,
          ease: 'power2.inOut', duration: 1.3,
        }, 1.7)
        .fromTo('.nzr__media-ui', { opacity: 0 }, { opacity: 1, duration: 0.4 }, 2.6)
        .from('.nzr__head > *', { y: 50, opacity: 0, duration: 0.5, stagger: 0.08 }, 2.3)
        .from('.nzr__item', { x: -40, opacity: 0, duration: 0.5, stagger: 0.06 }, 2.4)
    })
    return () => mm.revert()
  }, [])

  // Région ouverte : ses textes arrivent l'un après l'autre
  useGsap(root, () => {
    gsap.fromTo('.nzr__item.is-open .nzr__body > *', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: 'expo.out', clearProps: 'transform,opacity' })
  }, [active])

  // Enveloppe gérée par React autour de la section figée (voir ServicesList.jsx)
  return (
    <div className="nzr-pin">
    <section ref={root} className="nzr" aria-labelledby="nzr-title">
      <div className="nzr__head">
        <div>
          <p className="nzr__label"><span aria-hidden="true" />{t('regionsLabel')}</p>
          <h2 id="nzr-title" className="nzr__title">{t('regionsTitle')}</h2>
        </div>
        <p className="nzr__lead">{t('regionsText')}</p>
      </div>

      <div className="nzr__grid">
        {/* Accordéon des régions */}
        <ul className="nzr__list" aria-label={t('regionsTabs')}>
          {regions.map((r, i) => {
            const open = i === active
            const text = texts[i]
            return (
              <li key={r.id} className={`nzr__item${open ? ' is-open' : ''}`}>
                <button type="button" aria-expanded={open} onClick={() => setActive(i)} className="nzr__toggle">
                  <span className="nzr__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="nzr__name">{text.name}</span>
                  <span className="nzr__season">{season(r)}</span>
                  <span className="nzr__plus" aria-hidden="true">{open ? <Minus /> : <Plus />}</span>
                </button>
                {open && (
                  <div className="nzr__body">
                    <p className="nzr__tagline">{text.tagline}</p>
                    <p className="nzr__text">{text.text}</p>
                    <ul className="nzr__places" aria-label={t('mustSee')}>
                      {r.places.map((p, n) => (
                        <li key={p.name}>
                          <A href={`/destinations/${slugify(p.name)}`} className="nzr__place">
                            <img src={photo(p.slot)} alt="" loading="lazy" />
                            <span>{text.places[n]}</span>
                          </A>
                        </li>
                      ))}
                    </ul>
                    <div className="nzr__links">
                      <A href="/destinations" className="nzr__link">{t('exploreRegion')}<ArrowUpRight aria-hidden="true" /></A>
                      <A href="/circuits" className="nzr__link nzr__link--soft">{t('seeCircuits')}</A>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        {/* Case de la photo (la photo s'y pose à la fin de l'entrée) */}
        <div className="nzr__slot" aria-hidden="true" />
      </div>

      {/* Photo de la région ouverte : plein écran au départ, puis dans la case de droite */}
      <div className="nzr__media">
        <div className="nzr__photos" aria-hidden="true">
          {regions.map((r, i) => <img key={r.id} src={photo(r.slot)} alt="" className={i === active ? 'is-active' : undefined} />)}
        </div>
        <div className="nzr__media-ui">
          <span className="nzr__badge">{t('regionsLabel')}</span>
          <span className="nzr__count">{String(active + 1).padStart(2, '0')} / {String(regions.length).padStart(2, '0')}</span>
          <div className="nzr__caption">
            <div>
              <small>{tr.tagline}</small>
              <strong>{tr.name}</strong>
            </div>
            <span className="nzr__big">{season(region)}</span>
          </div>
        </div>
        {/* Texte au milieu de la photo plein écran (ordinateur), révélé mot à mot au défilement */}
        <div className="nzr__statement" aria-hidden="true">
          <span className="nzr__kicker"><i />{t('regionsKicker')}</span>
          <p className="nzr__statement-text">
            {t('regionsStatement').split(' ').map((w, i) => <span key={i} className="nzr__statement-w">{w}</span>)}
          </p>
        </div>
      </div>
    </section>
    {/* Défilement pendant lequel la section reste en haut (texte, puis photo qui se pose) */}
    <div className="nzr__spacer" aria-hidden="true" />
    </div>
  )
}

/* Voyages signature (homeTrips.css), d'après un modèle Webflow : photo du voyage choisi en fond, titre en haut
   à gauche et carte des voyages en bas à droite ; survoler ou choisir un voyage change la photo de fond.
   Sur ordinateur, elle s'ouvre depuis le bouton « Parler à un expert » de la section Services (ServicesList.jsx :
   la photo apparaît en pilule à la place du bouton et s'agrandit jusqu'à remplir l'écran). */
function Trips() {
  const photo = usePhoto()
  const root = useRef(null)
  const t = useT('home')
  const [active, setActive] = useState(0)
  const items = trips.map((trip, i) => ({ ...trip, ...t('trips')[i] }))
  const words = t('tripsTitle').split(' ')

  return (
    <section ref={root} className="nzx" aria-labelledby="nzx-title">
      {/* Photo de fond (celle du voyage choisi), découpée en pilule au départ */}
      <div className="nzx__frame" aria-hidden="true">
        <div className="nzx__frames">
          {items.map((trip, i) => (
            <img key={trip.name} src={photo(trip.slot)} alt="" className={i === active ? 'is-active' : undefined} />
          ))}
        </div>
        <span className="nzx__shade" />
      </div>

      <div className="nzx__content">
        <div className="nzx__head">
          <p className="nzx__label"><span aria-hidden="true" />{t('tripsLabel')}</p>
          <h2 id="nzx-title" className="nzx__title" aria-label={t('tripsTitle')}>
            {words.map((w, i) => (
              <React.Fragment key={i}><span className="nzx__w" aria-hidden="true"><span>{w}</span></span>{i < words.length - 1 ? ' ' : null}</React.Fragment>
            ))}
          </h2>
          <A href="/circuits" className="nzx__all">{t('tripsAll')}<ArrowUpRight aria-hidden="true" /></A>
        </div>

        {/* Carte des voyages : une ligne par voyage */}
        <ul className="nzx__card">
          {items.map((trip, i) => (
            <li key={trip.name}>
              <A
                href={quoteHref('trip', trip.name)}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={`nzx__row${i === active ? ' is-active' : ''}`}
              >
                <span className="nzx__name">
                  {trip.name}
                  <small>{t('strip.days', { days: trip.days, nights: trip.days - 1 })}</small>
                </span>
                <span className="nzx__text">{trip.text}</span>
                <span className="nzx__go" aria-hidden="true"><ArrowUpRight /></span>
              </A>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}


/* Appel final : bandeau « Vous ne savez pas par où commencer ? » (badge qui tourne, texte, bouton vers Contact) */
function FinalCta() {
  const root = useRef(null)
  const t = useT('home')

  useGsap(root, () => {
    const ease = 'expo.out'
    gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 85%', once: true } })
      .from('.nzw__help', { y: 50, opacity: 0, duration: 1.1, ease })
      .from('.nzw__help > *', { y: 20, opacity: 0, duration: 0.8, stagger: 0.1, ease }, 0.25)
  })

  return (
    <section ref={root} className="nzk" aria-labelledby="nzk-title">
      <div className="nzw__help">
        <TalkBadge />
        <div className="nzw__help-text">
          <h2 id="nzk-title" className="nzw__help-title">{t('notSure')}</h2>
          <p className="nzw__help-sub">{t('notSureText')}</p>
        </div>
        <A href="/contact" className="nzw__btn">{t('talkExpert')}<ArrowUpRight aria-hidden="true" /></A>
      </div>
    </section>
  )
}

/* ================= Page ================= */

function Home() {
  const photo = usePhoto()
  // Preloader au premier affichage, puis entrée du hero
  const [ready, setReady] = useState(() => !shouldPlayPreloader())

  // Recalcule les positions une fois les images chargées
  useLayoutEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    const t = setTimeout(refresh, 600)
    return () => {
      window.removeEventListener('load', refresh)
      clearTimeout(t)
    }
  }, [])

  return (
    <>
      {!ready && <Preloader onDone={() => setReady(true)} />}
      <main className="w-full overflow-x-clip bg-[#D5E8E2] flex flex-col items-center">
        <Hero ready={ready} />
        <TripStrip />
        <WaysOverview ways={ways} />
        <AboutUs regions={regions.length} />
        {/* Voyages signature s'ouvre depuis le bouton de fin des Services */}
        <ServicesList services={services} ctaImage={photo(trips[0].slot)}>
          <Trips />
        </ServicesList>
        <Regions />
        <Intro />
        {/* Même largeur et même écart que les autres sections */}
        <Testimonials className="w-[90vw] mt-[clamp(70px,8vw,140px)]" />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}

export default Home
