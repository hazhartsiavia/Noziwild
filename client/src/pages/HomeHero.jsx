// Hero de l'accueil et preloader, repris de la maquette WebsitesV2 (index.html + main.js).
//   1. Preloader : NOZI / WILD montent, une fenêtre s'ouvre entre les deux moitiés
//      et grandit jusqu'à remplir l'écran, où elle se confond avec le hero.
//   2. Hero : apparition du texte, diaporama plein écran et carte « diapositive suivante ».
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from '../i18n/router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from '../components/Navbar'
import { useT } from '../i18n/LanguageContext'
import bg1 from '../assets/images/hero/bg1-2400.jpg'
import bg1Small from '../assets/images/hero/bg1-1200.jpg'
import bg2 from '../assets/images/hero/bg2-2400.jpg'
import bg2Small from '../assets/images/hero/bg2-1200.jpg'
import bg3 from '../assets/images/hero/bg3-2400.jpg'
import bg3Small from '../assets/images/hero/bg3-1200.jpg'
import bg4 from '../assets/images/hero/bg4-2400.jpg'
import bg4Small from '../assets/images/hero/bg4-1200.jpg'
import bg5 from '../assets/images/hero/bg5-2400.jpg'
import bg5Small from '../assets/images/hero/bg5-1200.jpg'
import './homeHero.css'
import { usePhoto } from '../sitePhotos'

gsap.registerPlugin(ScrollTrigger)

// title : position dans home.json → hero.slides (comme la maquette, les trois dernières partagent un titre)
const slides = [
  { image: bg1, small: bg1Small, title: 0 },
  { image: bg2, small: bg2Small, title: 1 },
  { image: bg4, small: bg4Small, title: 2 },
  { image: bg3, small: bg3Small, title: 2 },
  { image: bg5, small: bg5Small, title: 2 },
]
const SLIDE_DURATION = 7
const srcSet = (s) => `${s.small} 1200w, ${s.image} 2400w`
// Taille servie selon l'écran ; une photo remplacée dans l'admin n'a qu'une taille
const imgProps = (s) => (s.small ? { src: s.image, srcSet: srcSet(s), sizes: '100vw' } : { src: s.image })

// Diapositives avec les photos choisies dans l'admin (emplacements home.hero.1 à 5)
function useSlides() {
  const photo = usePhoto()
  return slides.map((s, i) => {
    const custom = photo(`home.hero.${i + 1}`)
    return custom === s.image ? s : { ...s, image: custom, small: null }
  })
}

const reduceMotion =() => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Le preloader ne joue qu'une fois par chargement de page, pas à chaque retour sur l'accueil
let preloaderPlayed = false
export const shouldPlayPreloader = () => !preloaderPlayed && !reduceMotion()

// Se résout quand l'image est décodée, ou au bout de `timeout` ms au plus
const imageReady = (img, timeout = 4000) =>
  Promise.race([
    (img.complete && img.naturalWidth
      ? Promise.resolve()
      : new Promise((res) => {
          img.addEventListener('load', res, { once: true })
          img.addEventListener('error', res, { once: true })
        })
    ).then(() => (img.decode ? img.decode().catch(() => {}) : null)),
    new Promise((res) => setTimeout(res, timeout)),
  ])

/* ----------------------------- Preloader ----------------------------- */

export function Preloader({ onDone }) {
  const slides = useSlides()
  const root = useRef(null)

  useLayoutEffect(() => {
    const el = root.current
    const words = [...el.querySelectorAll('.nzpl__word')]
    const win = el.querySelector('.nzpl__window')
    const winImg = win.querySelector('img')
    const shade = win.querySelector('.nzpl__shade')
    const dot = el.querySelector('.nzpl__dot')
    let cancelled = false

    // Le preloader part toujours du haut de la page, sans défilement possible
    const html = document.documentElement
    const restoration = history.scrollRestoration
    history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    html.style.overflow = 'hidden'

    const ctx = gsap.context(() => {}, el)

    const run = async () => {
      // Les lettres sortent de leurs masques
      const rise = ctx.add(() => gsap.timeline({ delay: 0.35 })
        .to(dot, { autoAlpha: 0, scale: 0, duration: 0.4, ease: 'power2.in' })
        .fromTo(words, { y: 0, yPercent: 110 }, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12 }, '-=0.1'))

      await Promise.all([rise, imageReady(winImg)])
      if (cancelled) return

      const H = parseFloat(getComputedStyle(words[0]).height) / 1.08
      // Jamais plus large que la place laissée à côté de NOZI + WILD (téléphones)
      const lettersW = words.reduce((sum, w) => sum + w.offsetWidth, 0)
      const openW = Math.max(H * 0.6, Math.min(H * 1.55, window.innerWidth * 0.94 - lettersW - H * 0.22))

      await ctx.add(() => gsap.timeline()
        // Une petite fenêtre s'ouvre entre NOZI et WILD…
        .set(win, { visibility: 'visible' })
        .to(win, { width: openW, duration: 1.1, ease: 'expo.inOut' })
        .to(winImg, { scale: 1.3, duration: 1.6, ease: 'power2.out' }, '<')
        // …puis avale l'écran en repoussant les deux moitiés
        .to(win, {
          width: () => window.innerWidth,
          height: () => window.innerHeight,
          duration: 1.5,
          ease: 'expo.inOut',
        }, '+=0.35')
        .to(winImg, { scale: 1.1, duration: 1.5, ease: 'expo.inOut' }, '<')
        .to(shade, { opacity: 1, duration: 1.1, ease: 'power1.inOut' }, '<0.4'))
      if (cancelled) return

      // La fenêtre recouvre maintenant le hero au pixel près : on échange les deux
      preloaderPlayed = true
      onDone()
    }
    run()

    return () => {
      cancelled = true
      ctx.revert()
      html.style.overflow = ''
      history.scrollRestoration = restoration
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={root} className="nzpl" aria-hidden="true">
      <span className="nzpl__dot" />
      <div className="nzpl__row">
        <div className="nzpl__mask">
          <div className="nzpl__word">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="74.74 213.90 162.17 42.72" aria-hidden="true"><path fill="#F6F1E7" d="M106.14,218.58c-.53-.56-1.23-.85-2.08-.85s-1.61,.28-2.14,.85c-.53,.58-.8,1.29-.8,2.13v22.97l-19.41-24.78c-.25-.4-.65-.68-1.18-.89-.53-.18-1.04-.28-1.54-.28-.93,0-1.7,.3-2.32,.93-.62,.62-.93,1.39-.93,2.31v31.12c0,.85,.26,1.54,.79,2.13,.54,.56,1.23,.85,2.09,.85s1.61-.28,2.15-.85c.55-.59,.82-1.28,.82-2.13v-22.81l19.6,24.88c.24,.28,.6,.51,1.09,.67,.48,.15,.96,.23,1.41,.23,.92,0,1.7-.3,2.32-.92,.62-.63,.94-1.4,.94-2.32v-31.12c0-.84-.27-1.55-.8-2.13Z"/><path fill="#F6F1E7" d="M161.32,228.93c-.89-2.3-2.15-4.34-3.77-6.11-1.62-1.75-3.54-3.13-5.76-4.12s-4.64-1.49-7.28-1.49-5.05,.49-7.26,1.49c-2.2,1-4.12,2.38-5.74,4.12-1.62,1.77-2.87,3.81-3.75,6.11-.89,2.31-1.33,4.81-1.33,7.48s.44,5.17,1.33,7.48,2.14,4.35,3.75,6.11c1.62,1.77,3.54,3.13,5.74,4.12,2.21,1.01,4.62,1.5,7.26,1.5s5.06-.49,7.28-1.5c2.22-1,4.15-2.35,5.76-4.12,1.62-1.76,2.88-3.8,3.77-6.11,.89-2.31,1.33-4.8,1.33-7.48s-.44-5.17-1.33-7.48Zm-7.05,13.97c-.96,1.94-2.27,3.48-3.95,4.61-1.66,1.15-3.6,1.71-5.81,1.71s-4.15-.56-5.82-1.71c-1.68-1.13-2.97-2.67-3.92-4.61-.96-1.93-1.42-4.1-1.42-6.49s.47-4.58,1.42-6.5c.94-1.93,2.24-3.46,3.92-4.59,1.67-1.14,3.61-1.7,5.82-1.7s4.15,.56,5.81,1.7c1.68,1.13,3,2.67,3.95,4.6,.97,1.94,1.44,4.09,1.44,6.49s-.48,4.56-1.44,6.49Z"/><path fill="#B29147" d="M149.56,236.41c0,1.07-.22,2.05-.65,2.92-.43,.87-1.02,1.57-1.78,2.08-.75,.52-1.63,.77-2.62,.77s-1.87-.26-2.62-.77c-.76-.51-1.34-1.2-1.77-2.08-.43-.87-.64-1.84-.64-2.92s.21-2.07,.64-2.93c.42-.87,1.01-1.56,1.77-2.07,.75-.51,1.63-.77,2.62-.77s1.87,.26,2.62,.77c.76,.51,1.35,1.2,1.78,2.07,.43,.87,.65,1.84,.65,2.92Z"/><path fill="#F6F1E7" d="M210.03,220.87c0-.96-.39-1.71-1.14-2.29-.77-.56-1.55-.85-2.32-.85h-21.83c-.92,0-1.69,.27-2.31,.81-.63,.54-.94,1.29-.94,2.22s.31,1.66,.94,2.24c.62,.58,1.39,.86,2.31,.86h15.45l-20.25,26.05c-.51,.65-.76,1.33-.76,2.03,0,.78,.35,1.49,1.02,2.15,.68,.67,1.49,.99,2.4,.99h23.44c.91,0,1.69-.29,2.31-.89,.63-.56,.93-1.32,.93-2.2,0-.92-.3-1.66-.93-2.21-.62-.55-1.4-.84-2.31-.84h-17.04l20.28-26.02c.5-.68,.75-1.36,.75-2.04Z"/><path fill="#F6F1E7" d="M234.93,218.67c-.66-.63-1.41-.93-2.27-.93-1,0-1.81,.3-2.46,.93-.64,.62-.96,1.39-.96,2.31v30.85c0,.92,.3,1.69,.91,2.32,.61,.62,1.41,.92,2.4,.92,.89,0,1.67-.3,2.35-.92,.66-.63,1.01-1.4,1.01-2.32v-30.85c0-.92-.34-1.69-.99-2.31Z"/></svg>
          </div>
        </div>
        <div className="nzpl__window">
          <img {...imgProps(slides[0])} alt="" fetchPriority="high" />
          <span className="nzpl__shade" />
        </div>
        <div className="nzpl__mask">
          <div className="nzpl__word">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="253.12 213.90 172.16 42.72" aria-hidden="true"><path fill="#F6F1E7" d="M301.6,218.51c-.75-.64-1.54-.94-2.35-.94-.66,0-1.31,.18-1.92,.53-.6,.37-1.01,.89-1.22,1.54l-7.91,23.96-6.55-16.47c-.26-.64-.64-1.15-1.18-1.54-.53-.37-1.14-.53-1.8-.49-.68-.04-1.29,.12-1.82,.49-.53,.39-.94,.9-1.23,1.54l-6.93,16.63-7.95-24.11c-.21-.65-.61-1.17-1.19-1.54-.59-.35-1.23-.53-1.9-.53-.81,0-1.61,.3-2.38,.94-.76,.62-1.15,1.45-1.15,2.52,0,.31,.05,.69,.16,1.09l10.52,30.93c.21,.66,.61,1.15,1.17,1.49,.58,.34,1.14,.51,1.7,.55,.61,0,1.2-.18,1.8-.53,.58-.36,1.03-.86,1.36-1.54l7.62-17.23,7.59,17.23c.31,.68,.78,1.18,1.36,1.54,.6,.35,1.18,.53,1.79,.53,.61-.04,1.18-.22,1.74-.55s.92-.82,1.15-1.49l10.52-30.93c.1-.39,.15-.77,.15-1.09,0-1.06-.37-1.9-1.12-2.52Z"/><path fill="#B29147" d="M324.23,228.56c-3.07-1.88-4.61-4.35-4.61-6.83s1.55-4.95,4.61-6.83c6.16,3.77,6.16,9.88,0,13.65Z"/><path fill="#F6F1E7" d="M327.59,235.35v16.47c0,.93-.33,1.69-1.01,2.33-.67,.62-1.46,.93-2.35,.93-.99,0-1.79-.31-2.4-.93-.61-.63-.9-1.4-.9-2.33v-16.47c0-.93,.32-1.71,.96-2.33,.63-.62,1.45-.94,2.45-.94,.85,0,1.61,.32,2.26,.94,.67,.62,.99,1.4,.99,2.33Z"/><path fill="#F6F1E7" d="M371.85,249.72c-.62-.59-1.4-.88-2.32-.88h-13.93v-27.86c0-.92-.31-1.69-.98-2.31-.66-.63-1.42-.93-2.27-.93-1,0-1.81,.3-2.45,.93-.64,.62-.97,1.39-.97,2.31v30.85c0,.92,.31,1.69,.94,2.32,.62,.62,1.38,.92,2.31,.92h17.34c.92,0,1.7-.29,2.32-.89,.62-.56,.94-1.32,.94-2.2,0-.92-.33-1.68-.94-2.27Z"/><path fill="#F6F1E7" d="M423.23,229.18c-.69-2.27-1.71-4.24-3.09-5.99-1.37-1.7-3.05-3.05-5.05-4.02-1.99-.96-4.26-1.43-6.83-1.43h-12.75c-.92,0-1.7,.3-2.32,.93-.62,.62-.94,1.39-.94,2.31v30.85c0,.92,.33,1.69,.94,2.32,.62,.62,1.4,.92,2.32,.92h12.75c3.45,0,6.36-.82,8.73-2.52,2.37-1.66,4.17-3.91,5.42-6.73,1.25-2.84,1.87-5.98,1.87-9.43,0-2.55-.35-4.97-1.04-7.23Zm-6.89,13.46c-.65,1.89-1.69,3.42-3.11,4.58-1.42,1.15-3.26,1.73-5.49,1.73h-8.8v.6l-.33-.6h.33v-25.07h-.53l.53-.49v.49h8.8c1.67,0,3.1,.34,4.32,1.01,1.22,.68,2.2,1.6,3,2.75,.77,1.16,1.36,2.5,1.73,3.99,.37,1.53,.56,3.13,.56,4.79,0,2.25-.33,4.32-1,6.23Z"/></svg>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------- Hero -------------------------------- */

// ready : le preloader est terminé (ou n'a pas lieu d'être), le hero peut faire son entrée
export function Hero({ ready }) {
  const slides = useSlides()
  const root = useRef(null)
  const bar = useRef(null)
  const card = useRef(null)
  const progress = useRef(null)
  const t = useT('home')
  const titles = t('hero.slides')
  const [index, setIndex] = useState(0)
  const [leaving, setLeaving] = useState(null)
  // Pas de défilement automatique si l'utilisateur limite les animations
  const [paused, setPaused] = useState(reduceMotion)
  const pausedRef = useRef(paused)
  // La carte montre la diapositive suivante ; elle change après un fondu
  const [cardIndex, setCardIndex] = useState(1)
  const next = slides[cardIndex]

  const go = (to) => {
    const target = (to + slides.length) % slides.length
    if (target === index) return
    setLeaving(index)
    setIndex(target)
  }
  const goRef = useRef(go)
  goRef.current = go

  // Entrée du hero, une fois le preloader retiré
  useLayoutEffect(() => {
    if (!ready || reduceMotion()) return
    const ctx = gsap.context(() => {
      // La navbar joue sa propre entrée en apparaissant ; ici, seulement la bande blanche où elle s'accroche
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .fromTo('.nzh__strip', { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: 'power2.out' }, 0)
        .fromTo('.nzh__content .nzh__reveal > span', { y: 0, yPercent: 105 }, { yPercent: 0, duration: 1.3, stagger: 0.1 }, 0.1)
        .fromTo('.nzh__cta', { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1 }, 0.45)
        .fromTo('.nzh__card', { x: 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.3 }, 0.3)
        .fromTo('.nzh__giant span', { y: 0, yPercent: 105 }, { yPercent: 0, duration: 1.6 }, 0.25)
        .fromTo('.nzh__scroll', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 0.8)
    }, root)
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [ready])

  // Le hero s'éloigne lentement sous la section suivante
  useLayoutEffect(() => {
    if (reduceMotion()) return
    const ctx = gsap.context(() => {
      gsap.to('.nzh__media', {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  // Barre de progression : à la fin, diapositive suivante
  useEffect(() => {
    if (!ready || reduceMotion()) return
    const tween = gsap.fromTo(bar.current, { scaleX: 0 }, {
      scaleX: 1,
      duration: SLIDE_DURATION,
      ease: 'none',
      paused: pausedRef.current,
      onComplete: () => goRef.current(index + 1),
    })
    progress.current = tween
    return () => tween.kill()
  }, [index, ready])

  useEffect(() => {
    pausedRef.current = paused
    if (paused) progress.current?.pause()
    else progress.current?.resume()
  }, [paused])

  // La diapositive qui sort garde son zoom le temps du fondu
  useEffect(() => {
    if (leaving === null) return
    const timer = setTimeout(() => setLeaving(null), 1500)
    return () => clearTimeout(timer)
  }, [leaving])

  // Carte : fondu, nouvelle image, retour
  useEffect(() => {
    const following = (index + 1) % slides.length
    if (following === cardIndex) return
    if (reduceMotion()) return setCardIndex(following)
    const items = card.current.querySelectorAll('.nzh__card-media img, .nzh__card-title')
    const tl = gsap.timeline()
      .to(items, { autoAlpha: 0, y: 6, duration: 0.35, ease: 'power2.in' })
      .add(() => setCardIndex(following))
      .to(items, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.06 })
    return () => tl.kill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  return (
    <section ref={root} className={`nzh${ready ? '' : ' is-loading'}`} aria-label={t('hero.label')}>
      <div className="nzh__media" aria-hidden="true">
        {slides.map((s, i) => (
          <div key={s.image} className={`nzh__slide${i === index ? ' is-active' : ''}${i === leaving ? ' is-leaving' : ''}`}>
            <img {...imgProps(s)} alt="" loading={i === 0 ? undefined : 'lazy'} fetchPriority={i === 0 ? 'high' : undefined} />
          </div>
        ))}
      </div>
      <div className="nzh__shade" aria-hidden="true" />

      {/* Navbar du site, inchangée, accrochée à une bande blanche comme sur les autres pages à photo.
          Montée après le preloader pour que son animation d'entrée se voie. */}
      <div className="nzh__nav">
        <div className="nzh__strip" aria-hidden="true" />
        {ready && <Navbar />}
      </div>

      <div className="nzh__content">
        <p className="nzh__eyebrow"><span className="nzh__reveal"><span>{t('hero.eyebrow')}</span></span></p>
        <h1 className="nzh__title">
          <span className="nzh__reveal"><span>{t('hero.title1')}</span></span>
          <span className="nzh__reveal"><span>{t('hero.title2')}</span></span>
        </h1>
        <Link className="nzh__cta" to="/circuits">
          <span>{t('hero.cta')}</span>
          <i aria-hidden="true">→</i>
        </Link>
      </div>

      <aside ref={card} className="nzh__card">
        <button type="button" className="nzh__card-media" onClick={() => go(index + 1)} aria-label={t('hero.next')}>
          <img src={next.small} alt="" />
        </button>
        <button
          type="button"
          className="nzh__toggle"
          onClick={() => setPaused((p) => !p)}
          aria-label={t(paused ? 'hero.play' : 'hero.pause')}
          aria-pressed={paused}
        >
          <span className={paused ? 'nzh__i-play' : 'nzh__i-pause'} aria-hidden="true" />
        </button>
        <p className="nzh__card-title">{titles[next.title]}</p>
        <div className="nzh__progress" aria-hidden="true"><span ref={bar} /></div>
      </aside>

      <p className="nzh__giant" aria-hidden="true"><span>Noziwild</span></p>

      <div className="nzh__scroll" aria-hidden="true"><span /> <i>{t('hero.scroll')}</i></div>
    </section>
  )
}
