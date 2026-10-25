// Cadre commun des pages /login, /register, /forgot-password et /reset-password :
// une image à gauche (grands écrans) et le contenu à droite
import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import NosyIranja from '../assets/images/NosyIranja.png'
import { useT } from '../i18n/LanguageContext'

function AuthLayout({ title, text, children }) {
  const t = useT('auth')
  return (
    <>
      <section className="w-full pt-0 pb-12 md:pb-20 bg-[#D5E8E2] flex flex-col items-center">
        <Navbar />

        <div className="w-[90vw] max-w-6xl mt-10 grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-3xl bg-white">
          {/* Image */}
          <div className="relative hidden lg:block">
            <img src={NosyIranja} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
            <p className="absolute bottom-10 left-10 right-10 text-3xl xl:text-4xl font-medium leading-tight text-white">
              {t('layoutQuote')}
            </p>
          </div>

          {/* Contenu */}
          <div className="p-6 sm:p-10 md:p-14">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium uppercase leading-[1.15] tracking-tight text-forest">
              {title}
            </h1>
            <p className="mt-4 text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed">{text}</p>
            {children}
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}

export default AuthLayout
