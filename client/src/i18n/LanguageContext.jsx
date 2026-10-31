// Langue du site public (l'espace /admin reste en une seule langue).
//   Textes : un fichier par page et par langue, dans locales/<langue>/<page>.json
//   L'anglais est chargé tout de suite et sert de secours : un texte absent d'une traduction
//   s'affiche en anglais. Les autres langues ne sont téléchargées que si on les choisit.
//   La langue est dans l'adresse (/fr/circuits ; l'anglais sans préfixe), voir paths.js.
//   Choix mémorisé dans le navigateur ; à la première visite, langue du navigateur si on la propose.
//   Textes modifiés depuis l'admin (page « Textes ») : lus sur l'API et posés par-dessus les fichiers.
//   Gardés aussi dans le navigateur, pour s'afficher dès la visite suivante sans attendre l'API.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { fetchTexts } from '../api'
import { langFromPath, localizePath } from './paths'

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

// Noms des fichiers de textes (home, about, footer...), dans l'ordre alphabétique
export const NAMESPACES = Object.keys(ENGLISH).sort()

async function loadLanguage(lang) {
  if (loaded[lang]) return loaded[lang]
  const files = Object.keys(LOADERS).filter((file) => file.startsWith(`./locales/${lang}/`))
  const modules = await Promise.all(files.map((file) => LOADERS[file]()))
  loaded[lang] = byNamespace(Object.fromEntries(files.map((file, i) => [file, modules[i]])))
  return loaded[lang]
}

// Avant le premier affichage : une adresse sans langue (/circuits) ouvre la page dans la langue préférée
// du visiteur (/fr/circuits). Les robots (langue anglaise) restent sur l'anglais.
export function redirectToPreferredLanguage() {
  const { pathname, search, hash } = window.location
  if (pathname === '/admin' || pathname.startsWith('/admin/') || langFromPath(pathname) !== 'en') return
  const preferred = initialLanguage()
  if (preferred !== 'en') window.history.replaceState(null, '', localizePath(pathname, preferred) + search + hash)
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

// Textes d'origine d'une langue (sans les modifications de l'admin) : sert à l'éditeur de textes
export const loadBaseTexts = (lang) => loadLanguage(lang)

// Pose les textes modifiés sur ceux d'origine. Listes fusionnées élément par élément ;
// null dans une liste modifiée garde l'élément d'origine.
export function mergeTexts(base, changes) {
  if (changes === undefined || changes === null) return base
  if (Array.isArray(base) && Array.isArray(changes)) return base.map((item, i) => mergeTexts(item, changes[i]))
  if (base && typeof base === 'object' && !Array.isArray(base) && typeof changes === 'object' && !Array.isArray(changes)) {
    const result = { ...base }
    for (const key of Object.keys(changes)) result[key] = mergeTexts(base[key], changes[key])
    return result
  }
  return typeof changes === typeof base ? changes : base
}

const CHANGES_KEY = 'noziwild-texts'
function storedChanges(lang) {
  try {
    return JSON.parse(localStorage.getItem(`${CHANGES_KEY}-${lang}`)) || {}
  } catch {
    return {}
  }
}
function storeChanges(lang, changes) {
  try {
    localStorage.setItem(`${CHANGES_KEY}-${lang}`, JSON.stringify(changes))
  } catch {
    // stockage indisponible : les textes modifiés arriveront de l'API à chaque visite
  }
}

// Textes modifiés d'une langue : ceux gardés dans le navigateur tout de suite, puis ceux de l'API
function useTextChanges(lang) {
  const [changes, setChanges] = useState(() => ({ [lang]: storedChanges(lang) }))
  useEffect(() => {
    let cancelled = false
    setChanges((c) => (c[lang] ? c : { ...c, [lang]: storedChanges(lang) }))
    fetchTexts(lang)
      .then(({ texts }) => {
        if (cancelled) return
        storeChanges(lang, texts)
        setChanges((c) => ({ ...c, [lang]: texts }))
      })
      .catch(() => {
        // API injoignable : on garde les textes connus
      })
    return () => {
      cancelled = true
    }
  }, [lang])
  return changes[lang] || {}
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
  // La langue est celle de l'adresse (/fr/...), l'anglais sans préfixe
  const location = useLocation()
  const navigate = useNavigate()
  const lang = langFromPath(location.pathname)
  const [base, setBase] = useState(() => loaded[lang] || ENGLISH)
  const changes = useTextChanges(lang)
  // L'anglais sert de secours : ses textes modifiés comptent aussi
  const englishChanges = useTextChanges('en')
  const dictionary = useMemo(() => mergeTexts(base, changes), [base, changes])
  const english = useMemo(() => mergeTexts(ENGLISH, englishChanges), [englishChanges])

  useEffect(() => {
    let cancelled = false
    document.documentElement.lang = lang
    loadLanguage(lang)
      .then((dict) => !cancelled && setBase(dict))
      .catch(() => !cancelled && setBase(ENGLISH))
    return () => {
      cancelled = true
    }
  }, [lang])

  // Changer de langue : la même page, à l'adresse de l'autre langue
  const setLang = useCallback(
    (code) => {
      if (!CODES.includes(code)) return
      try {
        localStorage.setItem(STORAGE_KEY, code)
      } catch {
        // le choix ne sera pas mémorisé, mais s'applique quand même
      }
      navigate({ ...location, pathname: localizePath(location.pathname, code) })
    },
    [navigate, location],
  )

  const value = useMemo(() => ({ lang, setLang, dictionary, english }), [lang, setLang, dictionary, english])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  return useContext(LanguageContext)
}

// const t = useT('circuits') ; t('hero.title') ; t('filters', { count: 3 })
// Renvoie aussi des listes ou des objets (cartes, FAQ...) quand le texte en contient.
export function useT(namespace) {
  const { dictionary, english } = useContext(LanguageContext)
  return useCallback(
    (key, vars) => {
      const path = `${namespace}.${key}`
      const value = lookup(dictionary, path) ?? lookup(english, path)
      if (value === undefined) {
        if (import.meta.env.DEV) console.warn(`Texte manquant : ${path}`)
        return key
      }
      return fill(value, vars)
    },
    [dictionary, english, namespace],
  )
}

// Phrase traduite contenant des éléments React (lien, montant en gras...) :
//   <Trans text={t('follow')} values={{ link: <Link to="/account">{t('account')}</Link> }} />
// avec "follow": "Suivez-la dans {link}." : l'ordre des mots reste celui de chaque langue.
export function Trans({ text, values }) {
  const parts = String(text).split(/\{(\w+)\}/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? <React.Fragment key={i}>{part in values ? values[part] : `{${part}}`}</React.Fragment> : part,
  )
}
