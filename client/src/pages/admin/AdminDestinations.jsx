// /admin/destinations : destinations du site (pages /destinations/...), publication et ordre en un clic
import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, ExternalLink, Eye, EyeOff, Pencil, Plus, Trash } from 'lucide-react'
import { adminDeleteDestination, adminFetchDestinations, adminPatchDestination, assetUrl } from '../../api'
import { BTN_DANGER, BTN_GHOST, BTN_GOLD, CARD, ICON_BTN } from '../../components/admin/ui'

function AdminDestinations() {
  const [list, setList] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(null) // slug en cours de modification
  const [confirmDelete, setConfirmDelete] = useState(null)

  const load = useCallback(() => {
    adminFetchDestinations()
      .then(({ destinations }) => setList(destinations))
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

  const togglePublished = (d) =>
    run(d.slug, () => adminPatchDestination(d.slug, { isPublished: !d.isPublished }), `"${d.name}" is now ${d.isPublished ? 'hidden from' : 'visible on'} the site.`)

  // Monter / descendre : on renumérote toute la liste 1, 2, 3... dans le nouvel ordre
  const reorder = (index, delta) => {
    const next = [...list]
    const target = index + delta
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setList(next)
    run(next[target].slug, () => Promise.all(next.map((d, i) => adminPatchDestination(d.slug, { sortOrder: i + 1 }))), 'Order saved.')
  }

  const remove = (d) => {
    setConfirmDelete(null)
    run(d.slug, () => adminDeleteDestination(d.slug), `"${d.name}" was deleted.`)
  }

  return (
    <section aria-labelledby="destinations-title">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="destinations-title" className="text-xl sm:text-2xl font-medium text-forest">Destinations</h2>
          <p className="max-w-2xl text-sm text-slate-600">
            Each destination has its page, with things to do and places to visit (each place has its own page too).
            The region cards of the home and{' '}
            <a href="/destinations" target="_blank" rel="noreferrer" className="font-medium text-[#a9813a] hover:underline">/destinations</a> pages are edited in Texts › Home (regions).
          </p>
        </div>
        <Link to="/admin/destinations/new" className={BTN_GOLD}>
          <Plus size={16} aria-hidden="true" /> New destination
        </Link>
      </div>

      {notice && (
        <div role="status" className="mt-4 flex items-start justify-between gap-4 rounded-2xl bg-emerald-50 px-5 py-3 text-sm text-emerald-800">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} className="font-medium hover:underline">OK</button>
        </div>
      )}
      {error && <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-5 py-3 text-sm text-red-800">{error}</p>}

      {!list && !error && <p role="status" className="mt-6 text-slate-600">Loading…</p>}

      {list && list.length === 0 && (
        <div className={`${CARD} mt-6 text-center`}>
          <p className="text-slate-700">No destination yet.</p>
          <Link to="/admin/destinations/new" className={`mt-4 ${BTN_GOLD}`}>Create the first one</Link>
        </div>
      )}

      {list && list.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3">
          {list.map((d, i) => (
            <li key={d.slug} className={`rounded-3xl bg-white p-3 sm:p-4 flex flex-col md:flex-row md:items-center gap-4 ${busy === d.slug ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <img src={assetUrl(d.image)} alt="" className="h-16 w-24 sm:h-20 sm:w-28 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-base sm:text-lg font-medium text-slate-900">{d.name}</span>
                    {!d.isPublished && <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">Hidden</span>}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {d.region} · {d.visit.length} {d.visit.length === 1 ? 'place' : 'places'} to visit · /destinations/{d.slug}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1 md:justify-end">
                <button type="button" onClick={() => reorder(i, -1)} disabled={i === 0 || Boolean(busy)} aria-label={`Move "${d.name}" up`} className={ICON_BTN}>
                  <ArrowUp size={17} aria-hidden="true" />
                </button>
                <button type="button" onClick={() => reorder(i, 1)} disabled={i === list.length - 1 || Boolean(busy)} aria-label={`Move "${d.name}" down`} className={ICON_BTN}>
                  <ArrowDown size={17} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => togglePublished(d)}
                  disabled={Boolean(busy)}
                  aria-label={d.isPublished ? `Hide "${d.name}" from the site` : `Publish "${d.name}"`}
                  title={d.isPublished ? 'Visible on the site: click to hide' : 'Hidden: click to publish'}
                  className={ICON_BTN}
                >
                  {d.isPublished ? <Eye size={17} aria-hidden="true" /> : <EyeOff size={17} aria-hidden="true" />}
                </button>
                <a href={`/destinations/${d.slug}`} target="_blank" rel="noreferrer" aria-label={`Open the page of "${d.name}" (new tab)`} className={ICON_BTN}>
                  <ExternalLink size={17} aria-hidden="true" />
                </a>
                <Link to={`/admin/destinations/${d.slug}`} className={`ml-1 ${BTN_GHOST}`}>
                  <Pencil size={15} aria-hidden="true" /> Edit
                </Link>
                {confirmDelete === d.slug ? (
                  <span className="ml-1 flex items-center gap-1">
                    <button type="button" onClick={() => remove(d)} className={BTN_DANGER}>Confirm delete</button>
                    <button type="button" onClick={() => setConfirmDelete(null)} className={BTN_GHOST}>Cancel</button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirmDelete(d.slug)} disabled={Boolean(busy)} aria-label={`Delete "${d.name}"`} className={`${ICON_BTN} hover:text-red-700`}>
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

export default AdminDestinations
