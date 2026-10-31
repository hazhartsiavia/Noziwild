// Le routeur du site public, avec la langue dans l'adresse : à importer à la place de 'react-router-dom'.
// Link, NavLink, Navigate et useNavigate ajoutent tout seuls le préfixe de la langue en cours
// (<Link to="/circuits"> mène à /fr/circuits sur le site en français). Le reste vient de react-router-dom.
// <A href="/contact"> : lien classique (rechargement de la page), avec la même règle.
import { useCallback } from 'react'
import {
  Link as RouterLink,
  NavLink as RouterNavLink,
  Navigate as RouterNavigate,
  useNavigate as useRouterNavigate,
} from 'react-router-dom'
import { useLanguage } from './LanguageContext'
import { localizePath } from './paths'

export * from 'react-router-dom'

// const localize = useLocalize() ; localize('/blog') -> '/de/blog'
export function useLocalize() {
  const { lang } = useLanguage()
  return useCallback((to) => localizePath(to, lang), [lang])
}

export function Link({ to, ...props }) {
  return <RouterLink to={useLocalize()(to)} {...props} />
}

export function NavLink({ to, ...props }) {
  return <RouterNavLink to={useLocalize()(to)} {...props} />
}

export function Navigate({ to, ...props }) {
  return <RouterNavigate to={useLocalize()(to)} {...props} />
}

export function useNavigate() {
  const navigate = useRouterNavigate()
  const localize = useLocalize()
  // navigate(-1) : un nombre, rien à traduire
  return useCallback((to, options) => (typeof to === 'number' ? navigate(to) : navigate(localize(to), options)), [navigate, localize])
}

export function A({ href, ...props }) {
  return <a href={useLocalize()(href)} {...props} />
}
