import React, { useState, useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Ramena from '../assets/images/Ramena.jpg'
import NosyIranja from '../assets/images/NosyIranja.jpg'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import OffersStatus from '../components/OffersStatus'
import AddToTrip from '../components/AddToTrip'
import { useLanguage, useT } from '../i18n/LanguageContext'
import { formatPrice } from '../utils/format'
import { useOffers } from '../utils/useOffers'
import { usePhoto } from '../sitePhotos'
import { A } from '../i18n/router'

gsap.registerPlugin(ScrollTrigger)

const W = 'w-[90vw] lg:max-w-[95vw]'
const GOLD = 'bg-[#C49849] hover:bg-[#a9813a]'
const BTN = 'inline-flex items-center justify-center text-sm md:text-base font-medium px-6 py-3 rounded-full active:scale-95 transition'
const H2 = 'text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight text-slate-900'
const SELECT = 'w-full h-12 rounded-full border border-slate-300 bg-white px-5 text-base text-slate-800 focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700'

/* ---------------------------- Données ---------------------------- */
/* Les excursions (textes, prix, photos, région, durée) sont en base : admin > Offers > Excursions.
   region et length (half | day | multi) servent aux filtres ci-dessous.
   Autres textes de la page : locales/<langue>/excursions.json (steps, stops : même ordre qu'ici) */

const regions = ['All regions', 'North', 'Highlands', 'West', 'East']
const lengths = [
  { label: 'Any length', value: 'any' },
  { label: 'Half day', value: 'half' },
  { label: 'Full day', value: 'day' },
  { label: '2 days or more', value: 'multi' },
]

const steps = [
  { title: 'Hotel pick-up', text: 'Your driver and guide collect you in the morning.' },
  { title: 'Guided visit', text: 'Unhurried stops, with time for photos and questions.' },
  { title: 'Lunch with locals', text: 'A simple meal in a village or by the water.' },
  { title: 'Back by late afternoon', text: 'Dropped at your hotel in time to rest.' },
]

const stops = [
  { day: 'Day 1', text: 'Ambanja, then the boat from Ankify to Nosy Be' },
  { day: 'Day 2', text: 'Full day on Nosy Iranja, sandbar and turtles' },
  { day: 'Day 3', text: 'Nosy Lonjo in the morning, return in the afternoon' },
]

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

/* -------------------------- Composants --------------------------- */

function Hero({ region, setRegion, length, setLength }) {
  const photo = usePhoto()
  const heroRef = useRef(null)
  const formRef = useRef(null)
  const t = useT('excursions')

  // Hero : l'image se dézoome, le titre « respire » (espacement des lettres + flou),
  // le bloc texte dérive vers le haut quand on scrolle
  useGsap(heroRef, () => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.fromTo('.hero-bg', { scale: 1.2 }, { scale: 1, duration: 2, ease: 'power2.out', clearProps: 'all' }, 0)
      .fromTo(
        '.hero-title',
        { letterSpacing: '0.12em', opacity: 0, filter: 'blur(16px)' },
        { letterSpacing: '-0.025em', opacity: 1, filter: 'blur(0px)', duration: 1.6, ease: 'expo.out', clearProps: 'all' },
        0.2
      )
      .fromTo('.hero-sub', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, clearProps: 'all' }, 0.9)

    gsap.to('.hero-content', {
      yPercent: -18,
      opacity: 0.2,
      ease: 'none',
      scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
    })
  })

  // Barre de recherche : monte avec un léger rebond, puis les champs se posent un par un
  useGsap(formRef, () => {
    const tl = gsap.timeline({ delay: 0.9 })
    tl.fromTo(formRef.current, { y: 90, opacity: 0, transition: 'none' }, { y: 0, opacity: 1, duration: 1, ease: 'back.out(1.5)', clearProps: 'all' })
      .fromTo('.hero-field', { y: 18, opacity: 0, transition: 'none' }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out', clearProps: 'all' }, '-=0.5')
      .fromTo('.hero-find', { scale: 0.7, opacity: 0, transition: 'none' }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(2.5)', clearProps: 'all' }, '-=0.3')
  })

  return (
    <>
      <Navbar />
      <section ref={heroRef} className={`${W} relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-[#084838] text-white min-h-[460px] md:min-h-[70vh] flex items-center`}>
        <img src={photo('exc.hero')} alt={t('heroAlt')} className="hero-bg absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-slate-950/55" />
        <div className="hero-content relative w-full px-6 sm:px-10 md:px-16 pb-16 text-center flex flex-col items-center">
          <h1 className="hero-title text-6xl sm:text-7xl md:text-8xl xl:text-[120px] font-semibold leading-[0.95] tracking-tight">{t('title')}</h1>
          <p className="hero-sub mt-5 text-base md:text-xl text-white/90 max-w-2xl">{t('intro')}</p>
        </div>
      </section>

      {/* Barre de recherche flottante */}
      <form
        ref={formRef}
        onSubmit={(e) => { e.preventDefault(); document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }) }}
        className={`${W} relative z-10 -mt-10 md:-mt-12 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end rounded-[2rem] bg-white p-5 md:p-7 shadow-lg`}
      >
        <div className="hero-field">
          <label htmlFor="region" className="block mb-2 text-sm md:text-base text-slate-700">{t('region')}</label>
          <select id="region" value={region} onChange={(e) => setRegion(e.target.value)} className={SELECT}>
            {regions.map((r) => <option key={r} value={r}>{t('regions')[r]}</option>)}
          </select>
        </div>
        <div className="hero-field">
          <label htmlFor="length" className="block mb-2 text-sm md:text-base text-slate-700">{t('length')}</label>
          <select id="length" value={length} onChange={(e) => setLength(e.target.value)} className={SELECT}>
            {lengths.map((l, i) => <option key={l.value} value={l.value}>{t('lengths')[i]}</option>)}
          </select>
        </div>
        <button type="submit" className={`hero-find ${BTN} ${GOLD} text-white h-12 md:px-8`}>{t('find')}</button>
      </form>
    </>
  )
}

function Row({ item }) {
  const t = useT('excursions')
  const { lang } = useLanguage()
  // Page de détail si l'admin en a indiqué une
  const href = item.link
  const Photo = href ? 'a' : 'div'
  const tripItem = { kind: 'excursion', ref: String(item.id), title: item.title, image: item.image, link: item.link || '/excursions', details: [item.duration, item.place].filter(Boolean).join(' · '), price: item.price, unit: 'person' }
  return (
    <li className="excursion-row grid grid-cols-1 md:grid-cols-[300px_1fr_auto] lg:grid-cols-[360px_1fr_auto] gap-4 md:gap-8 rounded-[2rem] bg-white p-3 md:p-4 md:items-stretch">
      <Photo href={href || undefined} className="group relative block aspect-[4/3] md:aspect-auto md:min-h-[220px] overflow-hidden rounded-[1.5rem]">
        <img src={item.image} alt={item.title} className="row-img absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="row-badge absolute left-3 top-3 bg-[#C49849] text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm">{item.duration}</span>
      </Photo>

      <div className="px-2 md:px-0 md:py-4 flex flex-col justify-center">
        <p className="flex items-center gap-3 text-xs sm:text-sm text-slate-600">
          <span>{item.place}</span><span className="w-px h-4 bg-slate-500" /><span>{item.level}</span><span className="w-px h-4 bg-slate-500" /><span>{item.group}</span>
        </p>
        <h3 className="mt-3 text-xl md:text-3xl font-medium leading-snug text-forest">
          {href ? <A href={href} className="hover:underline">{item.title}</A> : item.title}
        </h3>
        <p className="mt-3 text-sm md:text-base text-slate-600 leading-relaxed max-w-xl">{item.text}</p>
      </div>

      <div className="row-side px-2 pb-3 md:p-4 md:pr-6 flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4 md:border-l md:border-slate-200 md:pl-8">
        <p className="text-slate-600 text-sm md:text-right">{t('from')}<br className="hidden md:block" /> <span className="text-2xl md:text-3xl font-semibold text-slate-900">{formatPrice(item.price, lang)}</span><span className="block text-xs">{t('perPerson')}</span></p>
        <div className="flex flex-col items-end gap-2">
          <AddToTrip item={tripItem} />
          {href && <A href={href} className="text-sm text-slate-600 hover:underline">{t('details')}</A>}
        </div>
      </div>
    </li>
  )
}

function Excursions() {
  const photo = usePhoto()
  const t = useT('excursions')
  const { offers, status } = useOffers('excursion')
  const [region, setRegion] = useState('All regions')
  const [length, setLength] = useState('any')

  const resultsRef = useRef(null)
  const dayRef = useRef(null)
  const multiRef = useRef(null)
  const ctaRef = useRef(null)

  const visible = offers.filter(
    (e) => (region === 'All regions' || e.region === region) && (length === 'any' || e.length === length)
  )

  /* Titre des résultats : glisse depuis la gauche, le compteur arrive de la droite */
  useGsap(resultsRef, () => {
    const trigger = { trigger: '.res-title', start: 'top 88%', once: true }
    reveal('.res-title', { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: trigger })
    reveal('.res-count', { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, delay: 0.15, ease: 'power3.out', scrollTrigger: trigger })
  })

  /* Lignes : chaque excursion se déplie en perspective (bascule vers l'avant),
     l'image se dézoome et le bloc prix arrive après. Rejoué à chaque filtre. */
  useGsap(resultsRef, () => {
    const rows = gsap.utils.toArray('.excursion-row')
    if (!rows.length) return
    gsap.set(rows, { opacity: 0, y: 70, scale: 0.95, rotateX: -10, transformPerspective: 900, transformOrigin: 'center top', transition: 'none' })

    ScrollTrigger.batch(rows, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 1, ease: 'power3.out', stagger: 0.15, clearProps: 'all' })
        reveal(batch.map((r) => r.querySelector('.row-img')), { scale: 1.35 }, { scale: 1, duration: 1.5, ease: 'power2.out', stagger: 0.15 })
        reveal(batch.map((r) => r.querySelector('.row-badge')), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(3)', delay: 0.4, stagger: 0.15 })
        reveal(batch.map((r) => r.querySelector('.row-side')), { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, delay: 0.5, stagger: 0.15, ease: 'power2.out' })
      },
    })
  }, [region, length, offers])

  /* Journée type : chaque étape se « dessine » de gauche à droite (la ligne du haut en premier) */
  useGsap(dayRef, () => {
    const trigger = { trigger: dayRef.current, start: 'top 80%', once: true }
    reveal('.day-title', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: trigger })
    reveal('.day-step', { clipPath: 'inset(0% 100% 0% 0%)', opacity: 0 }, { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 1.1, stagger: 0.22, delay: 0.2, ease: 'power3.inOut', scrollTrigger: trigger })
    reveal('.day-num', { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, duration: 0.6, stagger: 0.22, delay: 0.6, ease: 'back.out(3)', scrollTrigger: trigger })
  })

  /* Escapade : l'image se révèle de bas en haut, les étapes glissent une à une */
  useGsap(multiRef, () => {
    const trigger = { trigger: multiRef.current, start: 'top 75%', once: true }
    reveal('.multi-frame', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.out', scrollTrigger: trigger })
    reveal('.multi-img', { scale: 1.3 }, { scale: 1, duration: 1.8, ease: 'power2.out', scrollTrigger: trigger })
    reveal('.multi-badge', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, delay: 0.8, ease: 'back.out(3)', scrollTrigger: trigger })
    reveal('.multi-text > h2, .multi-text > p', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, delay: 0.2, ease: 'power3.out', scrollTrigger: trigger })
    reveal('.multi-stop', { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, stagger: 0.15, delay: 0.5, ease: 'power2.out', scrollTrigger: trigger })
    reveal('.multi-btn', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 1.0, ease: 'power2.out', scrollTrigger: trigger })
  })

  /* CTA : la section s'ouvre depuis le centre, le fond se dézoome au scroll */
  useGsap(ctaRef, () => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: ctaRef.current, start: 'top 80%', once: true } })
    tl.fromTo(ctaRef.current, { clipPath: 'inset(0% 50% 0% 50% round 2rem)', transition: 'none' }, { clipPath: 'inset(0% 0% 0% 0% round 2rem)', duration: 1.2, ease: 'expo.out', clearProps: 'clipPath,transition' })
      .fromTo('.cta-text > h2, .cta-text > p', { y: 30, opacity: 0, transition: 'none' }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out', clearProps: 'all' }, '-=0.6')
      .fromTo('.cta-btn', { y: 20, opacity: 0, transition: 'none' }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', clearProps: 'all' }, '-=0.3')

    gsap.fromTo(
      '.cta-bg',
      { scale: 1.15 },
      { scale: 1, ease: 'none', scrollTrigger: { trigger: ctaRef.current, start: 'top bottom', end: 'bottom top', scrub: true } }
    )
  })

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
      <main className="w-full bg-[#D5E8E2] pb-16 md:pb-24 flex flex-col items-center">
        <Hero region={region} setRegion={setRegion} length={length} setLength={setLength} />

        {/* Résultats */}
        <section ref={resultsRef} id="results" className={`${W} mt-16 md:mt-24 scroll-mt-6`}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-8">
            <h2 className={`res-title ${H2}`}>{t('resultsTitle')}</h2>
            {status === 'ready' && (
              <p role="status" className="res-count text-sm md:text-base text-slate-700">{visible.length === 1 ? t('foundOne') : t('found', { count: visible.length })}</p>
            )}
          </div>

          {status !== 'ready' ? (
            <OffersStatus status={status} />
          ) : visible.length > 0 ? (
            <ul className="flex flex-col gap-5">{visible.map((item) => <Row key={item.id} item={item} />)}</ul>
          ) : (
            <div className="rounded-[2rem] bg-white p-10 text-center">
              <p className="text-lg text-slate-700">{t('empty')}</p>
              <button type="button" onClick={() => { setRegion('All regions'); setLength('any') }} className={`${BTN} bg-[#084838] hover:bg-[#0a5c47] text-white mt-5`}>{t('showAll')}</button>
            </div>
          )}
        </section>

        {/* Une journée type */}
        <section ref={dayRef} className={`${W} mt-16 md:mt-28 rounded-[2rem] md:rounded-[3rem] bg-[#084838] text-white p-6 sm:p-10 md:p-14`}>
          <h2 className="day-title text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight max-w-2xl">{t('dayTitle')}</h2>
          <ol className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-8">
            {t('steps').map((s, i) => (
              <li key={steps[i].title} className="day-step border-t border-white/25 pt-5">
                <span className="day-num inline-block text-[#C49849] text-lg font-semibold">{i + 1}</span>
                <h3 className="mt-2 text-xl font-medium">{s.title}</h3>
                <p className="mt-2 text-sm md:text-base text-white/75 leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Escapade de plusieurs jours */}
        <section ref={multiRef} className={`${W} mt-16 md:mt-28 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center`}>
          <div className="multi-frame relative aspect-[4/3] lg:aspect-[4/5] overflow-hidden rounded-[2rem] md:rounded-[3rem]">
            <img src={photo('exc.multi')} alt={t('multiAlt')} className="multi-img absolute inset-0 w-full h-full object-cover" />
            <span className="multi-badge absolute left-5 top-5 bg-[#C49849] text-white text-sm font-medium px-3 py-1.5 rounded-sm">{t('multiBadge')}</span>
          </div>
          <div className="multi-text">
            <h2 className={H2}>{t('multiTitle')}</h2>
            <p className="mt-4 text-base md:text-lg text-slate-700 leading-relaxed max-w-xl">{t('multiText')}</p>
            <ul className="mt-8 flex flex-col divide-y divide-slate-900/15 border-y border-slate-900/15">
              {t('stops').map((s, i) => (
                <li key={stops[i].day} className="multi-stop flex gap-6 py-4 text-base md:text-lg text-slate-800">
                  <span className="w-16 shrink-0 font-medium">{s.day}</span>
                  <span>{s.text}</span>
                </li>
              ))}
            </ul>
            <AddToTrip
              variant="gold"
              className="multi-btn mt-8"
              item={{ kind: 'excursion', ref: 'three-days-islands', title: t('multiTitle'), image: photo('exc.multi'), link: '/excursions', price: null, unit: null }}
            />
          </div>
        </section>

        {/* Appel à l'action */}
        <section ref={ctaRef} className={`${W} mt-16 md:mt-28 relative overflow-hidden rounded-[2rem] md:rounded-[3rem] text-white min-h-[380px] flex items-center`}>
          <img src={photo('exc.cta')} alt="" className="cta-bg absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-950/65" />
          <div className="cta-text relative p-8 md:p-16 max-w-3xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight">{t('ctaTitle')}</h2>
            <p className="mt-4 text-sm md:text-lg text-white/85">{t('ctaText')}</p>
            <A href="/contact" className={`cta-btn ${BTN} ${GOLD} text-white mt-8`}>{t('ctaButton')}</A>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default Excursions