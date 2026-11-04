// Carte commune du site (circuits, transports, excursions, hébergements...) : fond blanc, photo 4/3, pastille dorée,
// ligne d'infos, titre, texte, puis le bas de carte. Chaque page assemble ces morceaux selon ce qu'elle doit montrer.
import React from 'react'

export const CARD = 'group flex flex-col rounded-xl bg-white p-3 text-slate-800'
export const CARD_MEDIA = 'relative aspect-[4/3] overflow-hidden rounded-md'
export const CARD_IMG = 'w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
export const CARD_BADGE = 'absolute left-3 top-3 inline-block bg-[#C49849] text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-sm'
export const CARD_BODY = 'flex flex-1 flex-col px-3 pt-6 pb-4'
export const CARD_TITLE = 'mt-4 text-xl md:text-2xl font-bold leading-snug text-forest'
export const CARD_TEXT = 'mt-3 text-sm text-slate-600 leading-relaxed'
export const CARD_CHIPS = 'mt-4 flex flex-wrap gap-2'
export const CARD_CHIP = 'rounded-full bg-[#D5E8E2] px-3 py-1 text-xs text-slate-700'
export const CARD_FOOT = 'mt-auto pt-6 flex flex-wrap items-center justify-between gap-3'

// Ligne d'infos : « Nord | Facile »
export function CardMeta({ items, className = '' }) {
  return (
    <p className={`flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600 ${className}`}>
      {items.filter(Boolean).map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span aria-hidden="true" className="w-px h-4 bg-slate-500" />}
          <span>{item}</span>
        </React.Fragment>
      ))}
    </p>
  )
}
