// /admin/texts/:namespace?lang=fr : textes d'un fichier du site, dans une langue.
// Un champ par texte, rangés par section. On n'enregistre que ce qui diffère du texte d'origine :
// le site pose ces textes par-dessus ses fichiers (voir LanguageContext, mergeTexts).
import React, { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, RotateCcw, Save, Search } from 'lucide-react'
import { adminFetchTexts, adminSaveTexts } from '../../api'
import { NAMESPACES, loadBaseTexts, mergeTexts } from '../../i18n/LanguageContext'
import { BTN_GHOST, BTN_GOLD, CARD, INPUT, TEXTAREA } from '../../components/admin/ui'
import { TEXT_LANGUAGES, textFile } from './textFiles'

const MAX_LENGTH = 5000

// Chaque texte du fichier : { key: 'hero.title', path: ['hero', 'title'], value }
function flatten(node, path = [], out = []) {
  if (typeof node === 'string') out.push({ key: path.join('.'), path, value: node })
  else if (Array.isArray(node)) node.forEach((item, i) => flatten(item, [...path, i], out))
  else if (node && typeof node === 'object') Object.entries(node).forEach(([k, v]) => flatten(v, [...path, k], out))
  return out
}

const getIn = (node, path) => path.reduce((n, k) => (n == null ? undefined : n[k]), node)

// Pose une valeur à un chemin : un index crée une liste (les places libres restent à null)
function setIn(target, path, value) {
  let node = target
  path.forEach((key, i) => {
    if (i === path.length - 1) {
      node[key] = value
      return
    }
    if (node[key] == null) node[key] = typeof path[i + 1] === 'number' ? [] : {}
    node = node[key]
  })
}

// Les listes ont des trous (éléments non modifiés) : on les remplit de null pour le JSON
const fillHoles = (node) => {
  if (Array.isArray(node)) return Array.from(node, (item) => (item === undefined ? null : fillHoles(item)))
  if (node && typeof node === 'object') return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, fillHoles(v)]))
  return node
}

// hero.ctaTitle → « Cta title » ; faqs.2.q → « 3 › Question »
const WORDS = { q: 'Question', a: 'Answer', cta: 'Button', alt: 'Image description', alts: 'Image descriptions' }
const humanize = (key) => {
  if (typeof key === 'number') return String(key + 1)
  if (WORDS[key]) return WORDS[key]
  const words = key.replace(/([a-z])([A-Z0-9])/g, '$1 $2').toLowerCase()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

// Mots entre accolades remplacés par le site ({name}, {count}...) : ils doivent rester
const tokens = (text) => text.match(/\{\w+\}/g) || []

function TextField({ entry, value, original, english, onChange }) {
  const changed = value !== original
  const long = original.length > 70 || original.includes('\n') || value.length > 70
  const missing = tokens(original).filter((tk) => !value.includes(tk))
  const id = `text-${entry.key}`
  const label = entry.path.length > 1 ? entry.path.slice(1).map(humanize).join(' › ') : humanize(entry.path[0])
  return (
    <div className={`rounded-2xl p-3 sm:p-4 ${changed ? 'bg-amber-50/70 ring-1 ring-amber-200' : ''}`}>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm text-slate-700">
          {label}
          {changed && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Changed</span>}
        </label>
        {changed && (
          <button type="button" onClick={() => onChange(original)} className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline">
            <RotateCcw size={13} aria-hidden="true" /> Back to the original
          </button>
        )}
      </div>
      {long ? (
        <textarea
          id={id}
          rows={Math.min(8, Math.max(2, Math.ceil(Math.max(value.length, original.length) / 80)))}
          value={value}
          maxLength={MAX_LENGTH}
          onChange={(e) => onChange(e.target.value)}
          placeholder={original}
          className={TEXTAREA}
        />
      ) : (
        <input id={id} value={value} maxLength={MAX_LENGTH} onChange={(e) => onChange(e.target.value)} placeholder={original} className={INPUT} />
      )}
      {english !== undefined && english !== value && (
        <p className="mt-1.5 text-xs text-slate-500"><span className="font-medium">English:</span> {english}</p>
      )}
      {missing.length > 0 && (
        <p className="mt-1.5 text-xs text-red-700">
          Keep {missing.join(', ')} as written: the site replaces {missing.length > 1 ? 'these words' : 'this word'} with a name, a number or a link.
        </p>
      )}
    </div>
  )
}

function TextsEditor() {
  const { namespace } = useParams()
  const [params, setParams] = useSearchParams()
  const lang = TEXT_LANGUAGES.some((l) => l.code === params.get('lang')) ? params.get('lang') : 'en'
  const file = textFile(namespace)
  const known = NAMESPACES.includes(namespace)

  const [base, setBase] = useState(null)       // textes d'origine de la langue
  const [english, setEnglish] = useState(null) // textes d'origine en anglais (référence)
  const [values, setValues] = useState(null)   // { 'hero.title': '...' } : textes affichés dans les champs
  const [saved, setSaved] = useState(null)     // même forme, tels qu'enregistrés
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('loading') // 'loading' | 'idle' | 'saving' | 'error'
  const [message, setMessage] = useState('')

  // Textes d'origine (fichiers du site) + textes modifiés (API) de la langue choisie
  useEffect(() => {
    if (!known) return undefined
    let cancelled = false
    setStatus('loading')
    setMessage('')
    Promise.all([loadBaseTexts(lang), loadBaseTexts('en'), adminFetchTexts(namespace)])
      .then(([langTexts, englishTexts, { texts }]) => {
        if (cancelled) return
        // Un texte pas encore traduit s'affiche en anglais sur le site : il apparaît ici avec son texte anglais
        const original = mergeTexts(englishTexts[namespace] || {}, langTexts[namespace])
        const changes = texts[lang] || {}
        const current = Object.fromEntries(
          flatten(original).map((e) => {
            const v = getIn(changes, e.path)
            return [e.key, typeof v === 'string' ? v : e.value]
          }),
        )
        setBase(original)
        setEnglish(englishTexts[namespace] || {})
        setValues(current)
        setSaved(current)
        setStatus('idle')
      })
      .catch((err) => {
        if (cancelled) return
        setMessage(err.message)
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [namespace, lang, known])

  const entries = useMemo(() => (base ? flatten(base) : []), [base])
  const dirty = values && saved && entries.some((e) => values[e.key] !== saved[e.key])
  const changedCount = values ? entries.filter((e) => values[e.key] !== e.value).length : 0

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

  if (!known) return <Navigate to="/admin/texts" replace />

  const pickLang = (code) => {
    if (code === lang) return
    if (dirty && !window.confirm('Your changes in this language are not saved. Leave them?')) return
    setParams({ lang: code })
  }

  // Sections : première partie du chemin (hero, faqs...) ; les textes isolés vont dans « General »
  const q = query.trim().toLowerCase()
  const visible = entries.filter((e) => {
    if (!q) return true
    const englishText = getIn(english, e.path)
    return [e.key, e.value, values?.[e.key], englishText].some((t) => typeof t === 'string' && t.toLowerCase().includes(q))
  })
  const sections = []
  for (const e of visible) {
    const id = e.path.length > 1 ? String(e.path[0]) : ''
    let section = sections.find((s) => s.id === id)
    if (!section) sections.push((section = { id, label: id ? humanize(id) : 'General', entries: [] }))
    section.entries.push(e)
  }
  sections.sort((a, b) => (a.id === '' ? -1 : b.id === '' ? 1 : 0))

  const save = async (event) => {
    event.preventDefault()
    setStatus('saving')
    setMessage('')
    // Seulement les textes différents de l'origine ; un champ vidé revient au texte d'origine
    const changes = {}
    const next = { ...values }
    for (const e of entries) {
      const v = values[e.key]
      if (!v.trim()) next[e.key] = e.value
      else if (v !== e.value) setIn(changes, e.path, v)
    }
    try {
      await adminSaveTexts(namespace, lang, fillHoles(changes))
      setValues(next)
      setSaved(next)
      setStatus('idle')
      setMessage('Changes saved. Reload the page of the site to see them.')
    } catch (err) {
      setStatus('error')
      setMessage(err.fields?.content ? `${err.message} ${err.fields.content}` : err.message)
    }
  }

  const resetAll = () => {
    if (!window.confirm(`Put back all the original ${TEXT_LANGUAGES.find((l) => l.code === lang).label} texts of this page? Click Save to confirm.`)) return
    setValues(Object.fromEntries(entries.map((e) => [e.key, e.value])))
  }

  return (
    <form onSubmit={save} noValidate className="pb-28">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link to="/admin/texts" className="inline-flex items-center gap-1.5 text-sm text-slate-700 hover:underline">
            <ArrowLeft size={15} aria-hidden="true" /> All texts
          </Link>
          <h2 className="mt-1 truncate text-xl sm:text-2xl font-medium text-forest">{file.label}</h2>
        </div>
        <a href={file.page} target="_blank" rel="noreferrer" className={BTN_GHOST}>
          <ExternalLink size={15} aria-hidden="true" /> View the page
        </a>
      </div>

      <div className="mt-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <nav aria-label="Language" className="flex flex-wrap gap-1 self-start rounded-full bg-white p-1">
          {TEXT_LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => pickLang(l.code)}
              aria-pressed={l.code === lang}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${l.code === lang ? 'bg-[#084838] text-white' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              {l.label}
            </button>
          ))}
        </nav>
        <label className="relative block w-full lg:w-80">
          <span className="sr-only">Search the texts</span>
          <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a word or a sentence" className={`${INPUT} pl-10`} />
        </label>
      </div>

      {message && (
        <p role={status === 'error' ? 'alert' : 'status'} className={`mt-4 rounded-2xl px-5 py-3 text-sm ${status === 'error' ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'}`}>
          {message}
        </p>
      )}

      {status === 'loading' && <p role="status" className="mt-6 text-slate-600">Loading…</p>}

      {values && status !== 'loading' && (
        <>
          <p className="mt-5 text-sm text-slate-600">
            {entries.length} texts{changedCount ? ` · ${changedCount} changed from the original` : ''}. Words in braces, like {'{name}'}, are filled in by the site: keep them.
          </p>
          {sections.length === 0 && <p className="mt-6 text-slate-600">No text matches “{query}”.</p>}
          <div className="mt-4 flex flex-col gap-4">
            {sections.map((section) => (
              <details key={section.id || 'general'} open={Boolean(q) || sections.length <= 8} className={CARD}>
                <summary className="cursor-pointer select-none text-lg font-medium text-slate-900">
                  {section.label} <span className="text-sm font-normal text-slate-500">({section.entries.length})</span>
                </summary>
                <div className="mt-4 flex flex-col gap-2">
                  {section.entries.map((e) => (
                    <TextField
                      key={e.key}
                      entry={e}
                      value={values[e.key]}
                      original={e.value}
                      english={lang === 'en' ? undefined : getIn(english, e.path)}
                      onChange={(v) => setValues((current) => ({ ...current, [e.key]: v }))}
                    />
                  ))}
                </div>
              </details>
            ))}
          </div>
        </>
      )}

      {/* Barre d'enregistrement */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-[90vw] lg:max-w-[95vw] items-center justify-between gap-4 py-3">
          <p className="text-sm text-slate-600" aria-live="polite">
            {status === 'saving' ? 'Saving…' : dirty ? 'Unsaved changes' : 'All changes saved'}
          </p>
          <div className="flex gap-2">
            {changedCount > 0 && (
              <button type="button" onClick={resetAll} className={BTN_GHOST}>
                <RotateCcw size={15} aria-hidden="true" /> All original
              </button>
            )}
            <button type="submit" disabled={status === 'saving' || status === 'loading' || !dirty} className={BTN_GOLD}>
              <Save size={16} aria-hidden="true" /> Save
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default TextsEditor
