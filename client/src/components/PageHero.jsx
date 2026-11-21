// Bannière commune des pages intérieures, sur le modèle de celle de la page Hébergement.
// Titre en grandes majuscules, trait fin, fil d'Ariane et phrase courte (moreHref / moreLabel ne sont plus affichés).
//   <PageHero slot="circ.hero" title={t('title')} crumb={t('crumb')} text={t('intro')} moreHref="#plan" moreLabel={t('plan')} />
import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SiteMedia from './SiteMedia'
import { useT } from '../i18n/LanguageContext'
import { A } from '../i18n/router'

gsap.registerPlugin(ScrollTrigger)

// Titre de la bannière, comme celle de la page Hébergement : grandes majuscules
const TITLE = 'text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold uppercase leading-none tracking-tight [text-wrap:balance]'

function PageHero({ slot, alt = '', title, crumb, text }) {
  const t = useT('blog')
  const root = useRef(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({ defaults: { ease: 'power4.out' } })
        .fromTo('.ph-word', { yPercent: 115 }, { yPercent: 0, duration: 1, stagger: 0.06, clearProps: 'all' }, 0.1)
        .fromTo('.ph-line', { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'power3.inOut', clearProps: 'transform' }, 0.35)
        .fromTo('.ph-foot > *', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, clearProps: 'all' }, 0.6)
      gsap.fromTo('.ph-media', { yPercent: -6, scale: 1.12 }, {
        yPercent: 6, scale: 1.12, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
      })
    }, root.current)
    return () => mm.revert()
  }, [])

  // Bannière compacte (comme Hébergement) : photo assombrie, contenu centré, titre en majuscules, trait,
  // fil d'Ariane « Accueil / page » et, s'il y en a une, la phrase d'intro à droite
  return (
    <section ref={root} data-no-reveal className="w-[90vw] xl:w-[95vw] mt-5 md:mt-0 relative flex items-center overflow-hidden rounded-3xl bg-[#084838] text-white min-h-[240px] md:min-h-[360px]">
      <div className="ph-media absolute inset-0">
        <SiteMedia slot={slot} alt={alt} className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-slate-950/60" />

      <div className="relative w-full max-w-5xl mx-auto px-6 md:px-10 py-16">
        <h1 aria-label={title} className={TITLE}>
          <span aria-hidden="true">
            {title.split(' ').map((word, i) => (
              <React.Fragment key={i}>
                {i > 0 && ' '}
                <span className="inline-block overflow-hidden align-bottom py-[0.1em] -my-[0.1em]"><span className="ph-word inline-block">{word}</span></span>
              </React.Fragment>
            ))}
          </span>
        </h1>
        <span aria-hidden="true" className="ph-line block my-6 md:my-8 h-px origin-left bg-white/30" />
        <div className="ph-foot flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-10">
          <nav aria-label="Breadcrumb" className="shrink-0 text-sm md:text-base font-medium">
            <A href="/" className="hover:underline underline-offset-4">{t('home')}</A> <span aria-hidden="true">/</span> {crumb}
          </nav>
          {text && <p className="max-w-xl text-sm md:text-base leading-relaxed text-white/85">{text}</p>}
        </div>
      </div>
    </section>
  )
}

export default PageHero
