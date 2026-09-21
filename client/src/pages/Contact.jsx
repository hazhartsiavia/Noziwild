import React, { useState } from 'react'
import NosyIranja from "../assets/images/NosyIranja.png";
import Ambanja from "../assets/images/Ambanja.png";
import NosyLonjo from "../assets/images/NosyLonjo.png";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';


/* Constantes partagées : mêmes valeurs que dans les autres sections */
const SECTION_WIDTH = "w-[90vw] lg:max-w-[90vw] xl:max-w-[95vw] mt-10"
const SECTION_SUBTITLE = "text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl"
const META_TEXT = "text-xs sm:text-sm"
const BUTTON = "text-sm font-medium px-5 py-2.5 rounded-full"
const STATEMENT_TITLE = "text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-medium uppercase leading-[1.15] tracking-tight text-slate-900"

// Propres au formulaire
const LABEL = "block mb-2 text-sm md:text-base text-slate-700"
const FIELD =
  "w-full h-12 md:h-14 rounded-full border border-slate-300 bg-white px-6 text-base text-slate-800 " +
  "focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700 transition"

/* ---------------------------- Données ---------------------------- */

const contact = {
  title: 'Let’s Talk With Noziwild',
  text: 'Questions about a trip, a custom itinerary or a partnership? Send us a message and a travel expert will get back to you within one working day.',
  cta: 'Contact Us Now',
  phone: '+261 34 00 000 00',
  email: 'info@noziwild.com',
  address: 'Antananarivo, Madagascar',
}

const inquiryTypes = ['Booking A Trip', 'Custom Tour Request', 'General Questions', 'Partnership', 'Support']

const call = {
  title: 'Want To Connect With Our Travel Experts?',
  text: 'Book A 30 Minutes Call',
  cta: 'Contact Us',
  href: '#', // lien vers ton agenda (Calendly, etc.)
  image: NosyIranja,            // fond de la bannière (à remplacer)
  photos: [Ambanja, NosyLonjo], // les 2 petites photos (à remplacer)
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

// Coordonnée avec pastille rouge
function ContactItem({ icon, text, href }) {
  const inner = (
    <>
      <span className="shrink-0 w-12 h-12 md:w-[68px] md:h-[68px] rounded-full bg-[#C49849] text-white flex items-center justify-center">
        {icon}
      </span>
      <span className="text-base md:text-xl lg:text-2xl text-slate-800 break-words">{text}</span>
    </>
  )
  const base = "flex items-center gap-4 md:gap-5"

  return href
    ? <a href={href} className={`${base} hover:opacity-80 transition`}>{inner}</a>
    : <div className={base}>{inner}</div>
}

// Carte "Let's Get Social" : déborde en haut à droite du formulaire (dès l'écran moyen)
function SocialCard() {
  return (
    <div className="relative md:absolute md:-top-12 md:right-10 z-10 w-fit mb-8 md:mb-0 rounded-2xl bg-slate-800 text-white px-6 py-4 md:px-9 md:py-5">
      <p className="text-sm md:text-base font-medium">Let’s Get Social</p>
      <ul className="mt-3 md:mt-4 flex items-center gap-5 md:gap-6">
        {socials.map((social) => {
          const SocialIcon = social.icon
          return (
            <li key={social.id}>
              <a href={social.href} aria-label={social.label} className="block hover:opacity-70 transition">
                <SocialIcon />
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// Bannière "Want to connect with our travel experts?"
function CallBanner() {
  const [first, second] = call.photos
  const frame = "absolute w-[52%] bg-white rounded-md p-1 md:p-1.5 shadow-sm"
  const photo = "w-full aspect-[4/5] object-cover rounded-sm"

  return (
    <div className="relative overflow-hidden rounded-xl text-white md:w-[66%]">
      <img src={call.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-slate-950/70" />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8 p-5 md:p-6">

        {/* Deux photos inclinées */}
        <div className="relative shrink-0 w-36 h-32 md:w-44 md:h-40 mx-auto sm:mx-0" aria-hidden="true">
          <div className={`${frame} left-0 top-0 -rotate-6`}>
            <img src={first} alt="" className={photo} />
          </div>
          <div className={`${frame} left-[42%] top-[10%] rotate-6`}>
            <img src={second} alt="" className={photo} />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-xl md:text-2xl font-medium leading-snug">{call.title}</h3>
          <p className="mt-3 text-sm md:text-base">{call.text}</p>
        </div>

        <a
          href={call.href}
          className={`self-start sm:self-center shrink-0 bg-[#C49849] hover:bg-[#b53d2a] active:scale-95 transition text-white ${BUTTON} md:px-6 md:py-3`}
        >
          {call.cta}
        </a>
      </div>
    </div>
  )
}

function Contact() {
  const [status, setStatus] = useState('idle') // 'idle' | 'sent'

  const handleSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))

    // TODO : envoyer `data` à ton API ou à un service d'emails (EmailJS, Formspree...)
    console.log('Contact form:', data)

    setStatus('sent')
    form.reset()
  }

  return (
    <>

    <section id="contact" className="w-full pt-0 pb-12 md:pb-20 bg-[#D5E8E2] flex flex-col items-center">
        <Navbar />
      <div className={SECTION_WIDTH}>

        {/* Titre + texte + bouton */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-0">
          <h1 className={STATEMENT_TITLE}>{contact.title}</h1>

          <div className="flex flex-col items-start gap-8 lg:gap-10 lg:border-l lg:border-slate-900/15 lg:pl-10">
            <p className={SECTION_SUBTITLE}>{contact.text}</p>
            <a
              href="#contact-form"
              className={`bg-slate-800 hover:bg-slate-700 active:scale-95 transition text-white ${BUTTON} md:px-6 md:py-3`}
            >
              {contact.cta}
            </a>
          </div>
        </div>

        {/* Coordonnées */}
        <div className="mt-10 md:mt-16 flex flex-wrap gap-x-10 xl:gap-x-16 gap-y-6">
          <ContactItem icon={<PhoneIcon />} text={contact.phone} href={`tel:${contact.phone.replace(/\s/g, '')}`} />
          <ContactItem icon={<AtIcon />} text={contact.email} href={`mailto:${contact.email}`} />
          <ContactItem icon={<PinIcon />} text={contact.address} />
        </div>

        {/* Carte du formulaire */}
        <div id="contact-form" className="relative mt-14 md:mt-24 rounded-3xl bg-white p-5 sm:p-8 md:p-12 scroll-mt-8">
          <SocialCard />

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 md:gap-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div>
                <label htmlFor="name" className={LABEL}>Name</label>
                <input id="name" name="name" type="text" autoComplete="name" required className={FIELD} />
              </div>
              <div>
                <label htmlFor="phone" className={LABEL}>Phone</label>
                <input id="phone" name="phone" type="tel" autoComplete="tel" className={FIELD} />
              </div>
            </div>

            <div>
              <label htmlFor="email" className={LABEL}>Email Address</label>
              <input id="email" name="email" type="email" autoComplete="email" required className={FIELD} />
            </div>

            {/* Type de demande : boutons radio stylés en pastilles */}
            <fieldset>
              <legend className={LABEL}>Select Inquiry Type</legend>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {inquiryTypes.map((type) => (
                  <label key={type} className="cursor-pointer">
                    <input type="radio" name="inquiry" value={type} className="peer sr-only" />
                    <span
                      className="block text-center rounded-full border border-slate-300 px-3 py-3 text-sm text-slate-700 transition
                                 hover:border-slate-500
                                 peer-checked:bg-slate-800 peer-checked:border-slate-800 peer-checked:text-white
                                 peer-focus-visible:ring-2 peer-focus-visible:ring-slate-700 peer-focus-visible:ring-offset-2"
                    >
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="message" className={LABEL}>Tell Us Little About Your Vision…</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="w-full rounded-3xl border border-slate-300 bg-white px-6 py-4 text-base text-slate-800 resize-y
                           focus:outline-none focus:border-slate-700 focus:ring-1 focus:ring-slate-700 transition"
              />
            </div>

            <p className="flex items-center gap-2 text-sm md:text-base text-slate-700">
              <svg className="w-4 h-4 text-[#F5B800] fill-current" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              Join 100+ Happy Customers
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                type="submit"
                className={`self-start bg-[#C49849] hover:bg-[#b53d2a] active:scale-95 transition text-white ${BUTTON} md:px-6 md:py-3`}
              >
                Start A Conversation
              </button>

              {status === 'sent' && (
                <p role="status" className={`${META_TEXT} md:text-base text-emerald-700`}>
                  Thank you! Your message has been sent, we will get back to you soon.
                </p>
              )}
            </div>
          </form>

          {/* Appel à l'action final */}
          <p className="mt-10 md:mt-14 text-sm md:text-base font-medium text-slate-800">
            Ready To Start Your Adventure? Fill Out The Form Or Book A Call And Let’s Plan Your Journey Today!
          </p>

          <div className="mt-6 md:mt-8">
            <CallBanner />
          </div>
        </div>

      </div>

    </section>
    <Footer />
    </>
  )
}

export default Contact