import React, { useRef, useState } from 'react'
import Ramena from '../assets/images/site/ramena-beach-aerial.jpg'
import NosyIranja from '../assets/images/site/nosy-iranja-aerial.jpg'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { CARD, CARD_BADGE, CARD_BODY, CARD_FOOT, CARD_IMG, CARD_MEDIA, CARD_TEXT, CARD_TITLE } from '../components/Card'
import PageHero from '../components/PageHero'
import PageCta, { PAGE_CTA_GOLD, PAGE_CTA_GHOST } from '../components/PageCta'
import OffersStatus from '../components/OffersStatus'
import AddToTrip from '../components/AddToTrip'
import { useT } from '../i18n/LanguageContext'
import { useOffers } from '../utils/useOffers'
import { useScrollReveal } from '../utils/useScrollReveal'
import { usePhoto } from '../sitePhotos'
import { A } from '../i18n/router'
import Img from '../components/Img'

const W = 'w-[90vw] max-w-[1360px]'
const GOLD = 'bg-[#A9813A] hover:bg-[#8C6A2C]'
const BTN = 'inline-flex items-center justify-center text-sm md:text-base font-medium px-6 py-3 rounded-full active:scale-95 transition'
const H2 = 'text-[clamp(2.6rem,5.4vw,5rem)] text-forest leading-[1] [text-wrap:balance]'

/* ---------------------------- Données ---------------------------- */
/* Les excursions (textes, prix, photos, port, durée) sont en base : admin > Offers > Cruise excursions.
   hours = durée totale, transferts depuis et vers le quai compris ; port = id d'un des ports ci-dessous.
   Autres textes de la page : locales/<langue>/cruise.json (listes dans le même ordre qu'ici) */

const ports = [
  { id: 'nosybe', name: 'Nosy Be', sub: 'Port of Hell-Ville', text: 'Islands, lemur forest and ylang-ylang country.', image: NosyIranja },
  { id: 'diego', name: 'Diego Suarez', sub: 'Antsiranana', text: 'A vast bay, red rock formations and mountain rainforest.', image: Ramena },
]


const timeline = [
  { time: '08:00', text: 'Ship arrives in port' },
  { time: '08:30', text: 'Meet your guide at the pier' },
  { time: '09:00', text: 'Excursion begins' },
  { time: '14:00', text: 'Back at the pier' },
  { time: '16:30', text: 'All aboard' },
]


const fmt = (h) => (Number.isInteger(h) ? `${h} h` : `${Math.floor(h)} h 30`)

/* -------------------------- Composants --------------------------- */

function ExcursionCard({ item, ashore }) {
  const t = useT('cruise')
  const fits = item.hours <= ashore
  const spare = Math.round((ashore - item.hours) * 60)
  const pct = Math.min(100, (item.hours / ashore) * 100)
  return (
    <li className={`${CARD} transition ${fits ? '' : 'opacity-55'}`}>
      <div className={CARD_MEDIA}>
        <Img src={item.image} alt={item.title} className={CARD_IMG} />
        <span className={CARD_BADGE}>{t('tags')[item.tag]}</span>
        <span className="absolute right-3 top-3 bg-white/90 text-slate-900 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full">{fmt(item.hours)}</span>
      </div>
      <div className={CARD_BODY}>
        <h3 className={CARD_TITLE.replace('mt-4 ', '')}>{item.title}</h3>
        <p className={CARD_TEXT}>{item.text}</p>

        <div className="mt-5" aria-hidden="true">
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden"><div className="h-full rounded-full bg-[#A9813A]" style={{ width: `${pct}%` }} /></div>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-slate-600">
          {fits ? t('spare', { minutes: spare }) : t('tooLong')}
        </p>

        <div className={CARD_FOOT}>
          <AddToTrip item={{ kind: 'cruise', ref: String(item.id), title: item.title, image: item.image, link: '/cruise-excursions', details: fmt(item.hours), price: null, unit: 'person' }} />
        </div>
      </div>
    </li>
  )
}

function CruiseExcursions() {
  const photo = usePhoto()
  const t = useT('cruise')
  const { offers, status } = useOffers('cruise')
  const root = useRef(null)
  useScrollReveal(root, [status])
  const [port, setPort] = useState('nosybe')
  const [ashore, setAshore] = useState(6)

  const list = offers
    .filter((e) => e.port === port)
    .sort((a, b) => (a.hours <= ashore ? 0 : 1) - (b.hours <= ashore ? 0 : 1) || a.hours - b.hours)
  const fitting = list.filter((e) => e.hours <= ashore).length

  return (
    <>
      <main ref={root} className="w-full overflow-x-clip bg-[#F4F1EA] flex flex-col items-center">
        <Navbar />
        <PageHero slot="cruise.hero" alt={t('heroAlt')} title={t('title')} crumb={t('eyebrow')} text={t('intro')} moreHref="#plan" moreLabel={t('planButton')} />

        {/* Planificateur */}
        <section id="plan" className={`${W} mt-16 md:mt-28 scroll-mt-6`}>
          <h2 className={H2}>{t('planTitle')}</h2>
          <p className="mt-3 text-base md:text-lg text-slate-700 max-w-2xl">{t('planText')}</p>

          <ul className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            {ports.map((port, i) => ({ ...port, ...t('ports')[i] })).map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setPort(p.id)}
                  aria-pressed={port === p.id}
                  className={`group relative block w-full aspect-[16/9] md:aspect-[2/1] overflow-hidden rounded-3xl text-left text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0C3E2E] ${port === p.id ? 'ring-4 ring-[#A9813A]' : ''}`}
                >
                  <Img src={photo(`cruise.port.${p.id}`)} alt="" className="absolute inset-0 w-full h-full object-cover img-zoom" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#072a1f]/85 via-[#072a1f]/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                    <p className="text-sm text-white/80">{p.sub}</p>
                    <h3 className="text-3xl md:text-4xl font-semibold">{p.name}</h3>
                    <p className="mt-1 text-sm md:text-base text-white/85">{p.text}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-3xl bg-white p-6 md:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <label htmlFor="ashore" className="text-base md:text-xl font-medium text-slate-900">{t('ashore')}</label>
              <p className="text-3xl md:text-4xl font-semibold text-slate-900" aria-live="polite">{fmt(ashore)}</p>
            </div>
            <input
              id="ashore" type="range" min="3" max="10" step="0.5" value={ashore}
              onChange={(e) => setAshore(Number(e.target.value))}
              className="mt-5 w-full accent-[#A9813A]"
            />
            <div className="flex justify-between text-xs md:text-sm text-slate-500"><span>3 h</span><span>10 h</span></div>
            <p className="mt-3 text-sm text-slate-600">{t('ashoreHint')}</p>
          </div>

          {status === 'ready' ? (
            <>
              <p role="status" className="mt-8 mb-5 text-sm md:text-base text-slate-700">{t('fit', { fit: fitting, total: list.length, port: ports.find((p) => p.id === port).name })}</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-7">
                {list.map((item) => <ExcursionCard key={item.id} item={item} ashore={ashore} />)}
              </ul>
            </>
          ) : (
            <OffersStatus status={status} className="mt-8" />
          )}
        </section>

        {/* Engagements */}
        <section className={`${W} mt-16 md:mt-28 rounded-3xl bg-[#0C3E2E] text-white p-6 sm:p-10 md:p-14`}>
          <h2 className="text-[clamp(2.6rem,5.4vw,5rem)] leading-[1] [text-wrap:balance] max-w-2xl">{t('promisesTitle')}</h2>
          <ul className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {t('promises').map((p) => (
              <li key={p.title} className="border-t border-white/25 pt-5">
                <h3 className="text-xl md:text-2xl font-bold">{p.title}</h3>
                <p className="mt-2 text-sm md:text-base text-white/75 leading-relaxed">{p.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Chronologie d'une escale */}
        <section className={`${W} mt-16 md:mt-28`}>
          <h2 className={H2}>{t('timelineTitle')}</h2>
          <p className="mt-3 text-sm md:text-base text-slate-600">{t('timelineText')}</p>
          <ol className="mt-10 grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-0 relative">
            <span aria-hidden="true" className="hidden md:block absolute left-0 right-0 top-[9px] h-px bg-slate-900/25" />
            {timeline.map((step, i) => (
              <li key={step.time} className="relative md:pr-6">
                <span className="block w-[18px] h-[18px] rounded-full bg-[#A9813A] border-4 border-[#F4F1EA] relative" />
                <p className="mt-4 text-2xl md:text-3xl font-semibold text-slate-900">{step.time}</p>
                <p className="mt-1 text-sm md:text-base text-slate-700">{t('timeline')[i]}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Questions */}
        <section className={`${W} mt-16 md:mt-28 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8 lg:gap-16`}>
          <h2 className={H2}>{t('faqTitle')}</h2>
          <div className="rounded-3xl bg-white px-6 md:px-10">
            {t('faqs').map((f) => (
              <details key={f.q} className="group border-b border-slate-200 last:border-b-0 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base md:text-xl text-slate-800">
                  {f.q}
                  <span aria-hidden="true" className="shrink-0 w-8 h-8 rounded-full bg-[#A9813A] text-white flex items-center justify-center group-open:rotate-45 transition">+</span>
                </summary>
                <p className="mt-3 pr-12 text-sm md:text-base text-slate-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Groupe */}
        <PageCta slot="cruise.cta" title={t('groupTitle')} text={t('groupText')}>
          <A href="/contact?type=cruise-group" className={PAGE_CTA_GOLD}>{t('groupButton')}</A>
        </PageCta>
      </main>
      <Footer />
    </>
  )
}

export default CruiseExcursions