// Bannière commune des pages intérieures : la photo (ou la vidéo) s'exprime, le texte reste en bas.
// Titre en majuscules sur une ligne dont la taille suit l'écran, trait fin, fil d'Ariane et phrase courte.
//   <PageHero slot="circ.hero" title={t('title')} crumb={t('crumb')} text={t('intro')} moreHref="#plan" moreLabel={t('plan')} />
import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, ChevronRight } from 'lucide-react'
import SiteMedia from './SiteMedia'
import { useT } from '../i18n/LanguageContext'
import { A } from '../i18n/router'

gsap.registerPlugin(ScrollTrigger)

// --chars : nombre de lettres du titre ; 0.6 : largeur moyenne d'une majuscule, marge comprise
const TITLE = 'text-[clamp(2rem,9vw,3rem)] md:whitespace-nowrap md:text-[min(calc((90vw-5rem)/(var(--chars)*0.6)),5.5rem)] font-bold uppercase leading-[1.05] tracking-tight [text-wrap:balance]'

function PageHero({ slot, alt = '', title, crumb, text, moreHref, moreLabel }) {
  const t = useT('blog')
  const root = useRef(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const r = getComputedStyle(root.current).borderTopLeftRadius
      gsap.timeline({ defaults: { ease: 'power4.out' } })
        .fromTo(root.current, { clipPath: `inset(6% 3% 6% 3% round ${r})` }, { clipPath: `inset(0% 0% 0% 0% round ${r})`, duration: 1.3, ease: 'expo.out', clearProps: 'clipPath' })
        .fromTo('.ph-word', { yPercent: 115 }, { yPercent: 0, duration: 1, stagger: 0.06, clearProps: 'all' }, 0.25)
        .fromTo('.ph-line', { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'power3.inOut', clearProps: 'transform' }, 0.55)
        .fromTo('.ph-foot > *', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, clearProps: 'all' }, 0.8)
        .fromTo('.ph-more', { y: -14, opacity: 0, transition: 'none' }, { y: 0, opacity: 1, duration: 0.7, clearProps: 'all' }, 0.8)
      gsap.fromTo('.ph-media', { yPercent: -6, scale: 1.12 }, {
        yPercent: 6, scale: 1.12, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
      })
    }, root.current)
    return () => mm.revert()
  }, [])

  return (
    <section ref={root} data-no-reveal className="w-[90vw] lg:max-w-[95vw] relative flex flex-col overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-[#074636] text-white min-h-[460px] md:min-h-[max(520px,70vh)]">
      <div className="ph-media absolute inset-0">
        <SiteMedia slot={slot} alt={alt} className="absolute inset-0 w-full h-full object-cover" />
      </div>
      {/* Seul le bas s'assombrit, sous le texte */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#072a1f]/90 via-[#072a1f]/45 via-25% to-transparent to-55%" />

      {moreHref && (
        <A href={moreHref} className="ph-more absolute right-4 top-4 md:right-6 md:top-6 z-10 inline-flex items-center gap-2 rounded-full border border-white/30 bg-[#072a1f]/55 hover:bg-[#072a1f]/75 backdrop-blur-sm pl-4 pr-1.5 py-1.5 text-xs md:text-sm font-medium transition-colors">
          {moreLabel}
          <span className="w-7 h-7 rounded-full bg-[#C49849] flex items-center justify-center"><ArrowDown size={15} aria-hidden="true" /></span>
        </A>
      )}

      <div className="relative mt-auto p-5 pt-40 md:p-8 md:pt-40 lg:p-10 lg:pt-40">
        <h1 aria-label={title} style={{ '--chars': title.length }} className={TITLE}>
          <span aria-hidden="true">
            {title.split(' ').map((word, i) => (
              <React.Fragment key={i}>
                {i > 0 && ' '}
                <span className="inline-block overflow-hidden align-bottom py-[0.1em] -my-[0.1em]"><span className="ph-word inline-block">{word}</span></span>
              </React.Fragment>
            ))}
          </span>
        </h1>
        <span aria-hidden="true" className="ph-line block mt-4 md:mt-5 h-px origin-left bg-white/50" />
        <div className="ph-foot mt-4 flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-10">
          <nav aria-label="Breadcrumb" className="flex shrink-0 items-center gap-2 text-sm font-medium">
            <A href="/" className="hover:underline underline-offset-4">{t('home')}</A>
            <ChevronRight className="w-3.5 h-3.5 text-white/70" aria-hidden="true" />
            <span>{crumb}</span>
          </nav>
          {text && <p className="max-w-xl text-sm md:text-base leading-relaxed text-white/90">{text}</p>}
        </div>
      </div>
    </section>
  )
}

export default PageHero
