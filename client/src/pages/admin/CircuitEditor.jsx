// /admin/circuits/new et /admin/circuits/:slug : création et modification d'un circuit
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowUp, ChevronRight, Copy, ExternalLink, Plus, Save, Trash } from 'lucide-react'
import { adminCreateCircuit, adminFetchCircuit, adminFetchCircuits, adminUpdateCircuit } from '../../api'
import Field from '../../components/admin/Field'
import ListEditor from '../../components/admin/ListEditor'
import PhotoPicker from '../../components/admin/PhotoPicker'
import TranslationsEditor, { TRANSLATION_LANGUAGES } from '../../components/admin/TranslationsEditor'
import { BTN_GHOST, BTN_GOLD, CARD, CARD_TITLE, ICON_BTN, INPUT, TEXTAREA, move } from '../../components/admin/ui'

const LEVELS = ['Easy', 'Moderate', 'Active']

// Ce que comprennent la plupart des circuits : point de départ d'un nouveau circuit
const DEFAULT_INCLUDED = [
  'Private vehicle with an experienced driver',
  'English or French speaking local guide',
  'National park entrance fees and local guides',
  'Accommodation in double room',
]
const DEFAULT_EXCLUDED = ['International flights and visa', 'Travel insurance', 'Drinks and personal expenses', 'Tips for guides and drivers']

// Clé locale pour suivre chaque jour quand on les déplace (jamais envoyée au serveur)
let nextKey = 1
const withKey = (day) => ({ ...day, _key: nextKey++ })
const newDay = (n) => withKey({ day: `Day ${n}`, title: '', text: '', stay: '', meals: '', images: [] })

const EMPTY = {
  slug: '', title: '', region: '', level: 'Easy', days: 7, price: 1000, stops: '', summary: '',
  groupSize: '2 to 8 travellers', tourType: '', start: '', end: '', bestTime: '', tip: '',
  image: '', gallery: [], overview: [''], highlights: [''], included: DEFAULT_INCLUDED, excluded: DEFAULT_EXCLUDED,
  sortOrder: 0, isPublished: false, itinerary: [], translations: {},
}

// "Nosy Be & Nosy Iranja" -> "nosy-be-nosy-iranja"
const slugify = (text) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120)

// Ce qui part vers l'API : sans les clés locales, nombres convertis.
// Les traductions des jours voyagent avec chaque jour dans le formulaire (elles suivent ses
// déplacements) ; l'API les attend dans translations.<langue>.itinerary, dans l'ordre des jours.
function toPayload(form) {
  const translations = {}
  for (const { code } of TRANSLATION_LANGUAGES) {
    translations[code] = { ...form.translations?.[code], itinerary: form.itinerary.map((day) => day.tr?.[code] || {}) }
  }
  return {
    ...form,
    days: Number(form.days),
    price: Number(form.price),
    sortOrder: Number(form.sortOrder) || 0,
    translations,
    itinerary: form.itinerary.map((day) => {
      const copy = { ...day }
      delete copy._key
      delete copy.tr
      return copy
    }),
  }
}

// Réponse de l'API → formulaire : traductions des jours rangées dans chaque jour
function fromCircuit(circuit) {
  const translations = {}
  for (const { code } of TRANSLATION_LANGUAGES) {
    const { itinerary: _days, ...rest } = circuit.translations?.[code] || {}
    translations[code] = rest
  }
  return {
    ...EMPTY,
    ...circuit,
    translations,
    itinerary: circuit.itinerary.map((day, i) => {
      const tr = {}
      for (const { code } of TRANSLATION_LANGUAGES) tr[code] = circuit.translations?.[code]?.itinerary?.[i] || {}
      return withKey({ ...day, tr })
    }),
    overview: circuit.overview.length ? circuit.overview : [''],
    highlights: circuit.highlights.length ? circuit.highlights : [''],
  }
}

const snapshot = (form) => JSON.stringify(toPayload(form))

/* ============================================================
   UN JOUR DE L'ITINÉRAIRE
============================================================ */
function DayEditor({ day, index, count, open, errors, onToggle, onChange, onMove, onDuplicate, onDelete }) {
  const err = (key) => errors[`itinerary[${index}].${key}`]
  const set = (key) => (e) => onChange({ ...day, [key]: e.target.value })
  const hasError = ['day', 'title', 'text', 'images'].some(err)
  const panelId = `day-editor-${day._key}`

  return (
    <li className={`rounded-2xl border ${hasError ? 'border-red-300' : 'border-slate-200'} bg-white`}>
      <div className="flex items-center gap-2 p-2 sm:p-3">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-1.5 text-left hover:bg-slate-50"
        >
          <ChevronRight size={18} aria-hidden="true" className={`shrink-0 text-slate-500 transition-transform ${open ? 'rotate-90' : ''}`} />
          <span className="shrink-0 rounded-full bg-[#D5E8E2] px-3 py-1 text-xs font-medium text-slate-800">{day.day || `#${index + 1}`}</span>
          <span className={`truncate text-sm sm:text-base ${day.title ? 'text-slate-900' : 'italic text-slate-400'}`}>{day.title || 'Untitled day'}</span>
          {hasError && <span className="shrink-0 text-xs font-medium text-red-700">To fix</span>}
        </button>
        <div className="flex shrink-0 items-center">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Move ${day.day} up`} className={ICON_BTN}><ArrowUp size={16} aria-hidden="true" /></button>
          <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} aria-label={`Move ${day.day} down`} className={ICON_BTN}><ArrowDown size={16} aria-hidden="true" /></button>
          <button type="button" onClick={onDuplicate} aria-label={`Duplicate ${day.day}`} className={ICON_BTN}><Copy size={16} aria-hidden="true" /></button>
          <button type="button" onClick={onDelete} aria-label={`Delete ${day.day}`} className={`${ICON_BTN} hover:text-red-700`}><Trash size={16} aria-hidden="true" /></button>
        </div>
      </div>

      {open && (
        <div id={panelId} className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 border-t border-slate-100 p-4 sm:p-5">
          <Field label="Label" error={err('day')} hint='e.g. "Day 3" or "Days 4 – 5"'>
            {(props) => <input {...props} value={day.day} onChange={set('day')} className={INPUT} />}
          </Field>
          <Field label="Title" error={err('title')}>
            {(props) => <input {...props} value={day.title} onChange={set('title')} className={INPUT} />}
          </Field>
          <Field label="Description" error={err('text')} className="sm:col-span-2">
            {(props) => <textarea {...props} rows={4} value={day.text} onChange={set('text')} className={TEXTAREA} />}
          </Field>
          <Field label="Night in" hint="Leave empty for the last day">
            {(props) => <input {...props} value={day.stay ?? ''} onChange={set('stay')} placeholder="Antananarivo" className={INPUT} />}
          </Field>
          <Field label="Meals">
            {(props) => <input {...props} value={day.meals ?? ''} onChange={set('meals')} placeholder="Breakfast, lunch" className={INPUT} />}
          </Field>
          <div className="sm:col-span-2">
            <PhotoPicker
              label="Photos of the day (3 recommended)"
              photos={day.images}
              max={6}
              error={err('images')}
              onChange={(images) => onChange({ ...day, images })}
            />
          </div>
        </div>
      )}
    </li>
  )
}

/* ============================================================
   ÉDITEUR
============================================================ */
function CircuitEditor() {
  const { slug } = useParams()
  const isNew = !slug
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState(() => (isNew ? { ...EMPTY, itinerary: [newDay(1)] } : null))
  const [saved, setSaved] = useState(() => (isNew ? null : ''))
  const [loadError, setLoadError] = useState('')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // 'idle' | 'saving' | 'error'
  // Message transmis après la création (la page change d'adresse)
  const [message, setMessage] = useState(location.state?.notice || '')
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [openDays, setOpenDays] = useState(() => new Set())
  const [regions, setRegions] = useState([])
  const topRef = useRef(null)

  // Le message a été lu : on l'efface de l'historique pour qu'il ne revienne pas au rafraîchissement
  useEffect(() => {
    if (location.state?.notice) navigate(location.pathname, { replace: true, state: null })
  }, [location, navigate])

  // Le circuit à modifier
  useEffect(() => {
    if (isNew) return undefined
    let cancelled = false
    adminFetchCircuit(slug)
      .then(({ circuit }) => {
        if (cancelled) return
        const loaded = fromCircuit(circuit)
        setForm(loaded)
        setSaved(snapshot(loaded))
      })
      .catch((err) => !cancelled && setLoadError(err.status === 404 ? 'This circuit does not exist (any more).' : err.message))
    return () => {
      cancelled = true
    }
  }, [slug, isNew])

  // Régions déjà utilisées, proposées dans le champ "Region"
  useEffect(() => {
    adminFetchCircuits()
      .then(({ circuits }) => setRegions([...new Set(circuits.map((c) => c.region))]))
      .catch(() => {})
  }, [])

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

  // Jours avec une erreur : ouverts pour la montrer
  const errorDays = useMemo(() => {
    const keys = new Set()
    if (!form) return keys
    for (const field of Object.keys(errors)) {
      const match = field.match(/^itinerary\[(\d+)\]/)
      if (match && form.itinerary[match[1]]) keys.add(form.itinerary[match[1]]._key)
    }
    return keys
  }, [errors, form])

  if (loadError) {
    return (
      <div className={`${CARD} text-center`}>
        <p role="alert" className="text-slate-700">{loadError}</p>
        <Link to="/admin/circuits" className={`mt-4 ${BTN_GHOST}`}>Back to circuits</Link>
      </div>
    )
  }
  if (!form) return <p role="status" className="text-slate-600">Loading the circuit…</p>

  const err = (key) => errors[key]
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))
  const setInput = (key) => (e) => set(key)(e.target.value)

  const setTitle = (e) => {
    const title = e.target.value
    setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }))
  }

  const setDays = (itinerary) => setForm((f) => ({ ...f, itinerary }))
  const toggleDay = (key) => {
    const next = new Set(openDays)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setOpenDays(next)
  }
  const addDay = () => {
    const day = newDay(form.itinerary.length + 1)
    setDays([...form.itinerary, day])
    setOpenDays(new Set(openDays).add(day._key))
  }

  const save = async (event) => {
    event.preventDefault()
    setStatus('saving')
    setErrors({})
    setMessage('')
    try {
      const payload = toPayload(form)
      const { circuit } = isNew ? await adminCreateCircuit(payload) : await adminUpdateCircuit(slug, payload)
      setSaved(snapshot(form))
      setStatus('idle')
      if (isNew) {
        // Nouvelle page (/admin/circuits/:slug) : le message passe par l'historique
        navigate(`/admin/circuits/${circuit.slug}`, { replace: true, state: { notice: 'Circuit created.' } })
        return
      }
      setMessage('Changes saved.')
      // Slug modifié : l'adresse de la page suit
      if (circuit.slug !== slug) navigate(`/admin/circuits/${circuit.slug}`, { replace: true })
    } catch (err) {
      setErrors(err.fields || {})
      setMessage(err.fields ? `${err.message} The fields to fix are marked in red.` : err.message)
      setStatus('error')
      topRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const publicUrl = `/circuits/${form.slug}`

  return (
    <form onSubmit={save} noValidate className="pb-28">
      <div ref={topRef} className="scroll-mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link to="/admin/circuits" className="inline-flex items-center gap-1.5 text-sm text-slate-700 hover:underline">
            <ArrowLeft size={15} aria-hidden="true" /> All circuits
          </Link>
          <h2 className="mt-1 truncate text-xl sm:text-2xl font-medium text-forest">{isNew ? 'New circuit' : form.title || 'Untitled circuit'}</h2>
        </div>
        {!isNew && saved && JSON.parse(saved).isPublished && (
          <a href={`/circuits/${slug}`} target="_blank" rel="noreferrer" className={BTN_GHOST}>
            <ExternalLink size={15} aria-hidden="true" /> View on the site
          </a>
        )}
      </div>

      {message && (
        <p role={status === 'error' ? 'alert' : 'status'} className={`mt-4 rounded-2xl px-5 py-3 text-sm ${status === 'error' ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'}`}>
          {message}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
        <div className="flex flex-col gap-6 min-w-0">
          {/* Général */}
          <section className={CARD} aria-labelledby="general-title">
            <h3 id="general-title" className={CARD_TITLE}>General</h3>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Title" error={err('title')} className="sm:col-span-2">
                {(props) => <input {...props} value={form.title} onChange={setTitle} className={INPUT} />}
              </Field>
              <Field label="Address on the site" error={err('slug')} hint={`noziwild.com${publicUrl}`} className="sm:col-span-2">
                {(props) => (
                  <input
                    {...props}
                    value={form.slug}
                    onChange={(e) => {
                      setSlugTouched(true)
                      set('slug')(slugify(e.target.value))
                    }}
                    className={INPUT}
                  />
                )}
              </Field>
              <Field label="Region" error={err('region')} hint="Pick one or type a new one">
                {(props) => (
                  <>
                    <input {...props} list="region-options" value={form.region} onChange={setInput('region')} className={INPUT} />
                    <datalist id="region-options">
                      {regions.map((r) => <option key={r} value={r} />)}
                    </datalist>
                  </>
                )}
              </Field>
              <Field label="Level" error={err('level')}>
                {(props) => (
                  <select {...props} value={form.level} onChange={setInput('level')} className={INPUT}>
                    {[...new Set([...LEVELS, form.level])].map((l) => <option key={l}>{l}</option>)}
                  </select>
                )}
              </Field>
              <Field label="Number of days" error={err('days')}>
                {(props) => <input {...props} type="number" min={1} max={60} value={form.days} onChange={setInput('days')} className={INPUT} />}
              </Field>
              <Field label="Price from (€ per person)" error={err('price')}>
                {(props) => <input {...props} type="number" min={0} step={10} value={form.price} onChange={setInput('price')} className={INPUT} />}
              </Field>
            </div>
          </section>

          {/* Présentation */}
          <section className={CARD} aria-labelledby="presentation-title">
            <h3 id="presentation-title" className={CARD_TITLE}>Presentation</h3>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Summary (one sentence under the title)" error={err('summary')} className="sm:col-span-2">
                {(props) => <textarea {...props} rows={2} value={form.summary} onChange={setInput('summary')} className={TEXTAREA} />}
              </Field>
              <Field label="Main stops" error={err('stops')} hint="Separated by « · », e.g. Diego Suarez · Ramena · Emerald Sea" className="sm:col-span-2">
                {(props) => <input {...props} value={form.stops} onChange={setInput('stops')} className={INPUT} />}
              </Field>
              <Field label="Starting location" error={err('start')}>
                {(props) => <input {...props} value={form.start} onChange={setInput('start')} className={INPUT} />}
              </Field>
              <Field label="Arrive back at" error={err('end')}>
                {(props) => <input {...props} value={form.end} onChange={setInput('end')} className={INPUT} />}
              </Field>
              <Field label="Group size" error={err('groupSize')}>
                {(props) => <input {...props} value={form.groupSize ?? ''} onChange={setInput('groupSize')} className={INPUT} />}
              </Field>
              <Field label="Tour type" error={err('tourType')}>
                {(props) => <input {...props} value={form.tourType ?? ''} onChange={setInput('tourType')} placeholder="Beach & nature" className={INPUT} />}
              </Field>
              <Field label="Best time" error={err('bestTime')}>
                {(props) => <input {...props} value={form.bestTime ?? ''} onChange={setInput('bestTime')} placeholder="April to December" className={INPUT} />}
              </Field>
              <Field label="Good to know" error={err('tip')} className="sm:col-span-2">
                {(props) => <textarea {...props} rows={3} value={form.tip ?? ''} onChange={setInput('tip')} className={TEXTAREA} />}
              </Field>
              <div className="sm:col-span-2">
                <ListEditor label="Overview paragraphs" items={form.overview} onChange={set('overview')} max={10} multiline error={err('overview')} addLabel="Add a paragraph" />
              </div>
            </div>
          </section>

          {/* Listes */}
          <section className={CARD} aria-labelledby="lists-title">
            <h3 id="lists-title" className={CARD_TITLE}>Highlights and price</h3>
            <div className="mt-5 flex flex-col gap-6">
              <ListEditor label="Highlights" items={form.highlights} onChange={set('highlights')} error={err('highlights')} addLabel="Add a highlight" />
              <ListEditor label="Price includes" items={form.included} onChange={set('included')} max={30} error={err('included')} />
              <ListEditor label="Price excludes" items={form.excluded} onChange={set('excluded')} max={30} error={err('excluded')} />
            </div>
          </section>

          {/* Itinéraire */}
          <section className={CARD} aria-labelledby="itinerary-title">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 id="itinerary-title" className={CARD_TITLE}>Itinerary</h3>
                <p className="text-sm text-slate-500">{form.itinerary.length} step{form.itinerary.length > 1 ? 's' : ''} · click a day to edit it</p>
              </div>
              <button
                type="button"
                onClick={() => setOpenDays(openDays.size ? new Set() : new Set(form.itinerary.map((d) => d._key)))}
                className="text-sm font-medium text-[#a9813a] hover:underline"
              >
                {openDays.size ? 'Collapse all' : 'Expand all'}
              </button>
            </div>
            {err('itinerary') && <p className="mt-2 text-sm text-red-700">{err('itinerary')}</p>}

            <ol className="mt-5 flex flex-col gap-3">
              {form.itinerary.map((day, i) => (
                <DayEditor
                  key={day._key}
                  day={day}
                  index={i}
                  count={form.itinerary.length}
                  open={openDays.has(day._key) || errorDays.has(day._key)}
                  errors={errors}
                  onToggle={() => toggleDay(day._key)}
                  onChange={(next) => setDays(form.itinerary.map((d) => (d._key === day._key ? next : d)))}
                  onMove={(delta) => setDays(move(form.itinerary, i, i + delta))}
                  onDuplicate={() => {
                    const copy = withKey({ ...day, _key: undefined, title: `${day.title} (copy)` })
                    const list = [...form.itinerary]
                    list.splice(i + 1, 0, copy)
                    setDays(list)
                    setOpenDays(new Set(openDays).add(copy._key))
                  }}
                  onDelete={() => setDays(form.itinerary.filter((d) => d._key !== day._key))}
                />
              ))}
            </ol>
            <button type="button" onClick={addDay} className={`mt-4 ${BTN_GHOST}`}>
              <Plus size={16} aria-hidden="true" /> Add a day
            </button>
          </section>

          {/* Traductions */}
          <TranslationsEditor form={form} setForm={setForm} />
        </div>

        {/* Colonne de droite : photos et publication */}
        <div className="flex flex-col gap-6 xl:sticky xl:top-6">
          <section className={CARD} aria-labelledby="publish-title">
            <h3 id="publish-title" className={CARD_TITLE}>Publication</h3>
            <label className="mt-4 flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => set('isPublished')(e.target.checked)} className="mt-1 h-5 w-5 accent-[#C49849]" />
              <span>
                <span className="block text-sm font-medium text-slate-900">Visible on the site</span>
                <span className="block text-xs text-slate-500">Unchecked: only admins can see it, here.</span>
              </span>
            </label>
          </section>

          <section className={CARD} aria-labelledby="photos-title">
            <h3 id="photos-title" className={CARD_TITLE}>Photos</h3>
            <div className="mt-5 flex flex-col gap-6">
              <PhotoPicker
                label="Cover (list of circuits)"
                photos={form.image ? [form.image] : []}
                max={1}
                error={err('image')}
                onChange={(list) => set('image')(list[0] || '')}
              />
              <PhotoPicker
                label="Gallery (top of the page, 3 recommended)"
                photos={form.gallery}
                max={6}
                error={err('gallery')}
                hint="The 1st photo is the large one on phones."
                onChange={set('gallery')}
              />
            </div>
          </section>
        </div>
      </div>

      {/* Barre d'enregistrement */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-[90vw] lg:max-w-[95vw] items-center justify-between gap-4 py-3">
          <p className="text-sm text-slate-600" aria-live="polite">
            {status === 'saving' ? 'Saving…' : dirty ? 'Unsaved changes' : isNew ? 'New circuit, not saved yet' : 'All changes saved'}
          </p>
          <div className="flex gap-2">
            <Link to="/admin/circuits" className={BTN_GHOST}>Close</Link>
            <button type="submit" disabled={status === 'saving' || (!dirty && !isNew)} className={BTN_GOLD}>
              <Save size={16} aria-hidden="true" /> {isNew ? 'Create circuit' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default CircuitEditor
