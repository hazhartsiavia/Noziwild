// Circuits : lecture des lignes MySQL, validation des données envoyées par l'admin, enregistrement
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { clean, ValidationError } from './validate.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const SEED_FILE = path.join(here, '..', '..', 'sql', 'circuits.seed.json')
// Traductions des circuits de départ : sql/circuits.translations/<langue>.json → { slug: { title, ... } }
const SEED_TRANSLATIONS = path.join(here, '..', '..', 'sql', 'circuits.translations')

// Colonnes de la liste (cartes de /circuits)
export const CARD_COLUMNS = 'slug, title, region, days, level, price, stops, summary, cover_image, translations'

// Langues traduites (l'anglais est la langue des colonnes)
export const LANGUAGES = ['fr', 'de', 'it', 'es']
export const pickLanguage = (value) => (LANGUAGES.includes(value) ? value : 'en')

// Champs traduisibles et leur longueur maximale (les mêmes qu'en anglais)
const TEXT_FIELDS = {
  title: 190, region: 60, level: 40, stops: 255, summary: 500, start: 190, end: 190,
  groupSize: 80, tourType: 80, bestTime: 120, tip: 2000,
}
const LIST_FIELDS = { overview: [10, 2000], highlights: [20, 300], included: [30, 300], excluded: [30, 300] }
const DAY_FIELDS = { day: 40, title: 190, text: 3000, stay: 120, meals: 120 }

// MySQL renvoie le JSON déjà décodé, MariaDB (XAMPP) le renvoie en texte
function parseJson(value, fallback = []) {
  if (value === null || value === undefined) return fallback
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

// Texte traduit s'il existe, sinon l'anglais
const pick = (translated, english) => (translated === undefined || translated === null || translated === '' ? english : translated)
// Listes : traduites ligne par ligne, une ligne vide ou manquante reste en anglais
const pickList = (translated, english) =>
  Array.isArray(translated) ? english.map((item, i) => translated[i] || item) : english

// `lang` absent ou 'en' : textes anglais. `region` reste l'anglais (sert au filtre), `regionLabel` est traduit.
export function toCircuitCard(row, lang = 'en') {
  const tr = (lang !== 'en' && parseJson(row.translations, {})[lang]) || {}
  return {
    slug: row.slug,
    title: pick(tr.title, row.title),
    region: row.region,
    regionLabel: pick(tr.region, row.region),
    days: row.days,
    level: pick(tr.level, row.level),
    price: row.price,
    stops: pick(tr.stops, row.stops),
    summary: pick(tr.summary, row.summary),
    image: row.cover_image,
  }
}

export function toCircuit(row, dayRows = [], lang = 'en') {
  const tr = (lang !== 'en' && parseJson(row.translations, {})[lang]) || {}
  const days = Array.isArray(tr.itinerary) ? tr.itinerary : []
  return {
    ...toCircuitCard(row, lang),
    groupSize: pick(tr.groupSize, row.group_size),
    tourType: pick(tr.tourType, row.tour_type),
    start: pick(tr.start, row.start_location),
    end: pick(tr.end, row.end_location),
    bestTime: pick(tr.bestTime, row.best_time),
    tip: pick(tr.tip, row.tip),
    gallery: parseJson(row.gallery),
    overview: pickList(tr.overview, parseJson(row.overview)),
    highlights: pickList(tr.highlights, parseJson(row.highlights)),
    included: pickList(tr.included, parseJson(row.included)),
    excluded: pickList(tr.excluded, parseJson(row.excluded)),
    sortOrder: row.sort_order,
    isPublished: Boolean(row.is_published),
    itinerary: dayRows.map((d, i) => {
      const t = days[i] || {}
      return {
        day: pick(t.day, d.day_label),
        title: pick(t.title, d.title),
        text: pick(t.text, d.text),
        stay: pick(t.stay, d.stay),
        meals: pick(t.meals, d.meals),
        images: parseJson(d.images),
      }
    }),
  }
}

// Pour l'éditeur admin : textes anglais + toutes les traductions telles qu'enregistrées
export function toCircuitForAdmin(row, dayRows = []) {
  return { ...toCircuit(row, dayRows), translations: parseJson(row.translations, {}) }
}

/* ------------------------------------------------------------------
   Validation (POST / PUT admin). Le corps a la même forme que GET /api/circuits/:slug.
------------------------------------------------------------------ */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
// Image servie par l'API (/uploads/...) ou adresse web complète
const IMAGE_RE = /^(\/uploads\/[\w\-/]+\.(?:png|jpe?g|webp)|https?:\/\/\S+)$/i

function textList(value, field, { min = 0, max, maxLength }, errors) {
  if (!Array.isArray(value)) {
    errors[field] = 'Must be a list.'
    return []
  }
  const list = value.map((item) => clean(item, maxLength)).filter(Boolean)
  if (list.length < min) errors[field] = `At least ${min} item(s).`
  if (list.length > max) errors[field] = `At most ${max} items.`
  return list.slice(0, max)
}

function imageList(value, field, { min = 0, max }, errors) {
  const list = textList(value, field, { min, max, maxLength: 500 }, errors)
  if (list.some((src) => !IMAGE_RE.test(src) || src.includes('..'))) {
    errors[field] = 'Images must be /uploads/... paths (png, jpg, webp) or http(s) addresses.'
  }
  return list
}

function integer(value, field, min, max, errors) {
  const n = Number(value)
  if (!Number.isInteger(n) || n < min || n > max) errors[field] = `Whole number between ${min} and ${max}.`
  return n
}

export function validateCircuit(body) {
  const errors = {}
  const required = (key, max) => {
    const v = clean(body[key], max)
    if (!v) errors[key] = 'This field is required.'
    return v
  }

  const data = {
    slug: required('slug', 120),
    title: required('title', 190),
    region: required('region', 60),
    level: required('level', 40),
    stops: required('stops', 255),
    summary: required('summary', 500),
    start: required('start', 190),
    end: required('end', 190),
    groupSize: clean(body.groupSize, 80),
    tourType: clean(body.tourType, 80),
    bestTime: clean(body.bestTime, 120),
    tip: clean(body.tip, 2000),
    days: integer(body.days, 'days', 1, 60, errors),
    price: integer(body.price, 'price', 0, 1_000_000, errors),
    sortOrder: body.sortOrder === undefined ? 0 : integer(body.sortOrder, 'sortOrder', -1000, 1000, errors),
    isPublished: body.isPublished === undefined ? true : Boolean(body.isPublished),
    image: clean(body.image, 500),
    gallery: imageList(body.gallery, 'gallery', { min: 1, max: 6 }, errors),
    overview: textList(body.overview, 'overview', { min: 1, max: 10, maxLength: 2000 }, errors),
    highlights: textList(body.highlights, 'highlights', { max: 20, maxLength: 300 }, errors),
    included: textList(body.included, 'included', { max: 30, maxLength: 300 }, errors),
    excluded: textList(body.excluded, 'excluded', { max: 30, maxLength: 300 }, errors),
  }

  if (data.slug && !SLUG_RE.test(data.slug)) errors.slug = 'Lowercase letters, numbers and dashes only (e.g. "nosy-be-islands").'
  if (!data.image || !IMAGE_RE.test(data.image) || data.image.includes('..')) errors.image = 'A cover image is required (/uploads/... path or http(s) address).'

  if (!Array.isArray(body.itinerary) || body.itinerary.length === 0 || body.itinerary.length > 60) {
    errors.itinerary = 'Between 1 and 60 days.'
    data.itinerary = []
  } else {
    data.itinerary = body.itinerary.map((day, i) => {
      const prefix = `itinerary[${i}]`
      const d = day && typeof day === 'object' ? day : {}
      const item = {
        day: clean(d.day, 40),
        title: clean(d.title, 190),
        text: clean(d.text, 3000),
        stay: clean(d.stay, 120),
        meals: clean(d.meals, 120),
        images: imageList(d.images ?? [], `${prefix}.images`, { max: 6 }, errors),
      }
      for (const key of ['day', 'title', 'text']) {
        if (!item[key]) errors[`${prefix}.${key}`] = 'This field is required.'
      }
      return item
    })
  }

  data.translations = validateTranslations(body.translations, data.itinerary.length, errors)

  if (Object.keys(errors).length) throw new ValidationError(errors)
  return data
}

// { fr: { title, ..., overview: [...], itinerary: [{ title, text, ... }] }, de: {...} }
// Tout est facultatif : un champ vide ou absent s'affiche en anglais. On ne garde que ce qui est rempli.
function validateTranslations(value, dayCount, errors) {
  if (value === undefined || value === null) return {}
  if (typeof value !== 'object' || Array.isArray(value)) {
    errors.translations = 'Must be an object (one entry per language).'
    return {}
  }
  const result = {}
  for (const lang of LANGUAGES) {
    const src = value[lang]
    if (!src || typeof src !== 'object') continue
    const out = {}
    for (const [field, max] of Object.entries(TEXT_FIELDS)) {
      const v = clean(src[field], max)
      if (v) out[field] = v
    }
    // Listes alignées sur l'anglais : les lignes vides gardent leur place
    for (const [field, [max, maxLength]] of Object.entries(LIST_FIELDS)) {
      if (!Array.isArray(src[field])) continue
      const list = src[field].slice(0, max).map((item) => clean(item, maxLength) || '')
      while (list.length && !list[list.length - 1]) list.pop()
      if (list.length) out[field] = list
    }
    if (Array.isArray(src.itinerary)) {
      const days = src.itinerary.slice(0, dayCount).map((day) => {
        const d = day && typeof day === 'object' ? day : {}
        const item = {}
        for (const [field, max] of Object.entries(DAY_FIELDS)) {
          const v = clean(d[field], max)
          if (v) item[field] = v
        }
        return item
      })
      if (days.some((d) => Object.keys(d).length)) out.itinerary = days
    }
    if (Object.keys(out).length) result[lang] = out
  }
  return result
}

/* ------------------------------------------------------------------
   Enregistrement : le circuit et ses jours, dans une transaction
------------------------------------------------------------------ */
const json = (value) => JSON.stringify(value)

// `db` : une connexion mysql2 (pas le pool) pour que la transaction porte sur toutes les requêtes
export async function saveCircuit(db, data, existingId = null) {
  const values = [
    data.slug, data.title, data.region, data.days, data.level, data.price, data.stops, data.summary,
    data.groupSize, data.tourType, data.start, data.end, data.bestTime, data.tip, data.image,
    json(data.gallery), json(data.overview), json(data.highlights), json(data.included), json(data.excluded),
    json(data.translations || {}), data.sortOrder, data.isPublished ? 1 : 0,
  ]

  await db.beginTransaction()
  try {
    let id = existingId
    if (id) {
      await db.execute(
        `UPDATE circuits SET slug = ?, title = ?, region = ?, days = ?, level = ?, price = ?, stops = ?, summary = ?,
           group_size = ?, tour_type = ?, start_location = ?, end_location = ?, best_time = ?, tip = ?, cover_image = ?,
           gallery = ?, overview = ?, highlights = ?, included = ?, excluded = ?, translations = ?, sort_order = ?, is_published = ?
         WHERE id = ?`,
        [...values, id],
      )
      await db.execute('DELETE FROM circuit_days WHERE circuit_id = ?', [id])
    } else {
      const [result] = await db.execute(
        `INSERT INTO circuits (slug, title, region, days, level, price, stops, summary, group_size, tour_type,
           start_location, end_location, best_time, tip, cover_image, gallery, overview, highlights, included, excluded,
           translations, sort_order, is_published)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        values,
      )
      id = result.insertId
    }

    for (const [position, day] of data.itinerary.entries()) {
      await db.execute(
        `INSERT INTO circuit_days (circuit_id, position, day_label, title, text, stay, meals, images)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, position, day.day, day.title, day.text, day.stay, day.meals, json(day.images)],
      )
    }

    await db.commit()
    return id
  } catch (error) {
    await db.rollback()
    throw error
  }
}

// Remplit la table avec les circuits de sql/circuits.seed.json si elle est vide.
// Sinon, ajoute les traductions du fichier aux circuits de départ qui n'en ont encore aucune
// (bases créées avant les traductions) ; un circuit déjà traduit depuis l'admin n'est pas touché.
async function loadSeed() {
  const seed = JSON.parse(await fs.readFile(SEED_FILE, 'utf8'))
  for (const lang of LANGUAGES) {
    const file = path.join(SEED_TRANSLATIONS, `${lang}.json`)
    const bySlug = JSON.parse(await fs.readFile(file, 'utf8').catch(() => '{}'))
    for (const circuit of seed) {
      if (bySlug[circuit.slug]) circuit.translations = { ...circuit.translations, [lang]: bySlug[circuit.slug] }
    }
  }
  return seed
}

export async function seedCircuits(db) {
  const seed = await loadSeed()
  const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM circuits')
  if (total === 0) {
    for (const circuit of seed) {
      await saveCircuit(db, validateCircuit(circuit))
    }
    return { added: seed.length, translated: 0 }
  }

  let translated = 0
  for (const circuit of seed) {
    if (!circuit.translations) continue
    const { translations } = validateCircuit(circuit)
    const [result] = await db.execute(
      `UPDATE circuits SET translations = ?
        WHERE slug = ? AND (translations IS NULL OR JSON_LENGTH(translations) = 0)`,
      [json(translations), circuit.slug],
    )
    translated += result.affectedRows
  }
  return { added: 0, translated }
}
