// Section Témoignages : carte de note fixe à gauche, avis qui défilent à droite.
// Les avis sont en base : admin > Offers > Testimonials (publication, ordre, note, photo, traductions).
// La note affichée est la moyenne des avis publiés. Sans avis publié, la section n'apparaît pas.
// Textes de la section : locales/<langue>/testimonials.json
import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Quote, Star } from 'lucide-react'
import { useLanguage, useT } from '../i18n/LanguageContext'
import { LOCALES } from '../utils/format'
import { useOffers } from '../utils/useOffers'
import { useScrollReveal } from '../utils/useScrollReveal'
import './testimonials.css'

gsap.registerPlugin(ScrollTrigger)

const SECTION_TITLE = 'text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-medium text-forest leading-[1.15] tracking-tight'
const SECTION_SUBTITLE = 'text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed'
const MIN_CARDS = 6 // assez de cartes pour remplir la largeur pendant le défilement
const SECONDS_PER_CARD = 9

const initials = (name) => name.split(/[\s&.]+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('')

function Avatar({ item, className }) {
  if (item.image) return <img src={item.image} alt="" className={`rounded-full object-cover ${className}`} />
  return <span aria-hidden="true" className={`rounded-full bg-[#C49849] text-white text-sm font-medium flex items-center justify-center ${className}`}>{initials(item.title)}</span>
}

function Stars({ rating, label }) {
  const rounded = Math.round(rating)
  return (
    <span role="img" aria-label={label} className="flex items-center justify-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={16} aria-hidden="true" className={n <= rounded ? 'fill-[#C49849] text-[#C49849]' : 'text-[#C49849]/40'} />
      ))}
    </span>
  )
}

// Une colonne : les étoiles au-dessus de l'avis, puis en dessous à la colonne suivante
function Column({ item, starsFirst, copy }) {
  const t = useT('testimonials')
  const stars = (
    <div className="tm-part rounded-xl bg-white px-4 py-3">
      <Stars rating={item.rating} label={t('ratingLabel', { rating: item.rating })} />
    </div>
  )
  return (
    <li aria-hidden={copy || undefined} className={`tm-column flex w-[280px] md:w-[320px] shrink-0 flex-col gap-3 mr-3 md:mr-4 ${copy ? 'tm-copy' : ''}`}>
      {starsFirst && stars}
      <figure className="tm-part flex flex-1 flex-col rounded-2xl bg-white p-5 md:p-6">
        <Quote size={22} aria-hidden="true" className="fill-[#C49849] text-[#C49849]" />
        <blockquote className="mt-4 text-base leading-relaxed text-slate-800">{item.text}</blockquote>
        <figcaption className="mt-auto pt-6 flex items-center gap-3">
          <Avatar item={item} className="w-11 h-11 shrink-0" />
          <span className="min-w-0">
            <span className="tm-name block text-sm md:text-base font-medium text-slate-900">{item.title}</span>
            <span className="tm-origin block text-xs md:text-sm text-slate-500">{item.origin}</span>
          </span>
        </figcaption>
      </figure>
      {!starsFirst && stars}
    </li>
  )
}

function Testimonials({ className = '' }) {
  const t = useT('testimonials')
  const { lang } = useLanguage()
  const { offers, status } = useOffers('testimonial')
  const root = useRef(null)
  useScrollReveal(root, [status])

  // À l'arrivée dans l'écran : la carte de note entre par la gauche, puis les avis montent l'un après l'autre
  useLayoutEffect(() => {
    if (status !== 'ready' || !root.current) return undefined
    const stage = root.current.querySelector('.tm-stage')
    if (!stage) return undefined
    const mm = gsap.matchMedia(root.current)
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const trigger = { trigger: stage, start: 'top 85%', once: true }
      gsap.fromTo('.tm-trust', { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: 'power3.out', clearProps: 'all', scrollTrigger: trigger })
      gsap.fromTo(gsap.utils.toArray('.tm-column').slice(0, 5), { y: 90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, delay: 0.2, ease: 'power3.out', clearProps: 'all', scrollTrigger: trigger })
    })
    return () => mm.revert()
  }, [status])

  if (status !== 'ready' || !offers.length) return null

  const average = offers.reduce((sum, o) => sum + Number(o.rating), 0) / offers.length
  const shown = new Intl.NumberFormat(LOCALES[lang] || 'en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(average)

  // Répétés pour une boucle sans à-coup : la seconde moitié prend la place de la première.
  // Les copies sont cachées aux lecteurs d'écran, et retirées sur écran tactile où la liste défile au doigt.
  const copies = Math.ceil(MIN_CARDS / offers.length)
  const half = Array.from({ length: copies }, () => offers).flat()
  const loop = [...half, ...half]

  return (
    <section ref={root} className={className}>
      <div className="mb-8 md:mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-12">
        <h2 className={`${SECTION_TITLE} lg:max-w-[50%]`}>{t('title')}</h2>
        <p className={`${SECTION_SUBTITLE} lg:max-w-md`}>{t('text')}</p>
      </div>

      <div className="tm-stage grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)] gap-4 md:gap-5" data-no-reveal>
        <aside className="tm-trust flex flex-col rounded-2xl bg-[#074636] text-white p-6 md:p-8 min-h-[280px] lg:min-h-[420px]">
          <p className="text-xs sm:text-sm font-medium uppercase tracking-wide text-[#E6C58A]">{t('trustLabel')}</p>
          <p className="mt-5 text-4xl md:text-5xl font-medium leading-none tabular-nums">
            {shown} <span className="text-2xl md:text-3xl text-[#E6C58A]">/ 5</span>
          </p>
          <p className="mt-3 text-sm md:text-base text-white/75">{t('average')}</p>
          <div className="mt-auto pt-8">
            <div className="flex -space-x-2.5" aria-hidden="true">
              {offers.slice(0, 4).map((o) => <Avatar key={o.id} item={o} className="w-11 h-11 ring-2 ring-[#074636]" />)}
            </div>
            <div className="mt-4 flex"><Stars rating={average} label={t('ratingLabel', { rating: shown })} /></div>
            <p className="mt-2 text-sm text-white/75">{t('from')}</p>
          </div>
        </aside>

        <div className="tm-viewport min-w-0">
          <ul className="tm-track flex w-max items-stretch" style={{ '--tm-duration': `${half.length * SECONDS_PER_CARD}s` }}>
            {loop.map((item, i) => (
              <Column key={`${item.id}-${i}`} item={item} starsFirst={i % 2 === 0} copy={i >= offers.length} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
