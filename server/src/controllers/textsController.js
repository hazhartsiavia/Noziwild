// Textes du site modifiés depuis l'admin (page « Textes ») :
//   le site garde ses fichiers de textes (client/src/i18n/locales/<langue>/<namespace>.json)
//   et pose par-dessus ce qui a été modifié ici. On n'enregistre que les textes modifiés.
import pool from '../config/db.js'
import { LANGUAGES } from '../utils/circuits.js'
import { ValidationError } from '../utils/validate.js'

const LANGS = ['en', ...LANGUAGES]
const NAMESPACE_RE = /^[a-zA-Z][\w-]{0,39}$/
const KEY_RE = /^[\w-]{1,60}$/
const STRING_MAX = 5000
const DEPTH_MAX = 8
// Sous la limite des requêtes JSON (200 Ko, server.js)
const SIZE_MAX = 180 * 1024

// MySQL renvoie le JSON déjà décodé, MariaDB (XAMPP) le renvoie en texte
const parse = (value) => (typeof value === 'string' ? JSON.parse(value) : value)

// Même forme qu'un fichier de textes : objets, listes et textes. Dans une liste, null garde la place
// d'un élément non modifié. Renvoie un message d'erreur, ou null si tout va bien.
function checkContent(value, depth = 0, inList = false) {
  if (depth > DEPTH_MAX) return 'Too deeply nested.'
  if (typeof value === 'string') return value.length > STRING_MAX ? `Texts are limited to ${STRING_MAX} characters.` : null
  if (value === null) return inList ? null : 'Empty values are only allowed in lists.'
  if (Array.isArray(value)) {
    for (const item of value) {
      const error = checkContent(item, depth + 1, true)
      if (error) return error
    }
    return null
  }
  if (typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (!KEY_RE.test(key)) return `Invalid key "${key.slice(0, 60)}".`
      const error = checkContent(item, depth + 1)
      if (error) return error
    }
    return null
  }
  return 'Only texts, lists and groups of texts are allowed.'
}

function checkParams(req, res) {
  const { namespace, lang } = req.params
  if (!NAMESPACE_RE.test(namespace)) {
    res.status(400).json({ ok: false, error: 'Unknown text file.' })
    return false
  }
  if (lang !== undefined && !LANGS.includes(lang)) {
    res.status(400).json({ ok: false, error: `Unknown language. Use one of: ${LANGS.join(', ')}.` })
    return false
  }
  return true
}

/* ------------------------------ Public ------------------------------ */

// GET /api/texts?lang=fr  → { texts: { home: {...}, footer: {...} } } : textes modifiés de cette langue
export async function listTexts(req, res) {
  const lang = LANGS.includes(req.query.lang) ? req.query.lang : 'en'
  const [rows] = await pool.execute('SELECT namespace, content FROM site_texts WHERE lang = ?', [lang])
  const texts = Object.fromEntries(rows.map((row) => [row.namespace, parse(row.content)]))
  // Pas de cache : une modification dans l'admin se voit à la visite suivante
  res.set('Cache-Control', 'no-cache')
  res.json({ ok: true, texts })
}

/* ------------------------------ Admin ------------------------------ */

// GET /api/admin/texts  → pour chaque fichier, les langues modifiées et leur date
export async function adminListTexts(req, res) {
  const [rows] = await pool.execute('SELECT namespace, lang, updated_at FROM site_texts ORDER BY namespace, lang')
  const files = {}
  for (const row of rows) (files[row.namespace] ||= {})[row.lang] = row.updated_at
  res.json({ ok: true, files })
}

// GET /api/admin/texts/:namespace  → { texts: { en: {...}, fr: {...} } } : textes modifiés, par langue
export async function adminGetTexts(req, res) {
  if (!checkParams(req, res)) return
  const [rows] = await pool.execute('SELECT lang, content FROM site_texts WHERE namespace = ?', [req.params.namespace])
  res.json({ ok: true, texts: Object.fromEntries(rows.map((row) => [row.lang, parse(row.content)])) })
}

// PUT /api/admin/texts/:namespace/:lang  { content }  → remplace les textes modifiés de cette langue
// Un contenu vide ({}) revient aux textes d'origine.
export async function adminSaveTexts(req, res) {
  if (!checkParams(req, res)) return
  const { namespace, lang } = req.params
  const { content } = req.body
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    throw new ValidationError({ content: 'Must be a group of texts.' })
  }
  const error = checkContent(content)
  if (error) throw new ValidationError({ content: error })
  const json = JSON.stringify(content)
  if (Buffer.byteLength(json) > SIZE_MAX) throw new ValidationError({ content: 'Too many texts in one file.' })

  if (!Object.keys(content).length) {
    await pool.execute('DELETE FROM site_texts WHERE namespace = ? AND lang = ?', [namespace, lang])
  } else {
    await pool.execute(
      'INSERT INTO site_texts (namespace, lang, content) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE content = VALUES(content)',
      [namespace, lang, json],
    )
  }
  res.json({ ok: true })
}

// DELETE /api/admin/texts/:namespace/:lang  → retour aux textes d'origine pour cette langue
export async function adminResetTexts(req, res) {
  if (!checkParams(req, res)) return
  await pool.execute('DELETE FROM site_texts WHERE namespace = ? AND lang = ?', [req.params.namespace, req.params.lang])
  res.json({ ok: true })
}
