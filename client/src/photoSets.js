// Versions haute définition des photos (2400 px de large, WebP) :
//   - photos du site    : assets/images/site/hd/<nom>.webp
//   - photos de départ  : server/uploads/circuits/hd/<nom>.webp (servies sur /uploads/circuits/hd/...)
// Le navigateur choisit seul : la photo d'origine (1600 px) sur un écran ordinaire, la version HD sur un
// grand écran ou un écran à haute densité (Retina, téléphones), là où l'originale paraîtrait floue.
// Une photo envoyée depuis l'admin (/uploads/files/...) n'a qu'une taille : elle est servie telle quelle.
const base = import.meta.glob('./assets/images/site/*.jpg', { eager: true, import: 'default' })
const hd = import.meta.glob('./assets/images/site/hd/*.webp', { eager: true, import: 'default' })

const HD = {}
for (const [path, url] of Object.entries(base)) {
  const big = hd[path.replace('/site/', '/site/hd/').replace(/\.jpg$/, '.webp')]
  if (big) HD[url] = big
}

const LIBRARY = /^(.*\/uploads\/circuits\/)([\w-]+)\.jpe?g$/i

// Adresse de la version HD d'une photo, ou undefined si elle n'en a pas
export function hdOf(src) {
  if (!src) return undefined
  if (HD[src]) return HD[src]
  const match = LIBRARY.exec(src)
  return match ? `${match[1]}hd/${match[2]}.webp` : undefined
}

// srcset prêt à poser sur <img> : « photo.jpg 1600w, photo-hd.webp 2400w »
export function srcSetOf(src) {
  const big = hdOf(src)
  return big ? `${src} 1600w, ${big} 2400w` : undefined
}
