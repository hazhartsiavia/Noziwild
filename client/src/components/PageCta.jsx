// Appel final commun des pages : photo sur toute la largeur, grand titre, et jusqu'à trois photos inclinées qui flottent au défilement.
//   <PageCta slot="circ.cta" title={t('ctaTitle')} text={t('ctaText')} floats={['act.photo.1']}>
//     <A href="/contact" className={PAGE_CTA_GOLD}>{t('ctaButton')}</A>
//   </PageCta>
import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SiteMedia from './SiteMedia'
import { usePhoto } from '../sitePhotos'

gsap.registerPlugin(ScrollTrigger)

const BTN = 'inline-flex items-center justify-center text-sm md:text-base font-medium px-6 py-3 rounded-full active:scale-95 transition'
export const PAGE_CTA_GOLD = `${BTN} bg-[#C49849] hover:bg-[#a9813a] text-white`
export const PAGE_CTA_GHOST = `${BTN} border border-white/60 hover:bg-white/10 text-white`

const FLOATS = [
  { cls: 'left-[4%] top-[14%] w-[15vw] max-w-[230px] -rotate-6', move: -70 },
  { cls: 'right-[5%] top-[8%] w-[13vw] max-w-[200px] rotate-6', move: -120 },
  { cls: 'right-[9%] bottom-[8%] w-[14vw] max-w-[220px] -rotate-3', move: 60 },
]

function PageCta({ slot, title, text, floats = [], children }) {
  const photo = usePhoto()
  const root = useRef(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const whileVisible = { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
      gsap.fromTo('.pc-bg', { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: whileVisible })
      gsap.utils.toArray('.pc-float').forEach((el, i) => {
        gsap.fromTo(el, { y: -FLOATS[i].move }, { y: FLOATS[i].move, ease: 'none', scrollTrigger: whileVisible })
      })
      gsap.from('.pc-content > *', {
        y: 40, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', clearProps: 'all',
        scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
      })
    }, root.current)
    return () => mm.revert()
  }, [])

  return (
    <section ref={root} data-no-reveal className="w-full mt-16 md:mt-28 relative overflow-hidden text-white min-h-[480px] md:min-h-[600px] flex items-center justify-center">
      <SiteMedia slot={slot} alt="" className="pc-bg absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-[#072a1f]/65" />
      {floats.slice(0, 3).map((floatSlot, i) => (
        <div key={floatSlot} aria-hidden="true" className={`pc-float absolute hidden lg:block ${FLOATS[i].cls}`}>
          <img src={photo(floatSlot)} alt="" className="w-full aspect-[4/5] object-cover rounded-xl border-[6px] border-white shadow-2xl" />
        </div>
      ))}
      <div className="pc-content relative w-[90vw] max-w-4xl py-16 text-center flex flex-col items-center">
        <h2 className="text-[clamp(2.25rem,5.5vw,5rem)] font-bold uppercase leading-[1.02] tracking-tight [text-wrap:balance]">{title}</h2>
        {text && <p className="mt-5 max-w-2xl text-sm md:text-lg text-white/90">{text}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>
      </div>
    </section>
  )
}

export default PageCta
