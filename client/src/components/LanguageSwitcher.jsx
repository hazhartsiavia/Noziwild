// Choix de la langue du site : menu compact (barre du haut) ou rangée de boutons (menu mobile)
import React, { useEffect, useId, useRef, useState } from 'react'
import { LANGUAGES, useLanguage, useT } from '../i18n/LanguageContext'

// Drapeaux en SVG : les emojis drapeaux ne s'affichent pas sous Windows
function UnionJack() {
  const id = useId()
  return (
    <>
      <clipPath id={id}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id})`} stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </>
  )
}

const FLAGS = {
  en: { viewBox: '0 0 60 30', body: <UnionJack /> },
  fr: {
    viewBox: '0 0 3 2',
    body: (
      <>
        <rect width="1" height="2" fill="#0055A4" />
        <rect x="1" width="1" height="2" fill="#fff" />
        <rect x="2" width="1" height="2" fill="#EF4135" />
      </>
    ),
  },
  de: {
    viewBox: '0 0 5 3',
    body: (
      <>
        <rect width="5" height="1" fill="#000" />
        <rect y="1" width="5" height="1" fill="#DD0000" />
        <rect y="2" width="5" height="1" fill="#FFCE00" />
      </>
    ),
  },
  it: {
    viewBox: '0 0 3 2',
    body: (
      <>
        <rect width="1" height="2" fill="#009246" />
        <rect x="1" width="1" height="2" fill="#fff" />
        <rect x="2" width="1" height="2" fill="#CE2B37" />
      </>
    ),
  },
  es: {
    viewBox: '0 0 6 4',
    body: (
      <>
        <rect width="6" height="4" fill="#AA151B" />
        <rect y="1" width="6" height="2" fill="#F1BF00" />
      </>
    ),
  },
}

function Flag({ code }) {
  const flag = FLAGS[code]
  return (
    <svg
      className="block h-[15px] w-[22px] shrink-0 rounded-[3px] ring-1 ring-black/10"
      viewBox={flag.viewBox}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {flag.body}
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
          aria-label={l.label}
          aria-pressed={lang === l.code}
          onClick={() => {
            setLang(l.code)
            onChange?.()
          }}
          className={`rounded-md p-1.5 transition ${
            lang === l.code ? 'bg-zinc-100 ring-1 ring-[#0c3e2e]' : 'hover:bg-zinc-100'
          }`}
        >
          <Flag code={l.code} />
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
        <Flag code={current.code} />
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
                className={`flex w-full items-center gap-3 px-4 py-2 text-left text-[14px] transition hover:bg-zinc-50 ${
                  lang === l.code ? 'font-medium text-zinc-900' : 'text-zinc-600'
                }`}
              >
                <Flag code={l.code} />
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
