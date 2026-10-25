// /admin/offers/:kind : offres d'un type (activités, excursions...), publication et ordre en un clic
import React, { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowDown, ArrowUp, ExternalLink, Eye, EyeOff, Pencil, Plus, Trash } from 'lucide-react'
import { adminDeleteOffer, adminFetchOffers, adminPatchOffer, assetUrl } from '../../api'
import { formatPrice } from '../../utils/format'
import { BTN_DANGER, BTN_GHOST, BTN_GOLD, CARD, ICON_BTN } from '../../components/admin/ui'
import { KIND_NAMES, OFFER_KINDS } from './offerKinds'

// Ligne de détails sous le titre : les réglages utiles pour reconnaître l'offre
function summary(kind, offer) {
  const parts = []
  for (const field of OFFER_KINDS[kind].fields) {
    const value = offer[field.key]
    if (field.type === 'text' && value) parts.push(value)
    if (field.type === 'select') parts.push(field.options.find((o) => o.value === value)?.label || value)
    if (field.type === 'hours') parts.push(`${value} h`)
  }
  if (OFFER_KINDS[kind].price) parts.push(`From ${formatPrice(offer.price)}`)
  return parts.slice(0, 5).join(' · ')
}

// Onglets des types d'offres
export function KindTabs({ current }) {
  return (
    <nav aria-label="Offer types" className="flex flex-wrap gap-2">
      {KIND_NAMES.map((name) => (
        <Link
          key={name}
          to={`/admin/offers/${name}`}
          aria-current={name === current ? 'page' : undefined}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            name === current ? 'bg-[#084838] text-white' : 'border border-slate-300 bg-white text-slate-700 hover:border-slate-700'
          }`}
        >
          {OFFER_KINDS[name].label}
        </Link>
      ))}
    </nav>
  )
}

function AdminOffers({ kind }) {
  const config = OFFER_KINDS[kind]
  const [offers, setOffers] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(null) // id en cours de modification
  const [confirmDelete, setConfirmDelete] = useState(null)

  const load = useCallback(() => {
    if (!config) return
    adminFetchOffers(kind)
      .then(({ offers: list }) => setOffers(list))
      .catch((err) => setError(err.message))
  }, [kind, config])

  useEffect(load, [load])

  if (!config) return <Navigate to="/admin/offers/activity" replace />

  const run = async (id, action, message) => {
    setBusy(id)
    setError('')
    try {
      await action()
      setNotice(message)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(null)
    }
  }

  const togglePublished = (o) =>
    run(o.id, () => adminPatchOffer(o.id, { isPublished: !o.isPublished }), `"${o.title}" is now ${o.isPublished ? 'hidden from' : 'visible on'} the site.`)

  // Monter / descendre : on renumérote toute la liste 1, 2, 3... dans le nouvel ordre
  const reorder = (index, delta) => {
    const list = [...offers]
    const target = index + delta
    if (target < 0 || target >= list.length) return
    ;[list[index], list[target]] = [list[target], list[index]]
    setOffers(list)
    run(list[target].id, () => Promise.all(list.map((o, i) => adminPatchOffer(o.id, { sortOrder: i + 1 }))), 'Order saved.')
  }

  const remove = (o) => {
    setConfirmDelete(null)
    run(o.id, () => adminDeleteOffer(o.id), `"${o.title}" was deleted.`)
  }

  return (
    <section aria-labelledby="offers-title">
      <KindTabs current={kind} />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="offers-title" className="text-xl sm:text-2xl font-medium text-forest">{config.label}</h2>
          <p className="text-sm text-slate-600">
            The order below is the order on the{' '}
            <a href={config.page} target="_blank" rel="noreferrer" className="font-medium text-[#a9813a] hover:underline">{config.page}</a> page.
          </p>
        </div>
        <Link to={`/admin/offers/${kind}/new`} className={BTN_GOLD}>
          <Plus size={16} aria-hidden="true" /> New {config.singular}
        </Link>
      </div>

      {notice && (
        <div role="status" className="mt-4 flex items-start justify-between gap-4 rounded-2xl bg-emerald-50 px-5 py-3 text-sm text-emerald-800">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} className="font-medium hover:underline">OK</button>
        </div>
      )}
      {error && <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-5 py-3 text-sm text-red-800">{error}</p>}

      {!offers && !error && <p role="status" className="mt-6 text-slate-600">Loading…</p>}

      {offers && offers.length === 0 && (
        <div className={`${CARD} mt-6 text-center`}>
          <p className="text-slate-700">Nothing here yet: the section is hidden on the site until you add one.</p>
          <Link to={`/admin/offers/${kind}/new`} className={`mt-4 ${BTN_GOLD}`}>Create the first one</Link>
        </div>
      )}

      {offers && offers.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3">
          {offers.map((o, i) => (
            <li key={o.id} className={`rounded-3xl bg-white p-3 sm:p-4 flex flex-col md:flex-row md:items-center gap-4 ${busy === o.id ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <img src={assetUrl(o.image)} alt="" className="h-16 w-24 sm:h-20 sm:w-28 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-base sm:text-lg font-medium text-slate-900">{o.title}</span>
                    {!o.isPublished && <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">Hidden</span>}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{summary(kind, o)}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1 md:justify-end">
                <button type="button" onClick={() => reorder(i, -1)} disabled={i === 0 || busy} aria-label={`Move "${o.title}" up`} className={ICON_BTN}>
                  <ArrowUp size={17} aria-hidden="true" />
                </button>
                <button type="button" onClick={() => reorder(i, 1)} disabled={i === offers.length - 1 || busy} aria-label={`Move "${o.title}" down`} className={ICON_BTN}>
                  <ArrowDown size={17} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => togglePublished(o)}
                  disabled={Boolean(busy)}
                  aria-label={o.isPublished ? `Hide "${o.title}" from the site` : `Publish "${o.title}"`}
                  title={o.isPublished ? 'Visible on the site: click to hide' : 'Hidden: click to publish'}
                  className={ICON_BTN}
                >
                  {o.isPublished ? <Eye size={17} aria-hidden="true" /> : <EyeOff size={17} aria-hidden="true" />}
                </button>
                <a href={config.page} target="_blank" rel="noreferrer" aria-label={`Open the ${config.label} page (new tab)`} className={ICON_BTN}>
                  <ExternalLink size={17} aria-hidden="true" />
                </a>
                <Link to={`/admin/offers/${kind}/${o.id}`} className={`ml-1 ${BTN_GHOST}`}>
                  <Pencil size={15} aria-hidden="true" /> Edit
                </Link>
                {confirmDelete === o.id ? (
                  <span className="ml-1 flex items-center gap-1">
                    <button type="button" onClick={() => remove(o)} className={BTN_DANGER}>Confirm delete</button>
                    <button type="button" onClick={() => setConfirmDelete(null)} className={BTN_GHOST}>Cancel</button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirmDelete(o.id)} disabled={Boolean(busy)} aria-label={`Delete "${o.title}"`} className={`${ICON_BTN} hover:text-red-700`}>
                    <Trash size={17} aria-hidden="true" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

// Un autre type d'offres : la page repart de zéro (liste, messages)
function AdminOffersPage() {
  const { kind } = useParams()
  return <AdminOffers key={kind} kind={kind} />
}

export default AdminOffersPage
