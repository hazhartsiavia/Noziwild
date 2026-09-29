import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Deux from "../assets/images/2.jpg";
import Ambanja from "../assets/images/Ambanja.png";
import NosyLonjo from "../assets/images/NosyLonjo.png";
import NosyIranja from "../assets/images/NosyIranja.png";
import Ramena from "../assets/images/Ramena.png";
import Tana from "../assets/images/Tana.png";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* Constantes partagées : mêmes valeurs que dans les autres pages */
const SECTION_WIDTH = "w-[90vw] lg:max-w-[90vw] xl:max-w-[95vw]"
const SECTION_TITLE = "text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-slate-900 leading-[1.15] tracking-tight"
const SECTION_SUBTITLE = "text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl"
const META_TEXT = "text-xs sm:text-sm"
const STATEMENT_TITLE = "text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-medium uppercase leading-[1.15] tracking-tight text-slate-900"
const BADGE = "inline-block bg-[#C49849] text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm"
const BUTTON = "text-sm font-medium px-5 py-2.5 rounded-full md:px-6 md:py-3 active:scale-95 transition"
const SECTION_GAP = "mt-[60px] md:mt-[120px]"

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------------------------- Données ---------------------------- */

const categories = [
  { id: 'all', label: 'All Photos' },
  { id: 'landscape', label: 'Landscapes' },
  { id: 'people', label: 'People' },
  { id: 'sea', label: 'Sea' },
  { id: 'wildlife', label: 'Wildlife' },
]

// ratio : forme de la photo dans la grille (mosaïque)
const photos = [
  { id: 1, category: 'sea', image: NosyIranja, ratio: 'aspect-[4/3]', caption: 'Sunrise over the island' },
  { id: 2, category: 'people', image: Ambanja, ratio: 'aspect-[3/4]', caption: 'A slow walk through the village' },
  { id: 3, category: 'landscape', image: Tana, ratio: 'aspect-[4/5]', caption: 'Morning light in the highlands' },
  { id: 4, category: 'wildlife', image: Deux, ratio: 'aspect-square', caption: 'Face to face with the wild' },
  { id: 5, category: 'sea', image: Ramena, ratio: 'aspect-[3/4]', caption: 'Sailing along the coast' },
  { id: 6, category: 'people', image: NosyLonjo, ratio: 'aspect-[4/3]', caption: 'Friends on the shore' },
  { id: 7, category: 'landscape', image: Deux, ratio: 'aspect-[4/3]', caption: 'The road to nowhere' },
  { id: 8, category: 'wildlife', image: Tana, ratio: 'aspect-[3/4]', caption: 'Quiet moment in the forest' },
  { id: 9, category: 'sea', image: NosyLonjo, ratio: 'aspect-square', caption: 'Turquoise water, empty beach' },
]

// Prix et contenus donnés en exemple, à adapter
const sessions = [
  { id: 1, name: 'Sunrise Session', text: 'A short, golden-hour shoot at your favorite spot.', duration: '1 hour', photos: '25 edited photos', delivery: '48 h', price: 90 },
  { id: 2, name: 'Private Moment', text: 'Couples, proposals or family portraits, relaxed and natural.', duration: '2 hours', photos: '40 edited photos', delivery: '3 days', price: 150 },
  { id: 3, name: 'Half-Day Story', text: 'We follow your day and capture the little things you would forget.', duration: '4 hours', photos: '80 edited photos', delivery: '3 days', price: 220 },
  { id: 4, name: 'Full-Day Story', text: 'From breakfast to sunset, the whole adventure told in pictures.', duration: '8 hours', photos: '200 edited photos', delivery: '5 days', price: 380 },
]

const steps = [
  { id: 1, title: 'Tell us your plan', text: 'Dates, places and the kind of pictures you love.' },
  { id: 2, title: 'We shoot', text: 'Your photographer joins you and keeps things relaxed.' },
  { id: 3, title: 'We edit', text: 'Every photo is selected, retouched and colour-matched.' },
  { id: 4, title: 'You receive', text: 'A private online gallery, ready to download and share.' },
]

const keepsakes = [
  { id: 1, title: 'Fine-Art Prints', text: 'Museum-quality paper, sizes from A5 to A2.', price: 'From $12' },
  { id: 2, title: 'Photo Book', text: 'Your story in 30 pages, hand-checked and bound.', price: 'From $55' },
  { id: 3, title: 'Framed Canvas', text: 'Your best shot, ready to hang on the wall.', price: 'From $70' },
  { id: 4, title: 'Digital Gallery', text: 'Private link and USB key with all your photos.', price: 'Included' },
]

const faqs = [
  { q: 'Do I need to be photogenic?', a: 'Not at all. Your photographer guides you and shoots natural moments. Most people forget the camera is there after ten minutes.' },
  { q: 'When do I receive my photos?', a: 'From 48 hours for a short session, up to 5 days for a full-day story. We tell you the exact date when you book.' },
  { q: 'Can I get the original files?', a: 'You receive all edited photos in full resolution. Unedited originals can be added on request.' },
  { q: 'What if the weather is bad?', a: 'We move your session to another time or day. Some of the best light comes just after the rain.' },
  { q: 'Can I print the photos anywhere?', a: 'Yes. You own the pictures for personal use and can print them anywhere, or order prints and books from us.' },
]

/* ---------------------------- Icônes ----------------------------- */

const Svg = ({ children, className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)
const ArrowIcon = () => <Svg className="w-5 h-5"><path d="M5 12h14M13 6l6 6-6 6" /></Svg>
const CloseIcon = () => <Svg className="w-6 h-6"><path d="M18 6 6 18M6 6l12 12" /></Svg>

/* -------------------------- Composants --------------------------- */

// Polaroid : 3 couches. Extérieur = entrée + parallaxe (GSAP), milieu = flottement, intérieur = inclinaison (Tailwind)
function Polaroid({ src, speed, tilt, className = '' }) {
  return (
    <div data-float data-speed={speed} className={`w-[62%] ${className}`}>
      <div data-bob>
        <div className={`${tilt} rounded-xl bg-white p-2 lg:p-3 shadow-md`}>
          <img src={src} alt="" className="w-full aspect-[4/5] object-cover rounded-md" />
        </div>
      </div>
    </div>
  )
}

const heroStats = [
  { id: 1, value: '500+', label: 'sessions shot' },
  { id: 2, value: '4.9/5', label: 'average rating' },
  { id: 3, value: '48 h', label: 'fastest delivery' },
]

// Hero : texte au centre, deux piles de polaroids sur les côtés (plus de superpositions avec le titre)
function Hero() {
  return (
    <section data-hero-section className="grid grid-cols-1 lg:grid-cols-[1fr_1.7fr_1fr] gap-8 lg:gap-6 items-center min-h-[480px] lg:min-h-[700px] py-6 lg:py-10">

      {/* Pile de gauche */}
      <div className="hidden lg:flex flex-col">
        <Polaroid src={Ramena} speed={-10} tilt="-rotate-6" className="self-start" />
        <Polaroid src={Ambanja} speed={6} tilt="rotate-3" className="self-end -mt-10 relative z-10" />
        <Polaroid src={Deux} speed={-6} tilt="-rotate-3" className="self-start -mt-10 relative z-20" />
      </div>

      {/* Texte */}
      <div className="flex flex-col items-center text-center">
        <span data-hero className={`${BADGE} inline-flex items-center gap-2`}>
          <Svg className="w-4 h-4"><path d="M14.5 4h-5L8 6H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3z" /><circle cx="12" cy="13" r="3.5" /></Svg>
          Photography & Memories
        </span>
        <h1 data-hero className={`${STATEMENT_TITLE} mt-6`}>Keep The Moment Forever</h1>
        <p data-hero className={`${SECTION_SUBTITLE} mt-6 md:mt-8 max-w-xl`}>
          A photographer by your side, so you can live the trip and still bring every moment home.
        </p>
        <div data-hero className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a href="#sessions" className={`bg-[#084838] hover:bg-[#0a5c47] text-white ${BUTTON}`}>Book A Session</a>
          <a href="#gallery" className="inline-flex items-center gap-2 text-sm md:text-base font-medium text-slate-800 hover:gap-3 transition-all">
            See the gallery <ArrowIcon />
          </a>
        </div>

        <ul data-hero className="mt-10 md:mt-12 flex flex-wrap items-center justify-center gap-x-8 md:gap-x-12 gap-y-4">
          {heroStats.map((st, i) => (
            <li key={st.id} className={`text-center ${i > 0 ? 'sm:pl-8 md:pl-12 sm:border-l sm:border-[#084838]/20' : ''}`}>
              <p className="text-2xl md:text-4xl leading-none text-slate-800">{st.value}</p>
              <p className={`mt-1 ${META_TEXT} text-slate-600`}>{st.label}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Pile de droite */}
      <div className="hidden lg:flex flex-col">
        <Polaroid src={NosyIranja} speed={10} tilt="rotate-6" className="self-end" />
        <Polaroid src={NosyLonjo} speed={-6} tilt="-rotate-3" className="self-start -mt-10 relative z-10" />
        <Polaroid src={Tana} speed={6} tilt="rotate-3" className="self-end -mt-10 relative z-20" />
      </div>

      {/* Tablette / mobile : rangée de photos sous le texte */}
      <div data-hero className="lg:hidden grid grid-cols-3 md:grid-cols-6 gap-3">
        {[Ramena, Ambanja, Tana, NosyIranja, NosyLonjo, Deux].map((src, i) => (
          <img key={i} src={src} alt="" className="w-full aspect-square object-cover rounded-xl" />
        ))}
      </div>
    </section>
  )
}

// Lightbox : photo en grand, flèches, Échap pour fermer (rendue dans <body>)
function Lightbox({ items, index, onClose, onStep }) {
  const closeRef = useRef(null)
  const imgRef = useRef(null)
  const item = items[index]

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onStep(-1)
      if (e.key === 'ArrowRight') onStep(1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (!imgRef.current || prefersReducedMotion()) return
    gsap.fromTo(imgRef.current, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' })
  }, [index])

  const nav = "absolute top-1/2 -translate-y-1/2 w-11 h-11 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition"

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Photo viewer" className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 md:p-10" onClick={onClose}>
      <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 md:right-8 md:top-8 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition">
        <CloseIcon />
      </button>
      <button type="button" onClick={(e) => { e.stopPropagation(); onStep(-1) }} aria-label="Previous photo" className={`${nav} left-3 md:left-8`}>
        <span className="rotate-180"><ArrowIcon /></span>
      </button>
      <button type="button" onClick={(e) => { e.stopPropagation(); onStep(1) }} aria-label="Next photo" className={`${nav} right-3 md:right-8`}>
        <ArrowIcon />
      </button>

      <figure className="max-w-5xl max-h-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <img ref={imgRef} src={item.image} alt={item.caption} className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain" />
        <figcaption className="mt-4 text-center text-white">
          <span className="block text-base md:text-lg">{item.caption}</span>
          <span className="block text-sm text-white/60 tabular-nums">{String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
        </figcaption>
      </figure>
    </div>,
    document.body
  )
}

// Galerie en mosaïque avec filtres et lightbox
function Gallery() {
  const [category, setCategory] = useState('all')
  const [open, setOpen] = useState(null) // index dans la liste filtrée, ou null
  const gridRef = useRef(null)
  const first = useRef(true)

  const list = category === 'all' ? photos : photos.filter((p) => p.category === category)

  // Les photos réapparaissent en cascade au changement de filtre
  useLayoutEffect(() => {
    if (first.current) { first.current = false; return }
    if (!gridRef.current || prefersReducedMotion()) return
    gsap.from(gridRef.current.children, { y: 30, opacity: 0, duration: 0.5, ease: 'power3.out', stagger: 0.06, clearProps: 'transform,opacity' })
  }, [category])

  const step = (delta) => setOpen((i) => (i === null ? i : (i + delta + list.length) % list.length))

  const tab = (active) =>
    `rounded-full px-5 py-2 text-sm md:text-base font-medium transition ${active ? 'bg-[#084838] text-white' : 'bg-white text-slate-700 hover:bg-white/70'}`

  return (
    <div id="gallery" className={`${SECTION_GAP} scroll-mt-8`}>
      <div className="mb-8 md:mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 lg:gap-12">
        <h2 className={`${SECTION_TITLE} lg:max-w-[52%]`}>Stories We Have Kept</h2>
        <p className={`${SECTION_SUBTITLE} lg:max-w-md`}>A few frames from our travelers. Tap a photo to see it bigger.</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2 md:gap-3" role="tablist" aria-label="Photo categories">
        {categories.map((c) => (
          <button key={c.id} type="button" role="tab" aria-selected={category === c.id} onClick={() => setCategory(c.id)} className={tab(category === c.id)}>
            {c.label}
          </button>
        ))}
      </div>

      <div ref={gridRef} className="columns-2 lg:columns-3 gap-3 md:gap-5">
        {list.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Open photo: ${p.caption}`}
            className="group relative mb-3 md:mb-5 block w-full break-inside-avoid overflow-hidden rounded-2xl"
          >
            <img src={p.image} alt={p.caption} className={`w-full ${p.ratio} object-cover transition-transform duration-700 group-hover:scale-105`} />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-left text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
              {p.caption}
            </span>
          </button>
        ))}
      </div>

      {open !== null && <Lightbox items={list} index={open} onClose={() => setOpen(null)} onStep={step} />}
    </div>
  )
}

// Séances : liste en lignes (durée, photos, délai, prix)
function Sessions() {
  return (
    <div id="sessions" className={`${SECTION_GAP} scroll-mt-8`}>
      <div className="mb-8 md:mb-12 text-center">
        <h2 className={SECTION_TITLE}>Choose Your Session</h2>
        <p className={`mt-4 mx-auto ${SECTION_SUBTITLE}`}>From one golden hour to a whole day. All sessions include editing and a private online gallery.</p>
      </div>

      <ul className="border-t border-[#084838]/20">
        {sessions.map((s) => (
          <li key={s.id} className="border-b border-[#084838]/20">
            <a href="/contact" className="group grid grid-cols-1 lg:grid-cols-[60px_1.4fr_1.6fr_auto_40px] items-center gap-3 lg:gap-8 py-6 md:py-8 px-2 md:px-4 transition hover:bg-white/60 rounded-2xl">
              <span className="text-sm md:text-lg tabular-nums text-[#9a742f]">{String(s.id).padStart(2, '0')}</span>

              <div>
                <h3 className="text-2xl md:text-3xl font-medium text-slate-900 tracking-tight">{s.name}</h3>
                <p className="mt-1 text-sm md:text-base text-slate-600">{s.text}</p>
              </div>

              <ul className="flex flex-wrap gap-2">
                {[s.duration, s.photos, `Delivered in ${s.delivery}`].map((m) => (
                  <li key={m} className="rounded-full border border-slate-400 px-3 py-1 text-xs md:text-sm text-slate-700">{m}</li>
                ))}
              </ul>

              <p className="text-sm text-slate-600 lg:text-right">From <span className="text-2xl md:text-3xl font-medium text-slate-900">${s.price}</span></p>

              <span className="hidden lg:flex w-10 h-10 rounded-full bg-[#084838] text-white items-center justify-center transition group-hover:bg-[#C49849] group-hover:translate-x-1">
                <ArrowIcon />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Comparateur avant / après (le curseur s'ouvre tout seul au défilement)
function BeforeAfter() {
  const [pos, setPos] = useState(() => (prefersReducedMotion() ? 50 : 100)) // % de la photo "après" visible
  const boxRef = useRef(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const counter = { v: 100 }
    const tween = gsap.to(counter, {
      v: 50, duration: 1.6, ease: 'power3.inOut',
      scrollTrigger: { trigger: boxRef.current, start: 'top 75%', once: true },
      onUpdate: () => setPos(counter.v),
    })
    return () => { tween.scrollTrigger?.kill(); tween.kill() }
  }, [])

  return (
    <div className={`${SECTION_GAP} grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-center`}>
      <div>
        <p className="mb-3 text-xs sm:text-sm md:text-base uppercase tracking-wide text-slate-700">From shoot to gallery</p>
        <h2 className={SECTION_TITLE}>Every Photo Is Edited By Hand</h2>
        <ol className="mt-8 flex flex-col gap-5">
          {steps.map((s) => (
            <li key={s.id} className="flex items-start gap-4">
              <span className="shrink-0 w-9 h-9 rounded-full bg-[#C49849] text-white flex items-center justify-center text-sm font-medium">{s.id}</span>
              <div>
                <h3 className="text-lg md:text-xl font-medium text-slate-900">{s.title}</h3>
                <p className="mt-1 text-sm md:text-base text-slate-600 leading-relaxed">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div ref={boxRef} className="relative aspect-[4/3] overflow-hidden rounded-3xl select-none">
        {/* Avant : photo terne */}
        <img src={NosyIranja} alt="Photo before editing" className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'saturate(0.45) contrast(0.85) brightness(0.9)' }} />
        {/* Après : photo retouchée, révélée par le curseur */}
        <img src={NosyIranja} alt="Photo after editing" className="absolute inset-0 w-full h-full object-cover" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} />

        <span className="absolute left-4 top-4 rounded-full bg-[#084838] px-3 py-1 text-xs md:text-sm text-white">After</span>
        <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs md:text-sm text-slate-800">Before</span>

        <div className="absolute inset-y-0 w-0.5 bg-white pointer-events-none" style={{ left: `${pos}%` }}>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center text-[#084838]">
            <Svg className="w-5 h-5"><path d="m9 6-6 6 6 6M15 6l6 6-6 6" /></Svg>
          </span>
        </div>

        <input
          type="range" min="0" max="100" step="0.5" value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Compare before and after editing"
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        />
      </div>
    </div>
  )
}

// Souvenirs à ramener chez soi : bande verte en colonnes
function Keepsakes() {
  return (
    <div className={`${SECTION_GAP} rounded-3xl bg-[#084838] text-white p-6 md:p-12`}>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 lg:gap-12">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium leading-[1.15] tracking-tight lg:max-w-[45%]">Take Your Memories Home</h2>
        <p className="text-sm md:text-lg text-white/75 leading-relaxed lg:max-w-md">Beautiful ways to keep your favorite photos close, long after the trip.</p>
      </div>

      <ul className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {keepsakes.map((k, i) => (
          <li key={k.id} className={`py-6 lg:py-2 lg:px-8 border-t border-white/20 lg:border-t-0 ${i > 0 ? 'lg:border-l lg:border-white/20' : 'lg:pl-0'}`}>
            <p className="text-sm text-[#E6C58A]">{k.price}</p>
            <h3 className="mt-2 text-xl md:text-2xl font-medium">{k.title}</h3>
            <p className="mt-3 text-sm md:text-base text-white/70 leading-relaxed">{k.text}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

// FAQ : questions en cartes blanches à gauche, titre à droite
function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <div className={`${SECTION_GAP} grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8 lg:gap-16`}>
      <div className="lg:order-2">
        <h2 className={SECTION_TITLE}>Frequently Asked Questions</h2>
        <p className={`mt-4 md:mt-6 ${SECTION_SUBTITLE}`}>Can&apos;t find your answer? Our team replies within a few hours.</p>
      </div>

      <div className="flex flex-col gap-3 lg:order-1">
        {faqs.map((f, i) => {
          const isOpen = open === i
          return (
            <div key={f.q} className="rounded-2xl bg-white">
              <button type="button" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="w-full flex items-center justify-between gap-4 text-left p-5 md:p-6">
                <span className="text-base md:text-xl font-medium text-slate-900">{f.q}</span>
                <Svg className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}><path d="M12 5v14M5 12h14" /></Svg>
              </button>
              {isOpen && <p className="px-5 md:px-6 pb-5 md:pb-6 -mt-1 text-sm md:text-base leading-relaxed text-slate-600">{f.a}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// CTA : grande image centrée
function Cta() {
  return (
    <div className={`${SECTION_GAP} relative overflow-hidden rounded-3xl min-h-[420px] md:min-h-[520px] flex items-center justify-center text-center text-white`}>
      <img src={Ramena} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative px-6 py-12 max-w-3xl">
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-medium leading-[1.15] tracking-tight">Your Trip, Beautifully Kept</h2>
        <p className="mt-4 text-sm md:text-lg text-white/85 leading-relaxed">
          Tell us when and where you are going. We match you with the right photographer and send a clear quote within one working day.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="/contact" className={`bg-[#C49849] hover:bg-[#b08339] text-white ${BUTTON}`}>Book A Photographer</a>
          <a href="#gallery" className={`border border-white/50 hover:bg-white/10 text-white ${BUTTON}`}>Back To The Gallery</a>
        </div>
      </div>
    </div>
  )
}

function Photography() {
  const contentRef = useRef(null)

  useLayoutEffect(() => {
    // Pas d'animation si l'utilisateur a demandé moins de mouvement
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      // Entrée du hero : textes puis polaroids qui arrivent
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-hero]', { y: 40, opacity: 0, duration: 0.9, stagger: 0.12 })
        .from('[data-float]', { y: 90, opacity: 0, duration: 1.1, stagger: 0.15 }, '-=0.6')

      // Léger flottement permanent des polaroids
      gsap.to('[data-bob]', {
        y: (i) => (i % 2 ? 8 : -8), duration: (i) => 2.8 + (i % 3) * 0.6,
        ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.2,
      })

      // Parallaxe : chaque polaroid bouge à sa vitesse pendant le défilement
      gsap.to('[data-float]', {
        yPercent: (i, el) => Number(el.dataset.speed),
        ease: 'none',
        scrollTrigger: { trigger: '[data-hero-section]', start: 'top top', end: 'bottom top', scrub: true },
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
        <Gallery />
        <Sessions />
        <BeforeAfter />
        <Keepsakes />
        <Faq />
        <Cta />
      </div>
    </section>
    <Footer />
    </>
  )
}

export default Photography