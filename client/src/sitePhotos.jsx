// Photos des pages (bannières, grands blocs, cartes qui ne viennent pas de la base) remplaçables
// depuis l'admin (page « Pages & photos »). Chaque emplacement a sa photo d'origine ici ; l'API ne garde
// que les photos remplacées, et le site les pose par-dessus.
//   const photo = usePhoto() ; <img src={photo('blog.hero')} />
// Les fonds listés dans VIDEO_SLOTS peuvent aussi recevoir une vidéo : voir components/SiteMedia.jsx.
// Le serveur pose photos et vidéos dans le HTML ; elles sont aussi gardées dans le navigateur.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { assetUrl, fetchSitePhotos } from './api'
import Ramena from './assets/images/Ramena.jpg'
import NosyIranja from './assets/images/NosyIranja.jpg'
import NosyLonjo from './assets/images/NosyLonjo.jpg'
import Ambanja from './assets/images/Ambanja.jpg'
import Deux from './assets/images/2.jpg'
import TeamLookout from './assets/images/site/noziwild-team-lookout.jpg'
import bg1 from './assets/images/hero/bg1-2400.jpg'
import bg2 from './assets/images/hero/bg2-2400.jpg'
import bg3 from './assets/images/hero/bg3-2400.jpg'
import bg5 from './assets/images/hero/bg5-2400.jpg'
import bg6 from './assets/images/hero/bg6-2000.jpg'
import GuideSifaka from './assets/images/site/guide-with-sifaka.jpg'
import { PHOTO_CHOICES } from './sitePhotoChoices'

const list = (prefix, label, sources) =>
  Object.fromEntries(sources.map((src, i) => [`${prefix}.${i + 1}`, { label: `${label} ${i + 1}`, src }]))

// Pages de l'admin : chaque page regroupe ses emplacements { clé: { label, src } }
export const PHOTO_PAGES = [
  {
    id: 'home', label: 'Home', page: '/',
    slots: {
      // Même ordre que les diapositives du hero (HomeHero.jsx)
      // Dans l'ordre d'affichage du hero (HomeHero.jsx). Chaque clé garde son numéro d'origine,
      // pour que les photos déjà choisies dans l'admin restent à leur place (home.hero.3 retiré).
      'home.hero.6': { label: 'Hero slide 1 (lemur)', src: bg6 },
      'home.hero.5': { label: 'Hero slide 2', src: bg5 },
      'home.hero.1': { label: 'Hero slide 3', src: bg1 },
      'home.hero.2': { label: 'Hero slide 4', src: bg2 },
      'home.hero.4': { label: 'Hero slide 5', src: bg3 },
      ...list('home.ways', 'Ways to travel card', [TeamLookout, Ramena, NosyIranja, Ambanja]),
      ...list('home.trips', 'Trip we love', [TeamLookout, NosyIranja, Deux]),
      'home.about.1': { label: 'About us photo', src: GuideSifaka },
      'home.why.1': { label: 'Why Noziwild, card 1 (Numerous routes), photo 1', src: GuideSifaka },
      'home.why.2': { label: 'Why Noziwild, card 1 (Numerous routes), photo 2', src: GuideSifaka },
      'home.why.3': { label: 'Why Noziwild, card 2 (Easy booking), photo 1', src: GuideSifaka },
      'home.why.4': { label: 'Why Noziwild, card 2 (Easy booking), photo 2', src: GuideSifaka },
      'home.why.5': { label: 'Why Noziwild, card 3 (Accommodation), photo 1', src: GuideSifaka },
      'home.why.6': { label: 'Why Noziwild, card 3 (Accommodation), photo 2', src: GuideSifaka },
      'home.why.7': { label: 'Why Noziwild, card 4 (Best tour guidance), photo 1', src: GuideSifaka },
      'home.why.8': { label: 'Why Noziwild, card 4 (Best tour guidance), photo 2', src: GuideSifaka },
    },
  },
  {
    id: 'regions', label: 'Regions (home and destinations pages)', page: '/destinations',
    slots: {
      'region.north': { label: 'The North', src: NosyIranja },
      ...list('region.north', 'The North, place', [Ramena, NosyIranja, Ambanja]),
      'region.highlands': { label: 'The Highlands', src: TeamLookout },
      ...list('region.highlands', 'The Highlands, place', [TeamLookout, Deux, Ambanja]),
      'region.west': { label: 'The West', src: Deux },
      ...list('region.west', 'The West, place', [Deux, NosyLonjo, Ambanja]),
      'region.south': { label: 'The South', src: NosyLonjo },
      ...list('region.south', 'The South, place', [NosyLonjo, Ramena, NosyIranja]),
      'region.east': { label: 'The East', src: Ambanja },
      ...list('region.east', 'The East, place', [Ambanja, NosyIranja, TeamLookout]),
    },
  },
  {
    id: 'destinations', label: 'Destinations', page: '/destinations',
    slots: { ...list('dest.hero', 'Hero photo', [Ramena, TeamLookout, NosyLonjo]), 'dest.cta': { label: 'Final banner', src: Ramena } },
  },
  {
    id: 'blog', label: 'Blog', page: '/blog',
    slots: { 'blog.hero': { label: 'Banner', src: Ramena } },
  },
  {
    id: 'about', label: 'About', page: '/about',
    slots: {
      'about.hero': { label: 'Page banner', src: Ramena },
      'about.promise': { label: '“Our promise” card', src: Deux },
      'about.mission': { label: 'Mission, large photo', src: NosyIranja },
      ...list('about.mission', 'Mission, small photo', [Ambanja, NosyLonjo]),
      ...list('about.expert', 'Travel expert', [Ambanja, NosyLonjo, NosyIranja, Ramena, TeamLookout]),
    },
  },
  {
    id: 'activities', label: 'Activities', page: '/activities',
    slots: { 'act.banner': { label: 'Banner', src: NosyLonjo }, ...list('act.photo', 'Tilted photo', [Ramena, TeamLookout, NosyIranja]) },
  },
  {
    id: 'circuits', label: 'Circuits', page: '/circuits',
    slots: { 'circ.hero': { label: 'Banner', src: NosyIranja }, 'circ.cta': { label: 'Final banner', src: Ambanja } },
  },
  {
    id: 'contact', label: 'Contact', page: '/contact',
    slots: { 'contact.banner': { label: '“Book a call” banner', src: NosyIranja }, ...list('contact.photo', 'Small photo', [Ambanja, NosyLonjo]) },
  },
  {
    id: 'cruise', label: 'Cruise excursions', page: '/cruise-excursions',
    slots: {
      'cruise.hero': { label: 'Banner', src: Ramena },
      'cruise.port.nosybe': { label: 'Port of Nosy Be', src: NosyIranja },
      'cruise.port.diego': { label: 'Port of Diego Suarez', src: Ramena },
      'cruise.cta': { label: 'Final banner', src: NosyIranja },
    },
  },
  {
    id: 'equipment', label: 'Equipment rentals', page: '/equipment-rentals',
    slots: {
      'gear.arch.water': { label: 'Category: water', src: Ramena },
      'gear.arch.trek': { label: 'Category: trek & camp', src: Deux },
      'gear.arch.ride': { label: 'Category: ride', src: Ambanja },
      'gear.arch.optics': { label: 'Category: photo & optics', src: TeamLookout },
      'gear.cta': { label: 'Final banner', src: NosyIranja },
    },
  },
  {
    id: 'excursions', label: 'Excursions', page: '/excursions',
    slots: {
      'exc.hero': { label: 'Banner', src: Ramena },
      'exc.multi': { label: '“3 days on the islands” block', src: NosyIranja },
      'exc.cta': { label: 'Final banner', src: Deux },
    },
  },
  {
    id: 'food', label: 'Food & dining', page: '/food-dining',
    slots: {
      ...list('food.plate', 'Hero plate', [Ambanja, Ramena, NosyLonjo]),
      ...list('food.dish', 'Dish', [Ambanja, TeamLookout, Deux, Ramena, NosyLonjo]),
      'food.class': { label: 'Cooking class', src: TeamLookout },
    },
  },
  {
    id: 'guides', label: 'Guides', page: '/guides',
    slots: {
      ...list('guides.hero', 'Hero photo', [TeamLookout, Ramena]),
      ...list('guides.service', 'Guide service', [TeamLookout, Deux, NosyIranja, NosyLonjo]),
      ...list('guides.gallery', 'Gallery photo', [TeamLookout, Ramena, NosyLonjo, Deux, Ambanja, NosyIranja, TeamLookout]),
    },
  },
  {
    id: 'hosting', label: 'Accommodation', page: '/accommodation',
    slots: {
      'hosting.hero': { label: 'Banner', src: NosyLonjo },
      'hosting.featured': { label: '“Guest favorite” block', src: NosyIranja },
      'hosting.cta': { label: 'Final banner', src: Ramena },
    },
  },
  {
    id: 'longstay', label: 'Long stays', page: '/long-stay',
    slots: {
      'long.hero': { label: 'Banner', src: NosyIranja },
      ...list('long.week', 'Week', [TeamLookout, Ramena, Ambanja, NosyIranja]),
      ...list('long.manage', 'Planning photo', [Ambanja, Deux]),
      ...list('long.service', 'Service', [NosyLonjo, Deux, TeamLookout, Ambanja, Ramena]),
      'long.cta': { label: 'Final banner', src: Ramena },
    },
  },
  {
    id: 'photography', label: 'Photography', page: '/photography',
    slots: {
      ...list('photo.hero', 'Hero photo', [Ramena, Ambanja, Deux, NosyIranja, NosyLonjo, TeamLookout]),
      'photo.edit': { label: 'Before / after photo', src: NosyIranja },
      'photo.cta': { label: 'Final banner', src: Ramena },
    },
  },
  {
    id: 'tailormade', label: 'Tailor-made', page: '/tailor-made',
    slots: {
      ...list('tm.hero', 'Hero arch', [Ambanja, NosyIranja, TeamLookout]),
      ...list('tm.interest', 'Interest', [NosyIranja, Ambanja, TeamLookout, Deux, Ramena, NosyLonjo]),
      'tm.cta': { label: 'Final banner', src: Ramena },
    },
  },
  {
    id: 'transport', label: 'Transport', page: '/transport',
    slots: { 'transport.hero': { label: 'Large card', src: Deux }, 'transport.cta': { label: 'Final banner', src: TeamLookout } },
  },
  {
    id: 'tickets', label: 'Ticket reservations', page: '/ticket-reservation',
    slots: {},
  },
  {
    id: 'account', label: 'Sign in and sign up', page: '/login',
    slots: { 'auth.background': { label: 'Background', src: NosyIranja } },
  },
]

// Photos Noziwild choisies selon le contenu de chaque emplacement (sitePhotoChoices.js)
for (const page of PHOTO_PAGES) {
  for (const [key, slot] of Object.entries(page.slots)) if (PHOTO_CHOICES[key]) slot.src = PHOTO_CHOICES[key]
}

export const PHOTO_SLOTS = Object.fromEntries(PHOTO_PAGES.flatMap((p) => Object.entries(p.slots)))

// Versions verticales (3:4) pour les écrans en portrait (téléphones, tablettes debout), coupées dans les
// originaux en haute résolution avec le même cadrage : assets/images/<site|hero>/mobile/<nom>.webp.
// Une photo paysage en plein écran sur un téléphone n'en montre qu'une bande étroite, agrandie : sans
// cette version, elle paraît floue. Indexées par l'adresse de la photo d'origine (bg1-2400.jpg → bg1.webp ; bg6 n'existe qu'en 2000 px).
const fileName = (path) => path.split('/').pop().replace(/\.\w+$/, '').replace(/-(2000|2400)$/, '')
const PORTRAIT_FILES = import.meta.glob('./assets/images/*/mobile/*.webp', { eager: true, import: 'default' })
const PORTRAIT_BY_NAME = Object.fromEntries(Object.entries(PORTRAIT_FILES).map(([path, url]) => [fileName(path), url]))
const LANDSCAPE_FILES = import.meta.glob(['./assets/images/site/*.jpg', './assets/images/hero/*-2400.jpg', './assets/images/hero/*-2000.jpg'], { eager: true, import: 'default' })
const PORTRAIT_BY_SRC = Object.fromEntries(
  Object.entries(LANDSCAPE_FILES)
    .filter(([path]) => PORTRAIT_BY_NAME[fileName(path)])
    .map(([path, url]) => [url, PORTRAIT_BY_NAME[fileName(path)]]),
)

// Emplacements affichés avec <SiteMedia> : grands fonds où une vidéo a du sens
export const VIDEO_SLOTS = new Set([
  'home.hero.1', 'home.hero.2', 'home.hero.4', 'home.hero.5', 'home.hero.6',
  'dest.cta', 'blog.hero', 'about.promise', 'about.mission', 'act.banner', 'circ.hero', 'circ.cta', 'contact.banner',
  'cruise.hero', 'cruise.cta', 'gear.cta', 'exc.hero', 'exc.multi', 'exc.cta', 'food.class',
  'hosting.hero', 'hosting.featured', 'hosting.cta', 'long.hero', 'long.cta', 'photo.cta', 'tm.cta',
  'transport.hero', 'transport.cta', 'auth.background', 'tm.hero.2',
  'about.hero', 'dest.hero.2',
])

const STORAGE_KEY = 'noziwild-photos'
const VIDEOS_KEY = 'noziwild-videos'
function stored(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {}
  } catch {
    return {}
  }
}

const SitePhotosContext = createContext({ custom: {}, setCustom: () => {}, videos: {}, setVideos: () => {} })

export function SitePhotosProvider({ children }) {
  const [custom, setCustom] = useState(() => window.__NOZIWILD_SITE__?.images ?? stored(STORAGE_KEY))
  const [videos, setVideos] = useState(() => window.__NOZIWILD_SITE__?.videos ?? stored(VIDEOS_KEY))
  useEffect(() => {
    let cancelled = false
    fetchSitePhotos()
      .then(({ images, videos: videoSlots }) => {
        if (cancelled) return
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(images))
          localStorage.setItem(VIDEOS_KEY, JSON.stringify(videoSlots))
        } catch {
          // stockage indisponible : les photos arriveront de l'API à chaque visite
        }
        setCustom(images)
        setVideos(videoSlots)
      })
      .catch(() => {
        // API injoignable : on garde les photos connues
      })
    return () => {
      cancelled = true
    }
  }, [])
  const value = useMemo(() => ({ custom, setCustom, videos, setVideos }), [custom, videos])
  return <SitePhotosContext.Provider value={value}>{children}</SitePhotosContext.Provider>
}

// photo('blog.hero') : la photo choisie dans l'admin, sinon celle d'origine
export function usePhoto() {
  const { custom } = useContext(SitePhotosContext)
  return useCallback((key) => (custom[key] ? assetUrl(custom[key]) : PHOTO_SLOTS[key]?.src), [custom])
}

// portraitPhoto('home.hero.1') : version verticale de la photo d'origine, ou null
// (photo remplacée dans l'admin, ou pas de version verticale)
export function usePortraitPhoto() {
  const { custom } = useContext(SitePhotosContext)
  return useCallback((key) => (custom[key] ? null : PORTRAIT_BY_SRC[PHOTO_SLOTS[key]?.src] || null), [custom])
}

// Vidéos de fond choisies dans l'admin : { 'blog.hero': '/uploads/files/....mp4' }
export const useSiteVideos = () => useContext(SitePhotosContext).videos

// Pour l'admin : photos et vidéos choisies, et mise à jour immédiate après un changement
export function useSitePhotos() {
  return useContext(SitePhotosContext)
}
