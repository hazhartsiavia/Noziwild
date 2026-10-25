// /admin/circuits : liste des circuits, publication et ordre en un clic
import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, ExternalLink, Eye, EyeOff, Pencil, Plus, Trash } from 'lucide-react'
import { adminDeleteCircuit, adminFetchCircuits, adminPatchCircuit, assetUrl } from '../../api'
import { formatPrice } from '../../utils/format'
import { BTN_DANGER, BTN_GHOST, BTN_GOLD, CARD, ICON_BTN } from '../../components/admin/ui'

function AdminCircuits() {
  const [circuits, setCircuits] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(null) // slug en cours de modification
  const [confirmDelete, setConfirmDelete] = useState(null)

  const load = useCallback(() => {
    adminFetchCircuits()
      .then(({ circuits: list }) => setCircuits(list))
      .catch((err) => setError(err.message))
  }, [])

  useEffect(load, [load])

  const run = async (slug, action, message) => {
    setBusy(slug)
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

  const togglePublished = (c) =>
    run(c.slug, () => adminPatchCircuit(c.slug, { isPublished: !c.isPublished }), `"${c.title}" is now ${c.isPublished ? 'hidden from' : 'visible on'} the site.`)

  // Monter / descendre : on renumérote toute la liste 1, 2, 3... dans le nouvel ordre
  const reorder = (index, delta) => {
    const list = [...circuits]
    const target = index + delta
    if (target < 0 || target >= list.length) return
    ;[list[index], list[target]] = [list[target], list[index]]
    setCircuits(list)
    run(list[target].slug, () => Promise.all(list.map((c, i) => adminPatchCircuit(c.slug, { sortOrder: i + 1 }))), 'Order saved.')
  }

  const remove = (c) => {
    setConfirmDelete(null)
    run(c.slug, () => adminDeleteCircuit(c.slug), `"${c.title}" was deleted.`)
  }

  return (
    <section aria-labelledby="circuits-title">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="circuits-title" className="text-xl sm:text-2xl font-medium text-forest">Circuits</h2>
          <p className="text-sm text-slate-600">The order below is the order on the site.</p>
        </div>
        <Link to="/admin/circuits/new" className={BTN_GOLD}>
          <Plus size={16} aria-hidden="true" /> New circuit
        </Link>
      </div>

      {notice && (
        <div role="status" className="mt-4 flex items-start justify-between gap-4 rounded-2xl bg-emerald-50 px-5 py-3 text-sm text-emerald-800">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} className="font-medium hover:underline">OK</button>
        </div>
      )}
      {error && <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-5 py-3 text-sm text-red-800">{error}</p>}

      {!circuits && !error && <p role="status" className="mt-6 text-slate-600">Loading circuits…</p>}

      {circuits && circuits.length === 0 && (
        <div className={`${CARD} mt-6 text-center`}>
          <p className="text-slate-700">No circuit yet.</p>
          <Link to="/admin/circuits/new" className={`mt-4 ${BTN_GOLD}`}>Create the first one</Link>
        </div>
      )}

      {circuits && circuits.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3">
          {circuits.map((c, i) => (
            <li key={c.slug} className={`rounded-3xl bg-white p-3 sm:p-4 flex flex-col md:flex-row md:items-center gap-4 ${busy === c.slug ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <img src={assetUrl(c.image)} alt="" className="h-16 w-24 sm:h-20 sm:w-28 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-base sm:text-lg font-medium text-slate-900">{c.title}</span>
                    {!c.isPublished && <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">Hidden</span>}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {c.region} · {c.days} days · {c.level} · From {formatPrice(c.price)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1 md:justify-end">
                <button type="button" onClick={() => reorder(i, -1)} disabled={i === 0 || busy} aria-label={`Move "${c.title}" up`} className={ICON_BTN}>
                  <ArrowUp size={17} aria-hidden="true" />
                </button>
                <button type="button" onClick={() => reorder(i, 1)} disabled={i === circuits.length - 1 || busy} aria-label={`Move "${c.title}" down`} className={ICON_BTN}>
                  <ArrowDown size={17} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => togglePublished(c)}
                  disabled={Boolean(busy)}
                  aria-label={c.isPublished ? `Hide "${c.title}" from the site` : `Publish "${c.title}"`}
                  title={c.isPublished ? 'Visible on the site: click to hide' : 'Hidden: click to publish'}
                  className={ICON_BTN}
                >
                  {c.isPublished ? <Eye size={17} aria-hidden="true" /> : <EyeOff size={17} aria-hidden="true" />}
                </button>
                {c.isPublished && (
                  <a href={`/circuits/${c.slug}`} target="_blank" rel="noreferrer" aria-label={`Open "${c.title}" on the site (new tab)`} className={ICON_BTN}>
                    <ExternalLink size={17} aria-hidden="true" />
                  </a>
                )}
                <Link to={`/admin/circuits/${c.slug}`} className={`ml-1 ${BTN_GHOST}`}>
                  <Pencil size={15} aria-hidden="true" /> Edit
                </Link>
                {confirmDelete === c.slug ? (
                  <span className="ml-1 flex items-center gap-1">
                    <button type="button" onClick={() => remove(c)} className={BTN_DANGER}>Confirm delete</button>
                    <button type="button" onClick={() => setConfirmDelete(null)} className={BTN_GHOST}>Cancel</button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirmDelete(c.slug)} disabled={Boolean(busy)} aria-label={`Delete "${c.title}"`} className={`${ICON_BTN} hover:text-red-700`}>
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

export default AdminCircuits
