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
const DARK = 'bg-[#074636]'
const BTN = 'inline-flex items-center justify-center text-sm md:text-base font-medium px-6 py-3 rounded-full active:scale-95 transition disabled:opacity-40 disabled:pointer-events-none'
const H2 = 'text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight text-slate-900'
const FIELD = 'w-full h-12 rounded-full border border-slate-300 bg-white px-5 text-base text-slate-800 focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700'
const LABEL = 'block mb-2 text-sm md:text-base text-slate-700'

/* ---------------------------- Données ---------------------------- */

const interests = [
  { id: 'Islands & beaches', image: NosyIranja },
  { id: 'Wildlife', image: Ambanja },
  { id: 'Culture & villages', image: Tana },
  { id: 'Hiking & adventure', image: Deux },
  { id: 'Sailing & sea', image: Ramena },
  { id: 'Slow & relaxing', image: NosyLonjo },
]
const lengths = ['1 week', '2 weeks', '3 weeks', '1 month or more']
const months = ['Not sure yet', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const paces = ['Slow', 'Balanced', 'Active']
const comforts = ['Comfortable', 'Premium', 'Luxury']
const groups = ['Solo', 'Couple', 'Family', 'Friends']

const steps = [
  { title: 'Tell us your wishes', text: 'Answer a few questions or write to us freely.' },
  { title: 'Get a first proposal', text: 'A travel expert sends a day-by-day route within a few days.' },
  { title: 'Refine together', text: 'Change anything until the trip feels exactly right.' },
  { title: 'Travel with support', text: 'Local guides, transfers and a contact on the ground.' },
]

const ideas = [
  { title: 'Romantic islands', text: 'Sandbars, sunsets and quiet stays.', image: NosyIranja, preset: { interests: ['Islands & beaches', 'Slow & relaxing'], group: 'Couple' } },
  { title: 'Family wildlife trail', text: 'Lemurs, forests and gentle adventure.', image: Ambanja, preset: { interests: ['Wildlife', 'Hiking & adventure'], group: 'Family' } },
  { title: 'Culture and countryside', text: 'Markets, royal hills and village life.', image: Tana, preset: { interests: ['Culture & villages', 'Wildlife'], group: 'Friends' } },
]

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

/* Effet magnétique réutilisable : l'élément suit légèrement le curseur au survol,
   puis revient avec un léger rebond élastique. */
function useMagnetic(ref, strength = 0.35) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(pointer: coarse)').matches) return // pas de souris, inutile sur tactile

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

function Words({ text, className }) {
  const words = text.split(' ')
  return words.map((w, i) => (
    <React.Fragment key={i}>
      <span aria-hidden="true" className={`${className} inline-block`}>{w}</span>
      {i < words.length - 1 ? ' ' : ''}
    </React.Fragment>
  ))
}

/* -------------------------- Composants --------------------------- */

function Pill({ active, onClick, children }) {
  const ref = useRef(null)
  const handleClick = () => {
    gsap.fromTo(ref.current, { scale: 0.9 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' })
    onClick?.()
  }
  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      className={`pill rounded-full border px-5 py-2.5 text-sm md:text-base transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2 ${
        active ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-slate-500'
      }`}
    >
      {children}
    </button>
  )
}

function Hero() {
  const root = useRef(null)
  const btn1Ref = useRef(null)
  const btn2Ref = useRef(null)
  const arch = 'object-cover w-full rounded-t-[999px] rounded-b-[1.5rem]'

  useMagnetic(btn1Ref, 0.25)
  useMagnetic(btn2Ref, 0.25)

  useGsap(root, () => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
    tl.fromTo('.hero-eyebrow', { x: -24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, clearProps: 'all' })
      .fromTo('.hero-word', { y: 46, opacity: 0, filter: 'blur(12px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.05, stagger: 0.11, ease: 'power3.out', clearProps: 'all' }, 0.08)
      .fromTo('.hero-copy', { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75, clearProps: 'all' }, 0.68)
      .fromTo('.hero-btn', { y: 20, opacity: 0, scale: 0.96, transition: 'none' }, { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)', clearProps: 'all' }, 0.85)
      .fromTo('.hero-arch', { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.08, transition: 'none' }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.5, stagger: 0.16, ease: 'expo.out', clearProps: 'clipPath,transition,scale' }, 0.28)

    gsap.utils.toArray('.hero-arch').forEach((el, i) => {
      gsap.to(el, {
        yPercent: [-6, -16, -10][i] ?? -8,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
      })
    })
  })

  return (
    <>
      <Navbar />
      <section ref={root} className={`${W} mt-6 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center`}>
        <div>
          <p className="hero-eyebrow text-sm md:text-base text-slate-700 mb-4">Tailor-made stays</p>
          <h1 aria-label="Your Madagascar, Your Way" className="text-5xl sm:text-6xl md:text-7xl xl:text-[100px] font-semibold leading-[0.95] tracking-tight text-slate-900">
            <Words text="Your Madagascar, Your Way" className="hero-word" />
          </h1>
          <p className="hero-copy mt-6 text-base md:text-lg text-slate-700 leading-relaxed max-w-xl">No fixed itinerary. Tell us what you love, how long you have and who is travelling. We design the trip around you.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a ref={btn1Ref} href="#builder" className={`hero-btn ${BTN} bg-[#074636] hover:bg-[#0a5f48] text-white`}>Design my trip</a>
            <a ref={btn2Ref} href="#how" className={`hero-btn ${BTN} border border-slate-400 hover:border-slate-800 text-slate-800`}>How it works</a>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 md:gap-5 items-end">
          <img src={Ambanja} alt="" className={`hero-arch ${arch} h-56 md:h-72`} />
          <img src={NosyIranja} alt="" className={`hero-arch ${arch} h-72 md:h-[26rem]`} />
          <img src={Tana} alt="" className={`hero-arch ${arch} h-48 md:h-60`} />
        </div>
      </section>
    </>
  )
}

function Builder({ form, setForm }) {
  const [step, setStep] = useState(0)
  const [sent, setSent] = useState(false)
  const root = useRef(null)
  const cardRef = useRef(null)
  const prevStep = useRef(0)
  const prevSent = useRef(false)
  const prevSummary = useRef(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const toggle = (id) => set('interests', form.interests.includes(id) ? form.interests.filter((x) => x !== id) : [...form.interests, id])
  const titles = ['Your interests', 'Time', 'Your style', 'Your details']

  const submit = (e) => {
    e.preventDefault()
    const payload = { ...form, ...Object.fromEntries(new FormData(e.currentTarget)) }
    console.log('Tailor-made request:', payload)
    setSent(true)
  }

  const summary = [
    ['Interests', form.interests.join(', ') || 'Not chosen yet'],
    ['Length', form.length],
    ['Month', form.month],
    ['Pace', form.pace],
    ['Comfort', form.comfort],
    ['Travelling', form.group],
  ]

  useGsap(root, () => {
    const trigger = { trigger: root.current, start: 'top 80%', once: true }
    reveal('.bld-card', { y: 70, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: trigger })
    reveal('.bld-aside', { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, delay: 0.15, ease: 'power3.out', scrollTrigger: trigger })
    reveal('.sum-row', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, delay: 0.55, ease: 'power2.out', scrollTrigger: trigger })
    reveal('.interest-card', { scale: 0.82, opacity: 0, y: 14 }, { scale: 1, opacity: 1, y: 0, duration: 0.6, stagger: 0.06, delay: 0.45, ease: 'back.out(2.2)', scrollTrigger: trigger })
  })

  /* Transition d'étape : la hauteur de la carte s'anime en douceur (FLIP) pour éviter
     le saut brutal quand le contenu change de taille, en plus du glissement du panneau. */
  useGsap(root, () => {
    const oldStep = prevStep.current
    const changed = oldStep !== step || prevSent.current !== sent
    const card = cardRef.current

    if (changed && card) {
      const fromHeight = card.offsetHeight
      // Laisse React peindre le nouveau contenu avant de mesurer la hauteur cible
      requestAnimationFrame(() => {
        const toHeight = card.scrollHeight
        gsap.fromTo(card, { height: fromHeight }, { height: toHeight, duration: 0.5, ease: 'power3.inOut', onComplete: () => gsap.set(card, { height: 'auto' }) })
      })
    }

    prevStep.current = step
    prevSent.current = sent
    if (!changed) return

    if (sent) {
      reveal('.thanks > *', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, stagger: 0.11, ease: 'back.out(1.7)' })
      return
    }
    const dir = step >= oldStep ? 1 : -1
    reveal('.step-pane', { x: 36 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55, ease: 'power3.out' })
    reveal('.interest-card', { scale: 0.85, opacity: 0, y: 10 }, { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.05, delay: 0.1, ease: 'back.out(2.2)' })
    reveal('.step-pane .pill', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.035, delay: 0.14, ease: 'power2.out' })
    reveal('#tailor-form > *', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.07, delay: 0.1, ease: 'power2.out' })
    const seg = gsap.utils.toArray('.prog-seg')[step]
    if (seg) reveal(seg, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.55, ease: 'power3.out' })
  }, [step, sent])

  const summaryKey = JSON.stringify(form)
  useGsap(root, () => {
    if (prevSummary.current === null) { prevSummary.current = summaryKey; return }
    if (prevSummary.current === summaryKey) return
    prevSummary.current = summaryKey
    gsap.fromTo(
      '.sum-val',
      { y: 8, opacity: 0.25, color: '#C49849' },
      { y: 0, opacity: 1, color: '#ffffff', duration: 0.55, stagger: 0.04, ease: 'power2.out', clearProps: 'color' }
    )
  }, [summaryKey])

  return (
    <section ref={root} id="builder" className={`${W} mt-16 md:mt-28 scroll-mt-6 grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6 items-start`}>
      <div ref={cardRef} className="bld-card rounded-[2rem] md:rounded-[3rem] bg-white p-5 sm:p-8 md:p-12 overflow-hidden">
        {sent ? (
          <div role="status" className="thanks py-8 text-center">
            <h2 className={H2}>Thank you!</h2>
            <p className="mt-4 text-base md:text-lg text-slate-700 max-w-xl mx-auto">Your wishes are with our travel experts. Expect a first proposal by email within a few days.</p>
            <button type="button" onClick={() => { setSent(false); setStep(0) }} className={`${BTN} bg-slate-800 hover:bg-slate-700 text-white mt-8`}>Start another request</button>
          </div>
        ) : (
          <>
            <p className="text-sm md:text-base text-slate-600">Step {step + 1} of 4 · {titles[step]}</p>
            <div className="mt-3 flex gap-2" aria-hidden="true">
              {titles.map((t, i) => <span key={t} className={`prog-seg h-1.5 flex-1 rounded-full ${i <= step ? 'bg-[#C49849]' : 'bg-slate-200'}`} />)}
            </div>

            {step === 0 && (
              <fieldset className="step-pane mt-8">
                <legend className={H2}>What do you love?</legend>
                <p className="mt-2 text-sm md:text-base text-slate-600">Pick as many as you like.</p>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {interests.map((it) => {
                    const on = form.interests.includes(it.id)
                    return (
                      <button key={it.id} type="button" onClick={() => toggle(it.id)} aria-pressed={on}
                        className={`interest-card group relative aspect-[4/3] overflow-hidden rounded-[1.5rem] text-left text-white transition-transform duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-800 ${on ? 'ring-4 ring-[#C49849]' : ''}`}>
                        <img src={it.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className={`absolute inset-0 ${on ? 'bg-slate-950/50' : 'bg-gradient-to-t from-slate-950/80 to-transparent'}`} />
                        <span className="absolute inset-x-0 bottom-0 p-4 text-base md:text-lg font-medium">{it.id}</span>
                        {on && <span aria-hidden="true" className="absolute right-3 top-3 w-7 h-7 rounded-full bg-[#C49849] flex items-center justify-center text-sm">✓</span>}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <div className="step-pane mt-8 flex flex-col gap-8">
                <fieldset>
                  <legend className={`${H2} mb-5`}>How long?</legend>
                  <div className="flex flex-wrap gap-3">{lengths.map((l) => <Pill key={l} active={form.length === l} onClick={() => set('length', l)}>{l}</Pill>)}</div>
                </fieldset>
                <div className="max-w-xs">
                  <label htmlFor="month" className={LABEL}>Preferred month</label>
                  <select id="month" value={form.month} onChange={(e) => set('month', e.target.value)} className={FIELD}>
                    {months.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="step-pane mt-8 flex flex-col gap-8">
                <h2 className={H2}>Your style</h2>
                {[['Pace', 'pace', paces], ['Comfort', 'comfort', comforts], ['Who is travelling?', 'group', groups]].map(([label, key, opts]) => (
                  <fieldset key={key}>
                    <legend className={LABEL}>{label}</legend>
                    <div className="flex flex-wrap gap-3">{opts.map((o) => <Pill key={o} active={form[key] === o} onClick={() => set(key, o)}>{o}</Pill>)}</div>
                  </fieldset>
                ))}
              </div>
            )}

            {step === 3 && (
              <form id="tailor-form" onSubmit={submit} className="step-pane mt-8 flex flex-col gap-5">
                <h2 className={H2}>Where do we send your proposal?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label htmlFor="t-name" className={LABEL}>Name</label><input id="t-name" name="name" required autoComplete="name" className={FIELD} /></div>
                  <div><label htmlFor="t-phone" className={LABEL}>Phone (optional)</label><input id="t-phone" name="phone" type="tel" autoComplete="tel" className={FIELD} /></div>
                </div>
                <div><label htmlFor="t-email" className={LABEL}>Email address</label><input id="t-email" name="email" type="email" required autoComplete="email" className={FIELD} /></div>
                <div>
                  <label htmlFor="t-notes" className={LABEL}>Anything else we should know?</label>
                  <textarea id="t-notes" name="notes" rows={4} className="w-full rounded-3xl border border-slate-300 bg-white px-5 py-3 text-base text-slate-800 focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700" />
                </div>
              </form>
            )}

            <div className="mt-10 flex items-center justify-between gap-3">
              <button type="button" onClick={() => setStep(step - 1)} disabled={step === 0} className={`${BTN} border border-slate-300 text-slate-800 hover:border-slate-700`}>Back</button>
              {step < 3 ? (
                <button type="button" onClick={() => setStep(step + 1)} disabled={step === 0 && form.interests.length === 0} className={`${BTN} bg-slate-800 hover:bg-slate-700 text-white`}>Next</button>
              ) : (
                <button type="submit" form="tailor-form" className={`${BTN} ${GOLD} text-white`}>Send my wishes</button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Résumé */}
      <aside className={`bld-aside rounded-[2rem] ${DARK} text-white p-6 md:p-8 lg:sticky lg:top-6`}>
        <h3 className="text-xl md:text-2xl font-medium">Your trip so far</h3>
        <dl className="mt-5 flex flex-col gap-4">
          {summary.map(([k, v]) => (
            <div key={k} className="sum-row border-t border-white/20 pt-3">
              <dt className="text-xs text-white/60">{k}</dt>
              <dd className="sum-val mt-1 text-sm md:text-base">{v}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </section>
  )
}

function IdeaCard({ it, onSelect }) {
  return (
    <li className="idea-card">
      <button
        type="button"
        onClick={onSelect}
        className="group relative block w-full aspect-[4/5] overflow-hidden rounded-[2rem] text-left text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-800"
      >
        <img src={it.image} alt="" className="idea-img absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent" />
        <div className="idea-text absolute inset-x-0 bottom-0 p-6">
          <h3 className="text-2xl md:text-3xl font-medium">{it.title}</h3>
          <p className="mt-2 text-sm text-white/80">{it.text}</p>
          <span className="mt-4 inline-block text-sm font-medium text-[#e2c58d]">Start from this idea</span>
        </div>
      </button>
    </li>
  )
}

function TailorMade() {
  const [form, setForm] = useState({ interests: [], length: '2 weeks', month: 'Not sure yet', pace: 'Balanced', comfort: 'Comfortable', group: 'Couple' })
  const howRef = useRef(null)
  const ideasRef = useRef(null)
  const ctaRef = useRef(null)
  const ctaBtnRef = useRef(null)

  useMagnetic(ctaBtnRef, 0.25)

  const applyPreset = (preset) => {
    setForm((f) => ({ ...f, ...preset }))
    document.getElementById('builder')?.scrollIntoView({ behavior: 'smooth' })
  }

  useGsap(howRef, () => {
    reveal('.how-title > *', { x: -36, opacity: 0 }, { x: 0, opacity: 1, duration: 0.85, stagger: 0.11, ease: 'power3.out', scrollTrigger: { trigger: '.how-title', start: 'top 85%', once: true } })

    gsap.utils.toArray('.step-item').forEach((li) => {
      const num = li.querySelector('.step-num')
      gsap.set(li, { opacity: 0.3 })
      ScrollTrigger.create({
        trigger: li,
        start: 'top 70%',
        onEnter: () => {
          gsap.to(li, { opacity: 1, duration: 0.5, ease: 'power2.out' })
          gsap.fromTo(num, { scale: 0.6, transformOrigin: 'left center' }, { scale: 1, duration: 0.65, ease: 'back.out(3.2)' })
        },
        onLeaveBack: () => gsap.to(li, { opacity: 0.3, duration: 0.4 }),
      })
    })
  })

  /* Idées de départ : dévoilement sobre par clip-path depuis le bas, avec léger dézoom de l'image */
  useGsap(ideasRef, () => {
    reveal('.ideas-head > *', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75, stagger: 0.11, ease: 'power3.out', scrollTrigger: { trigger: '.ideas-head', start: 'top 88%', once: true } })

    const trigger = { trigger: '.ideas-list', start: 'top 85%', once: true }
    reveal('.idea-card', { clipPath: 'inset(100% 0% 0% 0% round 2rem)' }, { clipPath: 'inset(0% 0% 0% 0% round 2rem)', duration: 1.2, stagger: 0.14, ease: 'expo.out', scrollTrigger: trigger })
    reveal('.idea-img', { scale: 1.12 }, { scale: 1, duration: 1.4, stagger: 0.14, ease: 'power2.out', scrollTrigger: trigger })
    reveal('.idea-text > *', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.06, delay: 0.5, ease: 'power2.out', scrollTrigger: trigger })
  })

  useGsap(ctaRef, () => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: ctaRef.current, start: 'top 82%', once: true } })
    tl.fromTo(ctaRef.current, { clipPath: 'circle(0% at 0% 50%)', transition: 'none' }, { clipPath: 'circle(150% at 0% 50%)', duration: 1.3, ease: 'expo.inOut', clearProps: 'clipPath,transition' })
      .fromTo('.cta-text > h2, .cta-text > p', { y: 26, opacity: 0, transition: 'none' }, { y: 0, opacity: 1, duration: 0.75, stagger: 0.12, ease: 'power3.out', clearProps: 'all' }, 0.55)
      .fromTo('.cta-btn', { scale: 0.6, opacity: 0, transition: 'none' }, { scale: 1, opacity: 1, duration: 0.65, ease: 'back.out(2.4)', clearProps: 'all' }, 1.0)

    gsap.fromTo(
      '.cta-bg',
      { scale: 1.2 },
      { scale: 1, ease: 'none', scrollTrigger: { trigger: ctaRef.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 } }
    )
  })

  /* Recalcule les positions ScrollTrigger une fois les polices et les images chargées,
     et à chaque redimensionnement — plus fiable qu'un simple setTimeout fixe. */
  useLayoutEffect(() => {
    const refresh = () => ScrollTrigger.refresh()

    window.addEventListener('load', refresh)
    document.fonts?.ready?.then(refresh)

    const images = Array.from(document.querySelectorAll('img'))
    images.forEach((img) => {
      if (!img.complete) img.addEventListener('load', refresh, { once: true })
    })

    const ro = new ResizeObserver(() => refresh())
    ro.observe(document.body)

    return () => {
      window.removeEventListener('load', refresh)
      images.forEach((img) => img.removeEventListener('load', refresh))
      ro.disconnect()
    }
  }, [])

  return (
    <>
      <main className="w-full bg-[#D5E8E2] pb-16 md:pb-24 flex flex-col items-center">
        <Hero />

        {/* Comment ça marche */}
        <section ref={howRef} id="how" className={`${W} mt-20 md:mt-32 scroll-mt-6 grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-10 lg:gap-20`}>
          <div className="lg:sticky lg:top-6 self-start">
            <div className="how-title">
              <h2 className={H2}>From Idea To Itinerary</h2>
              <p className="mt-4 text-base md:text-lg text-slate-700 max-w-md">Four simple steps, with a real person on the other side.</p>
            </div>
          </div>
          <ol className="flex flex-col">
            {steps.map((s, i) => (
              <li key={s.title} className="step-item flex gap-6 md:gap-10 border-t border-slate-900/15 py-8 transition-colors duration-300 hover:bg-slate-900/[0.02] rounded-xl">
                <span className="step-num text-5xl md:text-7xl font-semibold text-[#C49849] leading-none w-14 md:w-24 shrink-0">{i + 1}</span>
                <div>
                  <h3 className="text-xl md:text-3xl font-medium text-slate-900">{s.title}</h3>
                  <p className="mt-2 text-sm md:text-base text-slate-600 leading-relaxed">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Idées de départ */}
        <section ref={ideasRef} className={`${W} mt-16 md:mt-28`}>
          <div className="ideas-head">
            <h2 className={H2}>Need A Starting Point?</h2>
            <p className="mt-3 text-base md:text-lg text-slate-700">Pick an idea and we fill in the first answers for you.</p>
          </div>
          <ul className="ideas-list mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
            {ideas.map((it) => (
              <IdeaCard key={it.title} it={it} onSelect={() => applyPreset(it.preset)} />
            ))}
          </ul>
        </section>

        <Builder form={form} setForm={setForm} />

        {/* Contact direct */}
        <section ref={ctaRef} className={`${W} mt-16 md:mt-28 relative overflow-hidden rounded-[2rem] md:rounded-[3rem] text-white min-h-[340px] flex items-center`}>
          <img src={Ramena} alt="" className="cta-bg absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-950/65" />
          <div className="cta-text relative p-8 md:p-16 max-w-3xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight">Prefer to talk it through?</h2>
            <p className="mt-4 text-sm md:text-lg text-white/85">Book a call or write to us. A travel expert replies within one working day.</p>
            <a ref={ctaBtnRef} href="/contact" className={`cta-btn ${BTN} ${GOLD} text-white mt-8`}>Contact a travel expert</a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default TailorMade