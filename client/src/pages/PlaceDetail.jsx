import React, { useRef, useState } from 'react'
import { useParams, A } from '../i18n/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useDestinations } from './destinationsData'
import { DestinationsStatus } from './DestinationDetail'
import { Trans, useLanguage, useT } from '../i18n/LanguageContext'
import { formatPrice } from '../utils/format'
import { sendRequest } from '../api'
import { useAuth } from '../context/AuthContext'
import { BookingAdd, useTripItem } from '../components/AddToTrip'
import { useScrollReveal } from '../utils/useScrollReveal'

const W = 'w-[90vw] lg:max-w-[95vw]'
const GOLD = 'bg-[#C49849] hover:bg-[#a9813a]'
const BTN = 'inline-flex items-center justify-center text-sm md:text-base font-medium px-6 py-3 rounded-full active:scale-95 transition'
const H2 = 'text-2xl md:text-4xl font-medium leading-tight tracking-tight text-slate-900'
const FIELD = 'w-full h-12 rounded-full border border-slate-300 bg-white px-5 text-base text-slate-800 focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700'

const ICONS = {
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6" /></>,
  box: <><path d="M12 3 3 7.5v9L12 21l9-4.5v-9z" /><path d="m3 7.5 9 4.5 9-4.5M12 12v9" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
}
const Icon = ({ name, className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[name]}</svg>
)

function BookingCard({ place, dest }) {
  // Connecté : nom et email pré-remplis (la clé recrée le champ quand la session est connue)
  const { user } = useAuth()
  const t = useT('destinations')
  const { lang } = useLanguage()
  const [tab, setTab] = useState('booking')
  const tripItem = {
    kind: 'place',
    ref: `${dest.slug}/${place.slug}`,
    title: place.name,
    image: place.image,
    link: `/destinations/${dest.slug}/${place.slug}`,
    details: dest.name,
    price: place.price || null,
    unit: place.price ? 'person' : null,
  }
  // Déjà dans la sélection « Mon voyage » : on reprend ses réglages, et chaque changement la met à jour
  const { saved, sync } = useTripItem(tripItem)
  const [guests, setGuestsState] = useState(saved?.qty || 1)
  const [date, setDateState] = useState(saved?.date || '')
  const setGuests = (qty) => { setGuestsState(qty); sync({ qty }) }
  const setDate = (value) => { setDateState(value); sync({ date: value }) }
  const [sent, setSent] = useState(false)
  const total = place.price ? place.price * guests : null
  const tabCls = (name) => `flex-1 rounded-full py-3 text-sm md:text-base font-medium transition ${tab === name ? 'bg-[#084838] text-white' : 'text-slate-700 hover:bg-slate-100'}`

  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const submitInquiry = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const { name, email, message } = Object.fromEntries(new FormData(form))

    setSending(true)
    setError('')
    try {
      await sendRequest('place', { name, email, message, subject: place.name })
      setSent(true)
      form.reset()
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <aside className="rounded-3xl bg-white p-6 md:p-8 lg:sticky lg:top-6 self-start shadow-sm">
      <p className="text-lg text-slate-800">{t('place.price')}</p>
      <p className="mt-2 text-slate-600">
        {place.price
          ? <Trans text={t('place.fromPerPerson')} values={{ price: <span className="text-3xl md:text-4xl font-semibold text-slate-900">{formatPrice(place.price, lang)}</span> }} />
          : <span className="text-2xl font-semibold text-slate-900">{t('place.onRequest')}</span>}
      </p>

      <div className="mt-6 flex gap-1 rounded-full border border-slate-200 p-1" role="tablist">
        <button role="tab" aria-selected={tab === 'booking'} onClick={() => setTab('booking')} className={tabCls('booking')}>{t('place.booking')}</button>
        <button role="tab" aria-selected={tab === 'inquiry'} onClick={() => { setTab('inquiry'); setSent(false) }} className={tabCls('inquiry')}>{t('place.inquiry')}</button>
      </div>

      {tab === 'booking' ? (
        <div className="mt-6 flex flex-col gap-5">
          <div>
            <label htmlFor="date" className="block mb-2 text-sm md:text-base text-slate-700">{t('place.date')}</label>
            <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={FIELD} />
          </div>
          <div>
            <p className="mb-2 text-sm md:text-base text-slate-700">{t('place.guests')}</p>
            <div className="flex items-center justify-between rounded-full bg-[#D5E8E2] px-2 py-2">
              <button type="button" aria-label={t('place.fewer')} onClick={() => setGuests(Math.max(1, guests - 1))} className="w-10 h-10 rounded-full bg-white text-xl text-slate-800 hover:bg-slate-100">−</button>
              <span className="text-lg font-medium text-slate-900" aria-live="polite">{guests}</span>
              <button type="button" aria-label={t('place.more')} onClick={() => setGuests(Math.min(20, guests + 1))} className="w-10 h-10 rounded-full bg-white text-xl text-slate-800 hover:bg-slate-100">+</button>
            </div>
          </div>
          {total && (
            <p className="flex justify-between text-base text-slate-700">
              <span>{t('place.total')}</span><span className="font-semibold text-slate-900">{formatPrice(total, lang)}</span>
            </p>
          )}
          <BookingAdd item={{ ...tripItem, qty: guests, date }} />
          <p className="text-xs text-slate-500 text-center">{t('place.noPayment')}</p>
        </div>
      ) : (
        <form onSubmit={submitInquiry} className="mt-6 flex flex-col gap-4">
          <input name="name" key={`n-${user?.id}`} defaultValue={user?.name} required placeholder={t('place.name')} aria-label={t('place.name')} className={FIELD} />
          <input name="email" key={`e-${user?.id}`} defaultValue={user?.email} type="email" required placeholder={t('place.email')} aria-label={t('place.email')} className={FIELD} />
          <textarea name="message" rows={4} required placeholder={t('place.questions')} aria-label={t('place.questions')} className="w-full rounded-3xl border border-slate-300 px-5 py-3 text-base focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700" />
          <button type="submit" disabled={sending} className={`${BTN} ${GOLD} text-white w-full disabled:opacity-60 disabled:cursor-wait`}>{sending ? t('place.sending') : t('place.send')}</button>
          {sent && <p role="status" className="text-sm text-emerald-700">{t('place.thanks')}</p>}
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        </form>
      )}
    </aside>
  )
}

function PlaceDetail() {
  const { slug, placeSlug } = useParams()
  const t = useT('destinations')
  const { destinations, status } = useDestinations()
  const d = destinations[slug]
  const place = d?.visit.find((v) => v.slug === placeSlug)
  const root = useRef(null)
  useScrollReveal(root, [slug, placeSlug, status])

  if (status !== 'ready') return <DestinationsStatus status={status} />
  if (!place) {
    return (
      <>
        <main className="w-full bg-[#D5E8E2] pb-24 flex flex-col items-center">
          <Navbar />
          <section className={`${W} mt-16 rounded-3xl bg-white p-10 text-center`}>
            <h1 className={H2}>{t('place.notFound')}</h1>
            <A href="/destinations" className={`${BTN} bg-[#084838] hover:bg-[#0a5c47] text-white mt-6`}>{t('place.all')}</A>
          </section>
        </main>
        <Footer />
      </>
    )
  }

  const others = d.visit.filter((v) => v.slug !== place.slug)
  const gallery = [...new Set([place.image, d.image, ...others.map((o) => o.image)])].slice(0, 3)
  const overview = place.overview || place.details || [place.text]
  const meta = [
    { icon: 'clock', label: t('place.duration'), value: place.duration || d.stay },
    { icon: 'users', label: t('place.groupSize'), value: place.groupSize || t('place.smallGroups') },
    { icon: 'box', label: t('place.type'), value: place.tourType || t('place.guidedVisit') },
    { icon: 'globe', label: t('place.languages'), value: place.language || t('place.languagesValue') },
  ]

  return (
    <>
      <main ref={root} className="w-full bg-[#D5E8E2] pb-16 md:pb-24 flex flex-col items-center">
        <Navbar />

        {/* En-tête */}
        <section className={`${W} mt-6`}>
          <nav aria-label="Breadcrumb" className="text-sm md:text-base text-slate-700">
            <A href="/" className="hover:underline">{t('place.home')}</A> / <A href="/destinations" className="hover:underline">{t('place.destinations')}</A> / <A href={`/destinations/${d.slug}`} className="hover:underline">{d.name}</A> / {place.name}
          </nav>
          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-semibold leading-[1.05] tracking-tight text-forest max-w-5xl">{place.name}</h1>
          <p className="mt-3 text-lg md:text-2xl text-slate-700 max-w-3xl">{place.text}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm md:text-base text-slate-700">
            {place.rating && (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#F5B800] fill-current" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                {t('place.reviews', { rating: place.rating, count: place.reviews })}
              </span>
            )}
            <span className="flex items-center gap-2"><Icon name="pin" className="w-5 h-5" />{t('place.location', { place: d.name, region: d.regionLabel })}</span>
          </div>

          {/* Galerie */}
          <div className={`mt-8 grid grid-cols-1 gap-4 md:gap-6 ${gallery.length === 3 ? 'md:grid-cols-[1fr_1.5fr_1fr]' : 'md:grid-cols-2'}`}>
            {gallery.map((src, i) => (
              <img key={i} src={src} alt={i === 0 ? place.name : ''} className="w-full h-64 md:h-[440px] object-cover rounded-[1.5rem] md:rounded-[2rem]" />
            ))}
          </div>
        </section>

        {/* Contenu + réservation */}
        <section className={`${W} mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-10 lg:gap-16 items-start`}>
          <div>
            <h2 className={H2}>{t('place.overview')}</h2>
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              {meta.map((m) => (
                <li key={m.label} className="flex items-center gap-4 text-base md:text-lg text-slate-800">
                  <Icon name={m.icon} className="w-7 h-7 shrink-0 text-[#a9813a]" />
                  <span><span className="font-medium">{m.label}:</span> {m.value}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-4 max-w-3xl">
              {overview.map((p) => <p key={p} className="text-base md:text-lg text-slate-700 leading-relaxed">{p}</p>)}
            </div>

            <h2 className={`${H2} mt-12`}>{t('place.highlights')}</h2>
            <ul className="mt-6 flex flex-col gap-3 max-w-3xl">
              {(place.highlights || place.does || []).map((h) => (
                <li key={h} className="flex items-start gap-3 text-base md:text-lg text-slate-700">
                  <span className="mt-2.5 w-2 h-2 rounded-full bg-[#C49849] shrink-0" />{h}
                </li>
              ))}
            </ul>

            {(place.included || place.excluded) && (
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
                {[[t('place.included'), place.included, '✓'], [t('place.excluded'), place.excluded, '×']].map(([title, list, mark]) => list && (
                  <div key={title} className="rounded-3xl bg-white p-6 md:p-8">
                    <h3 className="text-xl font-medium text-forest">{title}</h3>
                    <ul className="mt-4 flex flex-col gap-2">
                      {list.map((x) => <li key={x} className="flex gap-3 text-sm md:text-base text-slate-700"><span aria-hidden="true" className="text-[#a9813a] font-semibold">{mark}</span>{x}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 rounded-3xl bg-[#084838] text-white p-6 md:p-8">
              <h3 className="text-xl font-medium">{t('place.goodToKnow')}</h3>
              <p className="mt-3 text-sm md:text-base text-white/75 leading-relaxed">{t('place.bestTime', { time: d.best })} {d.tip}</p>
            </div>
          </div>

          <BookingCard place={place} dest={d} />
        </section>

        {/* Autres lieux */}
        {others.length > 0 && (
          <section className={`${W} mt-16 md:mt-24`}>
            <h2 className={H2}>{t('place.more', { name: d.name })}</h2>
            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {others.map((o) => (
                <li key={o.slug}>
                  <A href={`/destinations/${d.slug}/${o.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-[1.5rem] text-white">
                    <img src={o.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 to-transparent" />
                    <p className="absolute inset-x-0 bottom-0 p-5 text-xl font-medium">{o.name}</p>
                  </A>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}

export default PlaceDetail