// Fond d'une page : la photo de l'emplacement, ou sa vidéo si l'admin en a choisi une (page « Pages & photos »).
//   <SiteMedia slot="transport.hero" alt="" className="absolute inset-0 w-full h-full object-cover" />
// La photo reste l'image d'attente de la vidéo. Elle la remplace si la vidéo ne se lit pas,
// si le système demande de réduire les animations ou si le visiteur économise ses données.
// La vidéo ne se télécharge et ne joue que lorsqu'elle est près de l'écran.
//   active={false} : vidéo en pause (diapositive du hero qui n'est pas à l'écran)
import React, { useEffect, useRef, useState } from 'react'
import { assetUrl } from '../api'
import { usePhoto, useSiteVideos } from '../sitePhotos'

const canPlayVideo = () =>
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !navigator.connection?.saveData

function SiteMedia({ slot, active = true, alt = '', src, ...props }) {
  const photo = usePhoto()
  const videos = useSiteVideos()
  const ref = useRef(null)
  const [failed, setFailed] = useState(null)
  const video = videos[slot]
  const poster = src || photo(slot)
  const showVideo = Boolean(video) && failed !== video && canPlayVideo()

  useEffect(() => {
    const element = ref.current
    if (!element) return undefined
    if (!active) {
      element.pause()
      return undefined
    }
    // Le navigateur ne lance tout seul qu'une vidéo muette
    element.muted = true
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) element.play().catch(() => {})
      else element.pause()
    }, { rootMargin: '200px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [showVideo, active])

  if (!showVideo) return <img src={poster} alt={alt} {...props} />

  const { srcSet, sizes, loading, fetchPriority, ...videoProps } = props
  return (
    <video
      ref={ref}
      src={assetUrl(video)}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      onError={() => setFailed(video)}
      {...videoProps}
    />
  )
}

export default SiteMedia
