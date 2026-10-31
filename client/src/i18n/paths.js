// Langue dans l'adresse des pages : l'anglais sans préfixe (/circuits), les autres avec (/fr/circuits).
// Chaque langue a ainsi ses propres pages, que Google peut trouver et afficher.
// L'admin, l'API et les photos n'ont jamais de préfixe.
export const PREFIXED = ['fr', 'de', 'it', 'es']
const NO_PREFIX = /^\/(admin|api|uploads)(\/|$)/

// Pages renommées : ancienne adresse -> nouvelle (le serveur redirige aussi, en 301, voir server/src/utils/seo.js)
export const RENAMED_PAGES = {
  '/excurssions': '/excursions',
  '/cruise-excurssion': '/cruise-excursions',
  '/hosting': '/accommodation',
  '/longstay': '/long-stay',
  '/guide': '/guides',
}

// /fr/circuits -> 'fr' ; /circuits -> 'en'
export function langFromPath(pathname) {
  const first = pathname.split('/')[1]
  return PREFIXED.includes(first) ? first : 'en'
}

// /fr/circuits -> /circuits ; /fr -> /
export function stripLang(pathname) {
  const first = pathname.split('/')[1]
  if (!PREFIXED.includes(first)) return pathname
  return pathname.slice(first.length + 1) || '/'
}

// Adresse d'une page du site dans une langue : localizePath('/circuits?x=1', 'fr') -> '/fr/circuits?x=1'.
// Les adresses relatives, externes (https://, mailto:...) ou sans préfixe (admin...) restent telles quelles.
export function localizePath(to, lang) {
  if (to && typeof to === 'object') return to.pathname ? { ...to, pathname: localizePath(to.pathname, lang) } : to
  if (typeof to !== 'string' || !to.startsWith('/') || to.startsWith('//') || NO_PREFIX.test(to)) return to
  const path = stripLang(to.replace(/^\/(fr|de|it|es)(?=[?#]|$)/, '/$1/'))
  if (lang === 'en' || !PREFIXED.includes(lang)) return path
  // '/' et '/?x' -> '/fr' et '/fr?x'
  return /^\/(?=[?#]|$)/.test(path) ? `/${lang}${path.slice(1)}` : `/${lang}${path}`
}
