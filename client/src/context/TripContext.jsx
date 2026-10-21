// Sélection « Mon voyage » : les offres mises de côté sur tout le site, envoyées ensemble
// en une seule demande de devis depuis la page /my-trip.
//   Gardée dans le navigateur (localStorage) : pas besoin de compte, et elle survit à un rechargement.
//   Un élément :
//     { id: 'activity:12', kind, ref, title, image, link, details, price, unit, qty, date, note }
//     unit : 'person' (prix par personne × qty) | 'night' (prix par nuit × qty) | 'unit' (prix × qty)
//            | 'fixed' (prix total) | null (sur devis)
//   Les titres sont copiés dans la langue du moment : c'est ce que l'équipe lira dans la demande.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { useT } from '../i18n/LanguageContext'

const STORAGE_KEY = 'noziwild-trip'
const MAX_ITEMS = 30

function readStorage() {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(items) ? items.filter((item) => item && item.id && item.title).slice(0, MAX_ITEMS) : []
  } catch {
    return []
  }
}

// Total indicatif d'un élément, null si son prix n'est pas connu
export function lineTotal(item) {
  if (!item.unit || item.price === null || item.price === undefined) return null
  return item.unit === 'fixed' ? item.price : item.price * (item.qty || 1)
}

const TripContext = createContext(null)

export function TripProvider({ children }) {
  const [items, setItems] = useState(readStorage)
  const [toast, setToast] = useState(null) // titre du dernier élément ajouté

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // stockage indisponible (navigation privée...) : la sélection vit le temps de la visite
    }
  }, [items])

  // Sélection modifiée dans un autre onglet
  useEffect(() => {
    const onStorage = (event) => event.key === STORAGE_KEY && setItems(readStorage())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Ajoute un élément, ou remplace celui qui a le même id (nouvelles dates, quantité...).
  // Sans quantité donnée, un prix par personne (ou sur devis) prend le nombre de voyageurs déjà choisi ailleurs (2 par défaut).
  const add = useCallback((item) => {
    const base = { date: '', note: '', ...item, id: item.id || `${item.kind}:${item.ref}` }
    setItems((prev) => {
      const people = Math.max(0, ...prev.filter((i) => i.unit === 'person').map((i) => i.qty || 1))
      const perPerson = item.unit === 'person' || !item.unit
      const entry = { ...base, qty: item.qty || (perPerson ? people || 2 : 1) }
      const index = prev.findIndex((i) => i.id === entry.id)
      if (index >= 0) return prev.map((i, n) => (n === index ? { ...i, ...entry, note: i.note } : i))
      return prev.length >= MAX_ITEMS ? prev : [...prev, entry]
    })
    setToast({ title: base.title, key: Date.now() })
  }, [])

  const remove = useCallback((id) => setItems((prev) => prev.filter((i) => i.id !== id)), [])
  const update = useCallback((id, patch) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i))), [])
  const clear = useCallback(() => setItems([]), [])
  const closeToast = useCallback(() => setToast(null), [])

  const value = useMemo(() => ({
    items,
    count: items.length,
    full: items.length >= MAX_ITEMS,
    has: (id) => items.some((i) => i.id === id),
    add,
    remove,
    update,
    clear,
  }), [items, add, remove, update, clear])

  return (
    <TripContext.Provider value={value}>
      {children}
      {toast && <TripToast key={toast.key} title={toast.title} onClose={closeToast} />}
    </TripContext.Provider>
  )
}

export function useTrip() {
  return useContext(TripContext)
}

// Confirmation en bas de l'écran après un ajout, avec un lien vers la sélection
function TripToast({ title, onClose }) {
  const t = useT('trip')
  const timer = useRef(null)

  useEffect(() => {
    timer.current = setTimeout(onClose, 5000)
    return () => clearTimeout(timer.current)
  }, [onClose])

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-lg sm:inset-x-auto sm:right-6 sm:bottom-6"
      onMouseEnter={() => clearTimeout(timer.current)}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C49849]"><Check size={16} aria-hidden="true" /></span>
      <p className="min-w-0 flex-1 text-sm">
        <span className="block truncate font-medium">{title}</span>
        <span className="text-white/70">{t('toastAdded')}</span>
      </p>
      <Link to="/my-trip" onClick={onClose} className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-white/90">
        {t('toastView')}
      </Link>
      <button type="button" onClick={onClose} aria-label={t('close')} className="shrink-0 rounded-full p-1 text-white/70 hover:text-white">
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
