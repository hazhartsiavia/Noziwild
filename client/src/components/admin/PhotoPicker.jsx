// Liste de photos d'un circuit : vignettes à réordonner ou retirer,
// ajout par envoi depuis l'ordinateur ou par choix dans la bibliothèque du serveur
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ImagePlus, Images, LoaderCircle, Trash, X, Check } from 'lucide-react'
import { adminFetchPhotos, adminUploadPhoto, assetUrl } from '../../api'
import { BTN_GHOST, BTN_PRIMARY, ICON_BTN, move } from './ui'

/* ------------------------------------------------------------------
   Bibliothèque : toutes les photos déjà sur le serveur
------------------------------------------------------------------ */
function PhotoLibrary({ selected, max, onConfirm, onClose }) {
  const [photos, setPhotos] = useState(null)
  const [error, setError] = useState('')
  const [picked, setPicked] = useState([])
  const closeRef = useRef(null)
  const room = max - selected.length

  useEffect(() => {
    adminFetchPhotos().then(({ photos: list }) => setPhotos(list)).catch((err) => setError(err.message))
  }, [])

  // Échap ferme ; focus dans la fenêtre ; page bloquée derrière
  useEffect(() => {
    const previous = document.activeElement
    closeRef.current?.focus()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus?.()
    }
  }, [onClose])

  const toggle = (path) => {
    if (picked.includes(path)) setPicked(picked.filter((p) => p !== path))
    else if (picked.length < room) setPicked([...picked, path])
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="library-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 id="library-title" className="text-lg font-medium text-slate-900">Photo library</h2>
            <p className="text-sm text-slate-500">
              {room > 0 ? `Choose up to ${room} photo${room > 1 ? 's' : ''}.` : 'This list is full: remove a photo first.'}
            </p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close the library" className={ICON_BTN}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6">
          {error && <p role="alert" className="text-red-700">{error}</p>}
          {!photos && !error && <p role="status" className="text-slate-500">Loading photos…</p>}
          {photos && (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photos.map((photo) => {
                const already = selected.includes(photo.path)
                const isPicked = picked.includes(photo.path)
                return (
                  <li key={photo.path}>
                    <button
                      type="button"
                      onClick={() => toggle(photo.path)}
                      disabled={already || (!isPicked && picked.length >= room)}
                      aria-pressed={isPicked}
                      aria-label={`${photo.path.split('/').pop()}${already ? ' (already used here)' : ''}`}
                      className={`group relative block w-full aspect-[4/3] overflow-hidden rounded-xl ring-offset-2 transition disabled:cursor-not-allowed ${isPicked ? 'ring-4 ring-[#C49849]' : 'hover:ring-2 hover:ring-slate-400'} ${already ? 'opacity-40' : ''}`}
                    >
                      <img src={assetUrl(photo.path)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                      {isPicked && (
                        <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#C49849] text-white">
                          <Check size={16} aria-hidden="true" />
                        </span>
                      )}
                      <span className="absolute inset-x-0 bottom-0 truncate bg-slate-950/60 px-2 py-1 text-left text-xs text-white">
                        {photo.folder === 'files' ? 'Uploaded · ' : ''}{photo.path.split('/').pop()}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4 sm:px-6">
          <button type="button" onClick={onClose} className={BTN_GHOST}>Cancel</button>
          <button type="button" onClick={() => onConfirm(picked)} disabled={!picked.length} className={BTN_PRIMARY}>
            Add {picked.length || ''} photo{picked.length > 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
   Sélecteur
------------------------------------------------------------------ */
function PhotoPicker({ label, photos, onChange, max = 6, error, hint }) {
  const [uploading, setUploading] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [libraryOpen, setLibraryOpen] = useState(false)
  const fileRef = useRef(null)
  const full = photos.length >= max
  // Stable : la bibliothèque ne doit pas reprendre le focus à chaque rendu
  const closeLibrary = useCallback(() => setLibraryOpen(false), [])

  const upload = async (event) => {
    const files = [...event.target.files].slice(0, max - photos.length)
    event.target.value = ''
    if (!files.length) return
    setUploadError('')
    setUploading(files.length)
    const added = []
    for (const file of files) {
      try {
        added.push(await adminUploadPhoto(file))
      } catch (err) {
        setUploadError(`${file.name}: ${err.message}`)
      }
      setUploading((n) => n - 1)
    }
    if (added.length) onChange([...photos, ...added])
  }

  return (
    <fieldset>
      <legend className="mb-2 text-sm text-slate-700">{label}</legend>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {photos.map((path, i) => (
          <li key={`${path}-${i}`} className="relative overflow-hidden rounded-xl bg-slate-100">
            <img src={assetUrl(path)} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
            {max > 1 && i === 0 && (
              <span className="absolute left-2 top-2 rounded-full bg-slate-900/70 px-2 py-0.5 text-xs text-white">1st</span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-slate-950/70 to-transparent p-1.5">
              {max > 1 && (
                <>
                  <button type="button" onClick={() => onChange(move(photos, i, i - 1))} disabled={i === 0} aria-label={`Move photo ${i + 1} left`} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-800 hover:bg-white disabled:opacity-30">
                    <ArrowLeft size={15} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => onChange(move(photos, i, i + 1))} disabled={i === photos.length - 1} aria-label={`Move photo ${i + 1} right`} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-800 hover:bg-white disabled:opacity-30">
                    <ArrowRight size={15} aria-hidden="true" />
                  </button>
                </>
              )}
              <button type="button" onClick={() => onChange(photos.filter((_, n) => n !== i))} aria-label={`Remove photo ${i + 1}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-700 hover:bg-white">
                <Trash size={15} aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
        {Array.from({ length: uploading }, (_, n) => (
          <li key={`uploading-${n}`} className="flex aspect-[4/3] items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <LoaderCircle size={22} className="animate-spin" aria-label="Uploading" />
          </li>
        ))}
      </ul>

      {!full && (
        <div className={`flex flex-wrap gap-2 ${photos.length || uploading ? 'mt-3' : ''}`}>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple={max > 1} onChange={upload} className="sr-only" tabIndex={-1} aria-hidden="true" />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading > 0} className={BTN_GHOST}>
            <ImagePlus size={16} aria-hidden="true" /> Upload
          </button>
          <button type="button" onClick={() => setLibraryOpen(true)} className={BTN_GHOST}>
            <Images size={16} aria-hidden="true" /> From library
          </button>
        </div>
      )}
      {hint && !error && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
      {(error || uploadError) && <p role="alert" className="mt-2 text-sm text-red-700">{error || uploadError}</p>}

      {libraryOpen && (
        <PhotoLibrary
          selected={photos}
          max={max}
          onClose={closeLibrary}
          onConfirm={(picked) => {
            onChange([...photos, ...picked])
            setLibraryOpen(false)
          }}
        />
      )}
    </fieldset>
  )
}

export default PhotoPicker
