import React, { useState, useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Ramena from '../assets/images/Ramena.png'
import NosyIranja from '../assets/images/NosyIranja.png'
import NosyLonjo from '../assets/images/NosyLonjo.png'
import Ambanja from '../assets/images/Ambanja.png'
import Deux from '../assets/images/2.jpg'
import Tana from '../assets/images/Tana.png'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

gsap.registerPlugin(ScrollTrigger)

const W = 'w-[90vw] lg:max-w-[95vw]'
const GOLD = 'bg-[#C49849] hover:bg-[#a9813a]'
const DARK = 'bg-[#0F172B]'
const BTN = 'inline-flex items-center justify-center text-sm font-medium px-6 py-3 rounded-full active:scale-95 transition'
const H2 = 'text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-medium leading-[1.1] tracking-tight'

/* ---------------------------- Données ---------------------------- */

const facts = [
  { value: '1 to 12', label: 'months, your choice' },
  { value: '8', label: 'travellers max per group' },
  { value: '7/7', label: 'on-site support' },
]

const formats = [
  {
    id: 'month',
    tab: '1 month',
    title: 'One Month Of Slow Travel',
    text: 'Two or three bases, no rushing. Combine a bay, the highlands and a national park, with time to sit still in between.',
    points: ['Furnished stays in 2 to 3 regions', 'Private driver for transfers', 'Guided excursions each week'],
    price: 'From €1,900',
    image: Ramena,
  },
  {
    id: 'season',
    tab: '3 months',
    title: 'A Season In Madagascar',
    text: 'Settle in one region, work remotely or volunteer, and take guided trips on weekends. We arrange housing, transport and local contacts.',
    points: ['One home base with reliable internet', 'Monthly guided getaways', 'Language lessons and community projects'],
    price: 'From €4,800',
    image: Tana,
  },
  {
    id: 'live',
    tab: '6 months +',
    title: 'Live Here, Fully Supported',
    text: 'For researchers, artists, families and retirees. We handle housing and paperwork, then stay close for the whole stay.',
    points: ['Long-term housing search', 'Paperwork and visa extensions', 'A named contact for your whole stay'],
    price: 'On request',
    image: NosyLonjo,
  },
]

const weeks = [
  { week: 'Week 1', place: 'Antananarivo', text: 'Arrive, settle in, explore the capital and the royal hill of Ambohimanga.', image: Tana },
  { week: 'Week 2', place: 'Diego Suarez', text: 'Work from the bay and sail the emerald coast.', image: Ramena },
  { week: 'Week 3', place: 'Ambanja', text: 'Cocoa plantations, markets and northern wildlife.', image: Ambanja },
  { week: 'Week 4', place: 'Nosy Be', text: 'Close the month on the islands of Nosy Iranja and Nosy Lonjo.', image: NosyIranja },
]

const services = [
  { title: 'Housing', text: 'Villas, apartments and guesthouses.', image: NosyLonjo, span: 'col-span-2 row-span-2', pos: 'object-center' },
  { title: 'Transport', text: 'Airport pick-up and private drivers.', image: Deux, span: 'col-span-2', pos: 'object-center' },
  { title: 'Internet', text: 'SIM card and connected homes.', image: Tana, span: '', pos: 'object-top' },
  { title: 'Paperwork', text: 'Visa and extension guidance.', image: Ambanja, span: '', pos: 'object-bottom' },
  { title: 'Local contacts', text: 'Guides, doctors, teachers and community projects.', image: Ramena, span: 'col-span-2', pos: 'object-center' },
]

const QUOTE = 'We came for three weeks and stayed for three months. Everything was ready when we landed.'

/* ----------------------- Utilitaires GSAP ------------------------ */

/* matchMedia scopé à la section (les sélecteurs ne sortent pas de leur bloc),
   prefers-reduced-motion respecté, nettoyage au démontage. */
function useGsap(scope, setup, deps = []) {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia(scope)
    mm.add('(prefers-reduced-motion: no-preference)', () => setup())
    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/* fromTo qui coupe la transition CSS Tailwind pendant l'animation, puis
   restitue tous les styles d'origine à la fin (clearProps). */
const reveal = (targets, from, to, extra = {}) =>
  gsap.fromTo(
    targets,
    { transition: 'none', ...from },
    { transition: 'none', clearProps: 'all', ...to, ...extra }
  )

/* Découpe un titre en lettres (mots insécables) pour l'animer lettre par lettre.
   Le rendu visuel reste identique ; aria-label garde le texte lisible. */
function Chars({ lines }) {
  return lines.map((line, li) => (
    <React.Fragment key={li}>
      {line.split(' ').map((word, wi, arr) => (
        <React.Fragment key={wi}>
          <span aria-hidden="true" className="inline-block whitespace-nowrap">
            {[...word].map((c, ci) => <span key={ci} className="hero-char inline-block">{c}</span>)}
          </span>
          {wi < arr.length - 1 ? ' ' : ''}
        </React.Fragment>
      ))}
      {li < lines.length - 1 && <br />}
    </React.Fragment>
  ))
}

/* -------------------------- Composants --------------------------- */

function Hero() {
  const root = useRef(null)

  // Hero : la section s'ouvre en iris depuis le bas, le titre jaillit lettre par lettre,
  // la carte vitrée glisse de la droite
  useGsap(root, () => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.fromTo(root.current, { clipPath: 'circle(0% at 50% 100%)', transition: 'none' }, { clipPath: 'circle(150% at 50% 100%)', duration: 1.6, ease: 'expo.inOut', clearProps: 'clipPath,transition' })
      .fromTo('.hero-bg', { scale: 1.25, transition: 'none' }, { scale: 1, duration: 2.4, ease: 'power2.out', clearProps: 'all' }, 0)
      .fromTo('.hero-eyebrow', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, clearProps: 'all' }, 0.9)
      .fromTo('.hero-char', { y: 50, opacity: 0, rotate: 6 }, { y: 0, opacity: 1, rotate: 0, duration: 0.9, ease: 'back.out(1.7)', stagger: 0.03, clearProps: 'all' }, 1)
      .fromTo('.hero-btn', { scale: 0.6, opacity: 0, transition: 'none' }, { scale: 1, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'back.out(2.2)', clearProps: 'all' }, 1.8)
      .fromTo('.hero-glass', { x: 80, opacity: 0, filter: 'blur(10px)' }, { x: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1, clearProps: 'all' }, 1.4)
      .fromTo('.hero-fact', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, clearProps: 'all' }, 1.9)
  })

  return (
    <>
      <Navbar />
      <section ref={root} className={`${W} relative overflow-hidden rounded-[2rem] md:rounded-[3rem] ${DARK} text-white min-h-[560px] md:min-h-[86vh] flex items-end`}>
        <img src={NosyIranja} alt="Turquoise water off Nosy Iranja" className="hero-bg absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-slate-950/10" />

        <div className="relative w-full grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10 items-end p-6 sm:p-10 md:p-16">
          <div>
            <p className="hero-eyebrow text-sm md:text-base text-white/80 mb-4">Long stays in Madagascar</p>
            <h1 aria-label="Don’t Visit. Live The Island." className="text-5xl sm:text-6xl md:text-7xl xl:text-[96px] font-semibold leading-[0.95] tracking-tight">
              <Chars lines={['Don’t Visit.', 'Live The Island.']} />
            </h1>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/contact" className={`hero-btn ${BTN} ${GOLD} text-white`}>Plan my long stay</a>
              <a href="#formats" className={`hero-btn ${BTN} border border-white/50 hover:bg-white/10 text-white`}>See the formats</a>
            </div>
          </div>

          {/* Carte vitrée */}
          <div className="hero-glass rounded-3xl border border-white/25 bg-white/10 backdrop-blur-md p-6 md:p-8">
            <ul className="grid grid-cols-3 gap-4">
              {facts.map((f) => (
                <li key={f.label} className="hero-fact">
                  <p className="text-2xl md:text-4xl font-semibold">{f.value}</p>
                  <p className="mt-1 text-xs md:text-sm text-white/80 leading-snug">{f.label}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}

function Manifesto() {
  const root = useRef(null)

  // Texte qui se dévoile, collage dont les photos s'ouvrent puis dérivent à des vitesses
  // opposées pendant le scroll
  useGsap(root, () => {
    const trigger = { trigger: root.current, start: 'top 75%', once: true }
    reveal('.man-title', { clipPath: 'inset(0% 0% 100% 0%)', y: 20 }, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1, ease: 'power4.out', scrollTrigger: trigger })
    reveal('.man-text', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, delay: 0.3, ease: 'power3.out', scrollTrigger: trigger })

    reveal('.man-img1', { clipPath: 'inset(0% 0% 100% 0% round 2rem)' }, { clipPath: 'inset(0% 0% 0% 0% round 2rem)', duration: 1.3, ease: 'expo.out', scrollTrigger: trigger }, { clearProps: 'clipPath,transition' })
    reveal('.man-img2', { clipPath: 'inset(0% 0% 0% 100% round 2rem)' }, { clipPath: 'inset(0% 0% 0% 0% round 2rem)', duration: 1.3, delay: 0.25, ease: 'expo.out', scrollTrigger: trigger }, { clearProps: 'clipPath,transition' })
    reveal('.man-badge', { scale: 0, rotate: -15, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.8, delay: 0.9, ease: 'back.out(2.5)', scrollTrigger: trigger })

    const scrub = { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true }
    gsap.fromTo('.man-img1', { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: scrub })
    gsap.fromTo('.man-img2', { yPercent: 8 }, { yPercent: -8, ease: 'none', scrollTrigger: scrub })
  })

  return (
    <section ref={root} className={`${W} mt-20 md:mt-32 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center`}>
      <div>
        <h2 className={`man-title ${H2} text-slate-900`}>Madagascar Rewards Those Who Stay.</h2>
        <p className="man-text mt-6 text-base md:text-lg text-slate-700 leading-relaxed max-w-xl">
          Two weeks show you the postcard. A month lets you learn the market days, the roads and the names of your neighbours.
          We build the base so you can spend your time on the island, not on logistics.
        </p>
        <p className="man-text mt-4 text-base md:text-lg text-slate-700 leading-relaxed max-w-xl">
          Housing, transport, connectivity and local introductions are ready before you land.
        </p>
      </div>

      {/* Collage */}
      <div className="relative h-[420px] sm:h-[520px] md:h-[600px]">
        <img src={Ambanja} alt="Village life near Ambanja" className="man-img1 absolute left-0 top-0 w-[68%] h-[78%] object-cover rounded-[2rem]" />
        <img src={Deux} alt="Northern Madagascar landscape" className="man-img2 absolute right-0 bottom-0 w-[52%] h-[52%] object-cover rounded-[2rem] border-[10px] border-[#D5E8E2]" />
        <div className={`man-badge absolute left-[6%] bottom-[4%] rounded-2xl ${DARK} text-white px-5 py-4`}>
          <p className="text-3xl font-semibold">100+</p>
          <p className="text-xs text-white/70">happy travellers</p>
        </div>
      </div>
    </section>
  )
}

function Formats() {
  const [active, setActive] = useState(0)
  const f = formats[active]
  const root = useRef(null)
  const prev = useRef(active)

  // Entrée de la section au scroll
  useGsap(root, () => {
    const trigger = { trigger: root.current, start: 'top 80%', once: true }
    reveal(root.current, { y: 70, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 1.1, ease: 'power3.out', scrollTrigger: trigger })
    reveal('.fmt-title', { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, delay: 0.3, ease: 'power3.out', scrollTrigger: trigger })
    reveal('.fmt-tab', { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.5, ease: 'back.out(2.5)', scrollTrigger: trigger })
  })

  // À chaque changement d'onglet : le cadre s'ouvre de droite à gauche, la photo se dézoome,
  // puis titre, texte, points et prix s'enchaînent
  useGsap(root, () => {
    if (prev.current === active) return
    prev.current = active
    reveal('.fmt-frame', { clipPath: 'inset(0% 0% 0% 100% round 1.5rem)' }, { clipPath: 'inset(0% 0% 0% 0% round 1.5rem)', duration: 0.9, ease: 'expo.out' })
    reveal('.fmt-img', { scale: 1.25 }, { scale: 1, duration: 1.2, ease: 'power3.out' })
    reveal('.fmt-chip', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, delay: 0.3, ease: 'back.out(3)' })
    reveal('.fmt-body > h3, .fmt-body > p, .fmt-body li, .fmt-body > div', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, delay: 0.15, ease: 'power2.out' })
  }, [active])

  return (
    <section ref={root} id="formats" className={`${W} mt-20 md:mt-32 rounded-[2rem] md:rounded-[3rem] ${DARK} text-white p-5 sm:p-8 md:p-14`}>
      <h2 className={`fmt-title ${H2} max-w-3xl`}>Choose Your Rhythm</h2>

      <div role="tablist" className="mt-8 flex flex-wrap gap-3">
        {formats.map((item, i) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            className={`fmt-tab rounded-full px-5 py-2.5 text-sm md:text-base transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C49849] ${
              active === i ? 'bg-[#C49849] text-white' : 'border border-white/30 text-white/80 hover:border-white'
            }`}
          >
            {item.tab}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="mt-10 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-14 items-center">
        <div className="fmt-frame relative aspect-[4/3] lg:aspect-[5/4] overflow-hidden rounded-[1.5rem] md:rounded-[2rem]">
          <img key={f.id} src={f.image} alt={f.title} className="fmt-img absolute inset-0 w-full h-full object-cover" />
          <span className="fmt-chip absolute left-4 top-4 rounded-full bg-white/90 text-slate-900 text-sm font-medium px-4 py-1.5">{f.tab}</span>
        </div>
        <div className="fmt-body">
          <h3 className="text-2xl md:text-4xl font-medium leading-tight">{f.title}</h3>
          <p className="mt-4 text-sm md:text-base text-white/75 leading-relaxed">{f.text}</p>
          <ul className="mt-6 flex flex-col gap-3">
            {f.points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm md:text-base">
                <span className="mt-2 w-2 h-2 rounded-full bg-[#C49849] shrink-0" />
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <p className="text-2xl font-semibold">{f.price}</p>
            <a href="/contact" className={`${BTN} ${GOLD} text-white`}>Ask for this stay</a>
          </div>
        </div>
      </div>
    </section>
  )
}

function Weeks() {
  const root = useRef(null)

  // Titre qui monte, puis chaque semaine se découvre de bas en haut, l'une après l'autre.
  // (Pas de translation sur les cartes : le conteneur défile en horizontal.)
  useGsap(root, () => {
    reveal('.wk-head > *', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.wk-head', start: 'top 88%', once: true } })

    const trigger = { trigger: '.wk-list', start: 'top 88%', once: true }
    reveal('.wk-card', { clipPath: 'inset(100% 0% 0% 0% round 2rem)' }, { clipPath: 'inset(0% 0% 0% 0% round 2rem)', duration: 1.2, stagger: 0.18, ease: 'expo.out', scrollTrigger: trigger })
    reveal('.wk-img', { scale: 1.35 }, { scale: 1, duration: 1.8, stagger: 0.18, ease: 'power2.out', scrollTrigger: trigger })
    reveal('.wk-badge', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.18, delay: 0.5, ease: 'back.out(3)', scrollTrigger: trigger })
    reveal('.wk-text > *', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, delay: 0.6, ease: 'power2.out', scrollTrigger: trigger })
  })

  return (
    <section ref={root} className="w-full mt-20 md:mt-32 flex flex-col items-center">
      <div className={`wk-head ${W} flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8`}>
        <h2 className={`${H2} text-slate-900 max-w-2xl`}>A Month, Week By Week</h2>
        <p className="text-sm md:text-base text-slate-600 max-w-sm">One way to spend four weeks. Scroll to explore. We adapt it to you.</p>
      </div>
      <div className="w-full overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="wk-list flex gap-5 px-[5vw] pb-2 w-max">
          {weeks.map((w) => (
            <li key={w.week} className="wk-card snap-start relative shrink-0 w-[78vw] sm:w-[360px] md:w-[420px] aspect-[3/4] overflow-hidden rounded-[2rem] text-white">
              <img src={w.image} alt={w.place} className="wk-img absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent" />
              <span className="wk-badge absolute left-5 top-5 bg-[#C49849] text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm">{w.week}</span>
              <div className="wk-text absolute inset-x-0 bottom-0 p-6">
                <h3 className="text-2xl md:text-3xl font-medium">{w.place}</h3>
                <p className="mt-2 text-sm text-white/80 leading-snug">{w.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Services() {
  const root = useRef(null)

  // Les tuiles apparaissent depuis le centre de la grille vers les bords
  useGsap(root, () => {
    reveal('.svc-title', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.svc-title', start: 'top 88%', once: true } })

    const trigger = { trigger: '.svc-grid', start: 'top 85%', once: true }
    reveal('.svc-tile', { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, stagger: { each: 0.12, from: 'center' }, ease: 'back.out(1.5)', scrollTrigger: trigger })
    reveal('.svc-img', { scale: 1.35 }, { scale: 1, duration: 1.6, stagger: { each: 0.12, from: 'center' }, ease: 'power2.out', scrollTrigger: trigger })
    reveal('.svc-text', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: { each: 0.12, from: 'center' }, delay: 0.5, ease: 'power2.out', scrollTrigger: trigger })
  })

  return (
    <section ref={root} className={`${W} mt-20 md:mt-32`}>
      <h2 className={`svc-title ${H2} text-slate-900 max-w-3xl`}>Everything Ready Before You Land</h2>
      <ul className="svc-grid mt-10 grid grid-cols-2 lg:grid-cols-4 auto-rows-[190px] md:auto-rows-[230px] gap-4 md:gap-5">
        {services.map((s) => (
          <li key={s.title} className={`svc-tile ${s.span} relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] text-white`}>
            <img src={s.image} alt="" className={`svc-img absolute inset-0 w-full h-full object-cover ${s.pos}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            <div className="svc-text absolute inset-x-0 bottom-0 p-4 md:p-6">
              <h3 className="text-lg md:text-2xl font-medium">{s.title}</h3>
              <p className="mt-1 text-xs md:text-sm text-white/80 leading-snug">{s.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Quote() {
  const root = useRef(null)
  const words = QUOTE.split(' ')

  // La photo s'ouvre de gauche à droite ; la citation s'éclaire mot après mot,
  // au rythme du scroll
  useGsap(root, () => {
    reveal('.q-img', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 80%', once: true } })

    gsap.fromTo(
      '.q-word',
      { opacity: 0.15 },
      { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: '.q-text', start: 'top 80%', end: 'bottom 50%', scrub: true } }
    )
    reveal('.q-cap', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: '.q-cap', start: 'top 92%', once: true } })
  })

  return (
    <section ref={root} className={`${W} mt-20 md:mt-32 grid grid-cols-1 md:grid-cols-[1fr_1.4fr] overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-white`}>
      <img src={Tana} alt="" className="q-img w-full h-64 md:h-full object-cover" />
      <figure className="p-8 md:p-16 flex flex-col justify-center">
        <blockquote aria-label={QUOTE} className="q-text text-2xl md:text-4xl font-medium leading-snug text-slate-900">
          {words.map((w, i) => (
            <span key={i} aria-hidden="true" className="q-word">{w}{i < words.length - 1 ? ' ' : ''}</span>
          ))}
        </blockquote>
        <figcaption className="q-cap mt-6 text-sm md:text-base text-slate-600">Traveller name, country</figcaption>
      </figure>
    </section>
  )
}

function FinalCta() {
  const root = useRef(null)

  // La carte se pose en grossissant, le fond passe de flou à net, texte puis boutons arrivent
  useGsap(root, () => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 82%', once: true } })
    tl.fromTo(root.current, { y: 80, opacity: 0, scale: 0.88, transition: 'none' }, { y: 0, opacity: 1, scale: 1, duration: 1.1, ease: 'power3.out', clearProps: 'all' })
      .fromTo('.fin-bg', { filter: 'blur(14px)', scale: 1.15, transition: 'none' }, { filter: 'blur(0px)', scale: 1, duration: 1.6, ease: 'power2.out', clearProps: 'all' }, 0)
      .fromTo('.fin-text > h2, .fin-text > p', { x: -60, opacity: 0, transition: 'none' }, { x: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out', clearProps: 'all' }, 0.4)
      .fromTo('.fin-btn', { scale: 0.6, opacity: 0, transition: 'none' }, { scale: 1, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'back.out(2.2)', clearProps: 'all' }, 0.9)
  })

  return (
    <section ref={root} className={`${W} mt-20 md:mt-32 relative overflow-hidden rounded-[2rem] md:rounded-[3rem] text-white min-h-[420px] flex items-center`}>
      <img src={Ramena} alt="" className="fin-bg absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-slate-950/65" />
      <div className="fin-text relative p-8 md:p-16 max-w-3xl">
        <h2 className={H2}>Tell Us How Long You Want To Stay.</h2>
        <p className="mt-4 text-sm md:text-lg text-white/85">Share your dates and plans. A travel expert replies within one working day.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="/contact" className={`fin-btn ${BTN} ${GOLD} text-white`}>Plan my long stay</a>
          <a href="/circuits" className={`fin-btn ${BTN} border border-white/50 hover:bg-white/10`}>Browse circuits</a>
        </div>
      </div>
    </section>
  )
}

function LongStay() {
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
      <main className="w-full bg-[#D5E8E2] pb-16 md:pb-24 flex flex-col items-center overflow-hidden">
        <Hero />
        <Manifesto />
        <Formats />
        <Weeks />
        <Services />
        <Quote />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}

export default LongStay