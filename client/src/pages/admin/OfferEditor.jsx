// /admin/offers/:kind/new et /admin/offers/:kind/:id : création et modification d'une offre
import React, { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Save } from 'lucide-react'
import { adminCreateOffer, adminFetchOffer, adminUpdateOffer } from '../../api'
import Field from '../../components/admin/Field'
import ListEditor from '../../components/admin/ListEditor'
import PhotoPicker from '../../components/admin/PhotoPicker'
import TranslationsEditor from '../../components/admin/TranslationsEditor'
import { BTN_GHOST, BTN_GOLD, CARD, CARD_TITLE, INPUT, TEXTAREA } from '../../components/admin/ui'
import { monthName } from '../../utils/format'
import { OFFER_KINDS, translationFields } from './offerKinds'

const newOffer = (kind) => ({
  kind, title: '', text: '', image: '', price: 50, sortOrder: 0, isPublished: false, translations: {},
  ...OFFER_KINDS[kind].empty,
})

// Ce qui part vers l'API : sans les champs en lecture seule, nombres convertis
function toPayload(form) {
  const { id: _id, updatedAt: _updatedAt, ...rest } = form
  const payload = { ...rest, sortOrder: Number(rest.sortOrder) || 0 }
  if (OFFER_KINDS[form.kind].price) payload.price = Number(rest.price)
  if ('hours' in rest) payload.hours = Number(rest.hours)
  return payload
}
const snapshot = (form) => JSON.stringify(toPayload(form))

// Meilleure période : un clic fait passer le mois de « possible » à « bon » puis « idéal »
const SEASON_LEVELS = [
  { label: 'Possible', className: 'bg-[#084838]/10 text-slate-700' },
  { label: 'Good', className: 'bg-[#C49849]/40 text-slate-900' },
  { label: 'Ideal', className: 'bg-[#C49849] text-white' },
]

function MonthsField({ label, value, error, onChange }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm text-slate-700">{label}</legend>
      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
        {value.map((level, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(value.map((v, n) => (n === i ? (v + 1) % 3 : v)))}
            aria-label={`${monthName(i + 1, 'en')}: ${SEASON_LEVELS[level].label}`}
            className={`h-11 rounded-lg text-xs font-medium transition hover:ring-2 hover:ring-slate-700 ${SEASON_LEVELS[level].className}`}
          >
            {monthName(i + 1, 'en', 'short')}
          </button>
        ))}
      </div>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        Click a month to change it:
        {SEASON_LEVELS.map((l) => (
          <span key={l.label} className="flex items-center gap-1.5"><span className={`h-3 w-3 rounded ${l.className}`} />{l.label}</span>
        ))}
      </p>
      {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
    </fieldset>
  )
}

function MultiField({ label, options, value, error, onChange }) {
  const toggle = (v) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm text-slate-700">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm transition ${
              value.includes(o.value) ? 'bg-slate-800 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:border-slate-700'
            }`}
          >
            <input type="checkbox" checked={value.includes(o.value)} onChange={() => toggle(o.value)} className="sr-only" />
            {o.label}
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
    </fieldset>
  )
}

// Un champ propre au type d'offre (voir offerKinds.js)
function KindField({ field, form, error, set }) {
  const value = form[field.key]
  const wide = ['months', 'multi', 'list', 'link'].includes(field.type)
  const className = wide ? 'sm:col-span-2' : ''

  if (field.type === 'months') return <div className={className}><MonthsField label={field.label} value={value} error={error} onChange={set} /></div>
  if (field.type === 'multi') return <div className={className}><MultiField label={field.label} options={field.options} value={value} error={error} onChange={set} /></div>
  if (field.type === 'list') {
    return (
      <div className={className}>
        <ListEditor label={field.label} items={value} onChange={set} max={field.max} error={error} />
      </div>
    )
  }
  return (
    <Field label={field.label} error={error} hint={field.hint} className={className}>
      {(props) =>
        field.type === 'select' ? (
          <select {...props} value={value} onChange={(e) => set(e.target.value)} className={INPUT}>
            {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : field.type === 'hours' ? (
          <input {...props} type="number" min={0.5} max={24} step={0.5} value={value} onChange={(e) => set(e.target.value)} className={INPUT} />
        ) : (
          <input {...props} value={value ?? ''} onChange={(e) => set(e.target.value)} placeholder={field.placeholder} className={INPUT} />
        )
      }
    </Field>
  )
}

function OfferEditor() {
  const { kind, id } = useParams()
  const config = OFFER_KINDS[kind]
  const isNew = !id
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState(() => (isNew && config ? newOffer(kind) : null))
  const [saved, setSaved] = useState(() => (isNew ? null : ''))
  const [loadError, setLoadError] = useState('')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // 'idle' | 'saving' | 'error'
  // Message transmis après la création (la page change d'adresse)
  const [message, setMessage] = useState(location.state?.notice || '')
  const topRef = useRef(null)

  // Le message a été lu : on l'efface de l'historique pour qu'il ne revienne pas au rafraîchissement
  useEffect(() => {
    if (location.state?.notice) navigate(location.pathname, { replace: true, state: null })
  }, [location, navigate])

  // L'offre à modifier
  useEffect(() => {
    if (isNew) return undefined
    let cancelled = false
    adminFetchOffer(id)
      .then(({ offer }) => {
        if (cancelled) return
        // Adresse avec le mauvais type : on remet la bonne
        if (offer.kind !== kind) return navigate(`/admin/offers/${offer.kind}/${offer.id}`, { replace: true })
        const loaded = { ...newOffer(offer.kind), ...offer }
        setForm(loaded)
        setSaved(snapshot(loaded))
      })
      .catch((err) => !cancelled && setLoadError(err.status === 404 ? 'This offer does not exist (any more).' : err.message))
    return () => {
      cancelled = true
    }
  }, [id, isNew, kind, navigate])

  const dirty = form && snapshot(form) !== saved

  // Quitter la page (fermer l'onglet, recharger) avec des modifications non enregistrées
  useEffect(() => {
    if (!dirty) return undefined
    const warn = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  if (!config) return <Navigate to="/admin/offers/activity" replace />
  const backTo = `/admin/offers/${kind}`

  if (loadError) {
    return (
      <div className={`${CARD} text-center`}>
        <p role="alert" className="text-slate-700">{loadError}</p>
        <Link to={backTo} className={`mt-4 ${BTN_GHOST}`}>Back to {config.label.toLowerCase()}</Link>
      </div>
    )
  }
  if (!form) return <p role="status" className="text-slate-600">Loading…</p>

  const err = (key) => errors[key]
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))
  const setInput = (key) => (e) => set(key)(e.target.value)

  const save = async (event) => {
    event.preventDefault()
    setStatus('saving')
    setErrors({})
    setMessage('')
    try {
      const payload = toPayload(form)
      const { offer } = isNew ? await adminCreateOffer(payload) : await adminUpdateOffer(id, payload)
      setSaved(snapshot(form))
      setStatus('idle')
      if (isNew) {
        // Nouvelle page (/admin/offers/:kind/:id) : le message passe par l'historique
        navigate(`${backTo}/${offer.id}`, { replace: true, state: { notice: 'Offer created.' } })
        return
      }
      setMessage('Changes saved.')
    } catch (error) {
      setErrors(error.fields || {})
      setMessage(error.fields ? `${error.message} The fields to fix are marked in red.` : error.message)
      setStatus('error')
      topRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <form onSubmit={save} noValidate className="pb-28">
      <div ref={topRef} className="scroll-mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link to={backTo} className="inline-flex items-center gap-1.5 text-sm text-slate-700 hover:underline">
            <ArrowLeft size={15} aria-hidden="true" /> All {config.label.toLowerCase()}
          </Link>
          <h2 className="mt-1 truncate text-xl sm:text-2xl font-medium text-slate-900">
            {isNew ? `New ${config.singular}` : form.title || 'Untitled'}
          </h2>
        </div>
        <a href={config.page} target="_blank" rel="noreferrer" className={BTN_GHOST}>
          <ExternalLink size={15} aria-hidden="true" /> View the page
        </a>
      </div>

      {message && (
        <p role={status === 'error' ? 'alert' : 'status'} className={`mt-4 rounded-2xl px-5 py-3 text-sm ${status === 'error' ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'}`}>
          {message}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
        <div className="flex flex-col gap-6 min-w-0">
          <section className={CARD} aria-labelledby="offer-general-title">
            <h3 id="offer-general-title" className={CARD_TITLE}>General</h3>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Title" error={err('title')} className="sm:col-span-2">
                {(props) => <input {...props} value={form.title} onChange={setInput('title')} className={INPUT} />}
              </Field>
              <Field label="Description" error={err('text')} className="sm:col-span-2">
                {(props) => <textarea {...props} rows={3} value={form.text} onChange={setInput('text')} className={TEXTAREA} />}
              </Field>
              {config.price && (
                <Field label="Price from (€ per person)" error={err('price')}>
                  {(props) => <input {...props} type="number" min={0} step={5} value={form.price ?? ''} onChange={setInput('price')} className={INPUT} />}
                </Field>
              )}
              {config.fields.map((field) => (
                <KindField key={field.key} field={field} form={form} error={err(field.key)} set={set(field.key)} />
              ))}
            </div>
          </section>

          <TranslationsEditor form={form} setForm={setForm} {...translationFields(kind)} />
        </div>

        {/* Colonne de droite : publication et photo */}
        <div className="flex flex-col gap-6 xl:sticky xl:top-6">
          <section className={CARD} aria-labelledby="offer-publish-title">
            <h3 id="offer-publish-title" className={CARD_TITLE}>Publication</h3>
            <label className="mt-4 flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => set('isPublished')(e.target.checked)} className="mt-1 h-5 w-5 accent-[#C49849]" />
              <span>
                <span className="block text-sm font-medium text-slate-900">Visible on the site</span>
                <span className="block text-xs text-slate-500">Unchecked: only admins can see it, here.</span>
              </span>
            </label>
          </section>

          <section className={CARD} aria-labelledby="offer-photo-title">
            <h3 id="offer-photo-title" className={CARD_TITLE}>Photo</h3>
            <div className="mt-5">
              <PhotoPicker
                label="Photo"
                photos={form.image ? [form.image] : []}
                max={1}
                error={err('image')}
                onChange={(list) => set('image')(list[0] || '')}
              />
            </div>
          </section>
        </div>
      </div>

      {/* Barre d'enregistrement */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-[90vw] lg:max-w-[95vw] items-center justify-between gap-4 py-3">
          <p className="text-sm text-slate-600" aria-live="polite">
            {status === 'saving' ? 'Saving…' : dirty ? 'Unsaved changes' : isNew ? 'Not saved yet' : 'All changes saved'}
          </p>
          <div className="flex gap-2">
            <Link to={backTo} className={BTN_GHOST}>Close</Link>
            <button type="submit" disabled={status === 'saving' || (!dirty && !isNew)} className={BTN_GOLD}>
              <Save size={16} aria-hidden="true" /> {isNew ? 'Create' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default OfferEditor
