// /admin/photos : photos des pages (bannières, grands blocs, cartes qui ne viennent pas de la base).
// Chaque emplacement montre sa photo actuelle ; en choisir une autre l'enregistre tout de suite,
// la retirer remet la photo d'origine. Les photos des offres, destinations et articles se changent dans leur éditeur.
import React, { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { adminResetSitePhoto, adminSaveSitePhoto, assetUrl } from '../../api'
import PhotoPicker from '../../components/admin/PhotoPicker'
import { CARD } from '../../components/admin/ui'
import { PHOTO_PAGES, useSitePhotos } from '../../sitePhotos'

function Slot({ slotKey, slot, custom, onSaved, onError }) {
  const [busy, setBusy] = useState(false)
  const current = custom[slotKey]

  const change = async (list) => {
    setBusy(true)
    try {
      if (list[0]) await adminSaveSitePhoto(slotKey, list[0])
      else await adminResetSitePhoto(slotKey)
      onSaved(slotKey, list[0] || null)
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className={`rounded-2xl border border-slate-200 p-3 ${busy ? 'opacity-60' : ''}`}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
        <img src={current ? assetUrl(current) : slot.src} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <span className={`absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${current ? 'bg-[#C49849] text-white' : 'bg-white/90 text-slate-700'}`}>
          {current ? 'Replaced' : 'Original'}
        </span>
      </div>
      <p className="mt-3 text-sm font-medium text-slate-900">{slot.label}</p>
      <div className="mt-2">
        <PhotoPicker
          label={current ? 'Your photo (remove it to put back the original)' : 'Replace with'}
          photos={current ? [current] : []}
          max={1}
          onChange={change}
        />
      </div>
    </li>
  )
}

function AdminPhotos() {
  const { custom, setCustom } = useSitePhotos()
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const saved = (key, path) => {
    setError('')
    setCustom((c) => {
      const next = { ...c }
      if (path) next[key] = path
      else delete next[key]
      return next
    })
    setNotice(path ? 'Photo replaced: it is already on the site.' : 'Original photo put back.')
  }

  return (
    <section aria-labelledby="photos-title">
      <h2 id="photos-title" className="text-xl sm:text-2xl font-medium text-forest">Photos of the pages</h2>
      <p className="mt-1 max-w-3xl text-sm text-slate-600">
        Banners, large blocks and cards of each page. Pick a photo from your computer or the library: it replaces the original right away.
        Remove it to put the original back. Photos of offers, destinations and articles are changed in their own editor.
      </p>

      {notice && (
        <div role="status" className="mt-4 flex items-start justify-between gap-4 rounded-2xl bg-emerald-50 px-5 py-3 text-sm text-emerald-800">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} className="font-medium hover:underline">OK</button>
        </div>
      )}
      {error && <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-5 py-3 text-sm text-red-800">{error}</p>}

      <div className="mt-6 flex flex-col gap-4">
        {PHOTO_PAGES.map((page) => {
          const keys = Object.keys(page.slots)
          const replaced = keys.filter((k) => custom[k]).length
          return (
            <details key={page.id} className={CARD}>
              <summary className="flex cursor-pointer select-none flex-wrap items-center justify-between gap-3">
                <span className="text-lg font-medium text-slate-900">
                  {page.label} <span className="text-sm font-normal text-slate-500">({keys.length} {keys.length > 1 ? 'photos' : 'photo'}{replaced ? `, ${replaced} replaced` : ''})</span>
                </span>
                <a href={page.page} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#a9813a] hover:underline">
                  <ExternalLink size={14} aria-hidden="true" /> {page.page}
                </a>
              </summary>
              <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {keys.map((key) => (
                  <Slot key={key} slotKey={key} slot={page.slots[key]} custom={custom} onSaved={saved} onError={setError} />
                ))}
              </ul>
            </details>
          )
        })}
      </div>
    </section>
  )
}

export default AdminPhotos
