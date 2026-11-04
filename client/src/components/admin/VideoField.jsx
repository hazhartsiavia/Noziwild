// Champ vidéo des formulaires de l'admin : envoi avec avancement, bibliothèque, aperçu
import React, { useRef, useState } from 'react'
import { Film, Images, LoaderCircle, Trash } from 'lucide-react'
import { adminFetchPhotos, adminUploadVideo, assetUrl } from '../../api'
import { BTN_GHOST } from './ui'

function VideoField({ label, hint, value, error, onChange }) {
  const [progress, setProgress] = useState(null)
  const [library, setLibrary] = useState(null)
  const [problem, setProblem] = useState('')
  const fileRef = useRef(null)

  const upload = async (event) => {
    const file = event.target.files[0]
    event.target.value = ''
    if (!file) return
    setProblem('')
    setProgress(0)
    try {
      onChange(await adminUploadVideo(file, setProgress))
    } catch (err) {
      setProblem(`${file.name}: ${err.message}`)
    } finally {
      setProgress(null)
    }
  }

  const openLibrary = async () => {
    setProblem('')
    try {
      const { videos } = await adminFetchPhotos()
      setLibrary(videos)
    } catch (err) {
      setProblem(err.message)
    }
  }

  const pick = (event) => {
    if (!event.target.value) return
    onChange(event.target.value)
    setLibrary(null)
  }

  const message = problem || error

  return (
    <div>
      <p className="mb-1.5 text-sm text-slate-700">{label}</p>
      {value && <video src={assetUrl(value)} controls preload="metadata" playsInline className="mb-3 w-full max-w-md aspect-video rounded-xl bg-slate-900 object-contain" />}
      <div className="flex flex-wrap gap-2">
        <input ref={fileRef} type="file" accept="video/mp4,video/webm" onChange={upload} className="sr-only" tabIndex={-1} aria-hidden="true" />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={progress !== null} className={BTN_GHOST}>
          {progress !== null
            ? <><LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> {progress}%</>
            : <><Film size={16} aria-hidden="true" /> {value ? 'Replace video' : 'Upload video'}</>}
        </button>
        <button type="button" onClick={openLibrary} className={BTN_GHOST}>
          <Images size={16} aria-hidden="true" /> From library
        </button>
        {value && (
          <button type="button" onClick={() => onChange('')} className={`${BTN_GHOST} text-red-700`}>
            <Trash size={16} aria-hidden="true" /> Remove
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
      {message
        ? <p role="alert" className="mt-1 text-sm text-red-700">{message}</p>
        : hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

export default VideoField
