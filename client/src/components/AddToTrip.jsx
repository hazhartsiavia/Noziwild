// Bouton « Ajouter à mon voyage » : met une offre de côté dans la sélection (voir context/TripContext.jsx).
//   item    : { kind, ref, title, image, link, details, price, unit, qty, date }
//   variant : 'dark' | 'gold' | 'green' | 'light' (bouton avec texte) ou 'icon' (rond, + / ✓)
//   Déjà dans la sélection : le bouton l'indique, et un nouveau clic l'en retire.
// BookingAdd : variante des cartes de réservation (date + nombre de voyageurs choisis sur la page).
import React from 'react'
import { Link } from 'react-router-dom'
import { Check, Plus } from 'lucide-react'
import { useTrip } from '../context/TripContext'
import { useT } from '../i18n/LanguageContext'

const BASE = 'inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
const SIZE = 'px-5 py-2.5 md:px-6 md:py-3'
const VARIANTS = {
  dark: { off: 'bg-[#084838] hover:bg-[#0a5c47] text-white', on: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-700/30 hover:bg-emerald-100' },
  gold: { off: 'bg-[#C49849] hover:bg-[#b08339] text-white', on: 'bg-white text-emerald-800 hover:bg-white/90' },
  green: { off: 'bg-[#084838] hover:bg-[#0a5c47] text-white', on: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-700/30 hover:bg-emerald-100' },
  light: { off: 'bg-white hover:bg-white/90 text-slate-900', on: 'bg-[#C49849] text-white hover:bg-[#b08339]' },
}
const ICON = {
  off: 'w-10 h-10 bg-[#C49849] hover:bg-[#b08339] text-white',
  on: 'w-10 h-10 bg-white text-emerald-700 ring-2 ring-emerald-600',
}

export const tripId = (item) => item.id || `${item.kind}:${item.ref}`

function AddToTrip({ item, variant = 'dark', className = '', size = SIZE }) {
  const t = useT('trip')
  const { has, add, remove, full } = useTrip()
  const id = tripId(item)
  const added = has(id)
  const toggle = (event) => {
    // Le bouton peut être posé sur une carte cliquable
    event.preventDefault()
    event.stopPropagation()
    if (added) remove(id)
    else add({ ...item, id })
  }
  const disabled = !added && full

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-pressed={added}
        aria-label={`${added ? t('inTrip') : t('add')} : ${item.title}`}
        title={added ? t('removeHint') : t('add')}
        className={`${BASE} shrink-0 ${added ? ICON.on : ICON.off} ${className}`}
      >
        {added ? <Check size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
      </button>
    )
  }

  const colors = VARIANTS[variant] || VARIANTS.dark
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      aria-pressed={added}
      title={added ? t('removeHint') : disabled ? t('full') : undefined}
      className={`${BASE} ${size} ${added ? colors.on : colors.off} ${className}`}
    >
      {added ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
      {added ? t('inTrip') : t('add')}
    </button>
  )
}

// Pour une carte de réservation : l'offre est-elle déjà dans la sélection, et mise à jour
// de sa date ou de sa quantité quand le visiteur les change sur la page
//   saved : l'élément tel qu'il est dans la sélection (pour reprendre sa date et sa quantité)
export function useTripItem(item) {
  const { items, update } = useTrip()
  const id = tripId(item)
  const saved = items.find((i) => i.id === id)
  const sync = (patch) => saved && update(id, patch)
  return { id, added: Boolean(saved), saved, sync }
}

// Bouton pleine largeur des cartes de réservation ; une fois ajouté, lien vers la sélection
export function BookingAdd({ item, className = '' }) {
  const t = useT('trip')
  const { add, full } = useTrip()
  const { id, added } = useTripItem(item)

  if (added) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <Link to="/my-trip" className={`${BASE} ${SIZE} w-full ${VARIANTS.green.off}`}>
          <Check size={16} aria-hidden="true" /> {t('viewTrip')}
        </Link>
        <p role="status" className="text-sm text-emerald-700">{t('added')}</p>
      </div>
    )
  }
  return (
    <button type="button" onClick={() => add({ ...item, id })} disabled={full} title={full ? t('full') : undefined} className={`${BASE} ${SIZE} w-full ${VARIANTS.dark.off} ${className}`}>
      <Plus size={16} aria-hidden="true" /> {t('add')}
    </button>
  )
}

export default AddToTrip
