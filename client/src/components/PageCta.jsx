// Appel final commun des pages : une photo sur toute la largeur, le titre posé en bas à gauche, les boutons à droite.
// La photo est plus haute que son cadre et glisse au défilement : elle n'est jamais agrandie, donc toujours nette.
//   <PageCta slot="circ.cta" title={t('ctaTitle')} text={t('ctaText')}>
//     <A href="/contact" className={PAGE_CTA_GOLD}>{t('ctaButton')}</A>
//   </PageCta>
// `floats` (anciennes petites photos inclinées) est encore accepté mais n'affiche plus rien.
import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SiteMedia from './SiteMedia'

gsap.registerPlugin(ScrollTrigger)

const BTN = 'inline-flex items-center justify-center gap-2 text-sm font-medium tracking-wide px-7 py-3.5 rounded-full transition-colors duration-300'
// Bouton principal (clair sur la photo) et bouton secondaire (contour)
export const PAGE_CTA_GOLD = `${BTN} bg-[#F4F1EA] hover:bg-white text-forest`
export const PAGE_CTA_GHOST = `${BTN} border border-white/50 hover:bg-white hover:text-forest text-white`

function PageCta({ slot, title, text, children }) {
  const root = useRef(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const whileVisible = { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
      gsap.fromTo('.pc-bg', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: whileVisible })
      gsap.from('.pc-content > *', {
        y: 28, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out', clearProps: 'all',
        scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
      })
    }, root.current)
    return () => mm.revert()
  }, [])

  return (
    <section ref={root} data-no-reveal className="w-full mt-24 md:mt-40 relative overflow-hidden bg-[#0C3E2E] text-white min-h-[520px] md:min-h-[78vh] flex items-end justify-center">
      <div className="pc-bg absolute inset-x-0 -top-[8%] h-[116%]">
        <SiteMedia slot={slot} alt="" loading="lazy" sizes="(min-width: 768px) 120vw, 260vw" className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#072a1f]/90 via-[#072a1f]/60 via-50% to-transparent to-90% md:via-[#072a1f]/30 md:via-45% md:to-75%" />
      <div className="pc-content relative w-[90vw] max-w-[1360px] pt-40 pb-12 md:pb-20 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-20 lg:items-end">
        <h2 className="text-[clamp(2.75rem,6.5vw,6.5rem)] leading-[0.95] [text-wrap:balance]">{title}</h2>
        <div>
          {text && <p className="max-w-md text-base md:text-lg leading-relaxed text-white/85">{text}</p>}
          <div className="mt-7 flex flex-wrap gap-3">{children}</div>
        </div>
      </div>
    </section>
  )
}

export default PageCta
