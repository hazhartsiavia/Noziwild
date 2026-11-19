// Pied de page du site (toutes les pages), même style que les sections de l'accueil :
//   haut    : phrase d'accroche, bouton « Demander un devis » et adresse e-mail
//   milieu  : logo et présentation, puis trois colonnes de liens (Voyager, Services, Noziwild)
//   bas     : copyright, « Retour en haut », et le grand nom Noziwild en filigrane
// Libellés : locales/<langue>/footer.json (textes du pied de page) et nav.json (noms des pages, comme le menu).
// Une page masquée dans l'admin disparaît de ses colonnes.
import React from 'react'
import { ArrowUp, ArrowUpRight, Mail } from 'lucide-react'
import { Link } from '../i18n/router'
import LogoPrincipal from '../assets/logo/principal-sur-vert.svg'
import Wordmark from '../assets/logo/wordmark-blanc.svg'
import { useT } from '../i18n/LanguageContext'
import { useSitePages } from '../context/SitePagesContext'
import './footer.css'

// Adresse affichée sur la page Contact
const EMAIL = 'info@noziwild.com'

// Colonnes : [clé du libellé dans nav.json, adresse] ; même ordre que le menu (Navbar.jsx)
const TRAVEL = [
  ['links.circuits', '/circuits'],
  ['links.excursions', '/excursions'],
  ['links.activities', '/activities'],
  ['links.cruise', '/cruise-excursions'],
  ['links.longStay', '/long-stay'],
  ['links.tailorMade', '/tailor-made'],
]

const SERVICES = [
  ['links.accommodation', '/accommodation'],
  ['links.transport', '/transport'],
  ['links.guides', '/guides'],
  ['links.food', '/food-dining'],
  ['links.equipment', '/equipment-rentals'],
  ['links.photography', '/photography'],
  ['links.tickets', '/ticket-reservation'],
]

const COMPANY = [
  ['about', '/about'],
  ['destinations', '/destinations'],
  ['blog', '/blog'],
]

const Footer = () => {
  const t = useT('footer')
  const nav = useT('nav')
  const { isHidden } = useSitePages()

  const column = (title, links) => {
    const visible = links.filter(([, to]) => !isHidden(to))
    if (!visible.length) return null
    return (
      <nav className="nzf__col" aria-label={title}>
        <p className="nzf__col-title">{title}</p>
        <ul>
          {visible.map(([key, to]) => (
            <li key={to}><Link to={to} className="nzf__link">{nav(key)}</Link></li>
          ))}
          {links === COMPANY && !isHidden('/contact') && (
            <li><Link to="/contact" className="nzf__link">{t('links.contact')}</Link></li>
          )}
        </ul>
      </nav>
    )
  }

  const toTop = () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })

  return (
    <footer className="nzf">
      <div className="nzf__box">
        {/* Haut : phrase d'accroche et contact */}
        <div className="nzf__top">
          <p className="nzf__promise">{t('promise')}</p>
          <div className="nzf__actions">
            <Link to="/contact?type=quote" className="nzf__btn">{nav('quote')}<ArrowUpRight aria-hidden="true" /></Link>
            <a href={`mailto:${EMAIL}`} className="nzf__mail"><Mail aria-hidden="true" />{EMAIL}</a>
          </div>
        </div>

        <span className="nzf__rule" aria-hidden="true" />

        {/* Milieu : logo et présentation, puis les liens */}
        <div className="nzf__grid">
          <div className="nzf__brand">
            <Link to="/" aria-label={t('home')} className="nzf__logo">
              <img src={LogoPrincipal} alt="" />
            </Link>
            <p className="nzf__tagline">{t('tagline')}</p>
          </div>
          {column(nav('travel'), TRAVEL)}
          {column(nav('services'), SERVICES)}
          {column('Noziwild', COMPANY)}
        </div>

        <span className="nzf__rule" aria-hidden="true" />

        {/* Bas : copyright et retour en haut */}
        <div className="nzf__bottom">
          <p>© {new Date().getFullYear()} Noziwild · Madagascar</p>
          <button type="button" onClick={toTop} className="nzf__top-btn">
            {t('backToTop')}<span><ArrowUp aria-hidden="true" /></span>
          </button>
        </div>

        {/* Grand nom en fond : les lettres du logo officiel, en blanc très léger */}
        <img src={Wordmark} alt="" draggable="false" className="nzf__wordmark" />
      </div>
    </footer>
  )
}

export default Footer
