// Message affiché à la place d'une liste d'offres pendant le chargement, en cas d'erreur, ou si elle est vide
import React from 'react'
import { useT } from '../i18n/LanguageContext'

function OffersStatus({ status, empty = false, dark = false, className = '' }) {
  const t = useT('offers')
  const box = `rounded-[2rem] p-8 text-center ${dark ? 'bg-white/10 text-white' : 'bg-white text-slate-700'} ${className}`

  if (status === 'loading') {
    return (
      <div role="status" className={box}>
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
        <span className="sr-only">{t('loading')}</span>
      </div>
    )
  }
  if (status === 'error') {
    return (
      <div role="alert" className={box}>
        <p className="text-base md:text-lg">{t('loadError')}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-full bg-slate-800 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700 active:scale-95"
        >
          {t('reload')}
        </button>
      </div>
    )
  }
  if (empty) {
    return (
      <div role="status" className={box}>
        <p className="text-base md:text-lg">{t('empty')}</p>
      </div>
    )
  }
  return null
}

export default OffersStatus
