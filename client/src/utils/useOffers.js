// Offres d'une page (activités, excursions, croisière, long séjour, idées sur mesure),
// lues depuis l'API dans la langue du site et rechargées quand la langue change.
//   const { offers, status } = useOffers('activity')   // status : 'loading' | 'ready' | 'error'
import { useEffect, useState } from 'react'
import { assetUrl, fetchOffers } from '../api'
import { useLanguage } from '../i18n/LanguageContext'

export function useOffers(kind) {
  const { lang } = useLanguage()
  const [state, setState] = useState({ offers: [], status: 'loading' })

  useEffect(() => {
    let cancelled = false
    fetchOffers(kind, lang)
      .then(({ offers }) => {
        if (cancelled) return
        // Photos servies par l'API : adresse complète si l'API est sur un autre domaine
        setState({ offers: offers.map((o) => ({ ...o, image: assetUrl(o.image) })), status: 'ready' })
      })
      .catch(() => !cancelled && setState((s) => ({ ...s, status: 'error' })))
    return () => {
      cancelled = true
    }
  }, [kind, lang])

  return state
}
