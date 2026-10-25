// /admin/blog/new et /admin/blog/:slug : écriture d'un article du journal.
// Corps en blocs (intertitre, paragraphe, liste, photo, bandeau d'offre), à ajouter, déplacer ou supprimer.
// En anglais : tous les champs, les photos et la structure. Dans une autre langue : seulement les textes,
// alignés sur l'anglais (un champ vide s'affiche en anglais sur le site).
import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, Heading2, Image, List, Megaphone, Pilcrow, Plus, Save, Trash } from 'lucide-react'
import { adminCreatePost, adminFetchPost, adminUpdatePost } from '../../api'
import Field from '../../components/admin/Field'
import PhotoPicker from '../../components/admin/PhotoPicker'
import { BTN_GHOST, BTN_GOLD, CARD, CARD_TITLE, ICON_BTN, INPUT, TEXTAREA, move } from '../../components/admin/ui'
import { getIn, setIn, slugify } from '../../components/admin/paths'
import { TEXT_LANGUAGES } from './textFiles'

const today = () => new Date().toISOString().slice(0, 10)
const emptyPost = () => ({
  slug: '', title: '', excerpt: '', image: '', date: today(), isFeatured: false, isPublished: false,
  body: [{ type: 'paragraph', text: '' }], translations: {},
})

// Types de blocs : nom, icône, bloc vide
const BLOCKS = {
  heading: { label: 'Heading', icon: Heading2, empty: () => ({ type: 'heading', text: '' }) },
  paragraph: { label: 'Paragraph', icon: Pilcrow, empty: () => ({ type: 'paragraph', text: '' }) },
  list: { label: 'List', icon: List, empty: () => ({ type: 'list', items: [{ lead: '', text: '' }] }) },
  image: { label: 'Photo', icon: Image, empty: () => ({ type: 'image', image: '', caption: '' }) },
  cta: {
    label: 'Offer banner', icon: Megaphone,
    empty: () => ({ type: 'cta', image: '', title: '', subtitle: '', priceLabel: '', button: 'Discover', link: '/circuits' }),
  },
}

const snapshot = (form) => JSON.stringify(form)

function PostEditor() {
  const { slug } = useParams()
  const isNew = !slug
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState(() => (isNew ? emptyPost() : null))
  const [saved, setSaved] = useState(() => (isNew ? null : ''))
  const [lang, setLang] = useState('en')
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [loadError, setLoadError] = useState('')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // 'idle' | 'saving' | 'error'
  const [message, setMessage] = useState(location.state?.notice || '')
  const topRef = useRef(null)

  useEffect(() => {
    if (location.state?.notice) navigate(location.pathname, { replace: true, state: null })
  }, [location, navigate])

  useEffect(() => {
    if (isNew) return undefined
    let cancelled = false
    adminFetchPost(slug)
      .then(({ post }) => {
        if (cancelled) return
        const { minutes: _minutes, updatedAt: _updatedAt, ...loaded } = { ...emptyPost(), ...post }
        setForm(loaded)
        setSaved(snapshot(loaded))
      })
      .catch((err) => !cancelled && setLoadError(err.status === 404 ? 'This article does not exist (any more).' : err.message))
    return () => {
      cancelled = true
    }
  }, [slug, isNew])

  const dirty = form && snapshot(form) !== saved

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
        <Link to="/admin/blog" className={`mt-4 ${BTN_GHOST}`}>Back to the blog</Link>
      </div>
    )
  }
  if (!form) return <p role="status" className="text-slate-600">Loading…</p>

  const english = lang === 'en'
  const err = (path) => errors[path.join('.')]
  const value = (path) => (english ? getIn(form, path) : getIn(form.translations?.[lang], path)) ?? ''
  const set = (path, v) =>
    setForm((f) => (english ? setIn(f, path, v) : { ...f, translations: setIn(f.translations || {}, [lang, ...path], v) }))

  // Liste en anglais (blocs, lignes d'une liste) : la même opération sur chaque traduction, pour garder l'alignement
  const reshape = (path, operation) =>
    setForm((f) => {
      const englishList = getIn(f, path) || []
      let next = setIn(f, path, operation(englishList, true))
      for (const code of Object.keys(f.translations || {})) {
        const list = getIn(f.translations[code], path)
        if (!Array.isArray(list)) continue
        const padded = Array.from({ length: englishList.length }, (_, i) => list[i] ?? {})
        next = { ...next, translations: setIn(next.translations, [code, ...path], operation(padded, false)) }
      }
      return next
    })

  const tool = (action) => (event) => {
    event.preventDefault()
    action()
  }

  // Champ texte ; dans une autre langue, l'anglais en gris
  const text = (path, label, { rows, placeholder, hint, optional } = {}) => {
    const englishText = getIn(form, path) || ''
    const props = {
      value: value(path),
      onChange: (e) => {
        set(path, e.target.value)
        if (english && path.length === 1 && path[0] === 'title' && !slugTouched) set(['slug'], slugify(e.target.value))
      },
      placeholder: english ? placeholder : englishText,
    }
    return (
      <Field
        label={`${label}${english && optional ? ' (optional)' : ''}`}
        error={err(path)}
        hint={english ? hint : englishText ? 'Empty: shown in English.' : 'Fill the English version first.'}
        className={rows ? 'sm:col-span-2' : ''}
      >
        {(p) => (rows ? <textarea {...p} {...props} rows={rows} className={TEXTAREA} /> : <input {...p} {...props} className={INPUT} />)}
      </Field>
    )
  }

  const photo = (path, label) => (
    <PhotoPicker label={label} photos={getIn(form, path) ? [getIn(form, path)] : []} max={1} error={err(path)} onChange={(list) => set(path, list[0] || '')} />
  )

  // Contenu d'un bloc, selon son type
  const blockFields = (block, i) => {
    const at = (key) => ['body', i, key]
    if (block.type === 'heading') return text(at('text'), 'Heading')
    if (block.type === 'paragraph') return text(at('text'), 'Text', { rows: 6, hint: 'An empty line starts a new paragraph.' })
    if (block.type === 'image') {
      return (
        <>
          {english && <div className="sm:col-span-2">{photo(at('image'), 'Photo')}</div>}
          {text(at('caption'), 'Caption', { optional: true })}
        </>
      )
    }
    if (block.type === 'cta') {
      return (
        <>
          {english && <div className="sm:col-span-2">{photo(at('image'), 'Background photo')}</div>}
          {text(at('title'), 'Big title', { placeholder: 'Nosy Be' })}
          {text(at('subtitle'), 'Subtitle', { optional: true, placeholder: '6 nights – 7 days' })}
          {text(at('priceLabel'), 'Price', { optional: true, placeholder: 'From €780 per person' })}
          {text(at('button'), 'Button', { optional: true, placeholder: 'Book now' })}
          {english && (
            <Field label="Button link" error={err(at('link'))} hint="A page of the site (/circuits/..., /destinations/...) or a full address.">
              {(p) => <input {...p} value={block.link || ''} onChange={(e) => set(at('link'), e.target.value)} className={INPUT} />}
            </Field>
          )}
        </>
      )
    }
    // Liste : mot-clé en gras (facultatif) + texte, ligne par ligne
    const items = block.items || []
    return (
      <div className="sm:col-span-2 flex flex-col gap-3">
        {items.map((item, n) => (
          <div key={n} className="grid grid-cols-1 sm:grid-cols-[200px_1fr_auto] gap-2 items-start">
            <input
              value={english ? item.lead || '' : value(['body', i, 'items', n, 'lead'])}
              onChange={(e) => set(['body', i, 'items', n, 'lead'], e.target.value)}
              placeholder={english ? 'Bold words (optional)' : item.lead}
              aria-label={`Line ${n + 1}, bold words`}
              className={INPUT}
            />
            <textarea
              rows={2}
              value={english ? item.text || '' : value(['body', i, 'items', n, 'text'])}
              onChange={(e) => set(['body', i, 'items', n, 'text'], e.target.value)}
              placeholder={english ? 'Text of the line' : item.text}
              aria-label={`Line ${n + 1}, text`}
              aria-invalid={err(['body', i, 'items', n, 'text']) ? true : undefined}
              className={TEXTAREA}
            />
            {english && (
              <div className="flex">
                <button type="button" onClick={tool(() => reshape(['body', i, 'items'], (l) => move(l, n, n - 1)))} disabled={n === 0} aria-label={`Move line ${n + 1} up`} className={ICON_BTN}><ArrowUp size={16} aria-hidden="true" /></button>
                <button type="button" onClick={tool(() => reshape(['body', i, 'items'], (l) => move(l, n, n + 1)))} disabled={n === items.length - 1} aria-label={`Move line ${n + 1} down`} className={ICON_BTN}><ArrowDown size={16} aria-hidden="true" /></button>
                <button type="button" onClick={tool(() => reshape(['body', i, 'items'], (l) => l.filter((_, x) => x !== n)))} aria-label={`Delete line ${n + 1}`} className={`${ICON_BTN} hover:text-red-700`}><Trash size={16} aria-hidden="true" /></button>
              </div>
            )}
          </div>
        ))}
        {err(['body', i, 'items']) && <p className="text-sm text-red-700">{err(['body', i, 'items'])}</p>}
        {Object.keys(errors).some((k) => k.startsWith(`body.${i}.items.`)) && <p className="text-sm text-red-700">Each line needs a text.</p>}
        {english && items.length < 12 && (
          <button type="button" onClick={tool(() => reshape(['body', i, 'items'], (l, isEnglish) => [...l, isEnglish ? { lead: '', text: '' } : {}]))} className={`self-start ${BTN_GHOST}`}>
            <Plus size={16} aria-hidden="true" /> Add a line
          </button>
        )}
      </div>
    )
  }

  const addBlock = (type) => reshape(['body'], (list, isEnglish) => [...list, isEnglish ? BLOCKS[type].empty() : {}])

  const save = async (event) => {
    event.preventDefault()
    setStatus('saving')
    setErrors({})
    setMessage('')
    try {
      const { post } = isNew ? await adminCreatePost(form) : await adminUpdatePost(slug, form)
      const next = { ...form, slug: post.slug }
      setSaved(snapshot(next))
      setForm(next)
      setStatus('idle')
      if (isNew || post.slug !== slug) {
        navigate(`/admin/blog/${post.slug}`, { replace: true, state: { notice: isNew ? 'Article created.' : 'Changes saved.' } })
        return
      }
      setMessage(`Changes saved. Reading time: ${post.minutes} min.`)
    } catch (error) {
      setErrors(error.fields || {})
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
          <Link to="/admin/blog" className="inline-flex items-center gap-1.5 text-sm text-slate-700 hover:underline">
            <ArrowLeft size={15} aria-hidden="true" /> All articles
          </Link>
          <h2 className="mt-1 truncate text-xl sm:text-2xl font-medium text-forest">{isNew ? 'New article' : form.title || 'Untitled'}</h2>
        </div>
        {!isNew && (
          <a href={`/blog/${slug}`} target="_blank" rel="noreferrer" className={BTN_GHOST}>
            <ExternalLink size={15} aria-hidden="true" /> View the article
          </a>
        )}
      </div>

      <nav aria-label="Language" className="mt-5 flex flex-wrap gap-1 rounded-full bg-white p-1 w-fit">
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
          Translation: only the texts. Photos, links and the order of the blocks are set in English. An empty field is shown in English on the site.
        </p>
      )}

      {message && (
        <p role={status === 'error' ? 'alert' : 'status'} className={`mt-4 rounded-2xl px-5 py-3 text-sm ${status === 'error' ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'}`}>
          {message}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
        <div className="flex flex-col gap-6 min-w-0">
          <section className={CARD} aria-labelledby="post-general">
            <h3 id="post-general" className={CARD_TITLE}>Article</h3>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">{text(['title'], 'Title')}</div>
              {english && (
                <Field label="Address of the page" error={errors.slug} hint={`/blog/${form.slug || '…'}. Changing it breaks the old links.`}>
                  {(p) => (
                    <input {...p} value={form.slug} onChange={(e) => { setSlugTouched(true); set(['slug'], slugify(e.target.value)) }} className={INPUT} />
                  )}
                </Field>
              )}
              {english && (
                <Field label="Date" error={errors.date} hint="Shown on the article; the newest come first.">
                  {(p) => <input {...p} type="date" value={form.date} onChange={(e) => set(['date'], e.target.value)} className={INPUT} />}
                </Field>
              )}
              {text(['excerpt'], 'Introduction', { rows: 3, optional: true, hint: 'Shown in large type at the top of the article.' })}
            </div>
          </section>

          <section className={CARD} aria-labelledby="post-body">
            <h3 id="post-body" className={CARD_TITLE}>Content <span className="text-sm font-normal text-slate-500">({form.body.length} blocks)</span></h3>
            {errors.body && <p className="mt-2 text-sm text-red-700">{errors.body}</p>}
            <ol className="mt-5 flex flex-col gap-4">
              {form.body.map((block, i) => {
                const { label, icon: Icon } = BLOCKS[block.type] || BLOCKS.paragraph
                return (
                  <li key={i} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="flex items-center gap-2 text-sm font-medium text-slate-700"><Icon size={16} aria-hidden="true" /> {label}</p>
                      {english && (
                        <div className="flex">
                          <button type="button" onClick={tool(() => reshape(['body'], (l) => move(l, i, i - 1)))} disabled={i === 0} aria-label={`Move block ${i + 1} up`} className={ICON_BTN}><ArrowUp size={16} aria-hidden="true" /></button>
                          <button type="button" onClick={tool(() => reshape(['body'], (l) => move(l, i, i + 1)))} disabled={i === form.body.length - 1} aria-label={`Move block ${i + 1} down`} className={ICON_BTN}><ArrowDown size={16} aria-hidden="true" /></button>
                          <button type="button" onClick={tool(() => reshape(['body'], (l) => l.filter((_, n) => n !== i)))} aria-label={`Delete block ${i + 1}`} className={`${ICON_BTN} hover:text-red-700`}><Trash size={16} aria-hidden="true" /></button>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">{blockFields(block, i)}</div>
                  </li>
                )
              })}
            </ol>
            {english && (
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(BLOCKS).map(([type, { label, icon: Icon }]) => (
                  <button key={type} type="button" onClick={() => addBlock(type)} className={BTN_GHOST}>
                    <Icon size={15} aria-hidden="true" /> {label}
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-6 xl:sticky xl:top-6">
          <section className={CARD} aria-labelledby="post-publish">
            <h3 id="post-publish" className={CARD_TITLE}>Publication</h3>
            <label className="mt-4 flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} className="mt-1 h-5 w-5 accent-[#C49849]" />
              <span>
                <span className="block text-sm font-medium text-slate-900">Visible on the site</span>
                <span className="block text-xs text-slate-500">Unchecked: only admins can see it, here.</span>
              </span>
            </label>
            <label className="mt-4 flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} className="mt-1 h-5 w-5 accent-[#C49849]" />
              <span>
                <span className="block text-sm font-medium text-slate-900">Featured</span>
                <span className="block text-xs text-slate-500">In the block at the top of /blog (the 3 newest featured articles).</span>
              </span>
            </label>
          </section>

          <section className={CARD} aria-labelledby="post-photo">
            <h3 id="post-photo" className={CARD_TITLE}>Cover photo</h3>
            <div className="mt-5">{photo(['image'], 'Photo')}</div>
          </section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-[90vw] lg:max-w-[95vw] items-center justify-between gap-4 py-3">
          <p className="text-sm text-slate-600" aria-live="polite">
            {status === 'saving' ? 'Saving…' : dirty ? 'Unsaved changes' : isNew ? 'Not saved yet' : 'All changes saved'}
          </p>
          <div className="flex gap-2">
            <Link to="/admin/blog" className={BTN_GHOST}>Close</Link>
            <button type="submit" disabled={status === 'saving' || (!dirty && !isNew)} className={BTN_GOLD}>
              <Save size={16} aria-hidden="true" /> {isNew ? 'Create' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default PostEditor
