// Langue du site public (l'espace /admin reste en une seule langue).
//   Textes : un fichier par page et par langue, dans locales/<langue>/<page>.json
//   L'anglais est chargé tout de suite et sert de secours : un texte absent d'une traduction
//   s'affiche en anglais. Les autres langues ne sont téléchargées que si on les choisit.
//   Choix mémorisé dans le navigateur ; à la première visite, langue du navigateur si on la propose.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'de', label: 'Deutsch', short: 'DE' },
  { code: 'it', label: 'Italiano', short: 'IT' },
  { code: 'es', label: 'Español', short: 'ES' },
]
const CODES = LANGUAGES.map((l) => l.code)
const STORAGE_KEY = 'noziwild-lang'

// locales/en/nav.json → { nav: {...} }
function byNamespace(modules) {
  const result = {}
  for (const [file, content] of Object.entries(modules)) {
    result[file.match(/\/([\w-]+)\.json$/)[1]] = content
  }
  return result
}

const ENGLISH = byNamespace(import.meta.glob('./locales/en/*.json', { eager: true, import: 'default' }))
const LOADERS = import.meta.glob(['./locales/*/*.json', '!./locales/en/*.json'], { import: 'default' })
const loaded = { en: ENGLISH }

async function loadLanguage(lang) {
  if (loaded[lang]) return loaded[lang]
  const files = Object.keys(LOADERS).filter((file) => file.startsWith(`./locales/${lang}/`))
  const modules = await Promise.all(files.map((file) => LOADERS[file]()))
  loaded[lang] = byNamespace(Object.fromEntries(files.map((file, i) => [file, modules[i]])))
  return loaded[lang]
}

function initialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (CODES.includes(saved)) return saved
  } catch {
    // stockage indisponible (navigation privée...) : on passe à la langue du navigateur
  }
  const browser = (navigator.languages || [navigator.language]).map((l) => String(l).slice(0, 2).toLowerCase())
  return browser.find((code) => CODES.includes(code)) || 'en'
}

// "Hello {name}" + { name: 'Ana' } → "Hello Ana"
function fill(value, vars) {
  if (!vars || typeof value !== 'string') return value
  return value.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? vars[key] : match))
}

function lookup(dictionary, path) {
  return path.split('.').reduce((node, key) => (node == null ? undefined : node[key]), dictionary)
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(initialLanguage)
  const [dictionary, setDictionary] = useState(() => loaded[lang] || ENGLISH)

  useEffect(() => {
    let cancelled = false
    document.documentElement.lang = lang
    loadLanguage(lang)
      .then((dict) => !cancelled && setDictionary(dict))
      .catch(() => !cancelled && setDictionary(ENGLISH))
    return () => {
      cancelled = true
    }
  }, [lang])

  const setLang = useCallback((code) => {
    if (!CODES.includes(code)) return
    try {
      localStorage.setItem(STORAGE_KEY, code)
    } catch {
      // le choix ne sera pas mémorisé, mais s'applique quand même
    }
    setLangState(code)
  }, [])

  const value = useMemo(() => ({ lang, setLang, dictionary }), [lang, setLang, dictionary])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  return useContext(LanguageContext)
}

// const t = useT('circuits') ; t('hero.title') ; t('filters', { count: 3 })
// Renvoie aussi des listes ou des objets (cartes, FAQ...) quand le texte en contient.
export function useT(namespace) {
  const { dictionary } = useContext(LanguageContext)
  return useCallback(
    (key, vars) => {
      const path = `${namespace}.${key}`
      const value = lookup(dictionary, path) ?? lookup(ENGLISH, path)
      if (value === undefined) {
        if (import.meta.env.DEV) console.warn(`Texte manquant : ${path}`)
        return key
      }
      return fill(value, vars)
    },
    [dictionary, namespace],
  )
}
