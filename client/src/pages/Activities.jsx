import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import p_nosy_iranja_sandbar from '../assets/images/site/nosy-iranja-sandbar.jpg'
import p_crowned_sifaka from '../assets/images/site/crowned-sifaka.jpg'
import p_red_tsingy_hikers from '../assets/images/site/red-tsingy-hikers.jpg'
import p_snorkelling from '../assets/images/site/snorkelling.jpg'
import p_amber_mountain_waterfall from '../assets/images/site/amber-mountain-waterfall.jpg'
import p_nosy_komba_craft_market from '../assets/images/site/nosy-komba-craft-market.jpg'
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CARD, CARD_BADGE, CARD_BODY, CARD_FOOT, CARD_IMG, CARD_MEDIA, CARD_TEXT, CARD_TITLE, CardMeta } from '../components/Card'
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
import Img from '../components/Img'

gsap.registerPlugin(ScrollTrigger)

/* Constantes partagées : mêmes valeurs que dans les autres pages */
const SECTION_WIDTH = "w-[90vw] max-w-[1360px]"
const SECTION_TITLE = 'text-[clamp(2.6rem,5.4vw,5rem)] text-forest leading-[1] [text-wrap:balance]'
const SECTION_SUBTITLE = "text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl"
const META_TEXT = "text-xs sm:text-sm"
const BADGE = "inline-block bg-[#F4F1EA] text-forest text-[11px] font-semibold uppercase tracking-[0.14em] px-3 py-1.5 rounded-sm"
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
const ArrowIcon = () => <Svg className="w-5 h-5"><path d="M5 12h14M13 6l6 6-6 6" /></Svg>

/* -------------------------- Composants --------------------------- */

function ActivityCarousel({ list, status }) {
  const t = useT('activities')
  const trackRef = useRef(null)
  const [pos, setPos] = useState({ progress: 0, start: true, end: false })

  const update = () => {
    const el = trackRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setPos({ progress: max > 0 ? el.scrollLeft / max : 0, start: el.scrollLeft <= 4, end: el.scrollLeft >= max - 4 })
  }

  // Recalculé quand les activités arrivent de l'API
  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [list.length])

  const scrollByCard = (dir) => {
    const el = trackRef.current
    const card = el?.firstElementChild
    if (!card) return
    el.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: 'smooth' })
  }

  const arrowClass =
    "w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-[#0C3E2E] text-[#0C3E2E] transition " +
    "hover:bg-[#0C3E2E]/10 active:bg-[#0C3E2E]/20 disabled:opacity-30 disabled:pointer-events-none " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0C3E2E]"

  return (
    <div id="activities" className={`${SECTION_GAP} scroll-mt-8`}>
      <div className="mb-8 md:mb-12 flex items-end justify-between gap-6">
        <div>
          <p className="mb-3 text-xs sm:text-sm md:text-base uppercase tracking-wide text-slate-700">{t('eyebrow')}</p>
          <h2 className={SECTION_TITLE}>{t('heading')}</h2>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <button type="button" onClick={() => scrollByCard(-1)} disabled={pos.start} aria-label={t('previous')} className={arrowClass}>
            <span className="rotate-180"><ArrowIcon /></span>
          </button>
          <button type="button" onClick={() => scrollByCard(1)} disabled={pos.end} aria-label={t('next')} className={arrowClass}>
            <ArrowIcon />
          </button>
        </div>
      </div>

      <OffersStatus status={status} empty={list.length === 0} />
      <div
        ref={trackRef}
        onScroll={update}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {list.map((a) => (
          <article key={a.id} className={`${CARD} snap-start shrink-0 w-[82%] sm:w-[46%] lg:w-[31.5%] xl:w-[24%]`}>
            <div className={CARD_MEDIA}>
              <Img src={a.image} alt={a.title} className={CARD_IMG} />
              <span className={CARD_BADGE}>{a.type}</span>
            </div>
            <div className={CARD_BODY}>
              <CardMeta items={[a.duration, a.level, a.group]} />
              <h3 className={CARD_TITLE}>{a.title}</h3>
              <p className={CARD_TEXT}>{a.text}</p>
              <div className={`${CARD_FOOT} justify-end`}>
                <AddToTrip
                  variant="icon"
                  item={{ kind: 'activity', ref: String(a.id), title: a.title, image: a.image, link: '/activities', details: [a.duration, a.level].filter(Boolean).join(' · '), price: a.price, unit: 'person' }}
                />
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Barre de progression */}
      <div className="mt-6 h-1.5 rounded-full bg-[#0C3E2E]/20 overflow-hidden" aria-hidden="true">
        <div className="h-full rounded-full bg-[#0C3E2E] transition-all duration-300" style={{ width: `${25 + pos.progress * 75}%` }} />
      </div>
    </div>
  )
}

// Meilleure période : tableau visuel activité x mois
function BestTime({ list }) {
  const t = useT('activities')
  const { lang } = useLanguage()
  const levels = t('levels')
  const cell = ['bg-[#0C3E2E]/10', 'bg-[#A9813A]/40', 'bg-[#A9813A]']
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
              <Img src={src} alt="" className="w-full h-full object-cover" />
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
      Array.from(contentRef.current.children).forEach((el) => {
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

  // Les cartes du carrousel arrivent l'une après l'autre, une fois chargées depuis l'API
  useLayoutEffect(() => {
    if (status !== 'ready' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const ctx = gsap.context(() => {
      gsap.from('#activities a', {
        y: 40, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: '#activities', start: 'top 80%', once: true },
      })
    }, contentRef)
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [status])

  return (
    <>
    <section className="w-full overflow-x-clip bg-[#F4F1EA] flex flex-col items-center">
      <Navbar />
      <PageHero slot="act.banner" title={t('title')} crumb={t('eyebrow')} text={t('intro')} moreHref="#activities" moreLabel={t('seeAll')} />
      <div ref={contentRef} className={SECTION_WIDTH}>
        <ActivityCarousel list={list} status={status} />
        {list.length > 0 && <BestTime list={list} />}
        <Moments />
        <Faq />
      </div>
      <PageCta slot="act.banner" title={t('ctaTitle')} text={t('ctaText')} floats={['act.photo.1', 'act.photo.2', 'act.photo.3']}>
        <A href="/contact" className={PAGE_CTA_GOLD}>{t('ctaButton')}</A>
        <A href="tel:+261340000000" className={PAGE_CTA_GHOST}>+261 34 00 000 00</A>
      </PageCta>
    </section>
    <Footer />
    </>
  )
}

export default Activities