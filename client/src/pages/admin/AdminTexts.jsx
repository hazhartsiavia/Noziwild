// /admin/texts : fichiers de textes du site, et les langues déjà modifiées dans chacun
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { adminFetchTextFiles } from '../../api'
import { NAMESPACES } from '../../i18n/LanguageContext'
import { TEXT_GROUPS, TEXT_LANGUAGES, textFile } from './textFiles'

function AdminTexts() {
  const [files, setFiles] = useState(null) // { home: { fr: date, ... } }
  const [error, setError] = useState('')

  useEffect(() => {
    adminFetchTextFiles()
      .then(({ files: list }) => setFiles(list))
      .catch((err) => setError(err.message))
  }, [])

  return (
    <section aria-labelledby="texts-title">
      <h2 id="texts-title" className="text-xl sm:text-2xl font-medium text-forest">Texts of the site</h2>
      <p className="mt-1 max-w-3xl text-sm text-slate-600">
        Every title, paragraph, button and question of the site, in the 5 languages. Pick a page, change what you need and save:
        the site shows your version instead of the original one. Lists of offers (stays, guides, tickets...) are edited in Offers.
      </p>

      {error && <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-5 py-3 text-sm text-red-800">{error}</p>}

      {TEXT_GROUPS.map((group) => {
        const names = NAMESPACES.filter((ns) => textFile(ns).group === group.id)
          .sort((a, b) => textFile(a).label.localeCompare(textFile(b).label))
        if (!names.length) return null
        return (
          <div key={group.id} className="mt-8">
            <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">{group.label}</h3>
            <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {names.map((ns) => {
                const changed = files?.[ns] || {}
                return (
                  <li key={ns}>
                    <Link to={`/admin/texts/${ns}`} className="group flex items-center justify-between gap-4 rounded-2xl bg-white p-4 sm:p-5 transition hover:ring-2 hover:ring-[#084838]">
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-slate-900">{textFile(ns).label}</span>
                        <span className="mt-1 block text-xs text-slate-500">
                          {Object.keys(changed).length
                            ? `Changed: ${TEXT_LANGUAGES.filter((l) => changed[l.code]).map((l) => l.code.toUpperCase()).join(', ')}`
                            : 'Original texts'}
                        </span>
                      </span>
                      <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </section>
  )
}

export default AdminTexts
