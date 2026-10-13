// Liste de textes modifiable : ajouter, déplacer, supprimer une ligne
import React from 'react'
import { ArrowDown, ArrowUp, Plus, Trash } from 'lucide-react'
import { INPUT, TEXTAREA, BTN_GHOST, ICON_BTN, move } from './ui'

function ListEditor({ label, items, onChange, max = 20, multiline = false, placeholder, error, addLabel = 'Add a line' }) {
  const update = (index, value) => onChange(items.map((item, i) => (i === index ? value : item)))

  return (
    <fieldset>
      <legend className="mb-2 text-sm text-slate-700">{label}</legend>
      <ol className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-2.5 w-6 shrink-0 text-right text-sm text-slate-400">{i + 1}.</span>
            {multiline ? (
              <textarea rows={3} value={item} onChange={(e) => update(i, e.target.value)} aria-label={`${label}, line ${i + 1}`} placeholder={placeholder} className={TEXTAREA} />
            ) : (
              <input value={item} onChange={(e) => update(i, e.target.value)} aria-label={`${label}, line ${i + 1}`} placeholder={placeholder} className={INPUT} />
            )}
            <div className="flex shrink-0 items-center">
              <button type="button" onClick={() => onChange(move(items, i, i - 1))} disabled={i === 0} aria-label={`Move line ${i + 1} up`} className={ICON_BTN}>
                <ArrowUp size={16} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => onChange(move(items, i, i + 1))} disabled={i === items.length - 1} aria-label={`Move line ${i + 1} down`} className={ICON_BTN}>
                <ArrowDown size={16} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => onChange(items.filter((_, n) => n !== i))} aria-label={`Delete line ${i + 1}`} className={`${ICON_BTN} hover:text-red-700`}>
                <Trash size={16} aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ol>
      {items.length < max && (
        <button type="button" onClick={() => onChange([...items, ''])} className={`mt-3 ${BTN_GHOST}`}>
          <Plus size={16} aria-hidden="true" /> {addLabel}
        </button>
      )}
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </fieldset>
  )
}

export default ListEditor
