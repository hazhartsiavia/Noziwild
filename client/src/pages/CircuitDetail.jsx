// Page /circuits/:slug : détail d'un circuit (aperçu, itinéraire jour par jour, réservation)
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { sendRequest, fetchCircuit, assetUrl } from '../api'
import { formatPrice } from '../utils/format'
import { useAuth } from '../context/AuthContext'

gsap.registerPlugin(ScrollTrigger)

/* Mêmes valeurs que PlaceDetail */
const W = 'w-[90vw] lg:max-w-[95vw]'
const GOLD = 'bg-[#C49849] hover:bg-[#a9813a]'
const BTN = 'inline-flex items-center justify-center text-sm md:text-base font-medium px-6 py-3 rounded-full active:scale-95 transition'
const H2 = 'text-2xl md:text-4xl font-medium leading-tight tracking-tight text-slate-900'
const FIELD = 'w-full h-12 rounded-full border border-slate-300 bg-white px-5 text-base text-slate-800 focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700'
const LABEL = 'block mb-2 text-sm md:text-base text-slate-700'

const ICONS = {
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>,
  gauge: <><path d="M4 18a9 9 0 1 1 16 0" /><path d="m12 14 4-5" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  flag: <><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></>,
  bed: <><path d="M3 18V7M3 14h18v4M21 14v-3a3 3 0 0 0-3-3h-7v6" /><circle cx="7" cy="11" r="1.5" /></>,
  meal: <><path d="M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10M16 3c-2 2-2 6 0 8v10" /></>,
  chevron: <path d="m6 9 6 6 6-6" />,
  check: <path d="M20 6 9 17l-5-5" />,
  cross: <path d="M18 6 6 18M6 6l12 12" />,
  left: <path d="m15 6-6 6 6 6" />,
  right: <path d="m9 6 6 6-6 6" />,
  expand: <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />,
}
const Icon = ({ name, className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[name]}</svg>
)

/* matchMedia scopé + respect de prefers-reduced-motion + nettoyage au démontage */
function useGsap(scope, setup, deps = []) {
  useLayoutEffect(() => {
    // Rien à animer (ex. page "circuit introuvable")
    if (!scope.current) return undefined
    const mm = gsap.matchMedia(scope)
    mm.add('(prefers-reduced-motion: no-preference)', () => setup())
    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* fromTo qui coupe la transition CSS Tailwind pendant l'animation,
   puis rend tous les styles d'origine à la fin (clearProps) */
const reveal = (targets, from, to) =>
  gsap.fromTo(targets, { transition: 'none', ...from }, { transition: 'none', clearProps: 'all', ...to })

const once = (trigger, start = 'top 85%') => ({ trigger, start, once: true })

/* ============================================================
   VISIONNEUSE : une photo d'étape en grand, flèches pour passer à la suivante
============================================================ */
function Lightbox({ photos, index, title, onClose, onMove }) {
  const closeRef = useRef(null)

  useEffect(() => {
    // Focus sur "Fermer", page bloquée derrière, focus rendu à la vignette en sortant
    const previous = document.activeElement
    closeRef.current?.focus()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
      else if (event.key === 'ArrowRight') onMove(1)
      else if (event.key === 'ArrowLeft') onMove(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus?.()
    }
  }, [onClose, onMove])

  const label = `${title}, photo ${index + 1} of ${photos.length}`
  const navBtn = 'absolute top-1/2 -translate-y-1/2 flex w-11 h-11 md:w-12 md:h-12 items-center justify-center rounded-full bg-white/90 text-slate-900 hover:bg-white transition'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 md:p-10"
      onClick={onClose}
    >
      <figure className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <img src={assetUrl(photos[index])} alt={label} className="w-full max-h-[78vh] object-contain rounded-2xl" />
        <figcaption className="mt-4 flex items-center justify-between gap-4 text-sm md:text-base text-white/85">
          <span>{title}</span>
          <span aria-hidden="true">{index + 1} / {photos.length}</span>
        </figcaption>
        <button type="button" aria-label="Previous photo" onClick={() => onMove(-1)} className={`${navBtn} left-2 md:-left-6`}>
          <Icon name="left" className="w-5 h-5" />
        </button>
        <button type="button" aria-label="Next photo" onClick={() => onMove(1)} className={`${navBtn} right-2 md:-right-6`}>
          <Icon name="right" className="w-5 h-5" />
        </button>
      </figure>
      <button ref={closeRef} type="button" aria-label="Close" onClick={onClose} className="absolute right-4 top-4 flex w-11 h-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition">
        <Icon name="cross" className="w-6 h-6" />
      </button>
    </div>
  )
}

/* ============================================================
   ITINÉRAIRE : frise verticale, une étape dépliable par jour
============================================================ */
function Endpoint({ icon, label, place }) {
  return (
    <li className="relative pl-14 md:pl-16">
      <span className="route-end absolute left-0 top-0 z-10 flex w-10 h-10 md:w-12 md:h-12 items-center justify-center rounded-full bg-slate-800 text-white">
        <Icon name={icon} className="w-5 h-5 md:w-6 md:h-6" />
      </span>
      <p className="pt-2 md:pt-3 text-base md:text-lg text-slate-800">
        <span className="font-medium">{label}</span> {place}
      </p>
    </li>
  )
}

function Itinerary({ circuit }) {
  const root = useRef(null)
  // Le premier jour est ouvert, comme une invitation à déplier la suite
  const [open, setOpen] = useState(() => new Set([0]))
  const allOpen = open.size === circuit.itinerary.length
  // Ouvrir ou fermer un jour change la hauteur de la frise : la ligne animée doit le savoir
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 350)
    return () => clearTimeout(t)
  }, [open])

  // Photo affichée en grand : { step, index } ou null
  const [viewer, setViewer] = useState(null)
  const viewerStep = viewer && circuit.itinerary[viewer.step]
  const closeViewer = useCallback(() => setViewer(null), [])
  const moveViewer = useCallback((delta) => {
    setViewer((v) => {
      const count = circuit.itinerary[v.step].images.length
      return { ...v, index: (v.index + delta + count) % count }
    })
  }, [circuit])

  // Jour qu'on vient d'ouvrir : ses vignettes arrivent en cascade
  const justOpened = useRef(null)

  const toggle = (index) => {
    const next = new Set(open)
    if (next.has(index)) next.delete(index)
    else {
      next.add(index)
      justOpened.current = index
    }
    setOpen(next)
  }

  useEffect(() => {
    const index = justOpened.current
    justOpened.current = null
    if (index === null || prefersReducedMotion()) return
    const thumbs = root.current?.querySelectorAll(`#day-panel-${index} li`)
    if (!thumbs?.length) return
    gsap.fromTo(thumbs, { y: 24, opacity: 0, scale: 0.92 }, {
      y: 0, opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(1.6)', stagger: 0.08, delay: 0.12, clearProps: 'all',
    })
  }, [open])

  useGsap(root, () => {
    // Ligne dorée qui suit le défilement, avec le point "voyageur" au bout.
    // La hauteur dépend des jours ouverts : recalculée à chaque refresh.
    gsap.fromTo('.route-progress', { height: '0%' }, {
      height: '100%', ease: 'none',
      scrollTrigger: { trigger: '.route-track', start: 'top 60%', end: 'bottom 60%', scrub: 0.6, invalidateOnRefresh: true },
    })

    gsap.utils.toArray('.route-step').forEach((step) => {
      // Carte du jour : glisse depuis la gauche
      reveal(step.querySelector('.route-card'), { x: -40, opacity: 0 }, {
        x: 0, opacity: 1, duration: 0.7, ease: 'power3.out', scrollTrigger: once(step, 'top 88%'),
      })
      // Pastille "Day X" : petit rebond
      reveal(step.querySelector('.route-pill'), { scale: 0.4, opacity: 0 }, {
        scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(2.5)', delay: 0.2, scrollTrigger: once(step, 'top 88%'),
      })
      // Point sur la frise : s'allume quand la ligne dorée l'atteint
      gsap.fromTo(step.querySelector('.route-dot'), { scale: 0.5 }, {
        scale: 1.35, ease: 'back.out(3)', duration: 0.4,
        scrollTrigger: { trigger: step, start: 'top 60%', toggleActions: 'play none none reverse' },
      })
    })

    // Départ et arrivée : les pastilles sombres tournent en entrant
    gsap.utils.toArray('.route-end').forEach((end) => {
      reveal(end, { scale: 0, rotate: -120 }, {
        scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(2)', scrollTrigger: once(end, 'top 90%'),
      })
    })
  }, [circuit.slug])

  return (
    <section ref={root} className="mt-14 md:mt-16" aria-labelledby="itinerary-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="itinerary-title" className={`gs-title ${H2}`}>Itinerary</h2>
        <button
          type="button"
          onClick={() => setOpen(allOpen ? new Set() : new Set(circuit.itinerary.map((_, i) => i)))}
          className="text-sm md:text-base font-medium text-[#a9813a] hover:underline"
        >
          {allOpen ? 'Collapse all days' : 'Expand all days'}
        </button>
      </div>

      <div className="relative mt-8">
        {/* Piste pointillée qui relie les étapes, et par-dessus la progression dorée qui suit le défilement */}
        <span aria-hidden="true" className="route-track absolute left-5 md:left-6 top-6 bottom-6 -translate-x-1/2 border-l-2 border-dashed border-slate-300">
          <span className="route-progress absolute -left-0.5 top-0 w-0.5 bg-[#C49849]" style={{ height: '100%' }}>
            <span className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#C49849] ring-4 ring-[#C49849]/25" />
          </span>
        </span>

        <ol className="relative flex flex-col gap-4">
          <Endpoint icon="flag" label="Starting location:" place={circuit.start} />

          {circuit.itinerary.map((step, i) => {
            const isOpen = open.has(i)
            const panelId = `day-panel-${i}`
            return (
              <li key={step.day} className="route-step relative pl-14 md:pl-16">
                <span aria-hidden="true" className={`route-dot absolute left-5 md:left-6 top-6 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-[#D5E8E2] transition-colors ${isOpen ? 'bg-[#C49849]' : 'bg-slate-400'}`} />
                <div className="route-card rounded-3xl bg-white">
                  <h3>
                    <button
                      type="button"
                      onClick={() => toggle(i)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="flex w-full items-center gap-4 rounded-3xl px-5 py-4 md:px-6 md:py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700"
                    >
                      <span className="route-pill shrink-0 rounded-full bg-[#D5E8E2] px-3 py-1 text-xs md:text-sm font-medium text-slate-800">{step.day}</span>
                      <span className="flex-1 text-base md:text-lg font-medium text-slate-900">{step.title}</span>
                      <Icon name="chevron" className={`w-5 h-5 shrink-0 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </h3>
                  {/* grid-rows 0fr -> 1fr : ouverture fluide sans connaître la hauteur */}
                  <div id={panelId} className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden" inert={!isOpen}>
                      <div className="px-5 pb-5 md:px-6 md:pb-6">
                        <p className="text-sm md:text-base text-slate-700 leading-relaxed">{step.text}</p>
                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-600">
                          {step.stay && <span className="flex items-center gap-2"><Icon name="bed" className="w-4 h-4 text-[#a9813a]" />Night in {step.stay}</span>}
                          {step.meals && <span className="flex items-center gap-2"><Icon name="meal" className="w-4 h-4 text-[#a9813a]" />{step.meals}</span>}
                        </div>
                        {step.images?.length > 0 && (
                          <ul className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                            {step.images.map((src, n) => (
                              <li key={n}>
                                <button
                                  type="button"
                                  onClick={() => setViewer({ step: i, index: n })}
                                  aria-label={`Enlarge photo ${n + 1} of ${step.images.length}: ${step.title}`}
                                  className="group relative block w-full aspect-[4/3] overflow-hidden rounded-xl sm:rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2"
                                >
                                  <img src={assetUrl(src)} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                  <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-slate-950/0 text-white opacity-0 transition group-hover:bg-slate-950/30 group-hover:opacity-100">
                                    <Icon name="expand" className="w-6 h-6" />
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}

          <Endpoint icon="pin" label="Arrive back at:" place={circuit.end} />
        </ol>
      </div>

      {viewer && (
        <Lightbox
          photos={viewerStep.images}
          index={viewer.index}
          title={`${viewerStep.day} · ${viewerStep.title}`}
          onClose={closeViewer}
          onMove={moveViewer}
        />
      )}
    </section>
  )
}

/* ============================================================
   CARTE DE PRIX : réservation ou question
============================================================ */
function BookingCard({ circuit }) {
  // Connecté : nom et email pré-remplis (la clé recrée le champ quand la session est connue)
  const { user } = useAuth()
  const [tab, setTab] = useState('booking')
  const [travellers, setTravellers] = useState(2)
  const [date, setDate] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'sent' | 'error'
  const [error, setError] = useState('')
  const total = circuit.price * travellers
  const today = new Date().toISOString().slice(0, 10)

  const switchTab = (next) => {
    setTab(next)
    setStatus('idle')
  }

  const submit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const { name, email, question } = Object.fromEntries(new FormData(form))
    const message = tab === 'booking'
      ? `Booking request. Start date: ${date || 'flexible'}. Travellers: ${travellers}. Estimated total: ${formatPrice(total)}.`
      : question

    setStatus('sending')
    try {
      await sendRequest('circuit', { name, email, subject: circuit.title, message })
      setStatus('sent')
      if (tab === 'inquiry') form.reset()
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  const tabCls = (t) => `flex-1 rounded-full py-3 text-sm md:text-base font-medium transition ${tab === t ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'}`

  return (
    <aside id="booking" className="booking-card scroll-mt-6 rounded-3xl bg-white p-6 md:p-8 lg:sticky lg:top-6 self-start shadow-sm">
      <p className="text-lg text-slate-800">Price</p>
      <p className="mt-2 text-slate-600">
        From <span className="gs-price text-3xl md:text-4xl font-semibold text-slate-900 tabular-nums">{formatPrice(circuit.price)}</span>
      </p>
      <p className="mt-1 text-sm text-slate-500">Per person, based on two travellers sharing</p>

      <div className="mt-6 flex gap-1 rounded-full border border-slate-200 p-1" role="tablist" aria-label="Booking options">
        <button type="button" role="tab" aria-selected={tab === 'booking'} onClick={() => switchTab('booking')} className={tabCls('booking')}>Booking</button>
        <button type="button" role="tab" aria-selected={tab === 'inquiry'} onClick={() => switchTab('inquiry')} className={tabCls('inquiry')}>Inquiry Form</button>
      </div>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-5">
        {tab === 'booking' && (
          <>
            <div>
              <label htmlFor="circuit-date" className={LABEL}>Start date</label>
              <input id="circuit-date" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className={FIELD} />
            </div>
            <div>
              <p className={LABEL} id="travellers-label">Number of travellers</p>
              <div className="flex items-center justify-between rounded-full bg-[#D5E8E2] px-2 py-2" role="group" aria-labelledby="travellers-label">
                <button type="button" aria-label="Fewer travellers" onClick={() => setTravellers(Math.max(1, travellers - 1))} disabled={travellers <= 1} className="w-10 h-10 rounded-full bg-white text-xl text-slate-800 hover:bg-slate-100 disabled:opacity-40">−</button>
                <span className="text-lg font-medium text-slate-900" aria-live="polite">{travellers}</span>
                <button type="button" aria-label="More travellers" onClick={() => setTravellers(Math.min(12, travellers + 1))} disabled={travellers >= 12} className="w-10 h-10 rounded-full bg-white text-xl text-slate-800 hover:bg-slate-100 disabled:opacity-40">+</button>
              </div>
            </div>
            <p className="flex justify-between border-t border-slate-200 pt-4 text-base text-slate-700">
              <span>Estimated total</span><span className="font-semibold text-slate-900">{formatPrice(total)}</span>
            </p>
          </>
        )}

        <input name="name" key={`n-${user?.id}`} defaultValue={user?.name} required autoComplete="name" placeholder="Your name" aria-label="Your name" className={FIELD} />
        <input name="email" key={`e-${user?.id}`} defaultValue={user?.email} type="email" required autoComplete="email" placeholder="Email address" aria-label="Email address" className={FIELD} />
        {tab === 'inquiry' && (
          <textarea name="question" rows={4} required placeholder="Your questions about this circuit" aria-label="Your questions about this circuit" className="w-full rounded-3xl border border-slate-300 px-5 py-3 text-base focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700" />
        )}

        <button type="submit" disabled={status === 'sending'} className={`${BTN} w-full text-white disabled:opacity-60 disabled:cursor-wait ${tab === 'booking' ? 'bg-slate-800 hover:bg-slate-700' : GOLD}`}>
          {status === 'sending' ? 'Sending…' : tab === 'booking' ? 'Request this circuit' : 'Send inquiry'}
        </button>

        {status === 'sent' && (
          <p role="status" className="text-sm text-emerald-700">
            Thank you! A travel expert will reply within one working day.
            {user && <> You can follow it in <Link to="/account" className="font-medium underline">your account</Link>.</>}
          </p>
        )}
        {status === 'error' && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {tab === 'booking' && status !== 'sent' && (
          <p className="text-xs text-slate-500 text-center">No payment now. We confirm availability and the final price first.</p>
        )}
      </form>
    </aside>
  )
}

/* ============================================================
   BARRE MOBILE : prix toujours visible, cachée quand la carte de réservation est à l'écran
============================================================ */
function MobileBookingBar({ circuit }) {
  const [cardVisible, setCardVisible] = useState(false)

  useEffect(() => {
    const card = document.getElementById('booking')
    if (!card) return undefined
    const observer = new IntersectionObserver(([entry]) => setCardVisible(entry.isIntersecting), { threshold: 0.1 })
    observer.observe(card)
    return () => observer.disconnect()
  }, [circuit.slug])

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur px-4 py-3 transition-transform duration-300 ${cardVisible ? 'translate-y-full' : 'translate-y-0'}`}
      aria-hidden={cardVisible}
    >
      <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
        <p className="text-sm text-slate-600">
          From <span className="text-xl font-semibold text-slate-900">{formatPrice(circuit.price)}</span> / person
        </p>
        <button
          type="button"
          tabIndex={cardVisible ? -1 : 0}
          onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
          className={`${BTN} bg-slate-800 hover:bg-slate-700 text-white`}
        >
          Book now
        </button>
      </div>
    </div>
  )
}

/* ============================================================
   PAGE
============================================================ */
function CircuitDetail() {
  const { slug } = useParams()
  // Réponse de l'API pour un slug : { slug, status: 'ready' | 'notfound' | 'error', circuit, related }.
  // Tant qu'elle ne correspond pas au slug de l'adresse, la page est en chargement.
  const [response, setResponse] = useState(null)
  const data = response?.slug === slug ? response : { status: 'loading', circuit: null, related: [] }
  const circuit = data.status === 'ready' ? data.circuit : null
  const related = data.related
  // Les animations démarrent quand le circuit est affiché, et repartent à chaque nouveau circuit
  const loadedSlug = circuit?.slug ?? null
  const header = useRef(null)
  const content = useRef(null)
  const more = useRef(null)

  useEffect(() => {
    let cancelled = false
    fetchCircuit(slug)
      .then(({ circuit: c, related: r }) => !cancelled && setResponse({ slug, status: 'ready', circuit: c, related: r }))
      .catch((err) => !cancelled && setResponse({ slug, status: err.status === 404 ? 'notfound' : 'error', circuit: null, related: [] }))
    return () => {
      cancelled = true
    }
  }, [slug])

  // Passer d'un circuit à l'autre (liens "More Circuits") : on repart du haut de la page
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  // Une fois le circuit affiché, les déclencheurs au défilement sont recalculés quand les photos ont leur taille
  useLayoutEffect(() => {
    if (!loadedSlug) return undefined
    const refresh = setTimeout(() => ScrollTrigger.refresh(), 600)
    return () => clearTimeout(refresh)
  }, [loadedSlug])

  // En-tête : titre puis galerie qui monte en cascade
  useGsap(header, () => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', clearProps: 'all' } })
    tl.fromTo('.detail-title', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
      .fromTo('.detail-meta', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
      .fromTo('.detail-photo', { y: 50, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.9, stagger: 0.12 }, '-=0.3')

    // Parallaxe : chaque photo glisse dans son cadre, celle du milieu plus vite
    gsap.utils.toArray('.gs-parallax').forEach((img, i) => {
      const depth = i === 1 ? 12 : 7
      gsap.fromTo(img, { yPercent: -depth }, {
        yPercent: depth, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    })
  }, [loadedSlug])

  // Contenu : titres en rideau, caractéristiques, textes, puces, cartes inclus/exclus, encadré final
  useGsap(content, () => {
    gsap.utils.toArray('.gs-title').forEach((title) => {
      reveal(title, { clipPath: 'inset(-10% 0% 110% 0%)', y: 40 }, {
        clipPath: 'inset(-10% 0% -10% 0%)', y: 0, duration: 1, ease: 'expo.out', scrollTrigger: once(title, 'top 88%'),
      })
    })

    const meta = gsap.utils.toArray('.gs-meta > li')
    reveal(meta, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.1, scrollTrigger: once('.gs-meta') })
    reveal('.gs-meta svg', { rotate: -90, scale: 0 }, { rotate: 0, scale: 1, duration: 0.8, ease: 'back.out(2.2)', stagger: 0.1, delay: 0.15, scrollTrigger: once('.gs-meta') })

    gsap.utils.toArray('.gs-text').forEach((text) => {
      reveal(text, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', scrollTrigger: once(text, 'top 90%') })
    })

    reveal('.gs-bullets > li', { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.09, scrollTrigger: once('.gs-bullets') })
    reveal('.gs-bullets > li > span', { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(4)', stagger: 0.09, delay: 0.2, scrollTrigger: once('.gs-bullets') })

    // Inclus / exclus : chaque carte arrive de son côté, puis les coches se dessinent
    gsap.utils.toArray('.gs-incl').forEach((card, i) => {
      const st = once(card, 'top 85%')
      reveal(card, { x: i === 0 ? -60 : 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: st })
      reveal(card.querySelectorAll('li'), { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out', stagger: 0.06, delay: 0.35, scrollTrigger: st })
      const paths = card.querySelectorAll('li svg path')
      gsap.fromTo(paths,
        { strokeDasharray: (_, el) => el.getTotalLength(), strokeDashoffset: (_, el) => el.getTotalLength() },
        { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut', stagger: 0.06, delay: 0.5, clearProps: 'strokeDasharray,strokeDashoffset', scrollTrigger: st })
    })

    const know = once('.gs-know', 'top 85%')
    reveal('.gs-know', { scale: 0.92, opacity: 0, y: 40 }, { scale: 1, opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: know })
    reveal('.gs-know > *', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.12, delay: 0.3, scrollTrigger: know })

    // Carte de prix : arrive par la droite, le prix compte jusqu'à sa valeur
    reveal('.booking-card', { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: once('.booking-card', 'top 90%') })
    const priceEl = content.current.querySelector('.gs-price')
    const counter = { value: 0 }
    gsap.to(counter, {
      value: circuit.price, duration: 1.4, ease: 'power2.out',
      scrollTrigger: once('.booking-card', 'top 90%'),
      onUpdate: () => { priceEl.textContent = formatPrice(Math.round(counter.value)) },
    })
    // À l'annulation (changement de circuit), le prix réel est remis
    return () => { priceEl.textContent = formatPrice(circuit.price) }
  }, [loadedSlug])

  // Autres circuits : arrivée par lots, photo qui se dézoome
  useGsap(more, () => {
    reveal('.gs-title', { clipPath: 'inset(-10% 0% 110% 0%)', y: 40 }, {
      clipPath: 'inset(-10% 0% -10% 0%)', y: 0, duration: 1, ease: 'expo.out', scrollTrigger: once(more.current, 'top 85%'),
    })
    const cards = gsap.utils.toArray('.gs-related')
    gsap.set(cards, { y: 80, opacity: 0, rotate: 2 })
    ScrollTrigger.batch(cards, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, { y: 0, opacity: 1, rotate: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12, clearProps: 'all' })
        gsap.fromTo(batch.map((c) => c.querySelector('img')), { scale: 1.3 }, { scale: 1, duration: 1.4, ease: 'power2.out', stagger: 0.12, clearProps: 'transform' })
      },
    })
  }, [loadedSlug])

  if (data.status === 'loading') {
    return (
      <>
        <main className="w-full bg-[#D5E8E2] pb-24 flex flex-col items-center">
          <Navbar />
          <section role="status" aria-label="Loading the circuit" className={`${W} mt-6 animate-pulse`}>
            <div className="h-4 w-64 rounded bg-white/70" />
            <div className="mt-6 h-14 md:h-20 w-full max-w-3xl rounded-2xl bg-white/70" />
            <div className="mt-4 h-6 w-full max-w-xl rounded bg-white/70" />
            <div className="mt-8 grid grid-cols-1 md:grid-cols-[1fr_1.5fr_1fr] gap-4 md:gap-6">
              {[0, 1, 2].map((n) => (
                <div key={n} className={`h-64 md:h-[440px] rounded-[1.5rem] md:rounded-[2rem] bg-white/70 ${n > 0 ? 'hidden md:block' : ''}`} />
              ))}
            </div>
          </section>
        </main>
        <Footer />
      </>
    )
  }

  if (!circuit) {
    const notFound = data.status === 'notfound'
    return (
      <>
        <main className="w-full bg-[#D5E8E2] pb-24 flex flex-col items-center">
          <Navbar />
          <section className={`${W} mt-16 rounded-3xl bg-white p-10 text-center`}>
            <h1 className={H2}>{notFound ? 'This circuit was not found' : 'This circuit could not be loaded'}</h1>
            {!notFound && <p className="mt-3 text-slate-600">Please check your connection and try again.</p>}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {!notFound && (
                <button type="button" onClick={() => window.location.reload()} className={`${BTN} ${GOLD} text-white`}>Try again</button>
              )}
              <Link to="/circuits" className={`${BTN} bg-slate-800 hover:bg-slate-700 text-white`}>All circuits</Link>
            </div>
          </section>
        </main>
        <Footer />
      </>
    )
  }

  const meta = [
    { icon: 'clock', label: 'Duration', value: `${circuit.days - 1} nights · ${circuit.days} days` },
    { icon: 'users', label: 'Group size', value: circuit.groupSize },
    { icon: 'compass', label: 'Tour type', value: circuit.tourType },
    { icon: 'gauge', label: 'Level', value: circuit.level },
  ]

  return (
    <>
      <main className="w-full bg-[#D5E8E2] pb-16 md:pb-24 flex flex-col items-center">
        <Navbar />

        {/* En-tête + galerie */}
        <section ref={header} className={`${W} mt-6`}>
          <nav aria-label="Breadcrumb" className="text-sm md:text-base text-slate-700">
            <Link to="/" className="hover:underline">Home</Link> / <Link to="/circuits" className="hover:underline">Circuits</Link> / {circuit.title}
          </nav>
          <h1 className="detail-title mt-5 text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-semibold leading-[1.05] tracking-tight text-slate-900 max-w-5xl">{circuit.title}</h1>
          <p className="detail-meta mt-3 text-lg md:text-2xl text-slate-700 max-w-3xl">{circuit.summary}</p>

          <div className="detail-meta mt-5 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm md:text-base text-slate-700">
            <span className="flex items-center gap-2"><Icon name="pin" className="w-5 h-5" />{circuit.stops}</span>
            <span className="flex items-center gap-2"><Icon name="compass" className="w-5 h-5" />{circuit.region}, Madagascar</span>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-[1fr_1.5fr_1fr] gap-4 md:gap-6">
            {circuit.gallery.map((src, i) => (
              <div key={i} className={`detail-photo relative h-64 md:h-[440px] overflow-hidden rounded-[1.5rem] md:rounded-[2rem] ${i > 0 ? 'hidden md:block' : ''}`}>
                <img src={assetUrl(src)} alt={i === 0 ? circuit.title : ''} className="gs-parallax absolute inset-x-0 -top-[15%] w-full h-[130%] object-cover" />
              </div>
            ))}
          </div>
        </section>

        {/* Contenu + réservation */}
        <section ref={content} className={`${W} mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-10 lg:gap-16 items-start`}>
          <div className="min-w-0">
            <h2 className={`gs-title ${H2}`}>Overview</h2>
            <ul className="gs-meta mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              {meta.map((m) => (
                <li key={m.label} className="flex items-center gap-4 text-base md:text-lg text-slate-800">
                  <Icon name={m.icon} className="w-7 h-7 shrink-0 text-[#a9813a]" />
                  <span><span className="font-medium">{m.label}:</span> {m.value}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-4 max-w-3xl">
              {circuit.overview.map((p) => <p key={p} className="gs-text text-base md:text-lg text-slate-700 leading-relaxed">{p}</p>)}
            </div>

            <h2 className={`gs-title ${H2} mt-12`}>Highlights</h2>
            <ul className="gs-bullets mt-6 flex flex-col gap-3 max-w-3xl">
              {circuit.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-base md:text-lg text-slate-700">
                  <span className="mt-2.5 w-2 h-2 rounded-full bg-[#C49849] shrink-0" />{h}
                </li>
              ))}
            </ul>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { title: 'Price includes', list: circuit.included, icon: 'check', color: 'text-emerald-700' },
                { title: 'Price excludes', list: circuit.excluded, icon: 'cross', color: 'text-red-700' },
              ].map(({ title, list, icon, color }) => (
                <div key={title} className="gs-incl rounded-3xl bg-white p-6 md:p-8">
                  <h3 className="text-xl font-medium text-slate-900">{title}</h3>
                  <ul className="mt-4 flex flex-col gap-3">
                    {list.map((x) => (
                      <li key={x} className="flex gap-3 text-sm md:text-base text-slate-700">
                        <Icon name={icon} className={`w-5 h-5 shrink-0 ${color}`} />{x}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <Itinerary circuit={circuit} />

            <div className="gs-know mt-12 rounded-3xl bg-slate-900 text-white p-6 md:p-8">
              <h3 className="text-xl font-medium">Good to know</h3>
              <p className="mt-3 text-sm md:text-base text-white/75 leading-relaxed">
                Best time: {circuit.bestTime}. {circuit.tip} Every circuit can be shortened, extended or combined with another one.
              </p>
              <Link to="/tailor-made" className={`${BTN} ${GOLD} text-white mt-6`}>Adapt this circuit</Link>
            </div>
          </div>

          <BookingCard key={circuit.slug} circuit={circuit} />
        </section>

        {/* Autres circuits */}
        {related.length > 0 && (
        <section ref={more} className={`${W} mt-16 md:mt-24`}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className={`gs-title ${H2}`}>More Circuits</h2>
            <Link to="/circuits" className="text-sm md:text-base font-medium text-[#a9813a] hover:underline">See all circuits</Link>
          </div>
          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {related.map((c) => (
              <li key={c.slug} className="gs-related">
                <Link to={`/circuits/${c.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-[1.5rem] text-white">
                  <img src={assetUrl(c.image)} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-sm bg-[#C49849] px-3 py-1.5 text-xs sm:text-sm font-medium">{c.days} days</span>
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-xl font-medium leading-snug">{c.title}</p>
                    <p className="mt-1 text-sm text-white/80">From {formatPrice(c.price)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        )}
      </main>
      <Footer />
      {/* Espace pour que la barre mobile ne cache pas le bas du pied de page */}
      <div className="h-20 lg:hidden bg-white" aria-hidden="true" />
      <MobileBookingBar circuit={circuit} />
    </>
  )
}

export default CircuitDetail
