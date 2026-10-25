// Animations au défilement communes (GSAP ScrollTrigger) pour les pages sans animations sur mesure :
// grands blocs arrondis dévoilés en fenêtre, cartes des grilles en cascade, titres et textes en fondu.
// Rien ne bouge si le système demande de réduire les animations.
import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Navbar, pied de page et zones marquées data-no-reveal ne s'animent pas
const SKIP = 'nav, footer, [data-no-reveal]'
// Styles posés pendant l'animation, retirés à la fin pour rendre la main au CSS (survols, transitions)
const PROPS = ['transform', 'translate', 'rotate', 'scale', 'opacity', 'clip-path', 'transition']
const clean = (targets) => targets.forEach((el) => PROPS.forEach((p) => el.style.removeProperty(p)))

export function useScrollReveal(scope, deps = []) {
  useLayoutEffect(() => {
    const root = scope.current
    if (!root) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const pick = (sel) => [...root.querySelectorAll(sel)].filter((el) => !el.closest(SKIP))
      const faded = new Set()
      const inFaded = (el) => {
        for (let p = el.parentElement; p && p !== root; p = p.parentElement) if (faded.has(p)) return true
        return false
      }
      const holdsFaded = (el) => [...faded].some((f) => el.contains(f))

      // 1. Grands blocs arrondis (bannières, cartes sur photo) : ouverture en fenêtre, photo qui se dézoome
      const blocks = pick('[class*="rounded-3xl"], [class*="rounded-[2rem]"]').filter((el) => el.offsetHeight > 280)
      blocks.forEach((el) => {
        const r = getComputedStyle(el).borderTopLeftRadius
        const img = [...el.children].find((c) => c.tagName === 'IMG')
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          onComplete: () => clean(img ? [el, img] : [el]),
        })
        tl.fromTo(el,
          { clipPath: `inset(10% 4% 0% 4% round ${r})`, transition: 'none' },
          { clipPath: `inset(0% 0% 0% 0% round ${r})`, duration: 1.3, ease: 'expo.out' })
        if (img) tl.fromTo(img, { scale: 1.18, transition: 'none' }, { scale: 1, duration: 1.6, ease: 'power3.out' }, 0)
      })

      // 2. Grilles : les cartes arrivent l'une après l'autre
      pick('.grid').forEach((grid) => {
        if (inFaded(grid)) return
        const items = [...grid.children].filter((c) => c.offsetParent !== null)
        if (!items.length) return
        items.forEach((c) => faded.add(c))
        gsap.fromTo(items,
          { y: 40, opacity: 0, transition: 'none' },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', onComplete: () => clean(items),
            scrollTrigger: { trigger: grid, start: 'top 88%', once: true } })
      })

      // 3. Titres et ce qui les suit (textes, boutons) : montée en fondu
      const maxH = window.innerHeight * 0.8
      pick('h1, h2, h3, h1 ~ *, h2 ~ *, [data-reveal]')
        .filter((el) => !faded.has(el) && !blocks.includes(el) && !inFaded(el) && !holdsFaded(el) && el.offsetHeight < maxH)
        .forEach((el) => {
          faded.add(el)
          gsap.fromTo(el,
            { y: 28, opacity: 0, transition: 'none' },
            { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', onComplete: () => clean([el]),
              scrollTrigger: { trigger: el, start: 'top 90%', once: true } })
        })
    })

    // Recalcule les positions quand les images et polices sont chargées
    let timer
    const refresh = () => { clearTimeout(timer); timer = setTimeout(() => ScrollTrigger.refresh(), 150) }
    const imgs = [...root.querySelectorAll('img')].filter((img) => !img.complete)
    imgs.forEach((img) => img.addEventListener('load', refresh, { once: true }))
    document.fonts?.ready.then(refresh)

    return () => {
      clearTimeout(timer)
      imgs.forEach((img) => img.removeEventListener('load', refresh))
      mm.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
