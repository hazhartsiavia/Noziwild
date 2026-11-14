// /admin/photos : pages du site. Pour chacune : affichée ou masquée, et ses photos (bannières, grands blocs,
// cartes qui ne viennent pas de la base). Choisir une photo l'enregistre tout de suite, la retirer remet celle d'origine.
// Les fonds peuvent aussi recevoir une vidéo, jouée par-dessus leur photo.
// Les photos des offres, destinations et articles se changent dans leur éditeur.
import React, { useRef, useState } from 'react'
import { ExternalLink, Film, Images, LoaderCircle, Trash } from 'lucide-react'
import {
  adminFetchPhotos, adminResetSitePhoto, adminResetSiteVideo, adminSaveSitePhoto, adminSaveSiteVideo,
  adminSetPageVisible, adminUploadVideo, assetUrl,
} from '../../api'
import PhotoPicker from '../../components/admin/PhotoPicker'
import { BTN_GHOST, CARD } from '../../components/admin/ui'
import { useSitePages } from '../../context/SitePagesContext'
import { PHOTO_PAGES, VIDEO_SLOTS, useSitePhotos } from '../../sitePhotos'

// Toujours affichées : l'accueil, la connexion, et les régions (partie de l'accueil et des destinations)
const ALWAYS_SHOWN = ['home', 'regions', 'account']

function VideoPicker({ slotKey, current, onSaved, onError }) {
  const [progress, setProgress] = useState(null)
  const [library, setLibrary] = useState(null)
  const fileRef = useRef(null)

  const save = async (path) => {
    await adminSaveSiteVideo(slotKey, path)
    onSaved(slotKey, path)
  }

  const upload = async (event) => {
    const file = event.target.files[0]
    event.target.value = ''
    if (!file) return
    setProgress(0)
    try {
      await save(await adminUploadVideo(file, setProgress))
    } catch (err) {
      onError(`${file.name}: ${err.message}`)
    } finally {
      setProgress(null)
    }
  }

  const openLibrary = async () => {
    try {
      const { videos } = await adminFetchPhotos()
      setLibrary(videos)
    } catch (err) {
      onError(err.message)
    }
  }

  const pick = async (event) => {
    const path = event.target.value
    if (!path) return
    setLibrary(null)
    try {
      await save(path)
    } catch (err) {
      onError(err.message)
    }
  }

  const remove = async () => {
    try {
      await adminResetSiteVideo(slotKey)
      onSaved(slotKey, null)
    } catch (err) {
      onError(err.message)
    }
  }

  return (
    <div className="mt-3 border-t border-slate-200 pt-3">
      <p className="mb-2 text-sm text-slate-700">Background video (optional)</p>
      <div className="flex flex-wrap gap-2">
        <input ref={fileRef} type="file" accept="video/mp4,video/webm" onChange={upload} className="sr-only" tabIndex={-1} aria-hidden="true" />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={progress !== null} className={BTN_GHOST}>
          {progress !== null
            ? <><LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> {progress}%</>
            : <><Film size={16} aria-hidden="true" /> {current ? 'Replace video' : 'Upload video'}</>}
        </button>
        <button type="button" onClick={openLibrary} className={BTN_GHOST}>
          <Images size={16} aria-hidden="true" /> From library
        </button>
        {current && (
          <button type="button" onClick={remove} className={`${BTN_GHOST} text-red-700`}>
            <Trash size={16} aria-hidden="true" /> Back to photo
          </button>
        )}
      </div>
      {library && (
        library.length ? (
          <select defaultValue="" onChange={pick} aria-label="Video from the library" className="mt-2 w-full rounded-full border border-slate-300 bg-white px-4 py-2 text-sm">
            <option value="">Choose a video…</option>
            {library.map((v) => <option key={v.path} value={v.path}>{v.path.split('/').pop()} ({Math.round(v.size / 1048576)} MB)</option>)}
          </select>
        ) : <p className="mt-2 text-sm text-slate-500">No video in the library yet.</p>
      )}
    </div>
  )
}

function Slot({ slotKey, slot, custom, video, onSaved, onVideoSaved, onError }) {
  const [busy, setBusy] = useState(false)
  const current = custom[slotKey]
  const image = current ? assetUrl(current) : slot.src

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
        {video
          ? <video key={video} src={assetUrl(video)} poster={image} controls muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
          : <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />}
        <span className={`absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${video || current ? 'bg-[#C49849] text-white' : 'bg-white/90 text-slate-700'}`}>
          {video ? 'Video' : current ? 'Replaced' : 'Original'}
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
      {VIDEO_SLOTS.has(slotKey) && <VideoPicker slotKey={slotKey} current={video} onSaved={onVideoSaved} onError={onError} />}
    </li>
  )
}

// Interrupteur dans le titre d'une page : un clic ne déplie pas le bloc
function VisibilitySwitch({ page, onChanged, onError }) {
  const { isHidden } = useSitePages()
  const [busy, setBusy] = useState(false)
  const visible = !isHidden(page.page)

  const toggle = async (event) => {
    event.preventDefault()
    event.stopPropagation()
    setBusy(true)
    try {
      const { hidden } = await adminSetPageVisible(page.page, !visible)
      onChanged(hidden, page, !visible)
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={visible}
      aria-label={`Show the ${page.label} page to visitors`}
      onClick={toggle}
      disabled={busy}
      className="inline-flex items-center gap-2 text-sm text-slate-700 disabled:opacity-60"
    >
      <span className={`relative h-6 w-11 rounded-full transition-colors ${visible ? 'bg-[#0C3E2E]' : 'bg-slate-300'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${visible ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
      {visible ? 'Visible' : 'Hidden'}
    </button>
  )
}

function AdminPhotos() {
  const { custom, setCustom, videos, setVideos } = useSitePhotos()
  const { setHidden } = useSitePages()
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const update = (key, path) => (current) => {
    const next = { ...current }
    if (path) next[key] = path
    else delete next[key]
    return next
  }

  const saved = (key, path) => {
    setError('')
    setCustom(update(key, path))
    setNotice(path ? 'Photo replaced: it is already on the site.' : 'Original photo put back.')
  }

  const videoSaved = (key, path) => {
    setError('')
    setVideos(update(key, path))
    setNotice(path ? 'Video saved: it is already on the site.' : 'Video removed: the photo is back.')
  }

  const pageChanged = (hidden, page, visible) => {
    setError('')
    setHidden(hidden)
    setNotice(visible ? `${page.label}: visible to visitors again.` : `${page.label}: hidden from visitors and removed from the menus.`)
  }

  return (
    <section aria-labelledby="photos-title">
      <h2 id="photos-title" className="text-xl sm:text-2xl font-medium text-forest">Pages and photos</h2>
      <p className="mt-1 max-w-3xl text-sm text-slate-600">
        Choose which pages visitors can see, and change the banners, large blocks and cards of each page. A photo or a video applies right away.
        Backgrounds can also play a video: MP4 (H.264) or WebM, silent, up to 60 MB (under 20 MB loads much faster).
        The photo stays as a backup while the video loads. Photos of offers, destinations and articles are changed in their own editor.
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
          const withVideo = keys.filter((k) => videos[k]).length
          return (
            <details key={page.id} className={CARD}>
              <summary className="flex cursor-pointer select-none flex-wrap items-center justify-between gap-3">
                <span className="text-lg font-medium text-slate-900">
                  {page.label} <span className="text-sm font-normal text-slate-500">({keys.length} {keys.length > 1 ? 'photos' : 'photo'}{replaced ? `, ${replaced} replaced` : ''}{withVideo ? `, ${withVideo} with video` : ''})</span>
                </span>
                <span className="flex flex-wrap items-center gap-4">
                  {!ALWAYS_SHOWN.includes(page.id) && <VisibilitySwitch page={page} onChanged={pageChanged} onError={setError} />}
                  <a href={page.page} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:underline">
                    <ExternalLink size={14} aria-hidden="true" /> {page.page}
                  </a>
                </span>
              </summary>
              {keys.length > 0 ? (
                <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {keys.map((key) => (
                    <Slot key={key} slotKey={key} slot={page.slots[key]} custom={custom} video={videos[key]} onSaved={saved} onVideoSaved={videoSaved} onError={setError} />
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-slate-500">This page has no background photo of its own: its photos come from its offers.</p>
              )}
            </details>
          )
        })}
      </div>
    </section>
  )
}

export default AdminPhotos
