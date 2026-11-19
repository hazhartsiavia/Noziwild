// « À propos de nous » sur l'accueil, après « Votre façon de voyager » (mise en page d'après un modèle Webflow) :
//   haut   : étiquette et « Noziwild · Madagascar », un trait ; grande phrase (fin en gras) et bouton vers À propos
//   bas    : une photo, puis quatre cartes de chiffres en mosaïque, dont les chiffres défilent comme un compteur
// Chiffres réels, lus en direct : destinations publiées, note moyenne des avis, circuits + excursions publiés,
// et les régions de l'accueil. Une carte dont le chiffre n'est pas disponible (API absente) n'apparaît pas.
// Textes : home.json → aboutUs ; photo : emplacement home.about.1 (admin > Pages & photos).
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, Sparkles } from 'lucide-react'
import { fetchCircuits, fetchDestinations } from '../api'
import { useLanguage, useT } from '../i18n/LanguageContext'
import { A } from '../i18n/router'
import { LOCALES } from '../utils/format'
import { useOffers } from '../utils/useOffers'
import { usePhoto } from '../sitePhotos'
import './aboutUs.css'

gsap.registerPlugin(ScrollTrigger)

// Nombre de circuits et de destinations publiés (null tant que rien n'est chargé ou si l'API ne répond pas)
function useCounts() {
  const { lang } = useLanguage()
  const [counts, setCounts] = useState({ circuits: null, destinations: null })
  useEffect(() => {
    let cancelled = false
    fetchCircuits(lang).then((d) => !cancelled && setCounts((c) => ({ ...c, circuits: d.circuits?.length ?? null }))).catch(() => {})
    fetchDestinations(lang).then((d) => !cancelled && setCounts((c) => ({ ...c, destinations: d.destinations?.length ?? null }))).catch(() => {})
    return () => {
      cancelled = true
    }
  }, [lang])
  return counts
}

// Chiffre « compteur » : chaque chiffre est une colonne 0-9 qui défile jusqu'à la bonne valeur (GSAP)
function Rolling({ value }) {
  return (
    <span className="nza__num" aria-label={value}>
      {Array.from(value).map((ch, i) => (/\d/.test(ch)
        ? (
          <span key={i} className="nza__digit" aria-hidden="true">
            <span className="nza__reel" data-digit={ch}>
              {'0123456789'.split('').map((d) => <span key={d}>{d}</span>)}
            </span>
          </span>
        )
        : <span key={i} aria-hidden="true">{ch}</span>))}
    </span>
  )
}

// regions : nombre de régions présentées sur l'accueil (Home.jsx)
export default function AboutUs({ regions }) {
  const t = useT('home')
  const { lang } = useLanguage()
  const photo = usePhoto()
  const root = useRef(null)
  const counts = useCounts()
  const { offers: excursions, status: excursionStatus } = useOffers('excursion')
  const { offers: reviews, status: reviewStatus } = useOffers('testimonial')

  const format = (n, digits = 0) => new Intl.NumberFormat(LOCALES[lang] || 'en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)
  const average = reviews.length ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length : null
  const trips = counts.circuits != null && excursionStatus === 'ready' ? counts.circuits + excursions.length : null

  // Deux colonnes de cartes : petite + grande, puis grande + petite (comme la maquette)
  const stats = {
    destinations: counts.destinations ? { value: format(counts.destinations), label: t('aboutUs.stats.destinations') } : null,
    rating: average ? { value: format(average, 1), suffix: '/5', ...t('aboutUs.stats.rating') } : null,
    trips: trips ? { value: format(trips), ...t('aboutUs.stats.trips') } : null,
    regions: regions ? { value: format(regions), label: t('aboutUs.stats.regions') } : null,
  }
  const columns = [[['small', stats.destinations], ['tall', stats.rating]], [['tall', stats.trips], ['small', stats.regions]]]
    .map((col) => col.filter(([, s]) => s))
  const ready = reviewStatus !== 'loading' && excursionStatus !== 'loading'
  const cardCount = columns.flat().length

  // Arrivée (GSAP, une fois) : en-tête et phrase qui montent, photo dévoilée, cartes et chiffres qui défilent
  useLayoutEffect(() => {
    if (!root.current || !ready) return undefined
    const mm = gsap.matchMedia(root.current)
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ease = 'expo.out'
      gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 80%', once: true } })
        .from('.nza__top > *', { y: 16, opacity: 0, duration: 0.8, stagger: 0.08, ease })
        .from('.nza__rule', { scaleX: 0, transformOrigin: 'left', duration: 1.4, ease }, 0.1)
        .from('.nza__line > span', { yPercent: 110, duration: 1.1, stagger: 0.03, ease }, 0.2)
        .from('.nza__cta', { y: 24, opacity: 0, duration: 0.9, ease }, 0.6)

      const grid = { trigger: '.nza__grid', start: 'top 82%', once: true }
      gsap.fromTo('.nza__photo', { clipPath: 'inset(100% 0% 0% 0% round 18px)' }, { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.4, ease, clearProps: 'clipPath', scrollTrigger: grid })
      gsap.from('.nza__photo img', { scale: 1.3, duration: 1.8, ease, scrollTrigger: grid })
      gsap.from('.nza__stat', { y: 50, opacity: 0, duration: 1, stagger: 0.1, ease, scrollTrigger: grid })
      // Compteur : chaque colonne part de 0 et descend jusqu'à son chiffre
      gsap.utils.toArray('.nza__reel').forEach((reel, i) => {
        // y: 0 remplace la position posée en CSS (sinon elle s'ajouterait au défilement) ;
        // immediateRender: false : le bon chiffre reste affiché jusqu'au départ de l'animation
        gsap.fromTo(reel, { y: 0, yPercent: 0 }, { y: 0, yPercent: -10 * Number(reel.dataset.digit), duration: 1.6 + (i % 3) * 0.2, ease: 'power3.out', immediateRender: false, scrollTrigger: grid })
      })
    })
    return () => mm.revert()
  }, [ready, cardCount])

  // Grande phrase : un masque par mot pour qu'ils montent l'un après l'autre (le gras est gardé)
  const words = t('aboutUs.headline').split('**').flatMap((part, i) =>
    part.split(' ').filter(Boolean).map((w) => ({ w, bold: i % 2 === 1 })))

  const card = ([size, s], key) => (
    <div key={key} className={`nza__stat nza__stat--${size}`}>
      <p className="nza__value"><Rolling value={s.value} />{s.suffix && <small>{s.suffix}</small>}</p>
      {size === 'small'
        ? <p className="nza__stat-label">{s.label}</p>
        : (
          <div className="nza__stat-body">
            <p className="nza__stat-title">{s.title}</p>
            <p className="nza__stat-text">{s.text}</p>
          </div>
        )}
    </div>
  )

  return (
    <section ref={root} className="nza" aria-labelledby="nza-title">
      <div className="nza__top">
        <p className="nza__label"><Sparkles aria-hidden="true" />{t('aboutUs.label')}</p>
        <p className="nza__handle">Noziwild · Madagascar</p>
      </div>
      <span className="nza__rule" aria-hidden="true" />

      <div className="nza__statement">
        <h2 id="nza-title" className="nza__headline" aria-label={t('aboutUs.headline').replaceAll('**', '')}>
          {words.map(({ w, bold }, i) => (
            <React.Fragment key={i}>
              <span className={`nza__line${bold ? ' is-bold' : ''}`} aria-hidden="true"><span>{w}</span></span>{' '}
            </React.Fragment>
          ))}
        </h2>
        <A href="/about" className="nza__cta"><ArrowRight aria-hidden="true" />{t('aboutUs.cta')}</A>
      </div>

      <div className="nza__grid">
        <div className="nza__photo"><img src={photo('home.about.1')} alt="" loading="lazy" /></div>
        <div className="nza__stats">
          {columns.map((col, c) => col.length > 0 && (
            <div key={c} className="nza__stats-col">{col.map((item, i) => card(item, `${c}-${i}`))}</div>
          ))}
        </div>
      </div>
    </section>
  )
}
