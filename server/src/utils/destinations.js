// Destinations (pages /destinations/:slug) et leurs lieux à visiter (/destinations/:slug/:lieu) :
// lecture des lignes MySQL, validation des données envoyées par l'admin, enregistrement, données de départ.
// L'anglais est dans les champs ; les autres langues dans `translations`, avec la même forme
// (les listes alignées sur l'anglais : une ligne vide s'affiche en anglais).
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { clean, ValidationError } from './validate.js'
import { LANGUAGES } from './circuits.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const SEED_FILE = path.join(here, '..', '..', 'sql', 'destinations.seed.json')

// Champs d'une destination : textes { champ: [longueur max, obligatoire] }, listes { champ: [lignes max, longueur max] }
const DESTINATION = {
  texts: { name: [120, true], region: [60, true], tagline: [200, true], best: [80, false], stay: [80, false], getting: [800, false], tip: [800, false] },
  lists: { intro: [8, 1500] },
}
// « À faire » : une photo et deux textes
const TODO = { max: 12, texts: { title: [120, true], text: [400, true] } }
// Lieux à visiter : chacun a sa page ; prix, note et avis facultatifs
const PLACE = {
  max: 12,
  texts: { name: [120, true], text: [400, true], duration: [80, false], groupSize: [80, false], tourType: [80, false], language: [120, false] },
  lists: { overview: [8, 1500], details: [8, 1500], highlights: [12, 200], does: [10, 200], included: [15, 200], excluded: [15, 200] },
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
// Image servie par l'API (/uploads/...) ou adresse web complète
const IMAGE_RE = /^(\/uploads\/[\w\-/]+\.(?:png|jpe?g|webp)|https?:\/\/\S+)$/i

// « Here’s Where » -> here-s-where serait laid : les apostrophes disparaissent, les accents aussi
export const slugify = (text) =>
  String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

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

/* ------------------------------------------------------------------
   Lecture
------------------------------------------------------------------ */
const pick = (translated, english) => (translated ? translated : english)
const pickList = (translated, english) => english.map((line, i) => (Array.isArray(translated) && translated[i]) || line)
// Textes facultatifs vides et listes vides : absents, la page met alors son texte par défaut
const present = (value) => (Array.isArray(value) ? (value.length ? value : undefined) : value || undefined)

function localizeFields(schema, english, tr = {}) {
  const out = {}
  for (const key of Object.keys(schema.texts || {})) out[key] = present(pick(tr[key], english[key]))
  for (const key of Object.keys(schema.lists || {})) out[key] = present(pickList(tr[key], english[key] || []))
  return out
}

// `lang` absent ou 'en' : textes anglais. `region` reste l'anglais (sert à regrouper), `regionLabel` est affiché.
export function toDestination(row, lang = 'en') {
  const details = parseJson(row.details, {})
  const english = { ...details, name: row.name, region: row.region }
  const tr = (lang !== 'en' && parseJson(row.translations, {})[lang]) || {}
  const texts = localizeFields(DESTINATION, english, tr)
  return {
    slug: row.slug,
    ...texts,
    region: row.region,
    regionLabel: texts.region,
    image: row.image,
    todo: (details.todo || []).map((item, i) => ({ ...localizeFields(TODO, item, tr.todo?.[i]), image: item.image })),
    visit: (details.visit || []).map((place, i) => ({
      slug: place.slug,
      ...localizeFields(PLACE, place, tr.visit?.[i]),
      image: place.image,
      price: place.price ?? null,
      rating: place.rating ?? null,
      reviews: place.reviews ?? null,
    })),
  }
}

// Pour l'admin : tout en anglais, avec les réglages et les traductions telles qu'enregistrées
export function toDestinationForAdmin(row) {
  const details = parseJson(row.details, {})
  return {
    slug: row.slug,
    name: row.name,
    region: row.region,
    image: row.image,
    ...Object.fromEntries(Object.keys(DESTINATION.texts).filter((k) => !['name', 'region'].includes(k)).map((k) => [k, details[k] || ''])),
    intro: details.intro || [],
    todo: details.todo || [],
    visit: details.visit || [],
    sortOrder: row.sort_order,
    isPublished: Boolean(row.is_published),
    updatedAt: row.updated_at,
    translations: parseJson(row.translations, {}),
  }
}

/* ------------------------------------------------------------------
   Validation (POST / PUT admin). Le corps a la même forme que toDestinationForAdmin.
------------------------------------------------------------------ */
function image(value, field, errors) {
  const v = clean(value, 500)
  if (!v || !IMAGE_RE.test(v) || v.includes('..')) errors[field] = 'A photo is required (/uploads/... path or http(s) address).'
  return v
}

function optionalNumber(value, field, min, max, step, errors) {
  if (value === undefined || value === null || value === '') return null
  const n = Number(value)
  const rounded = Math.round(n / step) * step
  if (!Number.isFinite(n) || n < min || n > max || Math.abs(n - rounded) > 1e-9) {
    errors[field] = `Number between ${min} and ${max}${step < 1 ? `, by ${step}` : ', whole'}, or empty.`
    return null
  }
  return Number(rounded.toFixed(2))
}

// Textes et listes d'un niveau (destination, « à faire » ou lieu) ; `prefix` nomme le champ en erreur (visit.2.name)
function readFields(schema, src, prefix, errors) {
  const out = {}
  for (const [key, [max, required]] of Object.entries(schema.texts || {})) {
    out[key] = clean(src[key], max) || ''
    if (required && !out[key]) errors[`${prefix}${key}`] = 'This field is required.'
  }
  for (const [key, [maxLines, maxLength]] of Object.entries(schema.lists || {})) {
    const list = Array.isArray(src[key]) ? src[key].map((line) => clean(line, maxLength)).filter(Boolean) : []
    if (list.length > maxLines) errors[`${prefix}${key}`] = `At most ${maxLines} lines.`
    out[key] = list.slice(0, maxLines)
  }
  return out
}

// Traductions d'un niveau : tout est facultatif, les listes gardent la place des lignes vides
function readTranslation(schema, src) {
  const out = {}
  if (!src || typeof src !== 'object') return out
  for (const [key, [max]] of Object.entries(schema.texts || {})) {
    const v = clean(src[key], max)
    if (v) out[key] = v
  }
  for (const [key, [maxLines, maxLength]] of Object.entries(schema.lists || {})) {
    if (!Array.isArray(src[key])) continue
    const list = src[key].slice(0, maxLines).map((line) => clean(line, maxLength) || '')
    while (list.length && !list[list.length - 1]) list.pop()
    if (list.length) out[key] = list
  }
  return out
}

function items(value, max, field, errors) {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value)) {
    errors[field] = 'Must be a list.'
    return []
  }
  if (value.length > max) errors[field] = `At most ${max}.`
  return value.slice(0, max).map((item) => (item && typeof item === 'object' ? item : {}))
}

export function validateDestination(body) {
  const errors = {}
  const fields = readFields(DESTINATION, body, '', errors)
  if (!fields.intro.length) errors.intro = 'At least one paragraph.'

  const slug = clean(body.slug, 120) || slugify(fields.name)
  if (!SLUG_RE.test(slug)) errors.slug = 'Lowercase letters, numbers and dashes only (e.g. nosy-be).'

  const todo = items(body.todo, TODO.max, 'todo', errors).map((item, i) => ({
    ...readFields(TODO, item, `todo.${i}.`, errors),
    image: image(item.image, `todo.${i}.image`, errors),
  }))

  // L'adresse d'un lieu vient de son nom anglais ; deux lieux du même nom prennent -2, -3...
  const used = new Set()
  const visit = items(body.visit, PLACE.max, 'visit', errors).map((place, i) => {
    const data = readFields(PLACE, place, `visit.${i}.`, errors)
    let placeSlug = slugify(data.name) || `place-${i + 1}`
    for (let n = 2; used.has(placeSlug); n++) placeSlug = `${slugify(data.name)}-${n}`
    used.add(placeSlug)
    return {
      slug: placeSlug,
      ...data,
      image: image(place.image, `visit.${i}.image`, errors),
      price: optionalNumber(place.price, `visit.${i}.price`, 0, 100000, 1, errors),
      rating: optionalNumber(place.rating, `visit.${i}.rating`, 0, 5, 0.1, errors),
      reviews: optionalNumber(place.reviews, `visit.${i}.reviews`, 0, 1000000, 1, errors),
    }
  })

  const translations = {}
  const source = body.translations && typeof body.translations === 'object' ? body.translations : {}
  for (const lang of LANGUAGES) {
    const src = source[lang]
    if (!src || typeof src !== 'object') continue
    const out = readTranslation(DESTINATION, src)
    const trTodo = todo.map((_, i) => readTranslation(TODO, src.todo?.[i]))
    const trVisit = visit.map((_, i) => readTranslation(PLACE, src.visit?.[i]))
    if (trTodo.some((t) => Object.keys(t).length)) out.todo = trTodo
    if (trVisit.some((t) => Object.keys(t).length)) out.visit = trVisit
    if (Object.keys(out).length) translations[lang] = out
  }

  const order = body.sortOrder === undefined ? 0 : Number(body.sortOrder)
  if (!Number.isInteger(order) || order < -1000 || order > 1000) errors.sortOrder = 'Whole number between -1000 and 1000.'

  const data = {
    slug,
    name: fields.name,
    region: fields.region,
    image: image(body.image, 'image', errors),
    details: { ...fields, todo, visit },
    translations,
    sortOrder: order,
    isPublished: body.isPublished === undefined ? true : Boolean(body.isPublished),
  }
  delete data.details.name
  delete data.details.region

  if (Object.keys(errors).length) throw new ValidationError(errors)
  return data
}

/* ------------------------------------------------------------------
   Enregistrement
------------------------------------------------------------------ */
const json = (value) => JSON.stringify(value)

export async function saveDestination(db, data, existingId = null) {
  const values = [data.slug, data.name, data.region, data.image, json(data.details), json(data.translations), data.sortOrder, data.isPublished ? 1 : 0]
  if (existingId) {
    await db.execute(
      `UPDATE destinations SET slug = ?, name = ?, region = ?, image = ?, details = ?, translations = ?, sort_order = ?, is_published = ?
        WHERE id = ?`,
      [...values, existingId],
    )
    return existingId
  }
  const [result] = await db.execute(
    `INSERT INTO destinations (slug, name, region, image, details, translations, sort_order, is_published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    values,
  )
  return result.insertId
}

// Destinations de sql/destinations.seed.json, ajoutées seulement si la table est vide (première installation)
export async function seedDestinations(db) {
  const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM destinations')
  if (total > 0) return 0
  const seed = JSON.parse(await fs.readFile(SEED_FILE, 'utf8'))
  for (const [i, destination] of seed.entries()) {
    await saveDestination(db, validateDestination({ ...destination, sortOrder: i + 1 }))
  }
  return seed.length
}
