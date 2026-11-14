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
import { CARD, CARD_BODY, CARD_IMG, CARD_MEDIA, CARD_TEXT, CARD_TITLE } from '../components/Card'
import PageHero from '../components/PageHero'
import PageCta, { PAGE_CTA_GOLD, PAGE_CTA_GHOST } from '../components/PageCta'
import { sendTailorMade } from '../api'
import { useAuth } from '../context/AuthContext'
import { useLanguage, useT } from '../i18n/LanguageContext'
import { monthName } from '../utils/format'
import { useOffers } from '../utils/useOffers'
import { usePhoto } from '../sitePhotos'
import { A } from '../i18n/router'
import Img from '../components/Img'

gsap.registerPlugin(ScrollTrigger)

const W = 'w-[90vw] max-w-[1360px]'
const GOLD = 'bg-[#A9813A] hover:bg-[#8C6A2C]'
const DARK = 'bg-[#0C3E2E]'
const BTN = 'inline-flex items-center justify-center text-sm md:text-base font-medium px-6 py-3 rounded-full active:scale-95 transition disabled:opacity-40 disabled:pointer-events-none'
const H2 = 'text-[clamp(2.6rem,5.4vw,5rem)] text-forest leading-[1] [text-wrap:balance]'
const FIELD = 'w-full h-12 rounded-full border border-slate-300 bg-white px-5 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E6C58A]'
const LABEL = 'block mb-2 text-sm md:text-base text-white/85'
const QUESTION = 'text-4xl sm:text-5xl md:text-6xl font-medium leading-[1.05] tracking-tight text-white'

/* ---------------------------- Données ---------------------------- */
// Les choix du formulaire sont envoyés à l'équipe en anglais (valeurs ci-dessous) ;
// leur libellé affiché vient de tailormade.options, les autres textes de tailormade.json.
// Les idées de départ (titre, texte, photo, choix pré-remplis) sont en base : admin > Offers > Tailor-made ideas.

const interests = [
  { id: 'Islands & beaches', slot: 'tm.interest.1', image: NosyIranja },
  { id: 'Wildlife', slot: 'tm.interest.2', image: Ambanja },
  { id: 'Culture & villages', slot: 'tm.interest.3', image: Tana },
  { id: 'Hiking & adventure', slot: 'tm.interest.4', image: Deux },
  { id: 'Sailing & sea', slot: 'tm.interest.5', image: Ramena },
  { id: 'Slow & relaxing', slot: 'tm.interest.6', image: NosyLonjo },
]
const lengths = ['1 week', '2 weeks', '3 weeks', '1 month or more']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const months = ['Not sure yet', ...MONTHS]
const paces = ['Slow', 'Balanced', 'Active']
const comforts = ['Comfortable', 'Premium', 'Luxury']
const groups = ['Solo', 'Couple', 'Family', 'Friends']

// Couleur de chaque carte de « De l'idée à l'itinéraire » (textes : locales/<langue>/tailormade.json, clé steps)
const STEP_TONES = ['bg-white text-slate-900', 'bg-[#0C3E2E] text-white', 'bg-[#A9813A] text-white', 'bg-white text-slate-900']

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
      className={`pill rounded-full border px-5 py-2.5 text-sm md:text-base transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C58A] ${
        active ? 'bg-[#A9813A] border-[#A9813A] text-white' : 'bg-white/10 border-white/35 text-white hover:bg-white/20'
      }`}
    >
      {children}
    </button>
  )
}

function Hero() {
  const t = useT('tailormade')
  return (
    <>
      <Navbar />
      <PageHero slot="tm.hero.2" title={t('title')} crumb={t('eyebrow')} text={t('intro')} moreHref="#builder" moreLabel={t('design')} />
    </>
  )
}

function Builder({ form, setForm }) {
  const photo = usePhoto()
  // Connecté : nom et email pré-remplis (la clé recrée le champ quand la session est connue)
  const { user } = useAuth()
  const t = useT('tailormade')
  const { lang } = useLanguage()
  // Libellé affiché d'une valeur envoyée en anglais (mois : nom dans la langue du site)
  const label = (value) => (MONTHS.includes(value) ? monthName(MONTHS.indexOf(value) + 1, lang, 'long') : t('options')[value] || value)
  const [step, setStep] = useState(0)
  const [sent, setSent] = useState(false)
  const root = useRef(null)
  const prevStep = useRef(0)
  const prevSent = useRef(false)
  const prevSummary = useRef(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const toggle = (id) => set('interests', form.interests.includes(id) ? form.interests.filter((x) => x !== id) : [...form.interests, id])
  const titles = t('stepTitles')

  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    const payload = { ...form, ...Object.fromEntries(new FormData(e.currentTarget)) }

    setSending(true)
    setError('')
    try {
      await sendTailorMade(payload)
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const s = t('summary')
  const summary = [
    [s.interests, form.interests.map(label).join(', ') || t('notChosen')],
    [s.length, label(form.length)],
    [s.month, label(form.month)],
    [s.pace, label(form.pace)],
    [s.comfort, label(form.comfort)],
    [s.group, label(form.group)],
  ]

  useGsap(root, () => {
    const trigger = { trigger: root.current, start: 'top 80%', once: true }
    reveal(root.current, { clipPath: 'inset(8% 4% 0% 4% round 3rem)', opacity: 0.4 }, { clipPath: 'inset(0% 0% 0% 0% round 3rem)', opacity: 1, duration: 1.1, ease: 'expo.out', scrollTrigger: trigger })
    reveal('.route-stop', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, delay: 0.3, ease: 'power2.out', scrollTrigger: trigger })
    reveal('.sum-row', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, delay: 0.5, ease: 'power2.out', scrollTrigger: trigger })
    reveal('.interest-card', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.07, delay: 0.35, ease: 'power3.out', scrollTrigger: trigger })
  })

  // Changement d'étape : la question et ses réponses glissent dans le sens de la marche
  useGsap(root, () => {
    const oldStep = prevStep.current
    const changed = oldStep !== step || prevSent.current !== sent
    prevStep.current = step
    prevSent.current = sent
    if (!changed) return

    if (sent) {
      reveal('.thanks > *', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, stagger: 0.11, ease: 'back.out(1.7)' })
      return
    }
    const dir = step >= oldStep ? 1 : -1
    reveal('.step-pane', { x: 36 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55, ease: 'power3.out' })
    reveal('.interest-card', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, delay: 0.1, ease: 'power3.out' })
    reveal('.step-pane .pill', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.025, delay: 0.14, ease: 'power2.out' })
  }, [step, sent])

  const summaryKey = JSON.stringify(form)
  useGsap(root, () => {
    if (prevSummary.current === null) { prevSummary.current = summaryKey; return }
    if (prevSummary.current === summaryKey) return
    prevSummary.current = summaryKey
    gsap.fromTo('.sum-val', { y: 6, color: '#A9813A' }, { y: 0, color: '#0c3e2e', duration: 0.55, stagger: 0.03, ease: 'power2.out', clearProps: 'color,transform' })
  }, [summaryKey])

  // La photo de fond suit la dernière envie choisie
  const backdrop = form.interests[form.interests.length - 1] || interests[0].id

  return (
    <section ref={root} id="builder" className={`${W} mt-16 md:mt-28 scroll-mt-6 relative overflow-hidden rounded-3xl ${DARK} text-white`}>
      {interests.map((it) => (
        <Img key={it.id} src={photo(it.slot)} alt="" loading="lazy" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${backdrop === it.id ? 'opacity-100' : 'opacity-0'}`} />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-[#072a1f]/90 via-[#072a1f]/75 to-[#072a1f]/95" />

      <div className="relative flex flex-col p-5 sm:p-8 md:p-12 min-h-[640px] md:min-h-[720px]">
        {sent ? (
          <div role="status" className="thanks my-auto py-12 text-center">
            <h2 className={QUESTION}>{t('thanksTitle')}</h2>
            <p className="mt-4 text-base md:text-lg text-white/85 max-w-xl mx-auto">{t('thanksText')}</p>
            <button type="button" onClick={() => { setSent(false); setStep(0) }} className={`${BTN} ${GOLD} text-white mt-8`}>{t('another')}</button>
          </div>
        ) : (
          <>
            {/* Les étapes, comme les arrêts d'un itinéraire */}
            <p className="md:hidden text-sm text-white/80">{t('stepOf', { n: step + 1, title: titles[step] })}</p>
            <ol className="mt-3 md:mt-0 flex items-center" aria-label={t('stepOf', { n: step + 1, title: titles[step] })}>
              {titles.map((title, i) => (
                <li key={title} className={`route-stop flex items-center ${i < titles.length - 1 ? 'flex-1' : ''}`}>
                  <button
                    type="button"
                    onClick={() => setStep(i)}
                    disabled={i > step}
                    aria-current={i === step ? 'step' : undefined}
                    className="flex items-center gap-2.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C58A] disabled:cursor-default"
                  >
                    <span className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm tabular-nums transition-colors ${i <= step ? 'bg-[#A9813A] text-white' : 'border border-white/40 text-white/70'}`}>{i < step ? '✓' : i + 1}</span>
                    <span className={`hidden md:block text-sm whitespace-nowrap ${i === step ? 'font-medium text-white' : 'text-white/70'}`}>{title}</span>
                  </button>
                  {i < titles.length - 1 && <span aria-hidden="true" className={`flex-1 mx-2 md:mx-4 border-t-2 border-dashed transition-colors ${i < step ? 'border-[#A9813A]' : 'border-white/25'}`} />}
                </li>
              ))}
            </ol>

            <div className="my-auto py-8 md:py-10">
              {step === 0 && (
                <fieldset className="step-pane">
                  <legend className={QUESTION}>{t('love')}</legend>
                  <p className="mt-3 text-sm md:text-lg text-white/80">{t('pickMany')}</p>
                  <div className="mt-6 md:mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                    {interests.map((it) => {
                      const on = form.interests.includes(it.id)
                      return (
                        <button key={it.id} type="button" onClick={() => toggle(it.id)} aria-pressed={on}
                          className={`interest-card group relative aspect-[3/4] overflow-hidden rounded-t-[999px] rounded-b-3xl text-white transition-transform duration-300 hover:-translate-y-1.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#E6C58A] ${on ? 'ring-4 ring-[#A9813A]' : 'ring-1 ring-white/25'}`}>
                          <Img src={photo(it.slot)} alt="" className="absolute inset-0 w-full h-full object-cover img-zoom" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#072a1f]/90 via-[#072a1f]/20 to-transparent" />
                          <span className="absolute inset-x-0 bottom-0 p-3 md:p-4 text-center text-sm md:text-base font-medium leading-snug">{label(it.id)}</span>
                          {on && <span aria-hidden="true" className="absolute left-1/2 top-5 -translate-x-1/2 w-8 h-8 rounded-full bg-[#A9813A] flex items-center justify-center text-sm">✓</span>}
                        </button>
                      )
                    })}
                  </div>
                </fieldset>
              )}

              {step === 1 && (
                <div className="step-pane flex flex-col gap-8">
                  <fieldset>
                    <legend className={`${QUESTION} mb-6`}>{t('howLong')}</legend>
                    <div className="flex flex-wrap gap-3">{lengths.map((l) => <Pill key={l} active={form.length === l} onClick={() => set('length', l)}>{label(l)}</Pill>)}</div>
                  </fieldset>
                  <fieldset>
                    <legend className={LABEL}>{t('month')}</legend>
                    <div className="flex flex-wrap gap-2">{months.map((m) => <Pill key={m} active={form.month === m} onClick={() => set('month', m)}>{label(m)}</Pill>)}</div>
                  </fieldset>
                </div>
              )}

              {step === 2 && (
                <div className="step-pane flex flex-col gap-7">
                  <h2 className={QUESTION}>{t('style')}</h2>
                  {[[t('pace'), 'pace', paces], [t('comfort'), 'comfort', comforts], [t('who'), 'group', groups]].map(([title, key, opts]) => (
                    <fieldset key={key}>
                      <legend className={LABEL}>{title}</legend>
                      <div className="flex flex-wrap gap-3">{opts.map((o) => <Pill key={o} active={form[key] === o} onClick={() => set(key, o)}>{label(o)}</Pill>)}</div>
                    </fieldset>
                  ))}
                </div>
              )}

              {step === 3 && (
                <form id="tailor-form" onSubmit={submit} className="step-pane flex flex-col gap-5 max-w-3xl">
                  <h2 className={QUESTION}>{t('where')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label htmlFor="t-name" className={LABEL}>{t('name')}</label><input id="t-name" name="name" key={`n-${user?.id}`} defaultValue={user?.name} required autoComplete="name" className={FIELD} /></div>
                    <div><label htmlFor="t-phone" className={LABEL}>{t('phone')}</label><input id="t-phone" name="phone" type="tel" autoComplete="tel" className={FIELD} /></div>
                  </div>
                  <div><label htmlFor="t-email" className={LABEL}>{t('email')}</label><input id="t-email" name="email" key={`e-${user?.id}`} defaultValue={user?.email} type="email" required autoComplete="email" className={FIELD} /></div>
                  <div>
                    <label htmlFor="t-notes" className={LABEL}>{t('notes')}</label>
                    <textarea id="t-notes" name="notes" rows={3} className="w-full rounded-3xl border border-slate-300 bg-white px-5 py-3 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E6C58A]" />
                  </div>
                </form>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => setStep(step - 1)} disabled={step === 0} className={`${BTN} border border-white/40 text-white hover:bg-white/10`}>{t('back')}</button>
              {step < 3 ? (
                <button type="button" onClick={() => setStep(step + 1)} disabled={step === 0 && form.interests.length === 0} className={`${BTN} ${GOLD} text-white`}>{t('next')}</button>
              ) : (
                <button type="submit" form="tailor-form" disabled={sending} className={`${BTN} ${GOLD} text-white disabled:opacity-60 disabled:cursor-wait`}>{sending ? t('sending') : t('send')}</button>
              )}
            </div>
            {error && <p role="alert" className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm md:text-base text-red-700">{error}</p>}

            {/* Résumé : un billet qui se remplit au fil des réponses */}
            <aside className="relative mt-6 rounded-2xl bg-white text-slate-900 p-4 md:p-5">
              <span aria-hidden="true" className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#072a1f]" />
              <span aria-hidden="true" className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#072a1f]" />
              <h3 className="px-2 text-xs font-bold uppercase tracking-wide text-[#9a742f]">{t('soFar')}</h3>
              <dl className="mt-3 px-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.8fr_repeat(5,1fr)] gap-x-5 gap-y-3 border-t border-dashed border-slate-300 pt-3">
                {summary.map(([k, v]) => (
                  <div key={k} className="sum-row min-w-0">
                    <dt className="text-xs text-slate-500">{k}</dt>
                    <dd className="sum-val mt-0.5 text-sm font-medium text-forest">{v}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          </>
        )}
      </div>
    </section>
  )
}

function IdeaCard({ it, onSelect }) {
  const t = useT('tailormade')
  return (
    <li className="idea-card flex">
      <button type="button" onClick={onSelect} className={`${CARD} w-full text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0C3E2E]`}>
        <span className={`block ${CARD_MEDIA}`}>
          <Img src={it.image} alt="" className={`idea-img ${CARD_IMG}`} />
        </span>
        <span className={`idea-text ${CARD_BODY}`}>
          <span className={`block ${CARD_TITLE.replace('mt-4 ', '')}`}>{it.title}</span>
          <span className={`block ${CARD_TEXT}`}>{it.text}</span>
          <span className="mt-auto pt-5 inline-block text-sm font-medium text-forest group-hover:underline">{t('startIdea')}</span>
        </span>
      </button>
    </li>
  )
}

function TailorMade() {
  const t = useT('tailormade')
  const { offers: ideas, status: ideasStatus } = useOffers('idea')
  const [form, setForm] = useState({ interests: [], length: '2 weeks', month: 'Not sure yet', pace: 'Balanced', comfort: 'Comfortable', group: 'Couple' })
  const howRef = useRef(null)
  const ideasRef = useRef(null)


  const applyPreset = (preset) => {
    setForm((f) => ({ ...f, ...preset }))
    document.getElementById('builder')?.scrollIntoView({ behavior: 'smooth' })
  }

  useGsap(howRef, () => {
    reveal('.how-title > *', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85, stagger: 0.11, ease: 'power3.out', scrollTrigger: { trigger: '.how-title', start: 'top 85%', once: true } })

    // Chaque carte monte puis reste accrochée : la suivante vient se poser par-dessus
    gsap.utils.toArray('.step-item').forEach((card) => {
      reveal(card, { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 92%', once: true } })
    })
  })

  /* Idées de départ : dévoilement sobre par clip-path depuis le bas, avec léger dézoom de l'image */
  useGsap(ideasRef, () => {
    reveal('.ideas-head > *', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75, stagger: 0.11, ease: 'power3.out', scrollTrigger: { trigger: '.ideas-head', start: 'top 88%', once: true } })

    const trigger = { trigger: '.ideas-list', start: 'top 85%', once: true }
    reveal('.idea-card', { clipPath: 'inset(100% 0% 0% 0% round 0.75rem)' }, { clipPath: 'inset(0% 0% 0% 0% round 0.75rem)', duration: 1.2, stagger: 0.14, ease: 'expo.out', scrollTrigger: trigger })
    reveal('.idea-img', { scale: 1.12 }, { scale: 1, duration: 1.4, stagger: 0.14, ease: 'power2.out', scrollTrigger: trigger })
    reveal('.idea-text > *', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.06, delay: 0.5, ease: 'power2.out', scrollTrigger: trigger })
  }, [ideasStatus])

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
      <main className="w-full overflow-x-clip bg-[#F4F1EA] flex flex-col items-center">
        <Hero />

        {/* Comment ça marche */}
        <section ref={howRef} id="how" className={`${W} mt-20 md:mt-32 scroll-mt-6`}>
          <div className="how-title mb-8 md:mb-12 text-center">
            <h2 className={H2}>{t('howTitle')}</h2>
            <p className="mt-4 mx-auto text-base md:text-lg text-slate-700 max-w-3xl">{t('howText')}</p>
          </div>
          <ol>
            {t('steps').map((s, i) => (
              <li
                key={s.title}
                style={{ top: `${88 + i * 22}px` }}
                className={`step-item sticky mb-6 rounded-3xl p-6 md:p-12 shadow-sm min-h-[240px] md:min-h-[280px] grid grid-cols-1 md:grid-cols-[120px_1fr_auto] gap-4 md:gap-10 items-center ${STEP_TONES[i]}`}
              >
                <span className="text-6xl md:text-8xl font-medium leading-none opacity-60 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="text-2xl md:text-4xl font-bold tracking-tight">{s.title}</h3>
                  <p className="mt-3 max-w-xl text-sm md:text-lg leading-relaxed opacity-85">{s.text}</p>
                </div>
                <span className="self-start md:self-center rounded-full border border-current px-4 py-2 text-sm">{s.deliverable}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Idées de départ (masquées s'il n'y en a aucune ou si elles n'ont pas pu être chargées) */}
        {ideasStatus !== 'error' && !(ideasStatus === 'ready' && ideas.length === 0) && (
          <section ref={ideasRef} className={`${W} mt-16 md:mt-28`}>
            <div className="ideas-head">
              <h2 className={H2}>{t('ideasTitle')}</h2>
              <p className="mt-3 text-base md:text-lg text-slate-700">{t('ideasText')}</p>
            </div>
            <ul className="ideas-list mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
              {ideas.map((it) => (
                <IdeaCard key={it.id} it={it} onSelect={() => applyPreset({ interests: it.interests, group: it.travellers })} />
              ))}
            </ul>
          </section>
        )}

        <Builder form={form} setForm={setForm} />

        {/* Contact direct */}
        <PageCta slot="tm.cta" title={t('ctaTitle')} text={t('ctaText')} floats={['tm.hero.1', 'tm.hero.3']}>
          <A href="/contact" className={PAGE_CTA_GOLD}>{t('ctaButton')}</A>
        </PageCta>
      </main>
      <Footer />
    </>
  )
}

export default TailorMade