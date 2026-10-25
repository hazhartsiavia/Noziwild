// Articles du blog (/blog et /blog/:slug) : lecture des lignes MySQL, validation des données envoyées
// par l'admin, enregistrement, articles de départ.
// Le corps est une liste de blocs : intertitre, paragraphe, liste (mot-clé en gras + texte), photo,
// bandeau d'offre (photo, titre, sous-titre, prix, lien). L'anglais est dans les champs ; les autres
// langues dans `translations`, avec la même forme (blocs alignés sur l'anglais).
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { clean, ValidationError } from './validate.js'
import { LANGUAGES } from './circuits.js'
import { slugify } from './destinations.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const SEED_FILE = path.join(here, '..', '..', 'sql', 'blog.seed.json')

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const IMAGE_RE = /^(\/uploads\/[\w\-/]+\.(?:png|jpe?g|webp)|https?:\/\/\S+)$/i
// Page du site (/circuits/...) ou adresse web complète
const LINK_RE = /^(\/[^\s]*|https?:\/\/\S+)$/i
const BLOCKS_MAX = 60
const LIST_MAX = 12

// Textes traduisibles de chaque type de bloc { champ: [longueur max, obligatoire] }
export const BLOCK_TYPES = {
  heading: { text: [160, true] },
  paragraph: { text: [4000, true] },
  list: {},
  image: { caption: [200, false] },
  cta: { title: [80, true], subtitle: [120, false], priceLabel: [60, false], button: [40, false] },
}
const LIST_ITEM = { lead: [80, false], text: [600, true] }

// MySQL renvoie le JSON déjà décodé, MariaDB (XAMPP) le renvoie en texte
function parseJson(value, fallback) {
  if (value === null || value === undefined) return fallback
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

// Date MySQL (objet Date à minuit, heure du serveur, ou texte) -> AAAA-MM-JJ, sans décalage de fuseau
const pad = (n) => String(n).padStart(2, '0')
const toDay = (value) =>
  value instanceof Date ? `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}` : String(value).slice(0, 10)

// Temps de lecture : 200 mots par minute, 1 minute au moins
function readingMinutes(post) {
  const words = [post.title, post.excerpt, ...post.body.flatMap((b) => [b.text, b.caption, b.title, b.subtitle, ...(b.items || []).flatMap((i) => [i.lead, i.text])])]
    .filter(Boolean)
    .join(' ')
    .split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

/* ------------------------------------------------------------------
   Lecture
------------------------------------------------------------------ */
const pick = (translated, english) => translated || english

function localizeBlock(block, tr = {}) {
  const out = { ...block }
  for (const key of Object.keys(BLOCK_TYPES[block.type] || {})) out[key] = pick(tr[key], block[key])
  if (block.type === 'list') out.items = block.items.map((item, i) => ({ lead: pick(tr.items?.[i]?.lead, item.lead), text: pick(tr.items?.[i]?.text, item.text) }))
  return out
}

// Carte de la liste : sans le corps
export function toPostCard(row, lang = 'en') {
  const tr = (lang !== 'en' && parseJson(row.translations, {})[lang]) || {}
  return {
    slug: row.slug,
    title: pick(tr.title, row.title),
    excerpt: pick(tr.excerpt, row.excerpt),
    image: row.image,
    date: toDay(row.published_on),
    minutes: row.minutes,
    isFeatured: Boolean(row.is_featured),
  }
}

export function toPost(row, lang = 'en') {
  const tr = (lang !== 'en' && parseJson(row.translations, {})[lang]) || {}
  const body = parseJson(row.body, [])
  return { ...toPostCard(row, lang), body: body.map((block, i) => localizeBlock(block, tr.body?.[i])) }
}

export function toPostForAdmin(row) {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    image: row.image,
    date: toDay(row.published_on),
    minutes: row.minutes,
    body: parseJson(row.body, []),
    isFeatured: Boolean(row.is_featured),
    isPublished: Boolean(row.is_published),
    updatedAt: row.updated_at,
    translations: parseJson(row.translations, {}),
  }
}

/* ------------------------------------------------------------------
   Validation (POST / PUT admin). Le corps a la même forme que toPostForAdmin.
------------------------------------------------------------------ */
function readTexts(schema, src, prefix, errors, required = true) {
  const out = {}
  for (const [key, [max, isRequired]] of Object.entries(schema)) {
    const v = clean(src?.[key], max)
    if (v) out[key] = v
    else if (required && isRequired) errors[`${prefix}${key}`] = 'This field is required.'
  }
  return out
}

function readBlock(src, i, errors) {
  const prefix = `body.${i}.`
  const type = src?.type
  if (!Object.hasOwn(BLOCK_TYPES, type)) {
    errors[`${prefix}type`] = `One of: ${Object.keys(BLOCK_TYPES).join(', ')}.`
    return { type: 'paragraph', text: '' }
  }
  const block = { type, ...readTexts(BLOCK_TYPES[type], src, prefix, errors) }
  if (type === 'list') {
    const items = Array.isArray(src.items) ? src.items.slice(0, LIST_MAX) : []
    block.items = items.map((item, n) => readTexts(LIST_ITEM, item, `${prefix}items.${n}.`, errors))
    if (!block.items.length) errors[`${prefix}items`] = 'At least one line.'
  }
  if (type === 'image' || type === 'cta') {
    const image = clean(src.image, 500)
    if (!image || !IMAGE_RE.test(image) || image.includes('..')) errors[`${prefix}image`] = 'A photo is required.'
    block.image = image || ''
  }
  if (type === 'cta') {
    const link = clean(src.link, 300)
    if (!link || !LINK_RE.test(link) || link.includes('..')) errors[`${prefix}link`] = 'A page of the site (/circuits/...) or an http(s) address.'
    block.link = link || ''
  }
  return block
}

// Traduction d'un bloc : textes seulement, tous facultatifs
function readBlockTranslation(block, src) {
  if (!src || typeof src !== 'object') return {}
  const out = readTexts(BLOCK_TYPES[block.type], src, '', {}, false)
  if (block.type === 'list' && Array.isArray(src.items)) {
    const items = block.items.map((_, n) => readTexts(LIST_ITEM, src.items[n], '', {}, false))
    if (items.some((item) => Object.keys(item).length)) out.items = items
  }
  return out
}

export function validatePost(body) {
  const errors = {}
  const title = clean(body.title, 190)
  if (!title) errors.title = 'This field is required.'
  const excerpt = clean(body.excerpt, 400) || ''

  const slug = clean(body.slug, 160) || slugify(title)
  if (!SLUG_RE.test(slug)) errors.slug = 'Lowercase letters, numbers and dashes only (e.g. sailing-in-ramena).'

  const image = clean(body.image, 500)
  if (!image || !IMAGE_RE.test(image) || image.includes('..')) errors.image = 'A cover photo is required.'

  const date = clean(body.date, 10)
  if (!date || !DATE_RE.test(date) || Number.isNaN(Date.parse(date))) errors.date = 'A date (YYYY-MM-DD).'

  const blocks = Array.isArray(body.body) ? body.body : []
  if (blocks.length > BLOCKS_MAX) errors.body = `At most ${BLOCKS_MAX} blocks.`
  const content = blocks.slice(0, BLOCKS_MAX).map((block, i) => readBlock(block, i, errors))
  if (!content.length) errors.body = 'Add at least one block of text.'

  const translations = {}
  const source = body.translations && typeof body.translations === 'object' ? body.translations : {}
  for (const lang of LANGUAGES) {
    const src = source[lang]
    if (!src || typeof src !== 'object') continue
    const out = readTexts({ title: [190, false], excerpt: [400, false] }, src, '', {}, false)
    const trBody = content.map((block, i) => readBlockTranslation(block, src.body?.[i]))
    if (trBody.some((b) => Object.keys(b).length)) out.body = trBody
    if (Object.keys(out).length) translations[lang] = out
  }

  if (Object.keys(errors).length) throw new ValidationError(errors)
  const post = {
    slug,
    title,
    excerpt,
    image,
    date,
    body: content,
    translations,
    isFeatured: Boolean(body.isFeatured),
    isPublished: body.isPublished === undefined ? true : Boolean(body.isPublished),
  }
  post.minutes = readingMinutes(post)
  return post
}

/* ------------------------------------------------------------------
   Enregistrement
------------------------------------------------------------------ */
const json = (value) => JSON.stringify(value)

export async function savePost(db, data, existingId = null) {
  const values = [
    data.slug, data.title, data.excerpt, data.image, data.date, data.minutes, json(data.body), json(data.translations),
    data.isFeatured ? 1 : 0, data.isPublished ? 1 : 0,
  ]
  if (existingId) {
    await db.execute(
      `UPDATE blog_posts SET slug = ?, title = ?, excerpt = ?, image = ?, published_on = ?, minutes = ?, body = ?, translations = ?,
        is_featured = ?, is_published = ? WHERE id = ?`,
      [...values, existingId],
    )
    return existingId
  }
  const [result] = await db.execute(
    `INSERT INTO blog_posts (slug, title, excerpt, image, published_on, minutes, body, translations, is_featured, is_published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    values,
  )
  return result.insertId
}

// Articles de sql/blog.seed.json, ajoutés seulement si la table est vide (première installation)
export async function seedPosts(db) {
  const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM blog_posts')
  if (total > 0) return 0
  const seed = JSON.parse(await fs.readFile(SEED_FILE, 'utf8'))
  for (const post of seed) await savePost(db, validatePost(post))
  return seed.length
}
