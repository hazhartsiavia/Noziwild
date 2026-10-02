import React, { useState, useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Deux from "../assets/images/2.jpg";
import Ambanja from "../assets/images/Ambanja.png";
import NosyLonjo from "../assets/images/NosyLonjo.png";
import NosyIranja from "../assets/images/NosyIranja.png";
import Ramena from "../assets/images/Ramena.png";
import Tana from "../assets/images/Tana.png";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

gsap.registerPlugin(ScrollTrigger)

/* Constantes partagées : mêmes valeurs que dans About, Explore, Choose, Trips et Blog */
const SECTION_WIDTH = "w-[90vw] lg:max-w-[90vw] xl:max-w-[95vw]"
const SECTION_TITLE = "text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-slate-900 leading-[1.15] tracking-tight"
const SECTION_SUBTITLE = "text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl"
const META_TEXT = "text-xs sm:text-sm"
const STATEMENT_TITLE = "text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-medium uppercase leading-[1.15] tracking-tight text-slate-900"
const ON_IMAGE_TITLE = "text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-white leading-[1.15] tracking-tight"
const SECTION_GAP = "mt-[50px] md:mt-[100px]"
const GOLD = "bg-[#C49849]"
const GREEN = "bg-[#074636]"

/* ---------------------------- Données ---------------------------- */

const hero = {
  title: 'Getting There Is Part of the Journey',
  text: 'Private 4x4s, shared shuttles, domestic flights, boats and trains: we choose the right way to move between every stop, and we book it all for you.',
  ctaLabel: 'Plan My Transfers',
  ctaHref: '#contact',
  label: 'Our Fleet',
  cardTitle: 'Every Transfer, Handled',
  image: Deux, // à remplacer par ta photo
  imageAlt: 'A 4x4 driving along a scenic road',
  stats: [
    { id: 1, value: '6', num: 6, suffix: '', label: 'Ways to Travel' },
    { id: 2, value: '24/7', label: 'Assistance on Trip' },
    { id: 3, value: '100%', num: 100, suffix: '%', label: 'Licensed Drivers' },
  ],
}

// category : 'land' | 'air' | 'sea'
const categories = [
  { id: 'all', label: 'All' },
  { id: 'land', label: 'Land' },
  { id: 'air', label: 'Air' },
  { id: 'sea', label: 'Sea' },
]

const transports = [
  {
    id: 1, category: 'land', name: 'Private 4x4',
    image: Tana, capacity: '1–6 travelers', duration: 'Flexible',
    text: 'Your own vehicle and driver-guide. Stop wherever you like, at your own pace.',
    perks: ['Door-to-door pickup', 'Air conditioning', 'English-speaking driver'],
  },
  {
    id: 2, category: 'land', name: 'Shared Minibus',
    image: Ambanja, capacity: '8–15 travelers', duration: 'Fixed schedule',
    text: 'A comfortable and affordable option on the main routes, ideal for solo travelers and groups.',
    perks: ['Reserved seats', 'Luggage included', 'Best price'],
  },
  {
    id: 3, category: 'air', name: 'Domestic Flight',
    image: NosyLonjo, capacity: '1 seat or more', duration: '1–2 h',
    text: 'Skip long road days. We book the seats and organize the airport transfers on both ends.',
    perks: ['Ticket booking', 'Airport transfers', 'Flexible dates'],
  },
  {
    id: 4, category: 'sea', name: 'Speedboat',
    image: NosyIranja, capacity: '2–10 travelers', duration: '30 min – 2 h',
    text: 'Fast and fun crossings to nearby islands, with life jackets and a skilled captain.',
    perks: ['Safety equipment', 'Island hopping', 'Private or shared'],
  },
  {
    id: 5, category: 'sea', name: 'Sailing Boat',
    image: Ramena, capacity: '2–8 travelers', duration: 'Half or full day',
    text: 'A slower, scenic way to reach hidden beaches, with snorkeling stops and a picnic on board.',
    perks: ['Snorkeling gear', 'Lunch on board', 'Sunset option'],
  },
  {
    id: 6, category: 'land', name: 'Scenic Train',
    image: Deux, capacity: 'Per seat', duration: 'Half or full day',
    text: 'Watch villages and landscapes roll by on a slow ride you will not forget.',
    perks: ['Window seats', 'Station transfers', 'Local snacks'],
  },
]

const steps = [
  { id: 1, title: 'Tell Us Your Plan', text: 'Share your dates, destinations and group size. Not sure yet? We suggest a route.' },
  { id: 2, title: 'We Pick the Best Mix', text: 'Our team combines road, air and sea so the trip stays smooth, safe and well paced.' },
  { id: 3, title: 'Confirm & Pay Online', text: 'You receive a clear quote with everything included, and confirm in a few clicks.' },
  { id: 4, title: 'Travel With Support', text: 'Meet your driver or captain on the day. Our team is one call away the whole time.' },
]

const included = [
  { id: 1, title: 'Trained Drivers', text: 'Experienced, licensed and familiar with every road.' },
  { id: 2, title: 'Insured Vehicles', text: 'Regularly serviced vehicles with full insurance.' },
  { id: 3, title: 'Fair, Fixed Prices', text: 'No surprises: fuel, tolls and fees are in the quote.' },
  { id: 4, title: '24/7 Support', text: 'A real person to help if your plans change.' },
]

const faqs = [
  { id: 1, q: 'Can I choose my own transport?', a: 'Yes. Tell us what you prefer and we adapt the plan. If you have no preference, we recommend the best option for each leg.' },
  { id: 2, q: 'Are meals and fuel included?', a: 'Fuel, driver and tolls are always included in the quote. Meals are only included when the trip description says so.' },
  { id: 3, q: 'How much luggage can I bring?', a: 'One suitcase and one small bag per person is the standard. Domestic flights have stricter weight limits, and we tell you the exact allowance when you book.' },
  { id: 4, q: 'Is it safe to travel by road?', a: 'Our drivers are selected and trained by us, and we avoid night driving on difficult routes. We adapt schedules to road and weather conditions.' },
  { id: 5, q: 'Can I change or cancel a booking?', a: 'You can change dates free of charge up to 7 days before departure, subject to availability. Cancellation terms depend on the service and are shown in your quote.' },
  { id: 6, q: 'Do you offer airport pickup?', a: 'Yes. A driver waits for you at arrivals with a sign, even if your flight is delayed.' },
]

const cta = {
  title: 'Ready to Hit the Road?',
  text: 'Tell us where you want to go and we will handle the rest.',
  label: 'Get a Free Quote',
  href: '#contact',
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

const UsersIcon = () => (
  <Svg className="w-4 h-4">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
)

const ClockIcon = () => (
  <Svg className="w-4 h-4">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </Svg>
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
  const root = useRef(null)
  const btnRef = useRef(null)
  useMagnetic(btnRef, 0.25)

  useGsap(root, () => {
    // 1. Titre, texte et bouton à l'arrivée sur la page
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
    tl.fromTo('.hero-word', { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.08, clearProps: 'all' })
      .fromTo('.hero-copy', { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, clearProps: 'all' }, 0.55)
      .fromTo('.hero-cta', { y: 20, opacity: 0, transition: 'none' }, { y: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.7)', clearProps: 'all' }, 0.7)

    // 2. Grande carte : dévoilement en fenêtre, chiffres qui comptent, parallaxe de l'image
    const card = gsap.timeline({ scrollTrigger: { trigger: '.hero-card', start: 'top 85%', once: true } })
    card.fromTo('.hero-card', { clipPath: 'inset(14% 4% 0% 4% round 1.5rem)', transition: 'none' }, { clipPath: 'inset(0% 0% 0% 0% round 1.5rem)', duration: 1.3, ease: 'expo.out', clearProps: 'clipPath,transition' })
      .fromTo('.hero-label, .hero-card-title', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out', clearProps: 'all' }, 0.5)
      .fromTo('.stat-card', { y: 30, opacity: 0, transition: 'none' }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out', clearProps: 'all' }, 0.7)

    gsap.utils.toArray('.stat-val[data-num]').forEach((el) => {
      const end = Number(el.dataset.num)
      const suffix = el.dataset.suffix || ''
      const o = { v: 0 }
      el.textContent = '0' + suffix
      card.to(o, { v: end, duration: 1.6, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v) + suffix } }, 0.85)
    })

    gsap.fromTo('.hero-img', { yPercent: -6, scale: 1.15 }, {
      yPercent: 6, scale: 1.15, ease: 'none',
      scrollTrigger: { trigger: '.hero-card', start: 'top bottom', end: 'bottom top', scrub: 0.6 },
    })
  })

  return (
    <div ref={root}>
      <h1 aria-label={hero.title} className={`${STATEMENT_TITLE} max-w-5xl`}>
        <MaskedWords text={hero.title} />
      </h1>
      <div className="mt-8 md:mt-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-12">
        <p className="hero-copy text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl">{hero.text}</p>
        <a
          ref={btnRef}
          href={hero.ctaHref}
          className={`hero-cta inline-flex items-center gap-5 self-start rounded-full ${GREEN} hover:bg-[#0a5f48] transition-colors text-white pl-6 pr-2.5 py-2.5 md:pl-7 md:py-3`}
        >
          <span className="text-lg md:text-xl font-medium">{hero.ctaLabel}</span>
          <span className={`w-11 h-11 md:w-14 md:h-14 rounded-full ${GOLD} flex items-center justify-center text-white`}><ArrowIcon /></span>
        </a>
      </div>

      {/* Grande carte avec chiffres */}
      <div className={`hero-card relative mt-10 md:mt-16 overflow-hidden rounded-3xl ${GREEN} text-white min-h-[480px] md:min-h-[560px]`}>
        <img src={hero.image} alt={hero.imageAlt} className="hero-img absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-black/80" />
        <div className="relative min-h-[inherit] flex flex-col p-5 md:p-8">
          <p className="hero-label flex items-center gap-2 text-lg md:text-xl font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-white" aria-hidden="true" />
            {hero.label}
          </p>
          <div className="mt-auto pt-24">
            <h2 className={`hero-card-title ${ON_IMAGE_TITLE} text-left md:text-center`}>{hero.cardTitle}</h2>
            <div className="mt-6 md:mt-10 grid grid-cols-3 gap-3 md:gap-5">
              {hero.stats.map((s) => (
                <div key={s.id} className="stat-card rounded-xl border border-white/20 bg-white/10 backdrop-blur-md p-4 md:p-5">
                  <p className="stat-val text-2xl md:text-5xl leading-none" data-num={s.num} data-suffix={s.suffix}>{s.value}</p>
                  <p className="mt-2 md:mt-3 text-xs md:text-base text-white/80 leading-snug">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TransportCard({ item }) {
  return (
    <article className="t-card flex flex-col overflow-hidden rounded-2xl bg-white">
      <div className="aspect-[16/10] overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
      </div>
      <div className="flex flex-col flex-1 p-5 md:p-6">
        <h3 className="text-xl md:text-2xl font-medium text-slate-900">{item.name}</h3>
        <div className={`mt-3 flex flex-wrap gap-x-5 gap-y-1 ${META_TEXT} text-slate-600`}>
          <span className="flex items-center gap-1.5"><UsersIcon />{item.capacity}</span>
          <span className="flex items-center gap-1.5"><ClockIcon />{item.duration}</span>
        </div>
        <p className="mt-4 text-sm md:text-base leading-relaxed text-slate-600">{item.text}</p>
        <ul className="mt-5 flex flex-col gap-2 text-sm text-slate-700">
          {item.perks.map((perk) => (
            <li key={perk} className="flex items-center gap-2"><CheckIcon />{perk}</li>
          ))}
        </ul>
        <a
          href="#contact"
          className="mt-6 pt-5 border-t border-slate-900/10 inline-flex items-center gap-2 text-sm md:text-base font-medium text-slate-800 hover:gap-3 transition-all"
        >
          Ask for this option <ArrowIcon />
        </a>
      </div>
    </article>
  )
}

function TransportTypes() {
  const [category, setCategory] = useState('all')
  const root = useRef(null)
  const prevCategory = useRef('all')
  const list = category === 'all' ? transports : transports.filter((t) => t.category === category)

  // Entrée au scroll
  useGsap(root, () => {
    reveal('.types-head > *', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.types-head', start: 'top 88%', once: true } })
    reveal('.tab-btn', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out', scrollTrigger: { trigger: '.tab-list', start: 'top 90%', once: true } })
    reveal('.t-card', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.t-grid', start: 'top 85%', once: true } })
  })

  // Changement de catégorie : les cartes se redessinent en cascade
  useGsap(root, () => {
    if (prevCategory.current === category) return
    prevCategory.current = category
    reveal('.t-card', { y: 30, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' })
  }, [category])

  return (
    <div ref={root} className={SECTION_GAP}>
      <div className="types-head mb-8 md:mb-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 lg:gap-12">
        <h2 className={`${SECTION_TITLE} lg:max-w-[52%]`}>Choose How You Travel</h2>
        <p className={`hidden md:block ${SECTION_SUBTITLE} lg:max-w-lg`}>
          Each option has its own pace and charm. Mix them freely across your trip.
        </p>
      </div>

      <div className="tab-list mb-8 flex flex-wrap gap-2 md:gap-3" role="tablist" aria-label="Transport categories">
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

      <div className="t-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {list.map((item) => <TransportCard key={item.id} item={item} />)}
      </div>
    </div>
  )
}

function HowItWorks() {
  const root = useRef(null)

  useGsap(root, () => {
    reveal('.how-title', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.how-title', start: 'top 88%', once: true } })
    const trigger = { trigger: '.how-list', start: 'top 85%', once: true }
    reveal('.step-card', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.14, ease: 'power3.out', scrollTrigger: trigger })
    reveal('.step-badge', { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, duration: 0.7, stagger: 0.14, delay: 0.2, ease: 'back.out(2.4)', scrollTrigger: trigger })
  })

  return (
    <div ref={root} className={SECTION_GAP}>
      <h2 className={`how-title ${SECTION_TITLE} text-center mb-10 md:mb-16`}>How It Works</h2>
      <ol className="how-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {steps.map((step) => (
          <li key={step.id} className="step-card rounded-2xl bg-white p-6 md:p-7">
            <span className={`step-badge w-12 h-12 rounded-full ${GOLD} flex items-center justify-center text-white text-lg font-medium`}>
              {step.id}
            </span>
            <h3 className="mt-6 text-xl md:text-2xl font-medium text-slate-900 leading-snug">{step.title}</h3>
            <p className="mt-3 text-sm md:text-base leading-relaxed text-slate-600">{step.text}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Included() {
  const root = useRef(null)

  useGsap(root, () => {
    const trigger = { trigger: root.current, start: 'top 82%', once: true }
    reveal(root.current, { y: 70, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'power3.out', scrollTrigger: trigger })
    reveal('.inc-head > *', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, delay: 0.35, ease: 'power3.out', scrollTrigger: trigger })
    reveal('.inc-item', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, delay: 0.55, ease: 'power3.out', scrollTrigger: trigger })
  })

  return (
    <div ref={root} className={`${SECTION_GAP} rounded-3xl ${GREEN} text-white p-6 md:p-12`}>
      <div className="inc-head flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 lg:gap-12">
        <h2 className={`${ON_IMAGE_TITLE} lg:max-w-[45%]`}>Included in Every Transfer</h2>
        <p className="text-sm md:text-lg text-white/70 leading-relaxed lg:max-w-lg">
          Comfort and safety are not options. They come with every vehicle, boat and seat we book.
        </p>
      </div>
      <div className="mt-8 md:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {included.map((item) => (
          <div key={item.id} className="inc-item rounded-xl border border-white/20 bg-white/10 p-4 md:p-5 md:min-h-[160px]">
            <h3 className="text-sm md:text-lg font-medium leading-snug">{item.title}</h3>
            <p className="mt-2 md:mt-3 text-xs md:text-sm text-white/70 leading-relaxed">{item.text}</p>
          </div>
        ))}
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
  const [open, setOpen] = useState(1)
  const root = useRef(null)

  useGsap(root, () => {
    reveal('.faq-head > *', { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.faq-head', start: 'top 85%', once: true } })
    reveal('.faq-item', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.09, ease: 'power3.out', scrollTrigger: { trigger: '.faq-list', start: 'top 85%', once: true } })
  })

  return (
    <div ref={root} className={`${SECTION_GAP} grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8 lg:gap-16`}>
      <div className="faq-head self-start lg:sticky lg:top-6">
        <h2 className={SECTION_TITLE}>Frequently Asked Questions</h2>
        <p className={`mt-4 md:mt-6 ${SECTION_SUBTITLE}`}>
          Can&apos;t find your answer? Our team replies within a few hours.
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
      <img src={cta.image} alt="" className="cta-bg absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
      <div className="cta-copy relative flex flex-col justify-end p-6 md:p-12 max-w-2xl">
        <h2 className={ON_IMAGE_TITLE}>{cta.title}</h2>
        <p className="mt-4 text-sm md:text-lg text-white/85 leading-relaxed">{cta.text}</p>
        <a
          ref={btnRef}
          href={cta.href}
          className="cta-link mt-6 md:mt-8 self-start inline-flex items-center gap-3 rounded-full bg-white hover:bg-white/90 transition-colors text-slate-900 pl-6 pr-2.5 py-2.5 font-medium"
        >
          {cta.label}
          <span className={`w-10 h-10 rounded-full ${GOLD} flex items-center justify-center text-white`}><ArrowIcon /></span>
        </a>
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
    <section className="w-full pt-0 pb-12 bg-[#D5E8E2] flex flex-col items-center">
      <Navbar />
      <div className={`${SECTION_WIDTH} mt-8 md:mt-12`}>
        <Hero />
        <TransportTypes />
        <HowItWorks />
        <Included />
        <Faq />
        <Cta />
      </div>
    </section>
    <Footer />
    </>
  )
}

export default Transport