// Petites fonctions des éditeurs en plusieurs langues (destinations, articles) :
// lire / poser une valeur à un chemin (['visit', 2, 'name']) et fabriquer une adresse à partir d'un nom.

export const getIn = (node, path) => path.reduce((n, k) => (n == null ? undefined : n[k]), node)

// Copie avec une valeur posée à un chemin : un index crée une liste
export function setIn(node, [key, ...rest], value) {
  const base = node ?? (typeof key === 'number' ? [] : {})
  const copy = Array.isArray(base) ? [...base] : { ...base }
  copy[key] = rest.length ? setIn(copy[key], rest, value) : value
  return copy
}

// « Île Sainte-Marie » -> ile-sainte-marie ; « Here’s » -> heres (même règle que le serveur)
export const slugify = (text) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
