// Bannière commune des pages intérieures : la photo (ou la vidéo) s'exprime, le texte reste en bas.
// Grand titre en serif dont la taille suit l'écran, trait fin, fil d'Ariane et phrase courte.
// La photo n'est jamais agrandie : elle est un peu plus haute que le cadre et glisse au défilement, pour rester nette.
//   <PageHero slot="circ.hero" title={t('title')} crumb={t('crumb')} text={t('intro')} moreHref="#plan" moreLabel={t('plan')} />
import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, ChevronRight } from 'lucide-react'
import SiteMedia from './SiteMedia'
import { useT } from '../i18n/LanguageContext'
import { A } from '../i18n/router'

gsap.registerPlugin(ScrollTrigger)

// --chars : nombre de lettres du titre ; 0.42 : largeur moyenne d'une lettre d'Instrument Serif, marge comprise
const TITLE = 'text-[clamp(2.75rem,12vw,4rem)] md:whitespace-nowrap md:text-[min(calc((min(90vw,1360px)-5rem)/(var(--chars)*0.42)),8rem)] leading-[0.95] [text-wrap:balance]'
// Largeur réelle de la photo : cadre large sur ordinateur, photo recadrée en hauteur sur téléphone
const SIZES = '(min-width: 1512px) 1500px, (min-width: 768px) 100vw, 260vw'

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
      gsap.fromTo('.ph-media', { yPercent: -5 }, {
        yPercent: 5, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 },
      })
    }, root.current)
    return () => mm.revert()
  }, [])

  return (
    <section ref={root} data-no-reveal className="w-[90vw] max-w-[1360px] relative flex flex-col overflow-hidden rounded-xl bg-[#0C3E2E] text-white min-h-[480px] md:min-h-[max(540px,72vh)]">
      <div className="ph-media absolute inset-x-0 -top-[7%] h-[114%]">
        <SiteMedia slot={slot} alt={alt} sizes={SIZES} fetchPriority="high" className="absolute inset-0 w-full h-full object-cover" />
      </div>
      {/* Seul le bas s'assombrit, sous le texte */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#072a1f]/85 via-[#072a1f]/30 via-30% to-transparent to-60%" />

      {moreHref && (
        <A href={moreHref} className="ph-more absolute right-4 top-4 md:right-6 md:top-6 z-10 inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#072a1f]/60 hover:bg-[#072a1f]/85 pl-4 pr-1.5 py-1.5 text-xs md:text-sm font-medium transition-colors">
          {moreLabel}
          <span className="w-7 h-7 rounded-full bg-[#F4F1EA] text-forest flex items-center justify-center"><ArrowDown size={15} strokeWidth={1.5} aria-hidden="true" /></span>
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
        <span aria-hidden="true" className="ph-line block mt-5 md:mt-7 h-px origin-left bg-white/35" />
        <div className="ph-foot mt-4 flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-10">
          <nav aria-label="Breadcrumb" className="flex shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85">
            <A href="/" className="hover:underline underline-offset-4">{t('home')}</A>
            <ChevronRight className="w-3.5 h-3.5 text-white/70" aria-hidden="true" />
            <span>{crumb}</span>
          </nav>
          {text && <p className="max-w-lg text-sm md:text-base leading-relaxed text-white/85">{text}</p>}
        </div>
      </div>
    </section>
  )
}

export default PageHero
