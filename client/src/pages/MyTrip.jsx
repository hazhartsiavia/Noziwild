// Page /my-trip : tout ce que le visiteur a mis de côté sur le site (circuits, activités, hébergements...),
// ses dates et ses coordonnées, envoyés en une seule demande de devis. Aucun paiement en ligne.
// Textes : locales/<langue>/trip.json
import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Minus, Plus, Trash2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { LABEL, FIELD, BUTTON, PRIMARY, SECONDARY } from '../components/authStyles'
import { useAuth } from '../context/AuthContext'
import { lineTotal, useTrip } from '../context/TripContext'
import { Trans, useLanguage, useT } from '../i18n/LanguageContext'
import { formatPrice } from '../utils/format'
import { sendQuote } from '../api'
import { useScrollReveal } from '../utils/useScrollReveal'

const CARD = 'rounded-3xl bg-white p-5 md:p-7'
const H1 = 'text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-slate-900'
const MUTED = 'text-sm md:text-base text-slate-600'
const TEXTAREA = 'w-full rounded-3xl border border-slate-300 bg-white px-6 py-3 text-base text-slate-800 focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700 transition'
const SMALL_FIELD = 'h-10 rounded-full border border-slate-300 bg-white px-4 text-sm text-slate-800 focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700'

// Pages où trouver des offres, proposées quand la sélection est vide
const BROWSE = [
  { to: '/circuits', key: 'circuits' },
  { to: '/activities', key: 'activities' },
  { to: '/excurssions', key: 'excursions' },
  { to: '/hosting', key: 'stays' },
]

const today = () => new Date().toISOString().slice(0, 10)

// Libellés par unité : prix unitaire × quantité, et valeur affichée entre les boutons − / +
const UNIT_TEXT = {
  person: { times: 'perPersonTimes', one: 'personOne', many: 'personMany', group: 'people', max: 30 },
  night: { times: 'perNightTimes', one: 'nightOne', many: 'nightMany', group: 'nights', max: 60 },
  unit: { times: 'times', one: 'quantityValue', many: 'quantityValue', group: 'quantity', max: 99 },
}

// Prix d'une ligne : « 45 € / pers. × 2 », « 30 € × 3 », « 90 € » ou « Sur devis »
function PriceLine({ item }) {
  const t = useT('trip')
  const { lang } = useLanguage()
  const total = lineTotal(item)
  if (total === null) return <p className="text-sm text-slate-500">{t('onRequest')}</p>
  const unitPrice = formatPrice(item.price, lang)
  return (
    <p className="text-right">
      <span className="block text-lg md:text-xl font-medium text-slate-900 tabular-nums">{formatPrice(total, lang)}</span>
      {UNIT_TEXT[item.unit] && (
        <span className="block text-xs text-slate-500 tabular-nums">{t(UNIT_TEXT[item.unit].times, { price: unitPrice, count: item.qty })}</span>
      )}
    </p>
  )
}

function ItemCard({ item }) {
  const t = useT('trip')
  const { update, remove } = useTrip()
  const [showNote, setShowNote] = useState(Boolean(item.note))
  const [imageOk, setImageOk] = useState(Boolean(item.image))
  // Sans prix (sur devis), la quantité reste un nombre de personnes
  const units = UNIT_TEXT[item.unit || 'person']
  const max = units.max
  const setQty = (qty) => update(item.id, { qty: Math.min(max, Math.max(1, qty)) })
  const kinds = t('kinds')

  return (
    <li className={`${CARD} flex flex-col gap-4`}>
      <div className="flex gap-4">
        {imageOk && (
          <img src={item.image} alt="" onError={() => setImageOk(false)} className="hidden sm:block w-28 h-24 md:w-36 md:h-28 shrink-0 rounded-2xl object-cover" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs md:text-sm uppercase tracking-wide text-[#9a742f]">{kinds[item.kind] || item.kind}</p>
          <h3 className="mt-1 text-lg md:text-xl font-medium leading-snug text-forest">
            {item.link ? <Link to={item.link} className="hover:underline">{item.title}</Link> : item.title}
          </h3>
          {item.details && <p className="mt-1 text-sm text-slate-600 break-words">{item.details}</p>}
        </div>
        <div className="shrink-0"><PriceLine item={item} /></div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {item.unit !== 'fixed' && (
          <div className="flex items-center gap-2 rounded-full bg-[#D5E8E2] p-1" role="group" aria-label={t(units.group)}>
            <button type="button" onClick={() => setQty(item.qty - 1)} disabled={item.qty <= 1} aria-label={t('fewer')} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-800 hover:bg-slate-100 disabled:opacity-40">
              <Minus size={14} aria-hidden="true" />
            </button>
            <span className="min-w-[5.5rem] text-center text-sm text-slate-800 tabular-nums" aria-live="polite">
              {t(item.qty === 1 ? units.one : units.many, { count: item.qty })}
            </span>
            <button type="button" onClick={() => setQty(item.qty + 1)} disabled={item.qty >= max} aria-label={t('more')} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-800 hover:bg-slate-100 disabled:opacity-40">
              <Plus size={14} aria-hidden="true" />
            </button>
          </div>
        )}

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <CalendarDays size={16} aria-hidden="true" />
          <span className="sr-only">{t('date')}</span>
          <input type="date" min={today()} value={item.date || ''} onChange={(e) => update(item.id, { date: e.target.value })} className={SMALL_FIELD} />
        </label>

        {!showNote && (
          <button type="button" onClick={() => setShowNote(true)} className="text-sm text-slate-600 underline-offset-2 hover:underline">
            {t('addNote')}
          </button>
        )}

        <button type="button" onClick={() => remove(item.id)} className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-700">
          <Trash2 size={15} aria-hidden="true" /> {t('remove')}
        </button>
      </div>

      {showNote && (
        <label className="block">
          <span className="sr-only">{t('note')}</span>
          <input
            type="text"
            maxLength={500}
            value={item.note || ''}
            onChange={(e) => update(item.id, { note: e.target.value })}
            placeholder={t('notePlaceholder')}
            className={`${SMALL_FIELD} w-full`}
          />
        </label>
      )}
    </li>
  )
}

// Formulaire d'envoi : dates, voyageurs, budget, coordonnées
function QuoteForm({ items, onSent }) {
  const t = useT('trip')
  const { lang } = useLanguage()
  const { user } = useAuth()
  const [arrival, setArrival] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'error'
  const [error, setError] = useState('')
  const people = Math.max(0, ...items.filter((i) => i.unit === 'person').map((i) => i.qty))
  const priced = items.map(lineTotal).filter((v) => v !== null)
  const estimate = priced.reduce((sum, v) => sum + v, 0)
  const unpriced = items.length - priced.length

  const submit = async (event) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    setStatus('sending')
    setError('')
    try {
      const result = await sendQuote({
        ...data,
        lang,
        items: items.map(({ kind, ref, title, details, price, unit, qty, date, note }) => ({ kind, ref, title, details, price, unit, qty, date, note })),
      })
      onSent(result.id)
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <form onSubmit={submit} className={`${CARD} flex flex-col gap-5 lg:sticky lg:top-6`}>
      <div>
        <p className="text-sm text-slate-600">{t('estimate')}</p>
        <p className="mt-1 text-3xl md:text-4xl font-medium text-slate-900 tabular-nums">
          {priced.length ? t('fromPrice', { price: formatPrice(estimate, lang) }) : t('onRequest')}
        </p>
        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
          {unpriced > 0 && priced.length > 0 && `${t(unpriced === 1 ? 'unpricedOne' : 'unpricedMany', { count: unpriced })} `}
          {t('estimateNote')}
        </p>
      </div>

      <div className="border-t border-slate-200 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="trip-arrival" className={LABEL}>{t('arrival')}</label>
          <input id="trip-arrival" name="arrival" type="date" min={today()} value={arrival} onChange={(e) => setArrival(e.target.value)} className={FIELD} />
        </div>
        <div>
          <label htmlFor="trip-departure" className={LABEL}>{t('departure')}</label>
          <input id="trip-departure" name="departure" type="date" min={arrival || today()} className={FIELD} />
        </div>
        <div>
          <label htmlFor="trip-travellers" className={LABEL}>{t('travellers')}</label>
          <input id="trip-travellers" name="travellers" type="number" min={1} max={99} defaultValue={people || 2} className={FIELD} />
        </div>
        <div>
          <label htmlFor="trip-budget" className={LABEL}>{t('budget')}</label>
          <select id="trip-budget" name="budget" defaultValue="" className={`${FIELD} appearance-none`}>
            <option value="">{t('budgetAny')}</option>
            {t('budgets').map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="trip-name" className={LABEL}>{t('name')}</label>
          <input id="trip-name" name="name" key={`n-${user?.id}`} defaultValue={user?.name} required autoComplete="name" className={FIELD} />
        </div>
        <div>
          <label htmlFor="trip-email" className={LABEL}>{t('email')}</label>
          <input id="trip-email" name="email" key={`e-${user?.id}`} defaultValue={user?.email} type="email" required autoComplete="email" className={FIELD} />
        </div>
        <div>
          <label htmlFor="trip-phone" className={LABEL}>{t('phone')}</label>
          <input id="trip-phone" name="phone" type="tel" autoComplete="tel" className={FIELD} />
        </div>
        <div>
          <label htmlFor="trip-message" className={LABEL}>{t('message')}</label>
          <textarea id="trip-message" name="message" rows={4} maxLength={5000} placeholder={t('messagePlaceholder')} className={TEXTAREA} />
        </div>
      </div>

      <button type="submit" disabled={status === 'sending'} className={`${PRIMARY} w-full`}>
        {status === 'sending' ? t('sending') : t('send')}
      </button>
      {status === 'error' && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <p className="text-xs text-slate-500 text-center">{t('noPayment')}</p>
    </form>
  )
}

function MyTrip() {
  const t = useT('trip')
  const { user } = useAuth()
  const { items, clear } = useTrip()
  const [sentId, setSentId] = useState(null)
  const root = useRef(null)
  useScrollReveal(root)

  const handleSent = (id) => {
    setSentId(id)
    clear()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <section ref={root} className="w-full pt-0 pb-12 md:pb-20 bg-[#D5E8E2] flex flex-col items-center">
        <Navbar />

        <div className="w-[90vw] max-w-6xl mt-4 md:mt-8">
          <h1 className={H1}>{t('title')}</h1>
          <p className={`mt-4 max-w-2xl ${MUTED}`}>{t('intro')}</p>

          {sentId && (
            <div role="status" className={`${CARD} mt-8`}>
              <h2 className="text-2xl md:text-3xl font-medium text-forest">{t('sentTitle')}</h2>
              <p className={`mt-3 ${MUTED}`}>{t('sentText', { id: sentId })}</p>
              {user && (
                <p className={`mt-2 ${MUTED}`}>
                  <Trans text={t('follow')} values={{ link: <Link to="/account" className="font-medium text-slate-900 underline">{t('followLink')}</Link> }} />
                </p>
              )}
              <Link to="/" className={`mt-6 inline-block ${SECONDARY}`}>{t('backHome')}</Link>
            </div>
          )}

          {!sentId && items.length === 0 && (
            <div className={`${CARD} mt-8`}>
              <h2 className="text-xl md:text-2xl font-medium text-forest">{t('emptyTitle')}</h2>
              <p className={`mt-2 ${MUTED}`}>{t('emptyText')}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {BROWSE.map(({ to, key }) => (
                  <Link key={key} to={to} className={SECONDARY}>{t('browse')[key]}</Link>
                ))}
              </div>
              <p className={`mt-6 ${MUTED}`}>
                <Trans text={t('noIdea')} values={{ link: <Link to="/tailor-made" className="font-medium text-slate-900 underline">{t('noIdeaLink')}</Link> }} />
              </p>
            </div>
          )}

          {!sentId && items.length > 0 && (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-lg md:text-xl font-medium text-forest">
                    {t(items.length === 1 ? 'countOne' : 'countMany', { count: items.length })}
                  </h2>
                  <button type="button" onClick={clear} className="text-sm text-slate-600 hover:text-red-700 hover:underline">{t('clear')}</button>
                </div>
                <ul className="flex flex-col gap-3">
                  {items.map((item) => <ItemCard key={item.id} item={item} />)}
                </ul>
                <div className="mt-4 flex flex-wrap gap-3">
                  {BROWSE.map(({ to, key }) => (
                    <Link key={key} to={to} className={`bg-white/60 hover:bg-white ${BUTTON} text-slate-800 transition`}>+ {t('browse')[key]}</Link>
                  ))}
                </div>
              </div>
              <QuoteForm items={items} onSent={handleSent} />
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  )
}

export default MyTrip
