// Pose les textes d'une langue sur des données de page (photos, prix, liens...).
//   localize({ title: 'Hi', image: img, list: [{ name: 'A', id: 1 }] }, { title: 'Salut', list: [{ name: 'B' }] })
//   -> { title: 'Salut', image: img, list: [{ name: 'B', id: 1 }] }
// Les listes sont fusionnées élément par élément ; ce qui manque dans `texts` garde sa valeur d'origine.
export function localize(base, texts) {
  if (texts === undefined || texts === null) return base
  if (Array.isArray(base)) return base.map((item, i) => localize(item, texts[i]))
  if (base && typeof base === 'object' && Object.getPrototypeOf(base) === Object.prototype) {
    const result = { ...base }
    for (const key of Object.keys(texts)) result[key] = localize(base[key], texts[key])
    return result
  }
  return texts
}
