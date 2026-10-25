import { useEffect, useState } from 'react'
import { assetUrl, fetchDestinations } from '../api'
import { useLanguage } from '../i18n/LanguageContext'

export const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

/* Destinations et lieux à visiter : dans la base, gérés depuis /admin/destinations.
   Les adresses (/destinations/ambanja/sambirano-valley) viennent des noms anglais : elles sont
   les mêmes dans toutes les langues. `region` reste l'anglais (sert à regrouper les lieux),
   `regionLabel` est le nom affiché. */

// Photos servies par l'API : adresse complète si l'API est sur un autre domaine
const withImages = (d) => ({
  ...d,
  image: assetUrl(d.image),
  todo: d.todo.map((item) => ({ ...item, image: assetUrl(item.image) })),
  visit: d.visit.map((place) => ({ ...place, image: assetUrl(place.image) })),
})

// Toutes les destinations, dans la langue du site : { destinations: { [slug]: destination }, status }
//   status : 'loading' | 'ready' | 'error'
export function useDestinations() {
  const { lang } = useLanguage()
  const [state, setState] = useState({ destinations: {}, status: 'loading' })

  useEffect(() => {
    let cancelled = false
    fetchDestinations(lang)
      .then(({ destinations }) => {
        if (cancelled) return
        setState({ destinations: Object.fromEntries(destinations.map((d) => [d.slug, withImages(d)])), status: 'ready' })
      })
      .catch(() => !cancelled && setState((s) => ({ ...s, status: 'error' })))
    return () => {
      cancelled = true
    }
  }, [lang])

  return state
}
