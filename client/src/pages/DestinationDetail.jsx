import React, { useRef } from 'react'
import { useParams, A } from '../i18n/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import OffersStatus from '../components/OffersStatus'
import { useDestinations } from './destinationsData'
import { useT } from '../i18n/LanguageContext'
import { useScrollReveal } from '../utils/useScrollReveal'

const W = 'w-[90vw] lg:max-w-[95vw]'
const GOLD = 'bg-[#C49849] hover:bg-[#a9813a]'
const BTN = 'inline-flex items-center justify-center text-sm font-medium px-6 py-3 rounded-full active:scale-95 transition'
const H2 = 'text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight text-slate-900'

function NotFound() {
  const t = useT('destinations')
  return (
    <>
      <main className="w-full bg-[#D5E8E2] pb-24 flex flex-col items-center">
        <Navbar />
        <section className={`${W} mt-16 rounded-3xl bg-white p-10 text-center`}>
          <h1 className={H2}>{t('detail.soonTitle')}</h1>
          <p className="mt-4 text-slate-600">{t('detail.soonText')}</p>
          <div className="mt-6 flex justify-center gap-3">
            <A href="/destinations" className={`${BTN} bg-[#084838] hover:bg-[#0a5c47] text-white`}>{t('detail.all')}</A>
            <A href="/contact" className={`${BTN} ${GOLD} text-white`}>{t('detail.contact')}</A>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

// Chargement ou erreur de l'API : la barre du haut et un message
export function DestinationsStatus({ status }) {
  return (
    <>
      <main className="w-full min-h-[70vh] bg-[#D5E8E2] pb-24 flex flex-col items-center">
        <Navbar />
        <OffersStatus status={status} className={`${W} mt-16`} />
      </main>
      <Footer />
    </>
  )
}

function PlacesCarousel({ d }) {
  const ref = useRef(null)
  const t = useT('destinations')
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' })
  const arrow = 'w-11 h-11 rounded-full border border-slate-300 text-slate-800 hover:bg-[#084838] hover:text-white transition flex items-center justify-center text-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700'
  return (
    <section className={`${W} mt-16 md:mt-24 rounded-[2rem] md:rounded-[3rem] bg-white p-5 sm:p-8 md:p-14`}>
      <div className="flex items-end justify-between gap-4">
        <h2 className={H2}>{t('detail.placesTitle')}</h2>
        {d.visit.length > 1 && (
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={() => scroll(-1)} aria-label={t('detail.previous')} className={arrow}>‹</button>
            <button type="button" onClick={() => scroll(1)} aria-label={t('detail.next')} className={arrow}>›</button>
          </div>
        )}
      </div>
      <ul ref={ref} className="mt-10 flex gap-6 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {d.visit.map((v) => (
          <li key={v.slug} className="snap-start shrink-0 w-[82%] sm:w-[46%] lg:w-[31%]">
            <A href={`/destinations/${d.slug}/${v.slug}`} className="group block">
              <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem]">
                <img src={v.image} alt={v.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <h3 className="mt-4 text-xl md:text-2xl font-medium text-forest group-hover:underline">{v.name}</h3>
              <p className="mt-2 text-sm md:text-base text-slate-600 leading-relaxed">{v.text}</p>
              <span className="mt-3 inline-block text-sm font-medium text-[#a9813a]">{t('detail.readMore')}</span>
            </A>
          </li>
        ))}
      </ul>
    </section>
  )
}

function DestinationDetail() {
  const { slug } = useParams()
  const t = useT('destinations')
  const { destinations, status } = useDestinations()
  const d = destinations[slug]
  const root = useRef(null)
  useScrollReveal(root, [slug, status])
  if (status !== 'ready') return <DestinationsStatus status={status} />
  if (!d) return <NotFound />

  const facts = [
    { label: t('detail.region'), value: d.regionLabel },
    { label: t('detail.best'), value: d.best },
    { label: t('detail.stay'), value: d.stay },
  ]
  const nearby = Object.values(destinations).filter((x) => x.region === d.region && x.slug !== d.slug)

  return (
    <>
      <main ref={root} className="w-full bg-[#D5E8E2] pb-16 md:pb-24 flex flex-col items-center">
        <Navbar />

        {/* Hero */}
        <section className={`${W} relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-[#084838] text-white min-h-[520px] md:min-h-[78vh] flex items-end`}>
          <img src={d.image} alt={d.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-slate-950/10" />
          <div className="relative p-6 sm:p-10 md:p-16">
            <nav aria-label="Breadcrumb" className="text-sm md:text-base text-white/80">
              <A href="/" className="hover:underline">{t('detail.home')}</A> / <A href="/destinations" className="hover:underline">{t('detail.destinations')}</A> / {d.name}
            </nav>
            <h1 className="mt-4 text-6xl sm:text-7xl md:text-8xl xl:text-[112px] font-semibold leading-[0.95] tracking-tight">{d.name}</h1>
            <p className="mt-4 text-lg md:text-2xl text-white/90 max-w-2xl">{d.tagline}</p>
          </div>
        </section>

        {/* Faits rapides */}
        <ul className={`${W} -mt-8 md:-mt-10 relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-px overflow-hidden rounded-3xl bg-slate-200 shadow-sm`}>
          {facts.map((f) => (
            <li key={f.label} className="bg-white px-6 py-5 md:px-8 md:py-6">
              <p className="text-xs sm:text-sm text-slate-500">{f.label}</p>
              <p className="mt-1 text-lg md:text-xl font-medium text-slate-900">{f.value}</p>
            </li>
          ))}
        </ul>

        {/* Introduction */}
        <section className={`${W} mt-16 md:mt-24 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-20`}>
          <h2 className={H2}>{t('detail.discover', { name: d.name })}</h2>
          <div className="flex flex-col gap-4">
            {d.intro.map((p) => <p key={p} className="text-base md:text-lg text-slate-700 leading-relaxed">{p}</p>)}
          </div>
        </section>

        {/* À faire */}
        <section className={`${W} mt-16 md:mt-24`}>
          <h2 className={H2}>{t('detail.todo', { name: d.name })}</h2>
          <ul className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            {d.todo.map((item) => (
              <li key={item.title} className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] text-white">
                <img src={item.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="text-xl md:text-2xl font-medium">{item.title}</h3>
                  <p className="mt-2 text-sm text-white/80 leading-snug">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <PlacesCarousel d={d} />

        {/* Pratique */}
        <section className={`${W} mt-16 md:mt-24 rounded-[2rem] md:rounded-[3rem] bg-[#084838] text-white p-6 sm:p-10 md:p-14 grid grid-cols-1 md:grid-cols-2 gap-10`}>
          <div>
            <h3 className="text-xl md:text-2xl font-medium">{t('detail.getting')}</h3>
            <p className="mt-3 text-sm md:text-base text-white/75 leading-relaxed">{d.getting}</p>
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-medium">{t('detail.tip')}</h3>
            <p className="mt-3 text-sm md:text-base text-white/75 leading-relaxed">{d.tip}</p>
          </div>
        </section>

        {/* Autres lieux de la région */}
        {nearby.length > 0 && (
          <section className={`${W} mt-16 md:mt-24`}>
            <h2 className={H2}>{t('detail.nearby', { region: d.regionLabel })}</h2>
            <ul className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {nearby.map((n) => (
                <li key={n.slug}>
                  <A href={`/destinations/${n.slug}`} className="group relative block aspect-[3/4] overflow-hidden rounded-[1.5rem] text-white">
                    <img src={n.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 to-transparent" />
                    <p className="absolute inset-x-0 bottom-0 p-4 text-lg font-medium">{n.name}</p>
                  </A>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CTA */}
        <section className={`${W} mt-16 md:mt-24 rounded-[2rem] md:rounded-[3rem] bg-white p-8 md:p-14 flex flex-col md:flex-row md:items-center justify-between gap-6`}>
          <h2 className={`${H2} max-w-2xl`}>{t('detail.ctaTitle', { name: d.name })}</h2>
          <A href="/contact" className={`${BTN} ${GOLD} text-white self-start md:self-center`}>{t('detail.ctaButton')}</A>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default DestinationDetail