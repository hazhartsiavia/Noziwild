// Photo nette sur tous les écrans, sans réglage : <Img src={photo('circ.hero')} alt="" className="..." />
//   - pose le srcset (photo d'origine + version HD 2400 px, voir photoSets.js) ;
//   - mesure la place que la photo occupe vraiment, recadrage compris : une photo en paysage affichée dans un cadre
//     étroit et haut (object-cover) est en réalité bien plus large que son cadre. C'est cette largeur qui est
//     annoncée au navigateur (`sizes`), pour qu'il prenne la version HD dès qu'il en a besoin, et seulement alors ;
//   - `sizes` peut aussi être donné à la main (grands fonds dont la taille est connue) ;
//   - si la version HD manque (photo retirée de la bibliothèque), la photo d'origine reprend sa place ;
//   - chargement différé (loading="lazy") sauf demande contraire.
// Une photo sans version HD (logo, photo envoyée depuis l'admin) est affichée telle quelle.
import React, { useLayoutEffect, useRef, useState } from 'react'
import { srcSetOf } from '../photoSets'

// Format le plus large des photos du site (largeur / hauteur) : sert à estimer la largeur d'une photo recadrée en hauteur
const WIDEST = 1.9

function Img({ src, srcSet, sizes, alt = '', loading = 'lazy', onError, ref, ...props }) {
  const inner = useRef(null)
  const [failed, setFailed] = useState(null)
  const [measured, setMeasured] = useState(0)
  const set = failed === src ? undefined : (srcSet ?? srcSetOf(src))
  const auto = Boolean(set) && !sizes

  useLayoutEffect(() => {
    if (!auto) return undefined
    const element = inner.current
    const measure = () => {
      const width = Math.ceil(Math.max(element.clientWidth, element.clientHeight * WIDEST)) || window.innerWidth
      // Ne change que si la photo grandit nettement : pas de rechargement pour quelques pixels
      setMeasured((previous) => (width > previous * 1.15 ? width : previous))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [auto])

  // Tant que la place n'est pas mesurée (avant le premier affichage), la photo n'est pas demandée :
  // le navigateur ne télécharge ainsi qu'une seule taille, la bonne.
  const ready = !auto || measured > 0
  return (
    <img
      ref={(element) => {
        inner.current = element
        if (typeof ref === 'function') ref(element)
        else if (ref) ref.current = element
      }}
      src={ready ? src : undefined}
      srcSet={ready ? set : undefined}
      sizes={set ? (sizes || `${measured}px`) : undefined}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={(event) => {
        if (set) setFailed(src)
        else onError?.(event)
      }}
      {...props}
    />
  )
}

export default Img
