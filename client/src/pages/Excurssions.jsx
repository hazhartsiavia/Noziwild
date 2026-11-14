import React, { useState, useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Ramena from '../assets/images/site/ramena-beach-aerial.jpg'
import NosyIranja from '../assets/images/site/nosy-iranja-aerial.jpg'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { CARD, CARD_BADGE, CARD_BODY, CARD_FOOT, CARD_IMG, CARD_MEDIA, CARD_TEXT, CARD_TITLE, CardMeta } from '../components/Card'
import PageHero from '../components/PageHero'
import PageCta, { PAGE_CTA_GOLD, PAGE_CTA_GHOST } from '../components/PageCta'
import OffersStatus from '../components/OffersStatus'
import AddToTrip from '../components/AddToTrip'
import { useT } from '../i18n/LanguageContext'
import { useOffers } from '../utils/useOffers'
import { A } from '../i18n/router'
import Img from '../components/Img'

gsap.registerPlugin(ScrollTrigger)

const W = 'w-[90vw] max-w-[1360px]'
const GOLD = 'bg-[#A9813A] hover:bg-[#8C6A2C]'
const BTN = 'inline-flex items-center justify-center text-sm md:text-base font-medium px-6 py-3 rounded-full active:scale-95 transition'
const H2 = 'text-[clamp(2.6rem,5.4vw,5rem)] text-forest leading-[1] [text-wrap:balance]'
const SELECT = 'w-full h-12 rounded-full border border-slate-300 bg-white px-5 text-base text-slate-800 focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700'

/* ---------------------------- Données ---------------------------- */
/* Les excursions (textes, prix, photos, lieu, durée) sont en base : admin > Offers > Excursions.
   region sert au filtre ci-dessous.
   Autres textes de la page : locales/<langue>/excursions.json (steps : même ordre qu'ici) */

const regions = ['All regions', 'Nosy Be', 'Diego Suarez']

const steps = [
  { title: 'Hotel pick-up', text: 'Your driver and guide collect you in the morning.' },
  { title: 'Guided visit', text: 'Unhurried stops, with time for photos and questions.' },
  { title: 'Lunch with locals', text: 'A simple meal in a village or by the water.' },
  { title: 'Back by late afternoon', text: 'Dropped at your hotel in time to rest.' },
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

function Hero({ region, setRegion }) {
  const formRef = useRef(null)
  const t = useT('excursions')

  // Hero : l'image se dézoome, le titre « respire » (espacement des lettres + flou),
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
      <PageHero slot="exc.hero" alt={t('heroAlt')} title={t('title')} crumb={t('title')} text={t('intro')} />

      {/* Barre de recherche */}
      <form
        ref={formRef}
        onSubmit={(e) => { e.preventDefault(); document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }) }}
        className={`${W} relative z-10 mt-4 md:mt-5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end rounded-3xl bg-white p-5 md:p-7 shadow-lg`}
      >
        <div className="hero-field">
          <label htmlFor="region" className="block mb-2 text-sm md:text-base text-slate-700">{t('region')}</label>
          <select id="region" value={region} onChange={(e) => setRegion(e.target.value)} className={SELECT}>
            {regions.map((r) => <option key={r} value={r}>{t('regions')[r]}</option>)}
          </select>
        </div>
        <button type="submit" className={`hero-find ${BTN} ${GOLD} text-white h-12 md:px-8`}>{t('find')}</button>
      </form>
    </>
  )
}

function Row({ item }) {
  // Page de détail si l'admin en a indiqué une
  const href = item.link
  const Photo = href ? 'a' : 'div'
  const tripItem = { kind: 'excursion', ref: String(item.id), title: item.title, image: item.image, link: item.link || '/excursions', details: [item.duration, item.place].filter(Boolean).join(' · '), price: null, unit: 'person' }
  return (
    <li className={`excursion-row ${CARD}`}>
      <Photo href={href || undefined} className={`block ${CARD_MEDIA}`}>
        <Img src={item.image} alt={item.title} className={`row-img ${CARD_IMG}`} />
        <span className={`row-badge ${CARD_BADGE}`}>{item.duration || item.place}</span>
      </Photo>
      <div className={CARD_BODY}>
        <CardMeta items={[item.place, item.level, item.group]} />
        <h3 className={CARD_TITLE}>
          {href ? <A href={href} className="hover:underline">{item.title}</A> : item.title}
        </h3>
        <p className={CARD_TEXT}>{item.text}</p>
        <div className={`row-side ${CARD_FOOT}`}>
          <AddToTrip item={tripItem} />
        </div>
      </div>
    </li>
  )
}

function Excursions() {
  const t = useT('excursions')
  const { offers, status } = useOffers('excursion')
  const [region, setRegion] = useState('All regions')

  const resultsRef = useRef(null)
  const dayRef = useRef(null)

  const visible = offers.filter((e) => region === 'All regions' || e.region === region)

  /* Titre des résultats : glisse depuis la gauche, le compteur arrive de la droite */
  useGsap(resultsRef, () => {
    const trigger = { trigger: '.res-title', start: 'top 88%', once: true }
    reveal('.res-title', { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: trigger })
    reveal('.res-count', { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, delay: 0.15, ease: 'power3.out', scrollTrigger: trigger })
  })

  /* Lignes : chaque excursion se déplie en perspective (bascule vers l'avant),
     l'image se dézoome et le bouton arrive après. Rejoué à chaque filtre. */
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
  }, [region, offers])

  /* Journée type : chaque étape se « dessine » de gauche à droite (la ligne du haut en premier) */
  useGsap(dayRef, () => {
    const trigger = { trigger: dayRef.current, start: 'top 80%', once: true }
    reveal('.day-title', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: trigger })
    reveal('.day-step', { clipPath: 'inset(0% 100% 0% 0%)', opacity: 0 }, { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 1.1, stagger: 0.22, delay: 0.2, ease: 'power3.inOut', scrollTrigger: trigger })
    reveal('.day-num', { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, duration: 0.6, stagger: 0.22, delay: 0.6, ease: 'back.out(3)', scrollTrigger: trigger })
  })

  /* CTA : la section s'ouvre depuis le centre, le fond se dézoome au scroll */
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
      <main className="w-full overflow-x-clip bg-[#F4F1EA] flex flex-col items-center">
        <Hero region={region} setRegion={setRegion} />

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
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-9">{visible.map((item) => <Row key={item.id} item={item} />)}</ul>
          ) : (
            <div className="rounded-3xl bg-white p-10 text-center">
              <p className="text-lg text-slate-700">{t('empty')}</p>
              <button type="button" onClick={() => setRegion('All regions')} className={`${BTN} bg-[#0C3E2E] hover:bg-[#14523F] text-white mt-5`}>{t('showAll')}</button>
            </div>
          )}
        </section>

        {/* Une journée type */}
        <section ref={dayRef} className={`${W} mt-16 md:mt-28 rounded-3xl bg-[#0C3E2E] text-white p-6 sm:p-10 md:p-14`}>
          <h2 className="day-title text-[clamp(2.6rem,5.4vw,5rem)] leading-[1] [text-wrap:balance] max-w-2xl">{t('dayTitle')}</h2>
          <ol className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-8">
            {t('steps').map((s, i) => (
              <li key={steps[i].title} className="day-step border-t border-white/25 pt-5">
                <span className="day-num inline-block text-[#A9813A] text-lg font-semibold">{i + 1}</span>
                <h3 className="mt-2 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm md:text-base text-white/75 leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Appel à l'action */}
        <PageCta slot="exc.cta" title={t('ctaTitle')} text={t('ctaText')}>
          <A href="/contact" className={PAGE_CTA_GOLD}>{t('ctaButton')}</A>
        </PageCta>
      </main>
      <Footer />
    </>
  )
}

export default Excursions