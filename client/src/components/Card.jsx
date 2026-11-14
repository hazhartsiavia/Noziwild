// Carte commune du site (circuits, transports, excursions, hébergements...) : la photo d'abord, sans cadre ni ombre,
// puis une étiquette discrète, la ligne d'infos, le titre en serif, le texte et le bas de carte sous un filet.
// Chaque page assemble ces morceaux selon ce qu'elle doit montrer.
import React from 'react'

export const CARD = 'group flex flex-col text-slate-800'
export const CARD_MEDIA = 'relative aspect-[4/3] overflow-hidden rounded-xl bg-[#EAE5D9]'
// Zoom au survol limité à 3 % (classe img-zoom, index.css) : au-delà, la photo perd sa netteté
export const CARD_IMG = 'img-zoom w-full h-full object-cover'
export const CARD_BADGE = 'absolute left-3 top-3 inline-block bg-[#F4F1EA] text-forest text-[11px] font-semibold uppercase tracking-[0.14em] px-3 py-1.5 rounded-sm'
export const CARD_BODY = 'flex flex-1 flex-col pt-5 pb-2'
export const CARD_TITLE = 'mt-3 font-display text-[1.75rem] md:text-[2rem] leading-[1.05] text-forest'
export const CARD_TEXT = 'mt-3 text-sm text-slate-600 leading-relaxed'
export const CARD_CHIPS = 'mt-4 flex flex-wrap gap-x-4 gap-y-1'
export const CARD_CHIP = 'text-xs text-slate-600 before:content-["—"] before:mr-1.5 before:text-[#b08d4f]'
export const CARD_FOOT = 'mt-auto pt-5 flex flex-wrap items-center justify-between gap-3'

// Ligne d'infos : « Nord | Facile »
export function CardMeta({ items, className = '' }) {
  return (
    <p className={`flex flex-wrap items-center gap-3 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500 ${className}`}>
      {items.filter(Boolean).map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span aria-hidden="true" className="w-px h-3 bg-slate-300" />}
          <span>{item}</span>
        </React.Fragment>
      ))}
    </p>
  )
}
