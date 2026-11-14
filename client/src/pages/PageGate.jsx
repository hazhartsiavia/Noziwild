// Devant toutes les pages publiques : une page masquée dans l'admin montre un message aux visiteurs.
// Un administrateur la voit quand même, avec un bandeau pour le rappeler.
// Textes : locales/<langue>/pages.json
import React from 'react'
import { A, Link, Outlet, useLocation } from '../i18n/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { useSitePages } from '../context/SitePagesContext'
import { useT } from '../i18n/LanguageContext'
import { stripLang } from '../i18n/paths'

function HiddenMessage() {
  const t = useT('pages')
  return (
    <>
      <main className="w-full bg-[#D5E8E2] pb-24 flex flex-col items-center">
        <Navbar />
        <section className="w-[90vw] max-w-3xl mt-16 rounded-3xl bg-white p-10 text-center">
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-forest">{t('hiddenTitle')}</h1>
          <p className="mt-4 text-slate-600">{t('hiddenText')}</p>
          <A href="/" className="mt-6 inline-block rounded-full bg-[#074636] hover:bg-[#0a5c47] px-6 py-3 text-sm font-medium text-white">{t('backHome')}</A>
        </section>
      </main>
      <Footer />
    </>
  )
}

function PageGate() {
  const { pathname } = useLocation()
  const { isHidden } = useSitePages()
  const { user, loading } = useAuth()

  if (!isHidden(stripLang(pathname))) return <Outlet />
  if (loading) return null
  if (user?.role !== 'admin') return <HiddenMessage />
  return (
    <>
      <Outlet />
      <p role="status" className="fixed bottom-4 left-1/2 z-[70] w-max max-w-[90vw] -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-center text-sm text-white shadow-lg">
        Hidden from visitors.{' '}
        <Link to="/admin/photos" className="font-medium underline">Change it in the admin</Link>
      </p>
    </>
  )
}

export default PageGate
