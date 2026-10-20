import { useMemo } from 'react'
import Ramena from '../assets/images/Ramena.png'
import NosyIranja from '../assets/images/NosyIranja.png'
import NosyLonjo from '../assets/images/NosyLonjo.png'
import Ambanja from '../assets/images/Ambanja.png'
import Deux from '../assets/images/2.jpg'
import Tana from '../assets/images/Tana.png'
import ENGLISH from '../i18n/locales/en/destinations.json'
import { useT } from '../i18n/LanguageContext'

export const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

/* Un lieu par entrée. Les textes (nom, présentation, activités, lieux à visiter...) sont dans
   locales/<langue>/destinations.json, sous items.<clé> ; ici, seulement les photos et les prix,
   dans le même ordre que les listes todo et visit des textes.
   Les adresses (/destinations/ambanja/sambirano-valley) viennent des noms anglais : elles sont
   les mêmes dans toutes les langues. */
const media = [
  {
    key: 'ambanja',
    image: Ambanja,
    todo: [Ambanja, Deux, Tana],
    visit: [
      { image: Ambanja, price: 85, rating: '4.9', reviews: 48 },
      { image: NosyLonjo, price: 140, rating: '4.8', reviews: 21 },
      { image: NosyIranja, price: 45, rating: '4.7', reviews: 64 },
    ],
  },
  { key: 'ramena-beach', image: Ramena, todo: [Ramena, NosyIranja, NosyLonjo], visit: [{ image: Ramena }, { image: NosyLonjo }, { image: Deux }] },
  { key: 'nosy-iranja', image: NosyIranja, todo: [NosyIranja, Ramena, NosyLonjo], visit: [{ image: NosyIranja }, { image: Ramena }, { image: NosyLonjo }] },
  { key: 'antananarivo', image: Tana, todo: [Tana, Ambanja, Deux], visit: [{ image: Deux }, { image: Tana }, { image: Ambanja }] },
  { key: 'baobab-avenue', image: Deux, todo: [Deux, Ambanja, Tana], visit: [{ image: Deux }, { image: NosyLonjo }, { image: Ramena }] },
  { key: 'andasibe', image: Ambanja, todo: [Ambanja, Tana, Deux], visit: [{ image: Ambanja }, { image: NosyLonjo }, { image: Tana }] },
]

// Textes d'une langue + photos et prix. `region` reste l'anglais (sert à regrouper les lieux),
// `regionLabel` est le nom affiché.
function build(items) {
  return Object.fromEntries(
    media.map((m) => {
      const en = ENGLISH.items[m.key]
      const tr = items?.[m.key] || en
      const slug = slugify(en.name)
      return [slug, {
        ...en,
        ...tr,
        slug,
        region: en.region,
        regionLabel: tr.region,
        image: m.image,
        todo: en.todo.map((item, i) => ({ ...item, ...tr.todo?.[i], image: m.todo[i] })),
        visit: en.visit.map((place, i) => ({ ...place, ...tr.visit?.[i], ...m.visit[i], slug: slugify(place.name) })),
      }]
    }),
  )
}

// Tous les lieux, dans la langue du site : { [slug]: lieu }
export function useDestinations() {
  const t = useT('destinations')
  const items = t('items')
  return useMemo(() => build(items), [items])
}
