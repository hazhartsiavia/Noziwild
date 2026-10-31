// Photos des pages (bannières, grands blocs, cartes qui ne viennent pas de la base) remplaçables
// depuis l'admin (page « Photos »). Chaque emplacement a sa photo d'origine ici ; l'API ne garde
// que les photos remplacées, et le site les pose par-dessus.
//   const photo = usePhoto() ; <img src={photo('blog.hero')} />
// Les photos remplacées sont aussi gardées dans le navigateur, pour s'afficher sans attendre l'API.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { assetUrl, fetchSitePhotos } from './api'
import Ramena from './assets/images/Ramena.png'
import NosyIranja from './assets/images/NosyIranja.png'
import NosyLonjo from './assets/images/NosyLonjo.png'
import Ambanja from './assets/images/Ambanja.png'
import Deux from './assets/images/2.jpg'
import Tana from './assets/images/Tana.png'
import bg1 from './assets/images/hero/bg1-2400.jpg'
import bg2 from './assets/images/hero/bg2-2400.jpg'
import bg3 from './assets/images/hero/bg3-2400.jpg'
import bg4 from './assets/images/hero/bg4-2400.jpg'
import bg5 from './assets/images/hero/bg5-2400.jpg'

const list = (prefix, label, sources) =>
  Object.fromEntries(sources.map((src, i) => [`${prefix}.${i + 1}`, { label: `${label} ${i + 1}`, src }]))

// Pages de l'admin : chaque page regroupe ses emplacements { clé: { label, src } }
export const PHOTO_PAGES = [
  {
    id: 'home', label: 'Home', page: '/',
    slots: {
      // Même ordre que les diapositives du hero (HomeHero.jsx)
      ...list('home.hero', 'Hero slide', [bg1, bg2, bg4, bg3, bg5]),
      ...list('home.ways', 'Ways to travel card', [Tana, Ramena, NosyIranja, Ambanja]),
      ...list('home.trips', 'Trip we love', [Tana, NosyIranja, Deux]),
      'home.cta': { label: 'Final banner', src: Ramena },
    },
  },
  {
    id: 'regions', label: 'Regions (home and destinations pages)', page: '/destinations',
    slots: {
      'region.north': { label: 'The North', src: NosyIranja },
      ...list('region.north', 'The North, place', [Ramena, NosyIranja, Ambanja]),
      'region.highlands': { label: 'The Highlands', src: Tana },
      ...list('region.highlands', 'The Highlands, place', [Tana, Deux, Ambanja]),
      'region.west': { label: 'The West', src: Deux },
      ...list('region.west', 'The West, place', [Deux, NosyLonjo, Ambanja]),
      'region.south': { label: 'The South', src: NosyLonjo },
      ...list('region.south', 'The South, place', [NosyLonjo, Ramena, NosyIranja]),
      'region.east': { label: 'The East', src: Ambanja },
      ...list('region.east', 'The East, place', [Ambanja, NosyIranja, Tana]),
    },
  },
  {
    id: 'destinations', label: 'Destinations', page: '/destinations',
    slots: { ...list('dest.hero', 'Hero photo', [Ramena, Tana, NosyLonjo]), 'dest.cta': { label: 'Final banner', src: Ramena } },
  },
  {
    id: 'blog', label: 'Blog', page: '/blog',
    slots: { 'blog.hero': { label: 'Banner', src: Ramena } },
  },
  {
    id: 'about', label: 'About', page: '/about',
    slots: {
      'about.promise': { label: '“Our promise” card', src: Deux },
      'about.mission': { label: 'Mission, large photo', src: NosyIranja },
      ...list('about.mission', 'Mission, small photo', [Ambanja, NosyLonjo]),
      ...list('about.expert', 'Travel expert', [Ambanja, NosyLonjo, NosyIranja, Ramena, Tana]),
    },
  },
  {
    id: 'activities', label: 'Activities', page: '/activities',
    slots: { 'act.banner': { label: 'Banner', src: NosyLonjo }, ...list('act.photo', 'Tilted photo', [Ramena, Tana, NosyIranja]) },
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
    id: 'cruise', label: 'Cruise excursions', page: '/cruise-excurssion',
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
      'gear.arch.optics': { label: 'Category: photo & optics', src: Tana },
      'gear.cta': { label: 'Final banner', src: NosyIranja },
    },
  },
  {
    id: 'excursions', label: 'Excursions', page: '/excurssions',
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
      ...list('food.dish', 'Dish', [Ambanja, Tana, Deux, Ramena, NosyLonjo]),
      'food.class': { label: 'Cooking class', src: Tana },
    },
  },
  {
    id: 'guides', label: 'Guides', page: '/guide',
    slots: {
      ...list('guides.hero', 'Hero photo', [Tana, Ramena]),
      ...list('guides.service', 'Guide service', [Tana, Deux, NosyIranja, NosyLonjo]),
      ...list('guides.gallery', 'Gallery photo', [Tana, Ramena, NosyLonjo, Deux, Ambanja, NosyIranja, Tana]),
    },
  },
  {
    id: 'hosting', label: 'Accommodation', page: '/hosting',
    slots: {
      'hosting.hero': { label: 'Banner', src: NosyLonjo },
      'hosting.featured': { label: '“Guest favorite” block', src: NosyIranja },
      'hosting.cta': { label: 'Final banner', src: Ramena },
    },
  },
  {
    id: 'longstay', label: 'Long stays', page: '/longstay',
    slots: {
      'long.hero': { label: 'Banner', src: NosyIranja },
      ...list('long.week', 'Week', [Tana, Ramena, Ambanja, NosyIranja]),
      ...list('long.manage', 'Planning photo', [Ambanja, Deux]),
      ...list('long.service', 'Service', [NosyLonjo, Deux, Tana, Ambanja, Ramena]),
      'long.quote': { label: 'Quote block', src: Tana },
      'long.cta': { label: 'Final banner', src: Ramena },
    },
  },
  {
    id: 'photography', label: 'Photography', page: '/photography',
    slots: {
      ...list('photo.hero', 'Hero photo', [Ramena, Ambanja, Deux, NosyIranja, NosyLonjo, Tana]),
      'photo.edit': { label: 'Before / after photo', src: NosyIranja },
      'photo.cta': { label: 'Final banner', src: Ramena },
    },
  },
  {
    id: 'tailormade', label: 'Tailor-made', page: '/tailor-made',
    slots: {
      ...list('tm.hero', 'Hero arch', [Ambanja, NosyIranja, Tana]),
      ...list('tm.interest', 'Interest', [NosyIranja, Ambanja, Tana, Deux, Ramena, NosyLonjo]),
      'tm.cta': { label: 'Final banner', src: Ramena },
    },
  },
  {
    id: 'transport', label: 'Transport', page: '/transport',
    slots: { 'transport.hero': { label: 'Large card', src: Deux }, 'transport.cta': { label: 'Final banner', src: Tana } },
  },
  {
    id: 'planning', label: 'Travel planning', page: '/travel-planning',
    slots: list('plan.sample', 'Sample trip', [Tana, NosyIranja, Deux]),
  },
  {
    id: 'account', label: 'Sign in and sign up', page: '/login',
    slots: { 'auth.background': { label: 'Background', src: NosyIranja } },
  },
]

export const PHOTO_SLOTS = Object.fromEntries(PHOTO_PAGES.flatMap((p) => Object.entries(p.slots)))

const STORAGE_KEY = 'noziwild-photos'
function stored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

const SitePhotosContext = createContext({ custom: {}, setCustom: () => {} })

export function SitePhotosProvider({ children }) {
  const [custom, setCustom] = useState(stored)
  useEffect(() => {
    let cancelled = false
    fetchSitePhotos()
      .then(({ images }) => {
        if (cancelled) return
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(images))
        } catch {
          // stockage indisponible : les photos arriveront de l'API à chaque visite
        }
        setCustom(images)
      })
      .catch(() => {
        // API injoignable : on garde les photos connues
      })
    return () => {
      cancelled = true
    }
  }, [])
  const value = useMemo(() => ({ custom, setCustom }), [custom])
  return <SitePhotosContext.Provider value={value}>{children}</SitePhotosContext.Provider>
}

// photo('blog.hero') : la photo choisie dans l'admin, sinon celle d'origine
export function usePhoto() {
  const { custom } = useContext(SitePhotosContext)
  return useCallback((key) => (custom[key] ? assetUrl(custom[key]) : PHOTO_SLOTS[key]?.src), [custom])
}

// Pour l'admin : photos remplacées, et mise à jour immédiate après un changement
export function useSitePhotos() {
  return useContext(SitePhotosContext)
}
