import React, { useLayoutEffect, useRef, useState } from 'react'
import p_nosy_iranja_sandbar from '../assets/images/site/nosy-iranja-sandbar.jpg'
import p_crowned_sifaka from '../assets/images/site/crowned-sifaka.jpg'
import p_red_tsingy_hikers from '../assets/images/site/red-tsingy-hikers.jpg'
import p_snorkelling from '../assets/images/site/snorkelling.jpg'
import p_amber_mountain_waterfall from '../assets/images/site/amber-mountain-waterfall.jpg'
import p_nosy_komba_craft_market from '../assets/images/site/nosy-komba-craft-market.jpg'
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero'
import PageCta, { PAGE_CTA_GOLD, PAGE_CTA_GHOST } from '../components/PageCta'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import OffersStatus from '../components/OffersStatus'
import AddToTrip from '../components/AddToTrip'
import { useLanguage, useT } from '../i18n/LanguageContext'
import { monthName } from '../utils/format'
import { useOffers } from '../utils/useOffers'
import { A } from '../i18n/router'
import './activities.css'

gsap.registerPlugin(ScrollTrigger)

/* Constantes partagées : mêmes valeurs que dans les autres pages */
const SECTION_WIDTH = "w-[90vw] lg:max-w-[90vw] xl:max-w-[95vw]"
const SECTION_TITLE = "text-[clamp(2rem,4.4vw,4rem)] font-bold text-forest leading-[1.08] tracking-tight"
const SECTION_SUBTITLE = "text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl"
const META_TEXT = "text-xs sm:text-sm"
const BADGE = "inline-block bg-[#C49849] text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm"
const BUTTON = "text-sm font-medium px-5 py-2.5 rounded-full md:px-6 md:py-3 active:scale-95 transition"
const SECTION_GAP = "mt-[60px] md:mt-[120px]"

/* ---------------------------- Données ---------------------------- */
// Les activités (textes, prix, photos, meilleure période) sont en base : admin > Offers > Activities.
// Autres textes de la page : locales/<langue>/activities.json

const moments = [p_nosy_iranja_sandbar, p_crowned_sifaka, p_red_tsingy_hikers, p_snorkelling, p_amber_mountain_waterfall, p_nosy_komba_craft_market]

/* ---------------------------- Icônes ----------------------------- */

const Svg = ({ children, className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

/* -------------------------- Composants --------------------------- */

// Toutes les activités (admin > Offers > Activities), d'après le modèle Funway : cartes blanches façon
// polaroïd (photo carrée, nom centré), 4 colonnes alignées, affichées tout de suite à leur place (activities.css)
function ActivityGrid({ list, status }) {
  const t = useT('activities')
  return (
    <div id="activities" className="nzac mt-6 md:mt-10 scroll-mt-8">
      <h2 className="sr-only">{t('heading')}</h2>
      <OffersStatus status={status} empty={list.length === 0} />
      <ul className="nzac__grid">
        {list.map((a) => (
          <li key={a.id} className="nzac__item">
            <article className="nzac__card">
              <div className="nzac__photo">
                <img src={a.image} alt="" loading="lazy" />
                <AddToTrip
                  variant="icon"
                  className="nzac__add"
                  item={{ kind: 'activity', ref: String(a.id), title: a.title, image: a.image, link: '/activities', details: [a.duration, a.level].filter(Boolean).join(' · '), price: a.price, unit: 'person' }}
                />
              </div>
              <h3 className="nzac__name">{a.title}</h3>
            </article>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Meilleure période : tableau visuel activité x mois
function BestTime({ list }) {
  const t = useT('activities')
  const { lang } = useLanguage()
  const levels = t('levels')
  const cell = ['bg-[#074636]/10', 'bg-[#C49849]/40', 'bg-[#C49849]']
  return (
    <div className={SECTION_GAP}>
      <div className="mb-8 md:mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-12">
        <h2 className={`${SECTION_TITLE} lg:max-w-[52%]`}>{t('bestTitle')}</h2>
        <p className={`${SECTION_SUBTITLE} lg:max-w-md`}>{t('bestText')}</p>
      </div>

      <div className="overflow-x-auto rounded-3xl bg-white p-4 md:p-8">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[200px_repeat(12,1fr)] md:grid-cols-[260px_repeat(12,1fr)] gap-1.5 md:gap-2 items-center">
            <span />
            {Array.from({ length: 12 }, (_, i) => <span key={i} className={`text-center ${META_TEXT} text-slate-600`}>{monthName(i + 1, lang, 'narrow')}</span>)}

            {list.map((row) => (
              <React.Fragment key={row.id}>
                <span className="pr-3 text-sm md:text-base font-medium text-slate-800">{row.title}</span>
                {row.months.map((v, i) => (
                  <span key={i} className={`h-8 md:h-10 rounded-md ${cell[v]}`} title={levels[v]} />
                ))}
              </React.Fragment>
            ))}
          </div>

          <ul className={`mt-6 flex flex-wrap gap-x-6 gap-y-2 ${META_TEXT} text-slate-600`}>
            {levels.map((label, v) => (
              <li key={label} className="flex items-center gap-2"><span className={`w-4 h-4 rounded ${cell[v]}`} />{label}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// Bande de photos qui défile toute seule (GSAP), pause au survol
function Moments() {
  const t = useT('activities')
  const trackRef = useRef(null)
  const tweenRef = useRef(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      tweenRef.current = gsap.to(trackRef.current, { xPercent: -50, duration: 45, ease: 'none', repeat: -1 })
    }, trackRef)
    return () => ctx.revert()
  }, [])

  const items = [...moments, ...moments]

  return (
    <div className={SECTION_GAP}>
      <h2 className={`${SECTION_TITLE} text-center mb-8 md:mb-12`}>{t('momentsTitle')}</h2>
      <div
        className="overflow-x-auto motion-safe:overflow-hidden rounded-3xl"
        onMouseEnter={() => tweenRef.current?.pause()}
        onMouseLeave={() => tweenRef.current?.resume()}
      >
        <div ref={trackRef} className="flex w-max">
          {items.map((src, i) => (
            <div key={i} className="shrink-0 mr-4 w-[240px] md:w-[340px] aspect-[4/3] overflow-hidden rounded-2xl">
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// FAQ : questions en cartes blanches à gauche, titre à droite
function Faq() {
  const t = useT('activities')
  const [open, setOpen] = useState(0)

  return (
    <div className={`${SECTION_GAP} grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8 lg:gap-16`}>
      <div className="lg:order-2">
        <h2 className={SECTION_TITLE}>{t('faqTitle')}</h2>
        <p className={`mt-4 md:mt-6 ${SECTION_SUBTITLE}`}>{t('faqText')}</p>
      </div>

      <div className="flex flex-col gap-3 lg:order-1">
        {t('faqs').map((f, i) => {
          const isOpen = open === i
          return (
            <div key={f.q} className="rounded-2xl bg-white">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 text-left p-5 md:p-6"
              >
                <span className="text-base md:text-xl font-medium text-slate-900">{f.q}</span>
                <Svg className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                  <path d="M12 5v14M5 12h14" />
                </Svg>
              </button>
              {isOpen && <p className="px-5 md:px-6 pb-5 md:pb-6 -mt-1 text-sm md:text-base leading-relaxed text-slate-600">{f.a}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// CTA : carte verte avec texte et photos empilées
function Activities() {
  const t = useT('activities')
  const contentRef = useRef(null)
  const { offers: list, status } = useOffers('activity')

  useLayoutEffect(() => {
    // Pas d'animation si l'utilisateur a demandé moins de mouvement
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      // Chaque section apparaît en remontant quand elle entre dans l'écran
      // (sauf la grille des activités : ses cartes s'affichent tout de suite à leur place)
      Array.from(contentRef.current.children).filter((el) => el.id !== 'activities').forEach((el) => {
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
    <section className="w-full overflow-x-clip bg-[#D5E8E2] flex flex-col items-center">
      <Navbar />
      <PageHero slot="act.banner" title={t('title')} crumb={t('eyebrow')} text={t('intro')} moreHref="#activities" moreLabel={t('seeAll')} />
      <div ref={contentRef} className={SECTION_WIDTH}>
        <ActivityGrid list={list} status={status} />
        {list.length > 0 && <BestTime list={list} />}
        <Moments />
        <Faq />
      </div>
      <PageCta slot="act.banner" title={t('ctaTitle')} text={t('ctaText')} floats={['act.photo.1', 'act.photo.2', 'act.photo.3']}>
        <A href="/contact" className={PAGE_CTA_GOLD}>{t('ctaButton')}</A>
        <A href="tel:+33698893064" className={PAGE_CTA_GHOST}>+33 6 98 89 30 64</A>
      </PageCta>
    </section>
    <Footer />
    </>
  )
}

export default Activities