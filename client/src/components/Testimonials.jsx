// Section Témoignages de l'accueil (mise en page d'après un modèle Webflow, couleurs et police Noziwild) :
//   gauche : grand titre posé dans un coin découpé, puis la vidéo d'un voyageur dans la langue du site,
//            puis un bandeau « Envie de partir ? » avec un bouton
//   droite : deux avis à la fois, avec des boutons précédent / suivant (pas de défilement automatique)
// Avis : admin > Offers > Testimonials (publication, ordre, note, photo, traductions) : textes dans la langue du site.
// Vidéo : admin > Offers > Client videos ; la première vidéo de la langue du site est montrée.
//         Sans vidéo dans cette langue : la vidéo de présentation de Noziwild (assets/videos/presentation.mp4),
//         en boucle et sans son, jouée seulement quand elle est à l'écran, avec un bouton pour le son.
// Textes de la section : locales/<langue>/testimonials.json
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronLeft, ChevronRight, ChevronsRight, Pause, Play, Star, Volume2, VolumeX } from 'lucide-react'
import { assetUrl } from '../api'
import { useLanguage, useT } from '../i18n/LanguageContext'
import { A } from '../i18n/router'
import { useOffers } from '../utils/useOffers'
import presentation from '../assets/videos/presentation.mp4'
import presentationPoster from '../assets/videos/presentation.jpg'
import './testimonials.css'

gsap.registerPlugin(ScrollTrigger)

// Avis visibles en même temps (un seul sur tablette et téléphone, voir testimonials.css)
const PER_VIEW = 2
const pad = (n) => String(n).padStart(2, '0')

const initials = (name) => name.split(/[\s&.]+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('')

function Avatar({ item }) {
  if (item.image) return <img src={item.image} alt="" className="nzt__avatar" />
  return <span aria-hidden="true" className="nzt__avatar nzt__avatar--initials">{initials(item.title)}</span>
}

function Stars({ rating, label }) {
  const rounded = Math.round(rating)
  return (
    <span role="img" aria-label={label} className="nzt__stars">
      {[1, 2, 3, 4, 5].map((n) => <Star key={n} aria-hidden="true" className={n <= rounded ? 'is-on' : undefined} />)}
    </span>
  )
}

function Card({ item }) {
  const t = useT('testimonials')
  return (
    <li className="nzt__item">
      <figure className="nzt__card">
        <Stars rating={item.rating} label={t('ratingLabel', { rating: item.rating })} />
        <blockquote className="nzt__quote">{item.text}</blockquote>
        <figcaption className="nzt__who">
          <Avatar item={item} />
          <span className="nzt__name">
            <span>– {item.title}</span>
            {item.origin && <small>{item.origin}</small>}
          </span>
        </figcaption>
      </figure>
    </li>
  )
}

// Vidéo de présentation de Noziwild : en boucle, sans son, jouée seulement quand elle est à l'écran
// (pas de lecture automatique si les animations sont réduites). Deux boutons : pause / lecture et son.
// Mise en pause par le visiteur : elle ne repart pas toute seule en revenant à l'écran.
function Presentation() {
  const t = useT('testimonials')
  const player = useRef(null)
  const stopped = useRef(false)   // pause demandée par le visiteur
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const el = player.current
    if (!el) return undefined
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (still) stopped.current = true
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) el.pause()
      else if (!stopped.current) el.play().catch(() => {})
    }, { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const togglePlay = () => {
    const el = player.current
    if (!el) return
    if (el.paused) {
      stopped.current = false
      el.play().catch(() => {})
    } else {
      stopped.current = true
      el.pause()
    }
  }

  const toggleSound = () => {
    const el = player.current
    if (!el) return
    el.muted = !el.muted
    setMuted(el.muted)
    if (el.paused) {
      stopped.current = false
      el.play().catch(() => {})
    }
  }

  return (
    <>
      <video
        ref={player}
        src={presentation}
        poster={presentationPoster}
        muted
        loop
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="nzt__photo"
      />
      <div className="nzt__vctrl">
        <button type="button" onClick={togglePlay} aria-label={t(playing ? 'pauseVideo' : 'playVideo')} className="nzt__vbtn">
          {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" className="nzt__vbtn-play" />}
        </button>
        <button type="button" onClick={toggleSound} aria-pressed={!muted} aria-label={t(muted ? 'soundOn' : 'soundOff')} className="nzt__vbtn">
          {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
        </button>
      </div>
    </>
  )
}

// Vidéo du voyageur (langue du site) ; l'image d'attente et le bouton lecture tant qu'elle n'a pas démarré
function Media({ video }) {
  const t = useT('testimonials')
  const player = useRef(null)
  const [started, setStarted] = useState(false)

  if (!video) return <Presentation />

  const start = () => {
    setStarted(true)
    player.current?.play()
  }

  return (
    <>
      {/* Sans image choisie, #t=0.1 fait apparaître la première image de la vidéo */}
      <video
        ref={player}
        src={`${assetUrl(video.video)}${video.image ? '' : '#t=0.1'}`}
        poster={video.image || undefined}
        preload={video.image ? 'none' : 'metadata'}
        controls={started}
        playsInline
        className="nzt__photo"
      />
      {!started && (
        <button type="button" onClick={start} aria-label={t('play', { name: video.title })} className="nzt__play">
          <span><Play aria-hidden="true" /></span>
        </button>
      )}
      {!started && (video.title || video.origin) && (
        <p className="nzt__credit">{[video.title, video.origin].filter(Boolean).join(' · ')}</p>
      )}
    </>
  )
}

function Testimonials({ className = '' }) {
  const t = useT('testimonials')
  const { lang } = useLanguage()
  const { offers, status } = useOffers('testimonial')
  const { offers: videos, status: videoStatus } = useOffers('client_video')
  const video = videos.find((v) => v.language === lang)
  const root = useRef(null)
  const [start, setStart] = useState(0)
  const firstRender = useRef(true)
  const count = offers.length
  const current = count ? start % count : 0
  const visible = Array.from({ length: Math.min(PER_VIEW, count) }, (_, i) => offers[(current + i) % count])
  const go = (step) => setStart((s) => (s + step + count) % count)

  // Changement d'avis : les cartes affichées arrivent en glissant (pas au premier affichage)
  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return undefined
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !root.current) return undefined
    const tween = gsap.fromTo(root.current.querySelectorAll('.nzt__item'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'expo.out', clearProps: 'all' })
    return () => tween.kill()
  }, [current])

  // Arrivée (GSAP, une fois) : titre mot par mot, bandeau et avis qui montent.
  // Vidéo, au défilement : elle s'ouvre depuis une forme plus petite et arrondie en arrivant, reste entière
  // un moment, puis se referme de la même façon en sortant de l'écran (dans les deux sens).
  useLayoutEffect(() => {
    if (status === 'loading' || videoStatus === 'loading' || !root.current) return undefined
    const mm = gsap.matchMedia(root.current)
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ease = 'expo.out'
      gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 75%', once: true } })
        .from('.nzt__title .nzt__w > span', { yPercent: 110, duration: 1.1, stagger: 0.06, ease })
        .from('.nzt__cta', { y: 50, opacity: 0, duration: 1, ease }, 0.5)
        .from('.nzt__item, .nzt__controls', { x: 80, opacity: 0, duration: 1.1, stagger: 0.12, ease }, 0.3)

      const closed = 'inset(18% 12% 18% 12% round 160px 160px 160px 160px)'
      const open = 'inset(0% 0% 0% 0% round 28px 28px 28px 28px)'
      gsap.timeline({ scrollTrigger: { trigger: '.nzt__media', start: 'top bottom', end: 'bottom top', scrub: 0.6 } })
        .fromTo('.nzt__media', { clipPath: closed }, { clipPath: open, duration: 0.35, ease: 'power2.out' }, 0)
        .fromTo('.nzt__media > *', { scale: 1.3 }, { scale: 1, duration: 0.35, ease: 'power2.out' }, 0)
        .fromTo('.nzt__media', { clipPath: open }, { clipPath: closed, duration: 0.3, ease: 'power2.in', immediateRender: false }, 0.7)
        .fromTo('.nzt__media > *', { scale: 1 }, { scale: 1.3, duration: 0.3, ease: 'power2.in', immediateRender: false }, 0.7)
    })
    return () => mm.revert()
  }, [status, videoStatus])

  if (!offers.length && !video) return null

  // Titre : chaque mot dans un masque pour l'animation
  const words = t('headline').split(' ')

  return (
    <section ref={root} className={`nzt ${className}`} aria-labelledby="nzt-title">
      <div className="nzt__main">
        <div className="nzt__media">
          <Media key={`${lang}-${video?.id || 'photo'}`} video={video} />
        </div>
        {/* Titre posé dans le coin découpé de la vidéo (hors de la vidéo : son dévoilement ne le cache pas) */}
        <h2 id="nzt-title" className="nzt__title">
          {words.map((w, i) => (
            <React.Fragment key={i}>
              <span className="nzt__w"><span>{w}</span></span>{i < words.length - 1 ? ' ' : null}
            </React.Fragment>
          ))}
        </h2>

        <div className="nzt__cta">
          <p>{t('ctaTitle')} <span aria-hidden="true">😊</span></p>
          <A href="/tailor-made" className="nzt__button">
            <i aria-hidden="true"><ChevronsRight /></i>
            {t('ctaButton')}
          </A>
        </div>
      </div>

      {offers.length > 0 && (
        <div className="nzt__reviews">
          <ul className="nzt__track" aria-live="polite">
            {visible.map((item) => <Card key={item.id} item={item} />)}
          </ul>
          {count > 1 && (
            <div className="nzt__controls">
              <p className="nzt__count" aria-hidden="true"><strong>{pad(current + 1)}</strong> / {pad(count)}</p>
              <div className="nzt__arrows">
                <button type="button" onClick={() => go(-1)} aria-label={t('previous')}><ChevronLeft aria-hidden="true" /></button>
                <button type="button" onClick={() => go(1)} aria-label={t('next')}><ChevronRight aria-hidden="true" /></button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default Testimonials
