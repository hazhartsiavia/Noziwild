// Choix de la langue du site : menu compact (barre du haut) ou rangée de boutons (menu mobile)
import React, { useEffect, useRef, useState } from 'react'
import { LANGUAGES, useLanguage, useT } from '../i18n/LanguageContext'

function Globe() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

export function LanguageRow({ onChange }) {
  const { lang, setLang } = useLanguage()
  const t = useT('nav')
  return (
    <div className="flex flex-wrap items-center gap-1 px-4 py-2" role="group" aria-label={t('language')}>
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.code}
          title={l.label}
          aria-pressed={lang === l.code}
          onClick={() => {
            setLang(l.code)
            onChange?.()
          }}
          className={`rounded-full px-3 py-1 text-[13px] font-medium transition ${
            lang === l.code ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          {l.short}
        </button>
      ))}
    </div>
  )
}

export default function LanguageSwitcher({ className = '' }) {
  const { lang, setLang } = useLanguage()
  const t = useT('nav')
  const [open, setOpen] = useState(false)
  const root = useRef(null)
  const current = LANGUAGES.find((l) => l.code === lang)

  // Ferme le menu en cliquant ailleurs ou avec Échap
  useEffect(() => {
    if (!open) return
    const onClick = (e) => !root.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={root} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t('language')} (${current.label})`}
        className="flex items-center gap-1.5 rounded-full px-2 py-1.5 text-[14px] font-medium text-zinc-700 transition hover:text-zinc-900"
      >
        <Globe />
        {current.short}
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={t('language')}
          className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg"
        >
          {LANGUAGES.map((l) => (
            <li key={l.code} role="option" aria-selected={lang === l.code}>
              <button
                type="button"
                lang={l.code}
                onClick={() => {
                  setLang(l.code)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between px-4 py-2 text-left text-[14px] transition hover:bg-zinc-50 ${
                  lang === l.code ? 'font-medium text-zinc-900' : 'text-zinc-600'
                }`}
              >
                {l.label}
                <span className="text-xs text-zinc-400">{l.short}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
