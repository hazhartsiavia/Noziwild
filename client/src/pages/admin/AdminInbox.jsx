// /admin/inbox : demandes de devis « Mon voyage », messages et demandes reçus par le site, inscrits à la newsletter, comptes
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Mail } from 'lucide-react'
import { adminFetchResource, adminSetQuoteStatus } from '../../api'
import { formatPrice } from '../../utils/format'
import { BTN_GHOST, CARD } from '../../components/admin/ui'

const REQUEST_TYPES = { place: 'Place inquiry', gear: 'Equipment', food: 'Food journey', trip: 'Trip idea', circuit: 'Circuit' }
const STATUS = { new: 'New', read: 'Read', answered: 'Answered', in_progress: 'In progress', done: 'Done', quoted: 'Quote sent', accepted: 'Accepted', declined: 'Declined' }
const QUOTE_STATUSES = ['new', 'quoted', 'accepted', 'declined']
const KINDS = {
  circuit: 'Circuit', activity: 'Activity', excursion: 'Excursion', cruise: 'Cruise excursion', longstay: 'Long stay', place: 'Place',
  stay: 'Accommodation', food: 'Food', gear: 'Equipment', ticket: 'Ticket', photo: 'Photography', guide: 'Guide', transport: 'Transport', plan: 'Trip plan',
}
const UNITS = { person: 'person', night: 'night' }

// Pour chaque source : titre de la fiche, ligne d'information, champs détaillés (libellé, colonne)
const SOURCES = {
  quotes: {
    label: 'Quotes',
    title: (r) => `Quote #${r.id} · ${r.name}`,
    fields: [
      ['Phone', 'phone'],
      ['Dates', (r) => (r.arrival_date || r.departure_date ? `${r.arrival_date || '?'} → ${r.departure_date || '?'}` : '')],
      ['Travellers', 'travellers'],
      ['Budget', 'budget'],
      ['Language', (r) => r.lang?.toUpperCase()],
      ['Estimate', (r) => (r.estimate !== null ? `From ${formatPrice(r.estimate)}` : 'Prices on request')],
      ['Message', 'message'],
    ],
  },
  requests: {
    label: 'Requests',
    title: (r) => `${REQUEST_TYPES[r.type] || r.type}${r.subject ? ` · ${r.subject}` : ''}`,
    fields: [['Name', 'name'], ['Message', 'message']],
  },
  contacts: {
    label: 'Contact',
    title: (r) => r.inquiry_type || 'Contact message',
    fields: [['Name', 'name'], ['Phone', 'phone'], ['Message', 'message']],
  },
  'tailor-made': {
    label: 'Tailor-made',
    title: (r) => [r.trip_length, r.travel_month].filter(Boolean).join(' · ') || 'Tailor-made trip',
    fields: [
      ['Name', 'name'], ['Phone', 'phone'], ['Interests', 'interests'], ['Pace', 'pace'],
      ['Comfort', 'comfort'], ['Group', 'travel_group'], ['Notes', 'notes'],
    ],
  },
  newsletter: { label: 'Newsletter', title: () => 'Subscriber', fields: [] },
  users: {
    label: 'Accounts',
    title: (r) => r.name,
    fields: [
      ['Role', 'role'],
      ['Sign-in', (r) => [r.has_google && 'Google', r.has_password && 'Password'].filter(Boolean).join(' + ')],
      ['Email verified', (r) => (r.email_verified_at ? 'Yes' : 'No')],
      ['Last login', (r) => (r.last_login_at ? formatDate(r.last_login_at) : 'Never')],
    ],
  },
}

// Prix d'un élément de devis : « €45 / person × 2 = €90 », « €90 » ou « On request »
function itemPrice(item) {
  if (!item.unit || item.price === null) return item.quantity > 1 ? `On request · ${item.quantity} people` : 'On request'
  if (item.unit === 'fixed') return formatPrice(item.price)
  const per = UNITS[item.unit] ? ` / ${UNITS[item.unit]}` : ''
  return `${formatPrice(item.price)}${per} × ${item.quantity} = ${formatPrice(item.price * item.quantity)}`
}

// Éléments d'une demande de devis et choix du statut
function QuoteDetails({ quote, onStatus }) {
  const [state, setState] = useState({ saving: false, error: '' })
  const change = async (status) => {
    setState({ saving: true, error: '' })
    try {
      await adminSetQuoteStatus(quote.id, status)
      onStatus(status)
      setState({ saving: false, error: '' })
    } catch (err) {
      setState({ saving: false, error: err.message })
    }
  }
  return (
    <div className="mt-4">
      <ol className="flex flex-col divide-y divide-slate-200 rounded-2xl border border-slate-200">
        {quote.items.map((item, i) => (
          <li key={i} className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-4 px-4 py-3 text-sm">
            <div className="min-w-0">
              <p className="text-slate-900"><span className="text-slate-500">{KINDS[item.kind] || item.kind} · </span>{item.title}</p>
              {item.details && <p className="text-slate-600 break-words">{item.details}</p>}
              {item.date && <p className="text-slate-600">Date: {item.date}</p>}
              {item.note && <p className="text-slate-600 italic break-words">“{item.note}”</p>}
            </div>
            <p className="shrink-0 text-slate-800 tabular-nums">{itemPrice(item)}</p>
          </li>
        ))}
      </ol>
      <label className="mt-4 flex items-center gap-3 text-sm text-slate-700">
        Status
        <select
          value={quote.status}
          disabled={state.saving}
          onChange={(e) => change(e.target.value)}
          className="h-9 rounded-full border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-slate-700"
        >
          {QUOTE_STATUSES.map((s) => <option key={s} value={s}>{STATUS[s]}</option>)}
        </select>
      </label>
      {state.error && <p role="alert" className="mt-2 text-sm text-red-700">{state.error}</p>}
    </div>
  )
}

function formatDate(value) {
  return new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function AdminInbox() {
  const [params, setParams] = useSearchParams()
  const source = SOURCES[params.get('source')] ? params.get('source') : 'quotes'
  const page = Math.max(Number(params.get('page')) || 1, 1)
  const [result, setResult] = useState(null) // { key, data, total, limit } ou { key, error }
  const key = `${source}-${page}`
  const current = result?.key === key ? result : null

  useEffect(() => {
    let cancelled = false
    adminFetchResource(source, page)
      .then((body) => !cancelled && setResult({ key, data: body.data, total: body.total, limit: body.limit }))
      .catch((err) => !cancelled && setResult({ key, error: err.message }))
    return () => {
      cancelled = true
    }
  }, [source, page, key])

  const config = SOURCES[source]
  const pages = current?.total ? Math.ceil(current.total / current.limit) : 1
  const go = (next) => setParams({ source, page: String(next) })
  const setRowStatus = (id, status) =>
    setResult((prev) => ({ ...prev, data: prev.data.map((row) => (row.id === id ? { ...row, status } : row)) }))

  return (
    <section aria-labelledby="inbox-title">
      <h2 id="inbox-title" className="text-xl sm:text-2xl font-medium text-forest">Inbox</h2>
      <p className="text-sm text-slate-600">Everything sent from the forms of the site, newest first.</p>

      <div role="tablist" aria-label="Sources" className="mt-4 flex flex-wrap gap-2">
        {Object.entries(SOURCES).map(([id, s]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={id === source}
            onClick={() => setParams({ source: id })}
            className={`rounded-full border px-4 py-2 text-sm transition ${id === source ? 'border-[#084838] bg-[#084838] text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-500'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-6" role="tabpanel" aria-label={config.label}>
        {!current && <p role="status" className="text-slate-600">Loading…</p>}
        {current?.error && <p role="alert" className="rounded-2xl bg-red-50 px-5 py-3 text-sm text-red-800">{current.error}</p>}
        {current?.data && current.data.length === 0 && (
          <div className={`${CARD} text-center text-slate-600`}>Nothing here yet.</div>
        )}

        {current?.data?.length > 0 && (
          <>
            <p className="mb-3 text-sm text-slate-600">{current.total} in total</p>
            <ul className="flex flex-col gap-3">
              {current.data.map((row) => (
                <li key={row.id} className="rounded-3xl bg-white p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">{config.title(row)}</p>
                      <a href={`mailto:${row.email}`} className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-[#a9813a] hover:underline break-all">
                        <Mail size={14} aria-hidden="true" /> {row.email}
                      </a>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
                      {row.status && <span className="rounded-full bg-[#D5E8E2] px-2.5 py-0.5 font-medium text-slate-800">{STATUS[row.status] || row.status}</span>}
                      <time dateTime={row.created_at}>{formatDate(row.created_at)}</time>
                    </div>
                  </div>
                  {config.fields.length > 0 && (
                    <dl className="mt-3 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-1.5 text-sm">
                      {config.fields.map(([label, field]) => {
                        const value = typeof field === 'function' ? field(row) : row[field]
                        if (value === null || value === undefined || value === '') return null
                        return (
                          <React.Fragment key={label}>
                            <dt className="text-slate-500">{label}</dt>
                            <dd className="text-slate-800 whitespace-pre-line break-words">{value}</dd>
                          </React.Fragment>
                        )
                      })}
                    </dl>
                  )}
                  {source === 'quotes' && <QuoteDetails quote={row} onStatus={(status) => setRowStatus(row.id, status)} />}
                </li>
              ))}
            </ul>

            {pages > 1 && (
              <nav aria-label="Pages" className="mt-6 flex items-center justify-center gap-3">
                <button type="button" onClick={() => go(page - 1)} disabled={page <= 1} className={BTN_GHOST}>
                  <ChevronLeft size={16} aria-hidden="true" /> Newer
                </button>
                <span className="text-sm text-slate-600">Page {page} of {pages}</span>
                <button type="button" onClick={() => go(page + 1)} disabled={page >= pages} className={BTN_GHOST}>
                  Older <ChevronRight size={16} aria-hidden="true" />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default AdminInbox
