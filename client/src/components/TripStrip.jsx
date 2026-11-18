// Bande de cartes sous le hero de l'accueil (maquette Aquvion « cruise-travel-home ») :
// photo carrée, titre et durée, qui défilent en continu vers la gauche.
// Contenu lu depuis l'API dans la langue du site : les circuits (jours / nuits), puis les excursions.
// La bande s'arrête au survol et au clavier ; sans animation (prefers-reduced-motion), elle défile à la main.
// Rien n'est affiché tant que rien n'est chargé (API absente : la bande n'apparaît pas).
import React, { useEffect, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { assetUrl, fetchCircuits } from '../api'
import { useOffers } from '../utils/useOffers'
import { useLanguage, useT } from '../i18n/LanguageContext'
import { A } from '../i18n/router'
import './tripStrip.css'

// Secondes pour faire défiler une carte : vitesse constante quel que soit le nombre de cartes
const SECONDS_PER_CARD = 6

function useCircuits() {
  const { lang } = useLanguage()
  const [circuits, setCircuits] = useState([])
  useEffect(() => {
    let cancelled = false
    fetchCircuits(lang)
      .then((data) => !cancelled && setCircuits(data.circuits || []))
      .catch(() => !cancelled && setCircuits([]))
    return () => {
      cancelled = true
    }
  }, [lang])
  return circuits
}

export default function TripStrip() {
  const t = useT('home')
  const circuits = useCircuits()
  const { offers } = useOffers('excursion')

  const items = [
    ...circuits.map((c) => ({
      key: `c-${c.slug}`,
      href: `/circuits/${c.slug}`,
      title: c.title,
      image: assetUrl(c.image),
      meta: t('strip.days', { days: c.days, nights: Math.max(c.days - 1, 0) }),
    })),
    ...offers.map((o) => ({
      key: `e-${o.id}`,
      href: o.link || '/excursions',
      title: o.title,
      image: o.image,
      // « 1 journée · 08:00–17:00 » → « 1 journée »
      meta: (o.duration || '').split('·')[0].trim(),
    })),
  ].filter((item) => item.title && item.image)

  // La bande allonge la page : les animations plus bas recalculent leur position
  useEffect(() => {
    if (!items.length) return undefined
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(frame)
  }, [items.length])

  if (!items.length) return null

  const card = (item, copy) => (
    <li key={`${item.key}${copy ? '-copy' : ''}`} className="nzs__item" aria-hidden={copy || undefined}>
      <A href={item.href} className="nzs__card" tabIndex={copy ? -1 : undefined}>
        <img src={item.image} alt="" loading="lazy" className="nzs__img" />
        <span className="nzs__body">
          <span className="nzs__title">{item.title}</span>
          {item.meta && <span className="nzs__meta">{item.meta}</span>}
        </span>
      </A>
    </li>
  )

  return (
    <section className="nzs" aria-label={t('strip.label')}>
      {/* Deux fois la même liste : quand la première est sortie, la seconde est exactement à sa place */}
      <ul className="nzs__track" style={{ '--nzs-duration': `${items.length * SECONDS_PER_CARD}s` }}>
        {items.map((item) => card(item, false))}
        {items.map((item) => card(item, true))}
      </ul>
    </section>
  )
}
