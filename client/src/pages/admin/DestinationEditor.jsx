// /admin/destinations/new et /admin/destinations/:slug : création et modification d'une destination,
// de ses choses à faire et de ses lieux à visiter (chacun a sa page).
// En anglais : tous les champs, les photos et la structure. Dans une autre langue : seulement les textes,
// alignés sur l'anglais (un champ vide s'affiche en anglais sur le site).
import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, Plus, Save, Trash } from 'lucide-react'
import { adminCreateDestination, adminFetchDestination, adminUpdateDestination } from '../../api'
import Field from '../../components/admin/Field'
import ListEditor from '../../components/admin/ListEditor'
import PhotoPicker from '../../components/admin/PhotoPicker'
import { BTN_GHOST, BTN_GOLD, CARD, CARD_TITLE, ICON_BTN, INPUT, TEXTAREA, move } from '../../components/admin/ui'
import { TEXT_LANGUAGES } from './textFiles'

const emptyDestination = () => ({
  slug: '', name: '', region: '', tagline: '', best: '', stay: '', getting: '', tip: '',
  intro: [''], image: '', todo: [], visit: [], isPublished: false, sortOrder: 0, translations: {},
})
const emptyTodo = () => ({ title: '', text: '', image: '' })
const emptyPlace = () => ({
  name: '', text: '', image: '', price: '', rating: '', reviews: '', duration: '', groupSize: '', tourType: '', language: '',
  overview: [''], highlights: [''], included: [], excluded: [], details: [], does: [],
})

// Champs des lieux, dans l'ordre du formulaire
const PLACE_TEXTS = [
  { key: 'duration', label: 'Duration', placeholder: 'Half day to 1 day' },
  { key: 'groupSize', label: 'Group size', placeholder: 'Up to 8 guests' },
  { key: 'tourType', label: 'Tour type', placeholder: 'Countryside tour' },
  { key: 'language', label: 'Languages', placeholder: 'Empty: the default text of the page' },
]
const PLACE_LISTS = [
  { key: 'overview', label: 'Overview paragraphs', multiline: true, max: 8 },
  { key: 'highlights', label: 'Highlights', max: 12 },
  { key: 'included', label: 'Price includes', max: 15 },
  { key: 'excluded', label: 'Price excludes', max: 15 },
  { key: 'details', label: 'Short paragraphs (used when there is no overview)', multiline: true, max: 8 },
  { key: 'does', label: 'Things to do there (used when there are no highlights)', max: 10 },
]

const slugify = (text) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const getIn = (node, path) => path.reduce((n, k) => (n == null ? undefined : n[k]), node)
// Copie avec une valeur posée à un chemin : un index crée une liste
function setIn(node, [key, ...rest], value) {
  const base = node ?? (typeof key === 'number' ? [] : {})
  const copy = Array.isArray(base) ? [...base] : { ...base }
  copy[key] = rest.length ? setIn(copy[key], rest, value) : value
  return copy
}

const snapshot = (form) => JSON.stringify(form)

function DestinationEditor() {
  const { slug } = useParams()
  const isNew = !slug
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState(() => (isNew ? emptyDestination() : null))
  const [saved, setSaved] = useState(() => (isNew ? null : ''))
  const [lang, setLang] = useState('en')
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [loadError, setLoadError] = useState('')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // 'idle' | 'saving' | 'error'
  const [message, setMessage] = useState(location.state?.notice || '')
  const topRef = useRef(null)

  // Le message a été lu : on l'efface de l'historique pour qu'il ne revienne pas au rafraîchissement
  useEffect(() => {
    if (location.state?.notice) navigate(location.pathname, { replace: true, state: null })
  }, [location, navigate])

  useEffect(() => {
    if (isNew) return undefined
    let cancelled = false
    adminFetchDestination(slug)
      .then(({ destination }) => {
        if (cancelled) return
        const loaded = { ...emptyDestination(), ...destination }
        delete loaded.updatedAt
        // Nombres vides : champ vide dans le formulaire
        loaded.visit = loaded.visit.map((p) => ({ ...emptyPlace(), ...p, price: p.price ?? '', rating: p.rating ?? '', reviews: p.reviews ?? '' }))
        setForm(loaded)
        setSaved(snapshot(loaded))
      })
      .catch((err) => !cancelled && setLoadError(err.status === 404 ? 'This destination does not exist (any more).' : err.message))
    return () => {
      cancelled = true
    }
  }, [slug, isNew])

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

  if (loadError) {
    return (
      <div className={`${CARD} text-center`}>
        <p role="alert" className="text-slate-700">{loadError}</p>
        <Link to="/admin/destinations" className={`mt-4 ${BTN_GHOST}`}>Back to destinations</Link>
      </div>
    )
  }
  if (!form) return <p role="status" className="text-slate-600">Loading…</p>

  const english = lang === 'en'
  const err = (path) => errors[path.join('.')]

  // Valeur d'un champ : l'anglais, ou la traduction de la langue choisie
  const value = (path) => (english ? getIn(form, path) : getIn(form.translations?.[lang], path)) ?? ''
  const set = (path, v) =>
    setForm((f) => (english ? setIn(f, path, v) : { ...f, translations: setIn(f.translations || {}, [lang, ...path], v) }))

  // Choses à faire et lieux : la même opération sur l'anglais et sur chaque traduction, pour garder l'alignement
  const reshape = (key, operation) =>
    setForm((f) => {
      const translations = { ...(f.translations || {}) }
      for (const code of Object.keys(translations)) {
        if (!Array.isArray(translations[code]?.[key])) continue
        const padded = Array.from({ length: f[key].length }, (_, i) => translations[code][key][i] ?? {})
        translations[code] = { ...translations[code], [key]: operation(padded, {}) }
      }
      return { ...f, [key]: operation(f[key], key === 'todo' ? emptyTodo() : emptyPlace()), translations }
    })
  const addItem = (key) => reshape(key, (list, blank) => [...list, blank])
  const removeItem = (key, i) => reshape(key, (list) => list.filter((_, n) => n !== i))
  const moveItem = (key, i, to) => reshape(key, (list) => move(list, i, to))

  // Champ texte ; dans une autre langue, l'anglais en gris
  const text = (path, label, { rows, placeholder, hint, required } = {}) => {
    const englishText = getIn(form, path) || ''
    const props = {
      value: value(path),
      onChange: (e) => {
        set(path, e.target.value)
        if (english && path.length === 1 && path[0] === 'name' && !slugTouched) set(['slug'], slugify(e.target.value))
      },
      placeholder: english ? placeholder : englishText,
    }
    return (
      <Field
        label={`${label}${english && required ? '' : english ? ' (optional)' : ''}`}
        error={err(path)}
        hint={english ? hint : englishText ? 'Empty: shown in English.' : 'Fill the English version first.'}
        className={rows ? 'sm:col-span-2' : ''}
      >
        {(p) => (rows ? <textarea {...p} {...props} rows={rows} className={TEXTAREA} /> : <input {...p} {...props} className={INPUT} />)}
      </Field>
    )
  }

  // Liste de lignes : en anglais, ajouter / déplacer / supprimer ; ailleurs, une traduction par ligne anglaise
  const lines = (path, label, { multiline, max = 12 } = {}) => {
    const englishLines = getIn(form, path) || []
    if (english) {
      return (
        <div className="sm:col-span-2">
          <ListEditor label={label} items={englishLines} onChange={(v) => set(path, v)} max={max} multiline={multiline} error={err(path)} />
        </div>
      )
    }
    if (!englishLines.some(Boolean)) return null
    const translated = value(path) || []
    return (
      <fieldset className="sm:col-span-2">
        <legend className="mb-2 text-sm text-slate-700">{label}</legend>
        <ol className="flex flex-col gap-2">
          {englishLines.map((line, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-2.5 w-6 shrink-0 text-right text-sm text-slate-400">{i + 1}.</span>
              {multiline ? (
                <textarea rows={3} value={translated[i] || ''} onChange={(e) => set([...path, i], e.target.value)} placeholder={line} aria-label={`${label}, line ${i + 1}`} className={TEXTAREA} />
              ) : (
                <input value={translated[i] || ''} onChange={(e) => set([...path, i], e.target.value)} placeholder={line} aria-label={`${label}, line ${i + 1}`} className={INPUT} />
              )}
            </li>
          ))}
        </ol>
      </fieldset>
    )
  }

  const number = (path, label, { min, max, step }) => (
    <Field label={`${label} (optional)`} error={err(path)}>
      {(p) => <input {...p} type="number" min={min} max={max} step={step} value={getIn(form, path) ?? ''} onChange={(e) => set(path, e.target.value)} className={INPUT} />}
    </Field>
  )

  const photo = (path, label) => (
    <PhotoPicker label={label} photos={getIn(form, path) ? [getIn(form, path)] : []} max={1} error={err(path)} onChange={(list) => set(path, list[0] || '')} />
  )

  // Boutons d'un élément de liste (chose à faire, lieu) : seulement en anglais.
  // preventDefault : dans l'en-tête d'un lieu, le clic n'ouvre ni ne ferme le bloc
  const tool = (action) => (event) => {
    event.preventDefault()
    action()
  }
  const itemTools = (key, i, total, name) =>
    english && (
      <div className="flex shrink-0 items-center">
        <button type="button" onClick={tool(() => moveItem(key, i, i - 1))} disabled={i === 0} aria-label={`Move "${name}" up`} className={ICON_BTN}><ArrowUp size={16} aria-hidden="true" /></button>
        <button type="button" onClick={tool(() => moveItem(key, i, i + 1))} disabled={i === total - 1} aria-label={`Move "${name}" down`} className={ICON_BTN}><ArrowDown size={16} aria-hidden="true" /></button>
        <button type="button" onClick={tool(() => removeItem(key, i))} aria-label={`Delete "${name}"`} className={`${ICON_BTN} hover:text-red-700`}><Trash size={16} aria-hidden="true" /></button>
      </div>
    )

  const save = async (event) => {
    event.preventDefault()
    setStatus('saving')
    setErrors({})
    setMessage('')
    try {
      const { destination } = isNew ? await adminCreateDestination(form) : await adminUpdateDestination(slug, form)
      const next = { ...form, slug: destination.slug }
      setSaved(snapshot(next))
      setForm(next)
      setStatus('idle')
      if (isNew || destination.slug !== slug) {
        navigate(`/admin/destinations/${destination.slug}`, { replace: true, state: { notice: isNew ? 'Destination created.' : 'Changes saved.' } })
        return
      }
      setMessage('Changes saved.')
    } catch (error) {
      setErrors(error.fields || {})
      // Une erreur dans un champ anglais : on revient à l'anglais pour la voir
      if (error.fields) setLang('en')
      setMessage(error.fields ? `${error.message} The fields to fix are marked in red.` : error.message)
      setStatus('error')
      topRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <form onSubmit={save} noValidate className="pb-28">
      <div ref={topRef} className="scroll-mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link to="/admin/destinations" className="inline-flex items-center gap-1.5 text-sm text-slate-700 hover:underline">
            <ArrowLeft size={15} aria-hidden="true" /> All destinations
          </Link>
          <h2 className="mt-1 truncate text-xl sm:text-2xl font-medium text-forest">{isNew ? 'New destination' : form.name || 'Untitled'}</h2>
        </div>
        {!isNew && (
          <a href={`/destinations/${slug}`} target="_blank" rel="noreferrer" className={BTN_GHOST}>
            <ExternalLink size={15} aria-hidden="true" /> View the page
          </a>
        )}
      </div>

      <nav aria-label="Language" className="mt-5 flex flex-wrap gap-1 self-start rounded-full bg-white p-1 w-fit">
        {TEXT_LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            aria-pressed={l.code === lang}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${l.code === lang ? 'bg-[#084838] text-white' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            {l.code === 'en' ? 'English (main)' : l.label}
          </button>
        ))}
      </nav>
      {!english && (
        <p className="mt-3 text-sm text-slate-600">
          Translation: only the texts. Photos, prices and the list of places are set in English. An empty field is shown in English on the site.
        </p>
      )}

      {message && (
        <p role={status === 'error' ? 'alert' : 'status'} className={`mt-4 rounded-2xl px-5 py-3 text-sm ${status === 'error' ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'}`}>
          {message}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
        <div className="flex flex-col gap-6 min-w-0">
          <section className={CARD} aria-labelledby="dest-general">
            <h3 id="dest-general" className={CARD_TITLE}>General</h3>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {text(['name'], 'Name', { required: true, placeholder: 'Nosy Be' })}
              {english && (
                <Field label="Address of the page" error={errors.slug} hint={`/destinations/${form.slug || '…'}. Changing it breaks the old links.`}>
                  {(p) => (
                    <input
                      {...p}
                      value={form.slug}
                      onChange={(e) => {
                        setSlugTouched(true)
                        set(['slug'], slugify(e.target.value))
                      }}
                      className={INPUT}
                    />
                  )}
                </Field>
              )}
              {text(['region'], 'Region', { required: true, placeholder: 'The North', hint: 'Places of the same region are suggested together.' })}
              {text(['tagline'], 'Tagline', { required: true, placeholder: 'Cocoa valleys and the gateway to Nosy Be' })}
              {text(['best'], 'Best time', { placeholder: 'April to November' })}
              {text(['stay'], 'How long to stay', { placeholder: '1 to 2 nights' })}
              {text(['getting'], 'Getting there', { rows: 3 })}
              {text(['tip'], 'Good to know', { rows: 3 })}
              {lines(['intro'], 'Introduction paragraphs', { multiline: true, max: 8 })}
            </div>
          </section>

          <section className={CARD} aria-labelledby="dest-todo">
            <h3 id="dest-todo" className={CARD_TITLE}>Things to do <span className="text-sm font-normal text-slate-500">({form.todo.length})</span></h3>
            {err(['todo']) && <p className="mt-2 text-sm text-red-700">{err(['todo'])}</p>}
            <ol className="mt-5 flex flex-col gap-4">
              {form.todo.map((item, i) => (
                <li key={i} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{i + 1}. {item.title || 'New item'}</p>
                    {itemTools('todo', i, form.todo.length, item.title || `item ${i + 1}`)}
                  </div>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {text(['todo', i, 'title'], 'Title', { required: true })}
                    {text(['todo', i, 'text'], 'Text', { required: true })}
                    {english && <div className="sm:col-span-2">{photo(['todo', i, 'image'], 'Photo')}</div>}
                  </div>
                </li>
              ))}
            </ol>
            {english && form.todo.length < 12 && (
              <button type="button" onClick={() => addItem('todo')} className={`mt-4 ${BTN_GHOST}`}><Plus size={16} aria-hidden="true" /> Add a thing to do</button>
            )}
          </section>

          <section className={CARD} aria-labelledby="dest-places">
            <h3 id="dest-places" className={CARD_TITLE}>Places to visit <span className="text-sm font-normal text-slate-500">({form.visit.length})</span></h3>
            <p className="mt-1 text-sm text-slate-600">Each place has its own page: /destinations/{form.slug || '…'}/name-of-the-place (from the English name).</p>
            {err(['visit']) && <p className="mt-2 text-sm text-red-700">{err(['visit'])}</p>}
            <ol className="mt-5 flex flex-col gap-4">
              {form.visit.map((place, i) => (
                <li key={i}>
                  <details open={!place.name || Object.keys(errors).some((k) => k.startsWith(`visit.${i}.`))} className="rounded-2xl border border-slate-200 p-4">
                    <summary className="flex cursor-pointer select-none items-center justify-between gap-3">
                      <span className="font-medium text-slate-900">{i + 1}. {place.name || 'New place'}</span>
                      {itemTools('visit', i, form.visit.length, place.name || `place ${i + 1}`)}
                    </summary>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {text(['visit', i, 'name'], 'Name', { required: true })}
                      {text(['visit', i, 'text'], 'Short description', { required: true })}
                      {english && <div className="sm:col-span-2">{photo(['visit', i, 'image'], 'Photo')}</div>}
                      {english && number(['visit', i, 'price'], 'Price from (€ per person)', { min: 0, max: 100000, step: 1 })}
                      {english && number(['visit', i, 'rating'], 'Rating (out of 5)', { min: 0, max: 5, step: 0.1 })}
                      {english && number(['visit', i, 'reviews'], 'Number of reviews', { min: 0, max: 1000000, step: 1 })}
                      {PLACE_TEXTS.map((f) => <React.Fragment key={f.key}>{text(['visit', i, f.key], f.label, { placeholder: f.placeholder })}</React.Fragment>)}
                      {PLACE_LISTS.map((f) => <React.Fragment key={f.key}>{lines(['visit', i, f.key], f.label, f)}</React.Fragment>)}
                    </div>
                  </details>
                </li>
              ))}
            </ol>
            {english && form.visit.length < 12 && (
              <button type="button" onClick={() => addItem('visit')} className={`mt-4 ${BTN_GHOST}`}><Plus size={16} aria-hidden="true" /> Add a place</button>
            )}
          </section>
        </div>

        {/* Colonne de droite : publication et photo principale */}
        <div className="flex flex-col gap-6 xl:sticky xl:top-6">
          <section className={CARD} aria-labelledby="dest-publish">
            <h3 id="dest-publish" className={CARD_TITLE}>Publication</h3>
            <label className="mt-4 flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} className="mt-1 h-5 w-5 accent-[#C49849]" />
              <span>
                <span className="block text-sm font-medium text-slate-900">Visible on the site</span>
                <span className="block text-xs text-slate-500">Unchecked: the page says the destination is coming soon.</span>
              </span>
            </label>
          </section>

          <section className={CARD} aria-labelledby="dest-photo">
            <h3 id="dest-photo" className={CARD_TITLE}>Main photo</h3>
            <div className="mt-5">{photo(['image'], 'Photo')}</div>
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
            <Link to="/admin/destinations" className={BTN_GHOST}>Close</Link>
            <button type="submit" disabled={status === 'saving' || (!dirty && !isNew)} className={BTN_GOLD}>
              <Save size={16} aria-hidden="true" /> {isNew ? 'Create' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default DestinationEditor
