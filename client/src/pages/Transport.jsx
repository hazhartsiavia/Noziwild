import React, { useState, useRef, useLayoutEffect } from 'react'
import { ArrowDown, BadgeCheck, Car, Headset, Plane, ReceiptText, ShieldCheck, Ship } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Deux from "../assets/images/2.jpg";
import Tana from "../assets/images/Tana.jpg";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CARD, CARD_BADGE, CARD_BODY, CARD_FOOT, CARD_MEDIA, CARD_TEXT, CARD_TITLE, CardMeta } from '../components/Card'
import AddToTrip from '../components/AddToTrip'
import { useT } from '../i18n/LanguageContext';
import { localize } from '../i18n/localize';
import OffersStatus from '../components/OffersStatus'
import { useOffers } from '../utils/useOffers'
import { A } from '../i18n/router'
import './transport.css'
import SiteMedia from '../components/SiteMedia'

gsap.registerPlugin(ScrollTrigger)

/* Constantes partagées : mêmes valeurs que dans About, Explore, Choose, Trips et Blog */
const SECTION_WIDTH = "w-[90vw] lg:max-w-[90vw] xl:max-w-[95vw]"
const SECTION_TITLE = "text-[clamp(2rem,4.4vw,4rem)] font-bold text-forest leading-[1.08] tracking-tight"
const SECTION_SUBTITLE = "text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl"
const META_TEXT = "text-xs sm:text-sm"
// Une seule ligne à partir de la tablette : la taille se calcule sur la longueur du titre (--chars), qui change selon la langue.
// Sur téléphone, une ligne serait illisible : le titre passe sur deux lignes.
const HERO_TITLE = "text-[clamp(1.5rem,7vw,2.25rem)] md:whitespace-nowrap md:text-[min(calc((90vw-4rem)/(var(--chars)*0.58)),3rem)] lg:text-[min(calc((90vw-23rem)/(var(--chars)*0.58)),3.5rem)] font-semibold uppercase leading-[1.1] tracking-tight text-white [text-wrap:balance]"
const ON_IMAGE_TITLE = "text-[clamp(2rem,4.4vw,4rem)] font-bold text-white leading-[1.08] tracking-tight"
const SECTION_GAP = "mt-[50px] md:mt-[100px]"
const GOLD = "bg-[#C49849]"
const GREEN = "bg-[#074636]"

/* ---------------------------- Données ---------------------------- */
// Textes affichés : locales/<langue>/transport.json, posés sur ces données par localize()
// (mêmes clés, listes dans le même ordre)

const HERO = {
  title: 'Getting There Is Part of the Journey',
  ctaLabel: 'Plan My Transfers',
  ctaHref: '/contact',
  more: 'See more',
  image: Deux, // à remplacer par ta photo
  imageAlt: 'A 4x4 driving along a scenic road',
}

// category : 'land' | 'air' | 'sea'
const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'land', label: 'Land' },
  { id: 'air', label: 'Air' },
  { id: 'sea', label: 'Sea' },
]

// Moyens de transport : dans la base, gérés depuis /admin/offers/transport

const STEPS = [
  { id: 1, title: 'Tell Us Your Plan', text: 'Share your dates, destinations and group size. Not sure yet? We suggest a route.' },
  { id: 2, title: 'We Pick the Best Mix', text: 'Our team combines road, air and sea so the trip stays smooth, safe and well paced.' },
  { id: 3, title: 'Confirm & Pay Online', text: 'You receive a clear quote with everything included, and confirm in a few clicks.' },
  { id: 4, title: 'Travel With Support', text: 'Meet your driver or captain on the day. Our team is one call away the whole time.' },
]

const INCLUDED = [
  { id: 1, title: 'Trained Drivers', text: 'Experienced, licensed and familiar with every road.' },
  { id: 2, title: 'Insured Vehicles', text: 'Regularly serviced vehicles with full insurance.' },
  { id: 3, title: 'Fair, Fixed Prices', text: 'No surprises: fuel, tolls and fees are in the quote.' },
  { id: 4, title: '24/7 Support', text: 'A real person to help if your plans change.' },
]

const INCLUDED_ICONS = [BadgeCheck, ShieldCheck, ReceiptText, Headset]
const MODE_ICONS = { land: Car, air: Plane, sea: Ship }

const FAQS = [
  { id: 1, q: 'Can I choose my own transport?', a: 'Yes. Tell us what you prefer and we adapt the plan. If you have no preference, we recommend the best option for each leg.' },
  { id: 2, q: 'Are meals and fuel included?', a: 'Fuel, driver and tolls are always included in the quote. Meals are only included when the trip description says so.' },
  { id: 3, q: 'How much luggage can I bring?', a: 'One suitcase and one small bag per person is the standard. Domestic flights have stricter weight limits, and we tell you the exact allowance when you book.' },
  { id: 4, q: 'Is it safe to travel by road?', a: 'Our drivers are selected and trained by us, and we avoid night driving on difficult routes. We adapt schedules to road and weather conditions.' },
  { id: 5, q: 'Can I change or cancel a booking?', a: 'You can change dates free of charge up to 7 days before departure, subject to availability. Cancellation terms depend on the service and are shown in your quote.' },
  { id: 6, q: 'Do you offer airport pickup?', a: 'Yes. A driver waits for you at arrivals with a sign, even if your flight is delayed.' },
]

const CTA = {
  title: 'Ready to Hit the Road?',
  text: 'Tell us where you want to go and we will handle the rest.',
  label: 'Get a Free Quote',
  href: '/contact',
  image: Tana,
}

/* ----------------------- Utilitaires GSAP ------------------------ */

function useGsap(scope, setup, deps = []) {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia(scope)
    mm.add('(prefers-reduced-motion: no-preference)', () => setup())
    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

const reveal = (targets, from, to, extra = {}) =>
  gsap.fromTo(
    targets,
    { transition: 'none', ...from },
    { transition: 'none', clearProps: 'all', ...to, ...extra }
  )

/* Effet magnétique : le bouton suit légèrement le curseur puis revient avec un rebond élastique */
function useMagnetic(ref, strength = 0.3) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      const x = e.clientX - (r.left + r.width / 2)
      const y = e.clientY - (r.top + r.height / 2)
      gsap.to(el, { x: x * strength, y: y * strength, duration: 0.35, ease: 'power2.out' })
    }
    const onLeave = () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' })

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [ref, strength])
}

/* Titre découpé en mots, chaque mot monte depuis un masque */
function MaskedWords({ text }) {
  const words = text.split(' ')
  return words.map((w, i) => (
    <React.Fragment key={i}>
      <span aria-hidden="true" className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]">
        <span className="hero-word inline-block">{w}</span>
      </span>
      {i < words.length - 1 ? ' ' : ''}
    </React.Fragment>
  ))
}

/* -------------------------- Icônes ----------------------------- */

const Svg = ({ children, className = "w-5 h-5 md:w-6 md:h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

const CheckIcon = () => (
  <Svg className="w-4 h-4 shrink-0 text-[#C49849]">
    <path d="M20 6 9 17l-5-5" />
  </Svg>
)

const ArrowIcon = () => (
  <Svg className="w-5 h-5">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
)

const PlusIcon = ({ open }) => (
  <Svg className={`w-5 h-5 shrink-0 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)

/* -------------------------- Composants --------------------------- */

function Hero() {
  const hero = localize(HERO, useT('transport')('hero'))
  const root = useRef(null)
  const btnRef = useRef(null)
  useMagnetic(btnRef, 0.25)

  useGsap(root, () => {
    // 1. Arrivée : la photo grandit depuis le centre de l'écran, puis la barre de navigation, le titre et le bouton apparaissent
    const nav = document.querySelector('nav[aria-label="Main"]')
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
    tl.fromTo(root.current, { clipPath: 'inset(32% 30% 32% 30% round 1rem)' }, { clipPath: 'inset(0% 0% 0% 0% round 1.5rem)', duration: 1.5, ease: 'expo.inOut', clearProps: 'clipPath' })
      .fromTo('.hero-media', { scale: 1.35 }, { scale: 1, duration: 1.5, ease: 'expo.inOut', clearProps: 'transform' }, 0)
    if (nav) tl.fromTo(nav, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power2.out', clearProps: 'opacity' }, 1.1)
    tl.fromTo('.hero-word', { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.08, clearProps: 'all' }, 1)
      .fromTo('.hero-more', { y: -16, opacity: 0, transition: 'none' }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', clearProps: 'all' }, 1.45)
      .fromTo('.hero-cta', { y: 20, opacity: 0, transition: 'none' }, { y: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.7)', clearProps: 'all' }, 1.45)

    // 2. L'image glisse doucement au défilement
    gsap.fromTo('.hero-img', { yPercent: -6, scale: 1.15 }, {
      yPercent: 6, scale: 1.15, ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
    })
  })

  return (
    <div ref={root} className={`relative flex flex-col overflow-hidden rounded-3xl ${GREEN} text-white min-h-[calc(100svh-7rem)] md:min-h-[max(620px,calc(100svh-7rem))]`}>
      <div className="hero-media absolute inset-0">
        <SiteMedia slot="transport.hero" alt={hero.imageAlt} className="hero-img absolute inset-0 w-full h-full object-cover" />
      </div>
      {/* Seul le bas s'assombrit, sous le titre : le reste de la photo ou de la vidéo reste intact */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#072a1f]/90 via-[#072a1f]/40 via-15% to-transparent to-35%" />

      {/* Coin en haut : descend vers la liste des transports */}
      <a href="#transports" className="hero-more absolute right-4 top-4 md:right-6 md:top-6 z-10 inline-flex items-center gap-2 rounded-full border border-white/30 bg-[#072a1f]/55 hover:bg-[#072a1f]/75 backdrop-blur-md transition-colors pl-4 pr-1.5 py-1.5 text-sm font-medium text-white">
        {hero.more}
        <span className={`w-7 h-7 rounded-full ${GOLD} flex items-center justify-center`}><ArrowDown size={15} aria-hidden="true" /></span>
      </a>

      <div className="relative mt-auto flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 lg:gap-10 p-5 pt-48 md:p-8 md:pt-48 lg:p-10">
        <h1 aria-label={hero.title} style={{ "--chars": hero.title.length }} className={`${HERO_TITLE} min-w-0`}>
          <MaskedWords text={hero.title} />
        </h1>
        <A
          ref={btnRef}
          href={hero.ctaHref}
          className="hero-cta self-start lg:self-end shrink-0 inline-flex items-center gap-3 rounded-full bg-white hover:bg-white/90 transition-colors text-slate-900 pl-5 pr-1.5 py-1.5 text-sm md:text-base font-medium"
        >
          {hero.ctaLabel}
          <span className={`w-9 h-9 md:w-10 md:h-10 rounded-full ${GOLD} flex items-center justify-center text-white`}><ArrowIcon /></span>
        </A>
      </div>
    </div>
  )
}

/* Bandeau qui défile : les moyens de transport de la base. Décoratif, la même liste suit plus bas. */
function ModesMarquee() {
  const { offers } = useOffers('transport')
  const root = useRef(null)

  useGsap(root, () => {
    if (!offers.length) return
    gsap.to('.marquee-track', { xPercent: -50, duration: 45, ease: 'none', repeat: -1 })
  }, [offers.length])

  return (
    <div ref={root} aria-hidden="true" className="marquee mt-8 md:mt-12 w-full overflow-hidden">
      <ul className="marquee-track flex w-max items-center">
        {[0, 1, 2, 3].flatMap((set) => offers.map((o) => {
          const Icon = MODE_ICONS[o.category] || Car
          return (
            <li key={`${set}-${o.id}`} className="flex items-center gap-3 px-6 md:px-10 text-lg md:text-2xl font-medium whitespace-nowrap text-forest/60">
              <Icon size={24} strokeWidth={1.6} />{o.title}
            </li>
          )
        }))}
      </ul>
    </div>
  )
}

// Carte de la liste : même présentation que les cartes de la page Circuits
function TransportCard({ item, categoryLabel }) {
  const t = useT('trip')
  return (
    <article className={`transport-card ${CARD}`}>
      <div className={`card-frame ${CARD_MEDIA}`}>
        {/* Plus haute que le cadre : c'est la marge dans laquelle la photo glisse au défilement */}
        <div className="card-media absolute inset-x-0 -inset-y-[10%]">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
        <span className={`transport-badge ${CARD_BADGE}`}>{item.duration}</span>
      </div>
      <div className={CARD_BODY}>
        <CardMeta items={[categoryLabel, item.capacity]} className="card-line" />
        <h3 className={`card-line ${CARD_TITLE}`}>{item.name}</h3>
        <p className={`card-line ${CARD_TEXT}`}>{item.text}</p>
        <ul className="mt-4 flex flex-col gap-2 text-sm text-slate-700">
          {item.perks.map((perk) => (
            <li key={perk} className="card-line flex items-center gap-2"><CheckIcon />{perk}</li>
          ))}
        </ul>
        <div className={`card-foot ${CARD_FOOT}`}>
          <p className="text-base md:text-lg font-medium text-slate-900">{t('onRequest')}</p>
          <AddToTrip variant="icon" item={{ kind: 'transport', ref: String(item.id), title: item.name, image: item.image, link: '/transport', details: item.capacity, price: null, unit: null }} />
        </div>
      </div>
    </article>
  )
}

// Offre de la base -> forme utilisée par les cartes
const toTransport = (o) => ({ id: o.id, category: o.category, name: o.title, image: o.image, capacity: o.capacity, duration: o.duration, text: o.text, perks: o.perks })

function TransportTypes() {
  const t = useT('transport')
  const categories = localize(CATEGORIES, t('categories'))
  const { offers, status } = useOffers('transport')
  const transports = offers.map(toTransport)
  const [category, setCategory] = useState('all')
  const root = useRef(null)
  const list = category === 'all' ? transports : transports.filter((item) => item.category === category)

  // Entrée au scroll
  useGsap(root, () => {
    reveal('.types-head > *', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.types-head', start: 'top 88%', once: true } })
    reveal('.tab-btn', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out', scrollTrigger: { trigger: '.tab-list', start: 'top 90%', once: true } })
  })

  /* Cartes, chacune avec son propre ScrollTrigger (rejoué à chaque changement de catégorie) :
     - à son arrivée dans l'écran, la carte monte, la photo se dévoile de bas en haut,
       puis le badge rebondit et les textes et le bouton suivent, un peu décalés d'une colonne à l'autre ;
     - tant qu'elle reste à l'écran, la photo glisse doucement avec le défilement. */
  useGsap(root, () => {
    const cards = gsap.utils.toArray('.transport-card')
    if (!cards.length) return
    const columns = getComputedStyle(cards[0].parentElement).gridTemplateColumns.split(' ').length

    cards.forEach((card, i) => {
      const q = gsap.utils.selector(card)
      const wait = (i % columns) * 0.14
      gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%', once: true } })
        .fromTo(card, { y: 100, opacity: 0, scale: 0.94, transition: 'none' }, { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'power3.out', clearProps: 'all' }, wait)
        .fromTo(q('.card-frame'), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.out', clearProps: 'clipPath' }, wait + 0.1)
        .fromTo(q('.card-line'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out', clearProps: 'all' }, wait + 0.35)
        .fromTo(q('.transport-badge'), { scale: 0, rotate: -12 }, { scale: 1, rotate: 0, duration: 0.6, ease: 'back.out(3)', clearProps: 'all' }, wait + 0.6)
        .fromTo(q('.card-foot p'), { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out', clearProps: 'all' }, wait + 0.75)
        .fromTo(q('.card-foot button'), { scale: 0, transition: 'none' }, { scale: 1, duration: 0.6, ease: 'back.out(2.5)', clearProps: 'all' }, wait + 0.85)

      gsap.fromTo(q('.card-media'), { yPercent: -8 }, {
        yPercent: 8, ease: 'none',
        scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      })
    })
  }, [category, offers])

  return (
    <div ref={root} id="transports" className={`${SECTION_GAP} scroll-mt-6`}>
      <div className="types-head mb-8 md:mb-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 lg:gap-12">
        <h2 className={`${SECTION_TITLE} lg:max-w-[52%]`}>{t('typesTitle')}</h2>
        <p className={`hidden md:block ${SECTION_SUBTITLE} lg:max-w-lg`}>
          {t('typesText')}
        </p>
      </div>

      <div className="tab-list mb-8 flex flex-wrap gap-2 md:gap-3" role="tablist" aria-label={t('tabsLabel')}>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={category === c.id}
            onClick={() => setCategory(c.id)}
            className={`tab-btn rounded-full px-5 py-2 text-sm md:text-base font-medium transition-colors ${
              category === c.id ? `${GREEN} text-white` : 'bg-white text-slate-700 hover:bg-white/70'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <OffersStatus status={status} empty={list.length === 0} />
      {status === 'ready' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-9">
          {list.map((item) => (
            <TransportCard key={item.id} item={item} categoryLabel={categories.find((c) => c.id === item.category)?.label} />
          ))}
        </div>
      )}
    </div>
  )
}

function HowItWorks() {
  const t = useT('transport')
  const steps = localize(STEPS, t('steps'))
  const root = useRef(null)

  useGsap(root, () => {
    reveal('.how-title', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.how-title', start: 'top 88%', once: true } })
    const trigger = { trigger: '.how-list', start: 'top 85%', once: true }
    reveal('.step-card', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.14, ease: 'power3.out', scrollTrigger: trigger })
    reveal('.step-badge', { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, duration: 0.7, stagger: 0.14, delay: 0.2, ease: 'back.out(2.4)', scrollTrigger: trigger })
  })

  return (
    <div ref={root} className={SECTION_GAP}>
      <h2 className={`how-title ${SECTION_TITLE} text-center mb-10 md:mb-16`}>{t('howTitle')}</h2>
      <ol className="how-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {steps.map((step) => (
          <li key={step.id} className="step-card rounded-2xl bg-white p-6 md:p-7">
            <span className={`step-badge w-12 h-12 rounded-full ${GOLD} flex items-center justify-center text-white text-lg font-medium`}>
              {step.id}
            </span>
            <h3 className="mt-6 text-xl md:text-2xl font-medium text-forest leading-snug">{step.title}</h3>
            <p className="mt-3 text-sm md:text-base leading-relaxed text-slate-600">{step.text}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Included() {
  const t = useT('transport')
  const hero = t('hero')
  const included = localize(INCLUDED, t('included'))
  const root = useRef(null)

  useGsap(root, () => {
    reveal('.inc-head > *', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.inc-head', start: 'top 85%', once: true } })
    // Les cartes arrivent décalées en escalier et s'alignent au défilement
    gsap.fromTo('.inc-card', { y: (i) => 40 + i * 50, opacity: 0.2 }, {
      y: 0, opacity: 1, ease: 'none', stagger: 0.05,
      scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'top 25%', scrub: 0.6 },
    })
  })

  return (
    <div ref={root} className={SECTION_GAP}>
      <div className="inc-head max-w-3xl">
        <p className={`mb-3 flex items-center gap-2 ${META_TEXT} font-medium uppercase tracking-wide text-[#9a742f]`}>
          <span className={`w-1.5 h-1.5 rounded-full ${GOLD}`} aria-hidden="true" />
          {t('incEyebrow')}
        </p>
        <h2 className={SECTION_TITLE}>{t('incTitle')}</h2>
        <p className={`mt-4 ${SECTION_SUBTITLE}`}>{t('incText')}</p>
      </div>

      <div className="mt-14 md:mt-16 flex flex-col lg:flex-row lg:items-end gap-10 lg:gap-8">
        <A href={HERO.ctaHref} className={`order-last lg:order-first self-start shrink-0 inline-flex items-center gap-3 rounded-full ${GREEN} hover:bg-[#0a5f48] transition-colors text-white pl-5 pr-1.5 py-1.5 font-medium`}>
          {hero.ctaLabel}
          <span className={`w-9 h-9 rounded-full ${GOLD} flex items-center justify-center`}><ArrowIcon /></span>
        </A>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
          {included.map((item, i) => {
            const Icon = INCLUDED_ICONS[i]
            return (
              <div key={item.id} className="inc-card relative rounded-2xl bg-white p-5 pt-12 md:pt-14">
                <span className={`absolute right-4 -top-5 w-12 h-12 md:w-14 md:h-14 rounded-xl ${GOLD} text-white flex items-center justify-center`}><Icon size={24} aria-hidden="true" /></span>
                <h3 className="text-lg md:text-xl font-medium leading-snug text-forest">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.text}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* Une question : le panneau s'ouvre et se ferme en hauteur, en douceur */
function FaqItem({ f, isOpen, onToggle }) {
  const panel = useRef(null)
  const first = useRef(true)

  useLayoutEffect(() => {
    const el = panel.current
    if (!el) return
    if (first.current) {
      first.current = false
      gsap.set(el, { height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 })
      return
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    gsap.to(el, { height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0, duration: reduce ? 0 : 0.5, ease: 'power3.inOut' })
  }, [isOpen])

  return (
    <div className="faq-item rounded-2xl bg-white">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 text-left p-5 md:p-6"
      >
        <span className="text-base md:text-xl font-medium text-slate-900">{f.q}</span>
        <PlusIcon open={isOpen} />
      </button>
      <div ref={panel} className="overflow-hidden" aria-hidden={!isOpen}>
        <p className="px-5 md:px-6 pb-5 md:pb-6 -mt-1 text-sm md:text-base leading-relaxed text-slate-600">{f.a}</p>
      </div>
    </div>
  )
}

function Faq() {
  const t = useT('transport')
  const faqs = localize(FAQS, t('faqs'))
  const [open, setOpen] = useState(1)
  const root = useRef(null)

  useGsap(root, () => {
    reveal('.faq-head > *', { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.faq-head', start: 'top 85%', once: true } })
    reveal('.faq-item', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.09, ease: 'power3.out', scrollTrigger: { trigger: '.faq-list', start: 'top 85%', once: true } })
  })

  return (
    <div ref={root} className={`${SECTION_GAP} grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8 lg:gap-16`}>
      <div className="faq-head self-start lg:sticky lg:top-6">
        <h2 className={SECTION_TITLE}>{t('faqTitle')}</h2>
        <p className={`mt-4 md:mt-6 ${SECTION_SUBTITLE}`}>
          {t('faqText')}
        </p>
      </div>

      <div className="faq-list flex flex-col gap-3">
        {faqs.map((f) => (
          <FaqItem key={f.id} f={f} isOpen={open === f.id} onToggle={() => setOpen(open === f.id ? null : f.id)} />
        ))}
      </div>
    </div>
  )
}

function Cta() {
  const cta = localize(CTA, useT('transport')('cta'))
  const root = useRef(null)
  const btnRef = useRef(null)
  useMagnetic(btnRef, 0.2)

  useGsap(root, () => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 82%', once: true } })
    tl.fromTo(root.current, { clipPath: 'inset(100% 0% 0% 0% round 1.5rem)', transition: 'none' }, { clipPath: 'inset(0% 0% 0% 0% round 1.5rem)', duration: 1.3, ease: 'expo.inOut', clearProps: 'clipPath,transition' })
      .fromTo('.cta-copy > h2, .cta-copy > p', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75, stagger: 0.12, ease: 'power3.out', clearProps: 'all' }, 0.7)
      .fromTo('.cta-link', { y: 20, opacity: 0, transition: 'none' }, { y: 0, opacity: 1, duration: 0.65, ease: 'back.out(2)', clearProps: 'all' }, 1.1)

    gsap.fromTo('.cta-bg', { yPercent: -8, scale: 1.2 }, {
      yPercent: 8, scale: 1.2, ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
    })
  })

  return (
    <div ref={root} className={`${SECTION_GAP} relative overflow-hidden rounded-3xl min-h-[380px] md:min-h-[460px] flex`}>
      <SiteMedia slot="transport.cta" alt="" className="cta-bg absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
      <div className="cta-copy relative flex flex-col justify-end p-6 md:p-12 max-w-2xl">
        <h2 className={ON_IMAGE_TITLE}>{cta.title}</h2>
        <p className="mt-4 text-sm md:text-lg text-white/85 leading-relaxed">{cta.text}</p>
        <A
          ref={btnRef}
          href={cta.href}
          className="cta-link mt-6 md:mt-8 self-start inline-flex items-center gap-3 rounded-full bg-white hover:bg-white/90 transition-colors text-slate-900 pl-6 pr-2.5 py-2.5 font-medium"
        >
          {cta.label}
          <span className={`w-10 h-10 rounded-full ${GOLD} flex items-center justify-center text-white`}><ArrowIcon /></span>
        </A>
      </div>
    </div>
  )
}

function Transport() {
  /* Recalcule les positions ScrollTrigger quand les images et polices sont chargées,
     et quand la hauteur de la page change (ex. ouverture d'une question de la FAQ). */
  useLayoutEffect(() => {
    let timer
    const refresh = () => { clearTimeout(timer); timer = setTimeout(() => ScrollTrigger.refresh(), 150) }

    window.addEventListener('load', refresh)
    document.fonts?.ready?.then(refresh)

    const images = Array.from(document.querySelectorAll('img'))
    images.forEach((img) => {
      if (!img.complete) img.addEventListener('load', refresh, { once: true })
    })

    const ro = new ResizeObserver(refresh)
    ro.observe(document.body)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('load', refresh)
      images.forEach((img) => img.removeEventListener('load', refresh))
      ro.disconnect()
    }
  }, [])

  return (
    <>
    <section className="w-full overflow-x-clip pt-0 pb-12 bg-[#D5E8E2] flex flex-col items-center">
      <Navbar />
      <div className={`${SECTION_WIDTH} mt-2 md:mt-4`}>
        <Hero />
      </div>
      <ModesMarquee />
      <div className={SECTION_WIDTH}>
        <TransportTypes />
        <Included />
        <HowItWorks />
        <Faq />
        <Cta />
      </div>
    </section>
    <Footer />
    </>
  )
}

export default Transport