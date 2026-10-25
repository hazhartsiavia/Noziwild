// Traductions d'un circuit ou d'une offre (français, allemand, italien, espagnol).
// Chaque champ montre le texte anglais en gris : un champ laissé vide s'affiche en anglais sur le site.
// Les listes et les jours sont traduits ligne par ligne, dans l'ordre de la version anglaise.
// Par défaut, les champs d'un circuit ; une offre passe les siens (textFields, listFields).
import React, { useState } from 'react'
import Field from './Field'
import { CARD, CARD_TITLE, INPUT, TEXTAREA } from './ui'

export const TRANSLATION_LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'es', label: 'Español' },
]

const TEXT_FIELDS = [
  { key: 'title', label: 'Title', wide: true },
  { key: 'summary', label: 'Summary', wide: true, rows: 2 },
  { key: 'stops', label: 'Main stops', wide: true },
  { key: 'region', label: 'Region' },
  { key: 'level', label: 'Level' },
  { key: 'start', label: 'Starting location' },
  { key: 'end', label: 'Arrive back at' },
  { key: 'groupSize', label: 'Group size' },
  { key: 'tourType', label: 'Tour type' },
  { key: 'bestTime', label: 'Best time' },
  { key: 'tip', label: 'Good to know', wide: true, rows: 3 },
]
const LIST_FIELDS = [
  { key: 'overview', label: 'Overview paragraphs', rows: 3 },
  { key: 'highlights', label: 'Highlights' },
  { key: 'included', label: 'Price includes' },
  { key: 'excluded', label: 'Price excludes' },
]
const DAY_FIELDS = [
  { key: 'day', label: 'Label' },
  { key: 'title', label: 'Title' },
  { key: 'text', label: 'Description', wide: true, rows: 3 },
  { key: 'stay', label: 'Night in' },
  { key: 'meals', label: 'Meals' },
]

// Nombre de textes anglais à traduire, et combien le sont déjà dans cette langue
function progress(form, lang, textFields, listFields) {
  const tr = form.translations?.[lang] || {}
  let total = 0
  let done = 0
  const count = (english, translated) => {
    if (!english) return
    total += 1
    if (translated) done += 1
  }
  textFields.forEach(({ key }) => count(form[key], tr[key]))
  listFields.forEach(({ key }) => (form[key] || []).forEach((item, i) => count(item, tr[key]?.[i])))
  ;(form.itinerary || []).forEach((day) => DAY_FIELDS.forEach(({ key }) => count(day[key], day.tr?.[lang]?.[key])))
  return { total, done }
}

function Input({ rows, ...props }) {
  return rows ? <textarea rows={rows} {...props} className={TEXTAREA} /> : <input {...props} className={INPUT} />
}

function TranslationsEditor({ form, setForm, textFields = TEXT_FIELDS, listFields = LIST_FIELDS }) {
  const [lang, setLang] = useState('fr')
  const tr = form.translations?.[lang] || {}

  const setText = (key, value) =>
    setForm((f) => ({ ...f, translations: { ...f.translations, [lang]: { ...f.translations?.[lang], [key]: value } } }))

  const setListItem = (key, index, value) =>
    setForm((f) => {
      const current = f.translations?.[lang] || {}
      const list = f[key].map((_, i) => (i === index ? value : current[key]?.[i] || ''))
      return { ...f, translations: { ...f.translations, [lang]: { ...current, [key]: list } } }
    })

  const setDayField = (dayKey, key, value) =>
    setForm((f) => ({
      ...f,
      itinerary: f.itinerary.map((d) =>
        d._key === dayKey ? { ...d, tr: { ...d.tr, [lang]: { ...d.tr?.[lang], [key]: value } } } : d,
      ),
    }))

  return (
    <section className={CARD} aria-labelledby="translations-title">
      <h3 id="translations-title" className={CARD_TITLE}>Translations</h3>
      <p className="mt-1 text-sm text-slate-500">
        The English text is shown in grey. Leave a field empty to show the English text on the site in that language.
      </p>

      <div role="tablist" aria-label="Language" className="mt-5 flex flex-wrap gap-2">
        {TRANSLATION_LANGUAGES.map((l) => {
          const { total, done } = progress(form, l.code, textFields, listFields)
          const selected = l.code === lang
          return (
            <button
              key={l.code}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setLang(l.code)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selected ? 'bg-[#084838] text-white' : 'border border-slate-300 bg-white text-slate-700 hover:border-slate-700'
              }`}
            >
              {l.label}
              <span className={`ml-2 text-xs ${selected ? 'text-white/70' : 'text-slate-500'}`}>
                {done}/{total}
              </span>
            </button>
          )
        })}
      </div>

      <div role="tabpanel" lang={lang} className="mt-6 flex flex-col gap-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {textFields.map(({ key, label, wide, rows }) => (
            <Field key={key} label={label} hint={form[key] ? `English: ${form[key]}` : undefined} className={wide ? 'sm:col-span-2' : ''}>
              {(props) => <Input {...props} rows={rows} value={tr[key] ?? ''} placeholder={form[key] || ''} onChange={(e) => setText(key, e.target.value)} />}
            </Field>
          ))}
        </div>

        {listFields.map(({ key, label, rows }) =>
          form[key]?.some(Boolean) ? (
            <fieldset key={key}>
              <legend className="mb-2 text-sm text-slate-700">{label}</legend>
              <ol className="flex flex-col gap-2">
                {form[key].map((english, i) =>
                  english ? (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-2.5 w-6 shrink-0 text-right text-sm text-slate-400">{i + 1}.</span>
                      <Input
                        rows={rows}
                        value={tr[key]?.[i] ?? ''}
                        placeholder={english}
                        aria-label={`${label}, line ${i + 1}`}
                        onChange={(e) => setListItem(key, i, e.target.value)}
                      />
                    </li>
                  ) : null,
                )}
              </ol>
            </fieldset>
          ) : null,
        )}

        {form.itinerary && (
          <div>
            <h4 className="text-sm font-medium text-slate-900">Itinerary</h4>
            <ol className="mt-3 flex flex-col gap-4">
              {form.itinerary.map((day, i) => (
                <li key={day._key} className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {day.day || `#${i + 1}`} · {day.title || 'Untitled day'}
                  </p>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DAY_FIELDS.map(({ key, label, wide, rows }) => (
                      <Field key={key} label={label} className={wide ? 'sm:col-span-2' : ''}>
                        {(props) => (
                          <Input
                            {...props}
                            rows={rows}
                            value={day.tr?.[lang]?.[key] ?? ''}
                            placeholder={day[key] || ''}
                            onChange={(e) => setDayField(day._key, key, e.target.value)}
                          />
                        )}
                      </Field>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  )
}

export default TranslationsEditor
