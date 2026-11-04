// Pages masquées depuis l'admin (page « Pages & photos ») : retirées des menus, et remplacées par un message
// pour les visiteurs. Le serveur les pose dans le HTML ; elles sont aussi gardées dans le navigateur.
//   const { isHidden } = useSitePages() ; isHidden('/transport') ; isHidden('/circuits/mon-circuit')
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchSitePages } from '../api'

const STORAGE_KEY = 'noziwild-hidden-pages'

function stored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

const SitePagesContext = createContext(null)

export function SitePagesProvider({ children }) {
  const [hidden, setHidden] = useState(() => window.__NOZIWILD_SITE__?.hidden ?? stored())

  useEffect(() => {
    let cancelled = false
    fetchSitePages()
      .then(({ hidden: pages }) => !cancelled && setHidden(pages))
      .catch(() => {
        // API injoignable : on garde les pages connues
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hidden))
    } catch {
      // stockage indisponible : les pages arriveront de l'API à chaque visite
    }
  }, [hidden])

  const isHidden = useCallback((path) => hidden.some((page) => path === page || path.startsWith(`${page}/`)), [hidden])
  const value = useMemo(() => ({ hidden, setHidden, isHidden }), [hidden, isHidden])
  return <SitePagesContext.Provider value={value}>{children}</SitePagesContext.Provider>
}

export function useSitePages() {
  return useContext(SitePagesContext)
}
