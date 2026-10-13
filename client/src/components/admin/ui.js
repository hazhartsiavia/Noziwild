// Classes Tailwind de l'espace admin : mêmes couleurs que le site, champs un peu plus compacts
export const CARD = 'rounded-3xl bg-white p-5 sm:p-8'
export const CARD_TITLE = 'text-lg sm:text-xl font-medium text-slate-900'
export const INPUT =
  'w-full h-11 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-800 ' +
  'focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700 transition'
export const TEXTAREA =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-800 leading-relaxed ' +
  'focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700 transition'
export const BTN = 'inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-full active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed'
export const BTN_PRIMARY = `${BTN} bg-slate-800 hover:bg-slate-700 text-white`
export const BTN_GOLD = `${BTN} bg-[#C49849] hover:bg-[#a9813a] text-white`
export const BTN_GHOST = `${BTN} border border-slate-300 bg-white text-slate-800 hover:border-slate-700`
export const BTN_DANGER = `${BTN} border border-red-300 bg-white text-red-700 hover:border-red-700`
export const ICON_BTN = 'inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition disabled:opacity-30 disabled:hover:bg-transparent'

// Déplace l'élément `from` à la position `to` (renvoie une nouvelle liste)
export const move = (list, from, to) => {
  if (to < 0 || to >= list.length) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}
