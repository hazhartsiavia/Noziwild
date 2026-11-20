// Page Contact, d'après un modèle Webflow (Funway), avec les couleurs, la police et les formes de l'accueil :
//   en-tête (grand titre | texte et bouton), coordonnées en pastilles dorées, carte blanche du formulaire avec
//   la carte « Suivez-nous » qui déborde en haut à droite, puis le bandeau « échanger avec nos experts ».
// Styles : contact.css. Textes : locales/<langue>/contact.json.
import React, { useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { sendContact } from '../api';
import { useAuth } from '../context/AuthContext';
import { useT } from '../i18n/LanguageContext';
import { useScrollReveal } from '../utils/useScrollReveal'
import { usePhoto } from '../sitePhotos'
import { A } from '../i18n/router'
import SiteMedia from '../components/SiteMedia'
import './contact.css'

/* ---------------------------- Données ---------------------------- */
// Textes affichés : locales/<langue>/contact.json

const contact = {
  title: 'Let’s Talk With Noziwild',
  text: 'Questions about a trip, a custom itinerary or a partnership? Send us a message and a travel expert will get back to you within one working day.',
  cta: 'Contact Us Now',
  phone: '+33 6 98 89 30 64',
  email: 'contact@madanoziwild.com',
  address: 'Lot AVA 149 AQ II Avarajozoro, 10402 Ambatolampy, Madagascar',   // siège social
}

// Valeur envoyée à l'équipe (en anglais, quelle que soit la langue du site) ; libellé traduit : contact.inquiryTypes
const inquiryTypes = ['Booking A Trip', 'Custom Tour Request', 'General Questions', 'Partnership', 'Support']

// Bandeau « échanger avec nos experts » : le bouton appelle Noziwild (pas d'agenda en ligne pour l'instant)
const call = {
  href: `tel:${contact.phone.replace(/\s/g, '')}`,
}

/* ---------------------------- Icônes ----------------------------- */

const Svg = ({ children, className = "w-5 h-5 md:w-7 md:h-7" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
)

const PhoneIcon = () => (
  <Svg>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </Svg>
)

const AtIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
  </Svg>
)

const PinIcon = () => (
  <Svg>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Svg>
)

const socialClass = "w-5 h-5 md:w-6 md:h-6"

const FacebookIcon = () => (
  <Svg className={socialClass}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </Svg>
)

const InstagramIcon = () => (
  <Svg className={socialClass}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </Svg>
)

const LinkedinIcon = () => (
  <Svg className={socialClass}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </Svg>
)

const YoutubeIcon = () => (
  <Svg className={socialClass}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </Svg>
)

const socials = [
  { id: 1, label: 'Facebook', href: '#', icon: FacebookIcon },
  { id: 2, label: 'Instagram', href: '#', icon: InstagramIcon },
  { id: 3, label: 'LinkedIn', href: '#', icon: LinkedinIcon },
  { id: 4, label: 'YouTube', href: '#', icon: YoutubeIcon },
]

/* -------------------------- Composants --------------------------- */

// Coordonnée avec pastille dorée
function ContactItem({ icon, text, href }) {
  const inner = (
    <>
      <span className="nzc__dot">{icon}</span>
      <span className="nzc__info-text">{text}</span>
    </>
  )
  return href
    ? <A href={href} className="nzc__info nzc__info--link">{inner}</A>
    : <div className="nzc__info">{inner}</div>
}

// Carte « Suivez-nous » : déborde en haut à droite de la carte du formulaire (ordinateur)
function SocialCard() {
  const t = useT('contact')
  return (
    <div className="nzc__social">
      <p>{t('social')}</p>
      <ul>
        {socials.map((social) => {
          const SocialIcon = social.icon
          return (
            <li key={social.id}>
              <A href={social.href} aria-label={social.label}><SocialIcon /></A>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// Bandeau « Envie d'échanger avec nos experts ? » : photo de fond, deux petites photos superposées, bouton doré
function CallBanner() {
  const photo = usePhoto()
  const t = useT('contact')
  return (
    <div className="nzc__call">
      <SiteMedia slot="contact.banner" alt="" className="nzc__call-bg" />
      <div className="nzc__call-inner">
        <div className="nzc__call-photos" aria-hidden="true">
          <img src={photo('contact.photo.1')} alt="" loading="lazy" />
          <img src={photo('contact.photo.2')} alt="" loading="lazy" />
        </div>
        <div className="nzc__call-text">
          <h3>{t('callTitle')}</h3>
          <p>{t('callText')}</p>
        </div>
        <A href={call.href} className="nzc__btn">{t('callCta')}<ArrowUpRight aria-hidden="true" /></A>
      </div>
    </div>
  )
}

function Contact() {
  // Connecté : nom et email pré-remplis (la clé recrée le champ quand la session est connue)
  const { user } = useAuth()
  const t = useT('contact')
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'sent' | 'error'
  const [error, setError] = useState('')
  const root = useRef(null)
  useScrollReveal(root)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))

    setStatus('sending')
    try {
      await sendContact(data)
      setStatus('sent')
      form.reset()
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <>
    <section ref={root} id="contact" className="nzc">
      <Navbar />

      <div className="nzc__wrap">
        {/* En-tête : grand titre à gauche ; texte et bouton à droite, séparés par un trait */}
        <header className="nzc__head">
          <h1 className="nzc__title">{t('title')}</h1>
          <div className="nzc__intro">
            <p>{t('text')}</p>
            <A href="#contact-form" className="nzc__btn nzc__btn--dark">{t('cta')}<ArrowUpRight aria-hidden="true" /></A>
          </div>
        </header>

        {/* Coordonnées */}
        <div className="nzc__infos">
          <ContactItem icon={<PhoneIcon />} text={contact.phone} href={`tel:${contact.phone.replace(/\s/g, '')}`} />
          <ContactItem icon={<AtIcon />} text={contact.email} href={`mailto:${contact.email}`} />
          <ContactItem icon={<PinIcon />} text={t('address')} />
        </div>

        {/* Carte du formulaire */}
        <div id="contact-form" className="nzc__card">
          <SocialCard />

          <form onSubmit={handleSubmit} className="nzc__form">
            <div className="nzc__row">
              <div>
                <label htmlFor="name" className="nzc__label">{t('name')}</label>
                <input id="name" name="name" key={`n-${user?.id}`} defaultValue={user?.name} type="text" autoComplete="name" required className="nzc__field" />
              </div>
              <div>
                <label htmlFor="phone" className="nzc__label">{t('phone')}</label>
                <input id="phone" name="phone" type="tel" autoComplete="tel" className="nzc__field" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="nzc__label">{t('email')}</label>
              <input id="email" name="email" key={`e-${user?.id}`} defaultValue={user?.email} type="email" autoComplete="email" required className="nzc__field" />
            </div>

            {/* Type de demande : boutons radio en pastilles */}
            <fieldset className="nzc__types">
              <legend className="nzc__label">{t('inquiry')}</legend>
              <div>
                {inquiryTypes.map((type, i) => (
                  <label key={type}>
                    <input type="radio" name="inquiry" value={type} />
                    <span>{t('inquiryTypes')[i]}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="message" className="nzc__label">{t('message')}</label>
              <textarea id="message" name="message" rows={5} required className="nzc__field nzc__field--area" />
            </div>

            <p className="nzc__customers">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              {t('customers')}
            </p>

            <div className="nzc__submit">
              <button type="submit" disabled={status === 'sending'} className="nzc__btn">
                {status === 'sending' ? t('sending') : t('send')}
                <ArrowUpRight aria-hidden="true" />
              </button>
              {status === 'sent' && <p role="status" className="nzc__note nzc__note--ok">{t('sent')}</p>}
              {status === 'error' && <p role="alert" className="nzc__note nzc__note--error">{error}</p>}
            </div>
          </form>

          {/* Appel à l'action final */}
          <p className="nzc__final">{t('finalCta')}</p>
          <CallBanner />
        </div>
      </div>
    </section>
    <Footer />
    </>
  )
}

export default Contact