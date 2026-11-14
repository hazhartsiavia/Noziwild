import React, { useState, useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Ramena from '../assets/images/site/ramena-beach-aerial.jpg'
import NosyIranja from '../assets/images/site/nosy-iranja-aerial.jpg'
import NosyLonjo from '../assets/images/site/sugar-loaf-view.jpg'
import Ambanja from '../assets/images/site/sambirano-river.jpg'
import Deux from '../assets/images/site/coastal-tsingy.jpg'
import Tana from '../assets/images/site/antananarivo-rice-fields.jpg'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PageHero from '../components/PageHero'
import Img from '../components/Img'
import PageCta, { PAGE_CTA_GOLD, PAGE_CTA_GHOST } from '../components/PageCta'
import { slugify } from './destinationsData'
import { useLanguage, useT } from '../i18n/LanguageContext'
import { monthName } from '../utils/format'
import { usePhoto } from '../sitePhotos'
import { A } from '../i18n/router'

gsap.registerPlugin(ScrollTrigger)

const W = 'w-[90vw] max-w-[1360px]'
const GOLD = 'bg-[#A9813A] hover:bg-[#8C6A2C]'
const BTN = 'inline-flex items-center justify-center text-sm font-medium px-6 py-3 rounded-full active:scale-95 transition'
const H2 = 'text-[clamp(2.6rem,5.4vw,5rem)] text-forest leading-[1] [text-wrap:balance]'

/* ---------------------------- Données ---------------------------- */
// Noms, accroches, textes et lieux affichés : les mêmes que la page d'accueil (home.regions, même ordre).
// Les noms anglais des lieux servent à construire leur adresse.

const regions = [
  {
    id: 'north',
    name: 'The North',
    tagline: 'Emerald bays, spice islands and dry forests',
    text: 'Sail the bay of Diego Suarez, hike the sharp limestone of Ankarana and finish on the islands around Nosy Be.',
    slot: 'region.north', image: NosyIranja,
    months: [4, 5, 6, 7, 8, 9, 10, 11],
    places: [
      { name: 'Ramena Beach', slot: 'region.north.1', image: Ramena },
      { name: 'Nosy Iranja', slot: 'region.north.2', image: NosyIranja },
      { name: 'Ambanja', slot: 'region.north.3', image: Ambanja },
    ],
  },
  {
    id: 'highlands',
    name: 'The Highlands',
    tagline: 'Royal hills, rice terraces and cool mornings',
    text: 'Start in Antananarivo, climb to the royal hill of Ambohimanga and ride south through the terraced valleys to Antsirabe.',
    slot: 'region.highlands', image: Tana,
    months: [5, 6, 7, 8, 9, 10],
    places: [
      { name: 'Antananarivo', slot: 'region.highlands.1', image: Tana },
      { name: 'Ambohimanga', slot: 'region.highlands.2', image: Deux },
      { name: 'Antsirabe', slot: 'region.highlands.3', image: Ambanja },
    ],
  },
  {
    id: 'west',
    name: 'The West',
    tagline: 'Baobab avenues and stone forests',
    text: 'Drive the famous Baobab Avenue at sunset, then cross the river to walk the Tsingy of Bemaraha.',
    slot: 'region.west', image: Deux,
    months: [5, 6, 7, 8, 9, 10],
    places: [
      { name: 'Baobab Avenue', slot: 'region.west.1', image: Deux },
      { name: 'Morondava', slot: 'region.west.2', image: NosyLonjo },
      { name: 'Tsingy de Bemaraha', slot: 'region.west.3', image: Ambanja },
    ],
  },
  {
    id: 'south',
    name: 'The South',
    tagline: 'Canyons, white sand and coastal villages',
    text: 'Hike the sandstone canyons of Isalo, swim in natural pools and end the trip on the Vezo coast.',
    slot: 'region.south', image: NosyLonjo,
    months: [4, 5, 6, 7, 8, 9, 10, 11],
    places: [
      { name: 'Isalo', slot: 'region.south.1', image: NosyLonjo },
      { name: 'Ifaty coast', slot: 'region.south.2', image: Ramena },
      { name: 'Fort Dauphin', slot: 'region.south.3', image: NosyIranja },
    ],
  },
  {
    id: 'east',
    name: 'The East',
    tagline: 'Rainforest, lemurs and island beaches',
    text: 'Listen for the indri at dawn in Andasibe, then take a boat to Ile Sainte-Marie or into the Masoala peninsula.',
    slot: 'region.east', image: Ambanja,
    months: [9, 10, 11, 12],
    places: [
      { name: 'Andasibe', slot: 'region.east.1', image: Ambanja },
      { name: 'Ile Sainte-Marie', slot: 'region.east.2', image: NosyIranja },
      { name: 'Masoala', slot: 'region.east.3', image: Tana },
    ],
  },
]

/* ----------------------- Hook utilitaire GSAP ---------------------- */
/* Crée un gsap.context lié à `scope`, respecte prefers-reduced-motion,
   et nettoie tout au démontage. */

function useGsap(scope, setup, deps = []) {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia(scope)
    mm.add('(prefers-reduced-motion: no-preference)', () => setup())
    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/* -------------------------- Composants --------------------------- */

function RegionNav() {
  const root = useRef(null)
  const t = useT('destinations')
  const names = useT('home')('regions').map((r) => r.name)

  useGsap(root, () => {
    // Pastille active : suit la région visible à l'écran
    const links = gsap.utils.toArray('.region-link')
    const setActive = (id) =>
      links.forEach((l) => {
        const on = l.getAttribute('href') === `#${id}`
        l.classList.toggle('bg-[#0C3E2E]', on)
        l.classList.toggle('text-white', on)
      })

    regions.forEach((r) => {
      ScrollTrigger.create({
        trigger: `#${r.id}`,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && setActive(r.id),
      })
    })

    // Apparition de la barre
    gsap.from(root.current, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      clearProps: 'opacity,transform',
      scrollTrigger: { trigger: root.current, start: 'top 95%', once: true },
    })
  })

  return (
    <nav ref={root} aria-label={t('list.regions')} id="regions" className="sticky top-3 z-20 mt-16 md:mt-24 scroll-mt-4">
      <ul className="flex gap-2 rounded-full bg-white/85 backdrop-blur-md p-2 shadow-sm overflow-x-auto max-w-[90vw] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {regions.map((r, i) => (
          <li key={r.id} className="shrink-0">
            <A href={`#${r.id}`} className="region-link block rounded-full px-5 py-2.5 text-sm md:text-base text-slate-800 hover:bg-[#0C3E2E] hover:text-white transition">
              {names[i]}
            </A>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function Region({ region, flip }) {
  const photo = usePhoto()
  const root = useRef(null)
  const t = useT('destinations')
  const { lang } = useLanguage()
  const first = region.months[0]
  const last = region.months[region.months.length - 1]

  useGsap(root, () => {
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
    })

    // Révélation de l'image par un clip-path + dézoom
    tl.fromTo(
      '.region-frame',
      { clipPath: 'inset(12% 12% 12% 12% round 3rem)' },
      { clipPath: 'inset(0% 0% 0% 0% round 3rem)', duration: 1.3, ease: 'expo.out', clearProps: 'clipPath' }
    )
      .from('.region-badge', { x: -20, opacity: 0, duration: 0.6 }, '-=0.6')
      .from('.region-text > *', { y: 30, opacity: 0, duration: 0.8, stagger: 0.1, clearProps: 'all' }, '-=1')
      .from('.region-place', { y: 40, opacity: 0, duration: 0.7, stagger: 0.1, clearProps: 'all' }, '-=0.5')

    // L'image glisse légèrement au défilement (elle dépasse du cadre en hauteur : jamais agrandie, donc nette)
    gsap.fromTo(
      '.region-img',
      { yPercent: -4 },
      {
        yPercent: 4,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    )
  })

  return (
    <section ref={root} id={region.id} className={`${W} mt-16 md:mt-28 scroll-mt-24 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center`}>
      <div className={`region-frame relative aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5] overflow-hidden rounded-3xl ${flip ? 'lg:order-2' : ''}`}>
        <Img src={photo(region.slot)} alt={region.name} sizes="(min-width: 1024px) 1400px, 250vw" className="region-img absolute inset-x-0 -top-[6%] w-full h-[112%] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#072a1f]/60 via-transparent to-transparent" />
        <span className="region-badge absolute left-5 top-5 bg-[#F4F1EA] text-forest text-[11px] font-semibold uppercase tracking-[0.14em] px-3 py-1.5 rounded-sm">
          {t('list.bestFrom', { from: monthName(first, lang, 'long'), to: monthName(last, lang, 'long') })}
        </span>
      </div>

      <div className="region-text">
        <h2 className={H2}>{region.name}</h2>
        <p className="mt-3 text-lg md:text-2xl text-slate-700">{region.tagline}</p>
        <p className="mt-5 text-sm md:text-base text-slate-600 leading-relaxed max-w-xl">{region.text}</p>

        <p className="mt-8 mb-3 text-sm md:text-base font-medium text-slate-800">{t('list.mustSee')}</p>
        <ul className="grid grid-cols-3 gap-3 md:gap-4">
          {region.places.map((p) => (
            <li key={p.name} className="region-place">
              <A href={`/destinations/${slugify(p.name)}`} className="group block">
                <div className="aspect-square overflow-hidden rounded-3xl">
                  <Img src={photo(p.slot)} alt={p.label} className="w-full h-full object-cover img-zoom" />
                </div>
                <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-800 leading-snug group-hover:underline">{p.label}</p>
              </A>
            </li>
          ))}
        </ul>

        <A href="/circuits" className={`${BTN} ${GOLD} text-white mt-8`}>{t('list.seeCircuits')}</A>
      </div>
    </section>
  )
}

function Planner() {
  const photo = usePhoto()
  const root = useRef(null)
  const list = useRef(null)
  const t = useT('destinations')
  const names = useT('home')('regions').map((r) => r.name)
  const { lang } = useLanguage()
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const good = regions.filter((r) => r.months.includes(month))

  // Entrée du bloc au scroll
  useGsap(root, () => {
    gsap.from(root.current, {
      y: 80,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      clearProps: 'all',
      scrollTrigger: { trigger: root.current, start: 'top 85%', once: true },
    })
    gsap.from('.planner-month', {
      y: 16,
      opacity: 0,
      duration: 0.5,
      stagger: 0.04,
      ease: 'power2.out',
      clearProps: 'all',
      scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
    })
  })

  // Les cartes se ré-animent à chaque changement de mois
  useGsap(list, () => {
    gsap.fromTo(
      '.planner-card',
      { y: 40, opacity: 0, scale: 0.94 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out', clearProps: 'all' }
    )
  }, [month])

  return (
    <section ref={root} id="planner" className={`${W} mt-20 md:mt-32 scroll-mt-8 rounded-3xl bg-[#0C3E2E] text-white p-5 sm:p-8 md:p-14`}>
      <h2 className={`${H2} !text-white max-w-3xl`}>{t('list.plannerTitle')}</h2>
      <p className="mt-4 text-sm md:text-base text-white/75 max-w-xl">{t('list.plannerText')}</p>

      <div className="mt-8 flex flex-wrap gap-2 md:gap-3">
        {Array.from({ length: 12 }, (_, i) => (
          <button
            key={i}
            onClick={() => setMonth(i + 1)}
            aria-pressed={month === i + 1}
            className={`planner-month rounded-full px-4 py-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A9813A] ${
              month === i + 1 ? 'bg-[#A9813A] text-white' : 'border border-white/30 text-white/80 hover:border-white'
            }`}
          >
            {monthName(i + 1, lang)}
          </button>
        ))}
      </div>

      <div ref={list}>
        {good.length > 0 ? (
          <ul className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {good.map((r) => (
              <li key={r.id} className="planner-card">
                <A href={`#${r.id}`} className="group relative block aspect-[3/4] overflow-hidden rounded-3xl">
                  <Img src={photo(r.slot)} alt="" className="absolute inset-0 w-full h-full object-cover img-zoom" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#072a1f]/85 to-transparent" />
                  <p className="absolute inset-x-0 bottom-0 p-4 text-lg md:text-xl font-medium">{names[regions.indexOf(r)]}</p>
                </A>
              </li>
            ))}
          </ul>
        ) : (
          <p role="status" className="planner-card mt-10 text-white/80">{t('list.noRegion', { month: monthName(month, lang, 'long') })}</p>
        )}
      </div>
    </section>
  )
}

function Destinations() {
  const t = useT('destinations')
  const texts = useT('home')('regions')
  // Recalcule les positions une fois les images chargées
  useLayoutEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    const timer = setTimeout(refresh, 600)
    return () => {
      window.removeEventListener('load', refresh)
      clearTimeout(timer)
    }
  }, [])

  return (
    <>
      <main className="w-full overflow-x-clip bg-[#F4F1EA] flex flex-col items-center">
        <Navbar />
        <PageHero slot="dest.hero.2" title={`${t('list.title1')} ${t('list.title2')}`} crumb={t('list.eyebrow')} text={t('list.intro')} moreHref="#regions" moreLabel={t('list.explore')} />
        <RegionNav />
        {regions.map((r, i) => (
          <Region
            key={r.id}
            region={{ ...r, ...texts[i], places: r.places.map((p, n) => ({ ...p, label: texts[i].places[n] })) }}
            flip={i % 2 === 1}
          />
        ))}
        <Planner />
        <PageCta slot="dest.cta" title={t('list.ctaTitle')} text={t('list.ctaText')} floats={['dest.hero.1', 'dest.hero.3']}>
          <A href="/contact" className={PAGE_CTA_GOLD}>{t('list.ctaExpert')}</A>
          <A href="/circuits" className={PAGE_CTA_GHOST}>{t('list.ctaCircuits')}</A>
        </PageCta>
      </main>
      <Footer />
    </>
  )
}

export default Destinations