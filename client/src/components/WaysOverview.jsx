// « Votre façon de voyager » sur l'accueil, après la bande de cartes (mise en page d'après un modèle Webflow) :
//   gauche  : étiquette, titre (dernier mot en gris), les formules cochées, texte, lien « Parler à un expert »
//   milieu  : une photo par formule (Circuits, Excursions, Long séjour, Sur mesure), flèches précédent / suivant
//   droite  : une ligne par formule (liée aux photos), puis une carte avec la mission de Noziwild (page À propos)
// Textes : home.json → waysLabel, waysTitle, waysText, ways, overview ; photos : emplacements home.ways.1 à 4.
// Une page masquée dans l'admin retire sa formule de la section.
// Animations GSAP à l'arrivée dans l'écran (une seule fois) : titre mot par mot, photo qui se dévoile de bas en haut,
// lignes et carte qui montent ; la photo glisse doucement au défilement (parallaxe). Rien si l'animation est réduite.
import React, { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { useT } from '../i18n/LanguageContext'
import { A } from '../i18n/router'
import { usePhoto } from '../sitePhotos'
import { useSitePages } from '../context/SitePagesContext'
import Team from '../assets/images/site/noziwild-team-lookout.jpg'
import './waysOverview.css'

gsap.registerPlugin(ScrollTrigger)

// ways : [{ href, slot, icon }] dans l'ordre de home.json → ways (voir Home.jsx)
export default function WaysOverview({ ways }) {
  const t = useT('home')
  const about = useT('about')
  const photo = usePhoto()
  const { isHidden } = useSitePages()
  const [index, setIndex] = useState(0)
  const root = useRef(null)

  useLayoutEffect(() => {
    if (!root.current) return undefined
    const mm = gsap.matchMedia(root.current)
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ease = 'expo.out'
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 78%', once: true } })
      tl.from('.nzo__label', { y: 20, opacity: 0, duration: 0.8, ease })
        .from('.nzo__title .nzo__w > span', { yPercent: 110, duration: 1.1, stagger: 0.05, ease }, 0.1)
        .from('.nzo__checks li', { y: 18, opacity: 0, duration: 0.8, stagger: 0.07, ease }, 0.45)
        .from('.nzo__text', { y: 24, opacity: 0, duration: 0.9, ease }, 0.6)
        .from('.nzo__intro > .nzo__link', { x: -24, opacity: 0, duration: 0.9, ease }, 0.75)
        // Photo : se dévoile de bas en haut pendant que l'image se dézoome
        .fromTo('.nzo__media', { clipPath: 'inset(100% 0% 0% 0% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.5, ease, clearProps: 'clipPath' }, 0.15)
        .from('.nzo__frames', { scale: 1.3, duration: 1.8, ease }, 0.15)
        .from('.nzo__pill, .nzo__arrows button, .nzo__caption', { y: 20, opacity: 0, duration: 0.8, stagger: 0.06, ease }, 0.9)
        // Lignes de droite : montent une à une, leur trait se dessine de gauche à droite
        .from('.nzo__facts li', { y: 24, opacity: 0, duration: 0.8, stagger: 0.08, ease }, 0.3)
        .from('.nzo__facts li', { '--nzo-line-scale': 0, duration: 1.2, stagger: 0.08, ease }, 0.3)
        .from('.nzo__card', { y: 60, opacity: 0, duration: 1.1, ease }, 0.6)
        .from('.nzo__avatar', { scale: 0, duration: 0.8, ease: 'back.out(2)' }, 1)
        .from('.nzo__quote', { y: 20, opacity: 0, duration: 0.9, ease }, 1.05)

      // Parallaxe légère de la photo pendant le défilement
      gsap.fromTo('.nzo__frames', { yPercent: -5 }, {
        yPercent: 5, ease: 'none',
        scrollTrigger: { trigger: '.nzo__media', start: 'top bottom', end: 'bottom top', scrub: true },
      })
    })
    return () => mm.revert()
  }, [])

  const texts = t('ways')
  const durations = t('overview.durations')
  const items = ways
    .map((way, i) => ({ ...way, ...texts[i], duration: durations[i] }))
    .filter((way) => !isHidden(way.href))
  if (!items.length) return null

  const current = index % items.length
  const item = items[current]
  const go = (step) => setIndex((i) => (i + step + items.length) % items.length)

  // Titre : le dernier mot en gris, comme la maquette ; chaque mot dans un masque pour l'animation
  const words = t('waysTitle').split(' ')
  const word = (w, i, grey) => (
    <React.Fragment key={i}>
      <span className={`nzo__w${grey ? ' is-grey' : ''}`}><span>{w}</span></span>{grey ? null : ' '}
    </React.Fragment>
  )

  return (
    <section ref={root} className="nzo" aria-labelledby="nzo-title">
      {/* Gauche */}
      <div className="nzo__intro">
        <div>
          <p className="nzo__label"><Star aria-hidden="true" />{t('waysLabel')}</p>
          <h2 id="nzo-title" className="nzo__title">
            {words.map((w, i) => word(w, i, i === words.length - 1))}
          </h2>
          <ul className="nzo__checks">
            {items.map((way) => <li key={way.href}><Check aria-hidden="true" />{way.title}</li>)}
          </ul>
          <p className="nzo__text">{t('waysText')}</p>
        </div>
        <A href="/contact" className="nzo__link">
          {t('talkExpert')}
          <i aria-hidden="true"><ArrowUpRight /></i>
        </A>
      </div>

      {/* Milieu : une photo par formule */}
      <div className="nzo__media" aria-roledescription="carousel" aria-label={t('overview.pill')}>
        <div className="nzo__frames">
          {items.map((way, i) => (
            <img key={way.href} src={photo(way.slot)} alt="" loading={i === 0 ? undefined : 'lazy'} className={i === current ? 'is-active' : undefined} />
          ))}
        </div>
        <span className="nzo__pill">{t('overview.pill')}</span>
        {items.length > 1 && (
          <div className="nzo__arrows">
            <button type="button" onClick={() => go(-1)} aria-label={t('overview.previous')}><ChevronLeft aria-hidden="true" /></button>
            <button type="button" onClick={() => go(1)} aria-label={t('overview.next')}><ChevronRight aria-hidden="true" /></button>
          </div>
        )}
        <div className="nzo__caption" aria-live="polite">
          <A key={`t${current}`} href={item.href} className="nzo__caption-title">
            {item.title}
            <ArrowUpRight aria-hidden="true" />
          </A>
          <p key={`s${current}`} className="nzo__caption-text">{item.text}</p>
        </div>
      </div>

      {/* Droite : une ligne par formule ; la ligne choisie affiche sa photo */}
      <div className="nzo__aside">
        <ul className="nzo__facts">
          {items.map((way, i) => (
            <li key={way.href}>
              <button type="button" onClick={() => setIndex(i)} aria-pressed={i === current} className={i === current ? 'is-active' : undefined}>
                <span>{way.title}</span>
                <strong>{way.duration}</strong>
              </button>
            </li>
          ))}
        </ul>
        <div className="nzo__card">
          <img src={Team} alt="" loading="lazy" className="nzo__avatar" />
          <p className="nzo__quote">{about('missionText')}</p>
          <A href="/about" className="nzo__link">
            {t('overview.story')}
            <i aria-hidden="true"><ArrowUpRight /></i>
          </A>
        </div>
      </div>
    </section>
  )
}
