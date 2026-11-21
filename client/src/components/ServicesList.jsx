// Section Services de l'accueil (mise en page d'après un modèle Webflow) :
//   à gauche le texte (étiquette, titre, phrase, bouton « Demander un devis »), puis une carte par service.
//   Ordinateur : la section reste fixe à l'écran et les cartes défilent de droite à gauche pendant que l'on
//   fait défiler la page vers le bas (ScrollTrigger, pin + scrub) ; une carte sur deux est décalée vers le bas.
//   Téléphone, tablette ou animations réduites : une rangée de cartes à faire glisser au doigt.
// Carte blanche : photo de la page du service, nombre d'offres | première offre, nom, phrase d'intro de la page.
// Tout vient du site (home.json → services, pages des services, admin > Offers). Page masquée : service retiré.
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Wrench } from 'lucide-react'
import { fetchOffers } from '../api'
import { useLanguage, useT } from '../i18n/LanguageContext'
import { A } from '../i18n/router'
import { usePhoto } from '../sitePhotos'
import { useSitePages } from '../context/SitePagesContext'
import './servicesList.css'

gsap.registerPlugin(ScrollTrigger)

// Noms des offres de chaque service, chargés ensemble dans la langue du site : { [kind]: [titre, …] }
function useOfferTitles(kinds) {
  const { lang } = useLanguage()
  const [byKind, setByKind] = useState({})
  const key = kinds.join(',')
  useEffect(() => {
    let cancelled = false
    Promise.all(key.split(',').map((kind) => fetchOffers(kind, lang)
      .then(({ offers }) => [kind, offers.map((o) => o.title).filter(Boolean)])
      .catch(() => [kind, null])))
      .then((entries) => !cancelled && setByKind(Object.fromEntries(entries)))
    return () => {
      cancelled = true
    }
  }, [key, lang])
  return byKind
}

// Une carte de service : carte blanche, photo encadrée, ligne d'infos (nombre d'offres | première offre),
// nom et phrase d'intro de la page du service
function ServiceCard({ service }) {
  const t = useT('home')
  const page = useT(service.ns)
  const photo = usePhoto()
  const names = service.offers || []

  return (
    <li className="nzv__card">
      <A href={service.href} className="nzv__link">
        <span className="nzv__photo"><img src={photo(service.slot)} alt="" loading="lazy" /></span>
        <span className="nzv__body">
          {names.length > 0 && (
            <span className="nzv__meta">
              <span>{t('servicesCount', { count: names.length })}</span>
              <span className="nzv__meta-first">{names[0]}</span>
            </span>
          )}
          <span className="nzv__name">{service.title}<ArrowUpRight aria-hidden="true" /></span>
          <span className="nzv__text">{page(service.textKey)}</span>
        </span>
      </A>
    </li>
  )
}

// services : [{ href, ns, textKey, slot, kind }] dans l'ordre de home.json → services (voir Home.jsx)
// children : la section qui s'ouvre depuis le bouton de fin (Voyages signature, voir Home.jsx → Trips)
// ctaImage : photo de cette section, déjà visible en fond du bouton « Parler à un expert »
export default function ServicesList({ services, children, ctaImage }) {
  const t = useT('home')
  const nav = useT('nav')
  const { isHidden } = useSitePages()
  const root = useRef(null)
  const track = useRef(null)
  const reveal = useRef(null)
  const scroller = useRef(null)
  // Boutons ← → sous la rangée (téléphone, tablette) : début / fin de la rangée atteints ?
  const [edge, setEdge] = useState({ start: true, end: false })
  const titles = t('services')
  const offers = useOfferTitles(services.map((s) => s.kind))
  const items = services
    .map((s, i) => ({ ...s, title: titles[i], offers: offers[s.kind] }))
    .filter((s) => !isHidden(s.href))

  useLayoutEffect(() => {
    if (!root.current || !track.current) return undefined
    const mm = gsap.matchMedia(root.current)

    // Ordinateur : une seule scène figée.
    //   1. les cartes défilent vers la gauche ; arrêt net quand « Parler à un expert » est au milieu de l'écran
    //   2. la photo des voyages apparaît à la place du bouton, en pilule, et s'agrandit jusqu'à remplir l'écran
    //   3. le titre et la carte des voyages apparaissent ; un temps d'arrêt pour choisir un voyage
    //   4. la scène reste figée pendant que la section suivante (Destinations) monte par-dessus
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const button = () => track.current.querySelector('.nzv__end .nzv__btn')
      // Distance de défilement des cartes : jusqu'à ce que le centre du bouton soit au milieu de l'écran
      const distance = () => {
        const b = button()?.getBoundingClientRect()
        if (!b) return Math.max(0, track.current.scrollWidth - root.current.clientWidth)
        const center = b.left - track.current.getBoundingClientRect().left + b.width / 2
        return Math.max(0, center - root.current.clientWidth / 2)
      }
      const opening = () => window.innerHeight * 0.9   // ouverture de la pilule
      const stay = () => (reveal.current ? window.innerHeight * 0.6 : 0)   // temps d'arrêt sur les voyages
      // Puis la scène reste figée un écran de plus : la section suivante (Destinations) monte par-dessus
      // (elle est remontée d'un écran, voir homeRegions.css → .nzr-pin)
      const cover = () => (reveal.current ? window.innerHeight : 0)

      const setX = gsap.quickSetter(track.current, 'x', 'px')
      const panel = reveal.current
      const photos = panel?.querySelector('.nzx__frames')
      const content = panel?.querySelector('.nzx__content')
      const label = panel?.querySelector('.nzv__reveal-cta')
      const row = root.current.querySelector('.nzv__scroller')
      let travel = 0
      let pill = null   // position du bouton dans la section, une fois arrivé au milieu : { top, side, bottom, radius }

      const measure = () => {
        travel = distance()
        const b = button()?.getBoundingClientRect()
        const box = root.current.getBoundingClientRect()
        if (!b) return
        pill = {
          top: b.top - box.top,
          bottom: box.bottom - b.bottom,
          side: (box.width - b.width) / 2,
          radius: b.height / 2,
        }
        // Fond du bouton cadré comme la photo qui s'agrandit (plein écran, agrandie à 125 %, centrée) :
        // au moment où la pilule prend le relais, l'image ne bouge pas.
        const img = panel?.querySelector('.nzx__frames img.is-active') || panel?.querySelector('.nzx__frames img')
        const el = button()
        if (img?.naturalWidth && el) {
          const scale = Math.max(box.width / img.naturalWidth, box.height / img.naturalHeight) * 1.25
          const w = img.naturalWidth * scale
          const h = img.naturalHeight * scale
          el.style.backgroundSize = `${w}px ${h}px`
          el.style.backgroundPosition = `${b.width / 2 - w / 2}px ${b.height / 2 - h / 2 + (box.height / 2 - (pill.top + b.height / 2))}px`
        }
        // Texte du bouton, recopié par-dessus la pilule pour s'effacer pendant qu'elle s'agrandit
        if (label) Object.assign(label.style, { top: `${pill.top}px`, left: `${pill.side}px`, width: `${b.width}px`, height: `${b.height}px` })
      }

      const render = (scrolled) => {
        setX(-Math.min(travel, scrolled))
        if (!panel || !pill) return
        const raw = Math.min(1, Math.max(0, (scrolled - travel) / opening()))
        const e = gsap.parseEase('power2.inOut')(raw)
        const open = scrolled > travel
        panel.style.visibility = open ? 'visible' : 'hidden'
        panel.style.pointerEvents = raw >= 1 ? 'auto' : 'none'
        panel.style.clipPath = `inset(${pill.top * (1 - e)}px ${pill.side * (1 - e)}px ${pill.bottom * (1 - e)}px ${pill.side * (1 - e)}px round ${pill.radius * (1 - e)}px)`
        // Les cartes s'effacent en reculant dès que la photo s'agrandit (parties à 40 % de l'ouverture)
        const gone = Math.min(1, raw / 0.4)
        row.style.opacity = 1 - gone
        row.style.transform = gone ? `scale(${1 - 0.06 * gone})` : ''
        row.style.visibility = gone >= 1 ? 'hidden' : ''
        if (photos) photos.style.transform = `scale(${1.25 - 0.25 * e})`
        // Le texte du bouton s'efface au début de l'ouverture
        if (label) label.style.opacity = Math.max(0, 1 - raw * 4)
        if (content) {
          const show = Math.min(1, Math.max(0, (raw - 0.65) / 0.35))
          content.style.opacity = show
          content.style.transform = `translateY(${(1 - show) * 40}px)`
        }
      }

      const trigger = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: () => `+=${distance() + opening() + stay() + cover()}`,
        pin: true,
        anticipatePin: 1,   // fige la section une image plus tôt : pas d'à-coup en arrivant en haut
        // La page (main) est en flex : GSAP n'ajoute pas l'espace du défilement fixé tout seul
        pinSpacing: true,
        invalidateOnRefresh: true,
        // La section fixée allonge la page : elle se calcule avant les animations des sections suivantes
        refreshPriority: 1,
        onRefresh: (self) => {
          setX(0)
          measure()
          // L'image peut finir de charger après : on recadre alors le fond du bouton
          const img = panel?.querySelector('.nzx__frames img')
          if (img && !img.complete) img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true })
          render(self.progress * (self.end - self.start))
        },
        onUpdate: (self) => render(self.progress * (self.end - self.start)),
      })
      ScrollTrigger.sort()
      ScrollTrigger.refresh()
      // Arrivée : le texte et les premières cartes montent
      gsap.from('.nzv__intro > *, .nzv__card', {
        y: 40, opacity: 0, duration: 1, stagger: 0.06, ease: 'expo.out',
        scrollTrigger: { trigger: root.current, start: 'top 80%', once: true },
      })
      return () => {
        trigger.kill()
        if (panel) {
          panel.style.cssText = ''
          if (photos) photos.style.transform = ''
          if (content) content.style.cssText = ''
          if (label) label.style.cssText = ''
        }
        row.style.cssText = ''
        const el = button()
        if (el) { el.style.backgroundSize = ''; el.style.backgroundPosition = '' }
      }
    })
    return () => mm.revert()
  }, [items.length])

  // Rangée à faire glisser : où en est-on, et défilement d'une carte avec les boutons
  // Mise à jour seulement si l'état change (sinon chaque rendu en relance un : boucle infinie)
  function updateEdge() {
    const el = scroller.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const start = el.scrollLeft <= 4
    const end = el.scrollLeft >= max - 4
    setEdge((prev) => (prev.start === start && prev.end === end ? prev : { start, end }))
  }
  // Au chargement, quand la liste change et au redimensionnement (pas à chaque rendu)
  useEffect(() => {
    updateEdge()
    window.addEventListener('resize', updateEdge)
    return () => window.removeEventListener('resize', updateEdge)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length])
  const slide = (dir) => {
    const el = scroller.current
    const card = el?.querySelector('.nzv__card')
    if (!card) return
    const gap = parseFloat(getComputedStyle(card.parentElement).columnGap) || 0
    el.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: 'smooth' })
  }

  if (!items.length) return null

  // Enveloppe gérée par React autour de la section figée : GSAP glisse son propre conteneur (pin-spacer)
  // entre les deux, et React retire l'enveloppe sans erreur quand on quitte la page.
  return (
    <div className="nzv-pin">
    <section ref={root} className="nzv" aria-labelledby="nzv-title">
      {/* Téléphone, tablette, animations réduites : le texte au-dessus, sur toute la largeur, et seulement les
          cartes dans la rangée à faire glisser (sur ordinateur, ce texte est le début de la rangée, plus bas) */}
      <div className="nzv__top">
        <p className="nzv__label"><Wrench aria-hidden="true" />{t('servicesLabel')}</p>
        <h2 className="nzv__heading">{t('servicesTitle')}</h2>
        <p className="nzv__lead">{t('servicesText')}</p>
        <A href="/contact?type=quote" className="nzv__btn">{nav('quote')}<ArrowRight aria-hidden="true" /></A>
      </div>

      {/* Rangée des cartes (téléphone : à faire glisser au doigt) */}
      <div ref={scroller} className="nzv__scroller" onScroll={updateEdge}>
        <ul ref={track} className="nzv__track">
          <li className="nzv__intro">
            <p className="nzv__label"><Wrench aria-hidden="true" />{t('servicesLabel')}</p>
            <h2 id="nzv-title" className="nzv__heading">{t('servicesTitle')}</h2>
            <p className="nzv__lead">{t('servicesText')}</p>
            <A href="/contact?type=quote" className="nzv__btn">{nav('quote')}<ArrowRight aria-hidden="true" /></A>
          </li>
          {items.map((s) => <ServiceCard key={s.href} service={s} />)}
          {/* Fin de rangée : CTA avec la photo de la section suivante en fond ; un clic mène à Contact,
              le défilement l'agrandit pour ouvrir la suite */}
          <li className="nzv__end">
            <A href="/contact" className="nzv__btn nzv__btn--image" style={ctaImage ? { backgroundImage: `url(${ctaImage})` } : undefined}>
              <span>{t('talkExpert')}<ArrowRight aria-hidden="true" /></span>
            </A>
          </li>
        </ul>
      </div>

      {/* Boutons ← → sous la rangée (téléphone, tablette, animations réduites) */}
      <div className="nzv__nav">
        <button type="button" onClick={() => slide(-1)} disabled={edge.start} aria-label={t('servicesPrev')}><ChevronLeft aria-hidden="true" /></button>
        <button type="button" onClick={() => slide(1)} disabled={edge.end} aria-label={t('servicesNext')}><ChevronRight aria-hidden="true" /></button>
      </div>

      {/* Section suivante, ouverte depuis le bouton (ordinateur) ou affichée en dessous (téléphone) */}
      {children && (
        <div ref={reveal} className="nzv__reveal">
          {children}
          {/* Copie du texte du bouton, posée sur la pilule, qui s'efface pendant l'ouverture */}
          <span className="nzv__reveal-cta" aria-hidden="true">{t('talkExpert')}<ArrowRight /></span>
        </div>
      )}
    </section>
    </div>
  )
}
