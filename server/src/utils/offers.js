// Offres et catalogues des pages du site (activités, excursions, hébergements, transports, guides...) :
// lecture des lignes MySQL, validation des données envoyées par l'admin, enregistrement
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { clean, ValidationError } from './validate.js'
import { LANGUAGES } from './circuits.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const SEED_FILE = path.join(here, '..', '..', 'sql', 'offers.seed.json')

// Champs propres à chaque type d'offre, rangés dans la colonne `details` (en anglais).
//   price   : prix en euros par personne (entier)
//   texts   : textes courts, traduisibles { champ: longueur max }
//   lists   : listes de textes, traduites ligne par ligne { champ: [lignes max, longueur max] }
//   choices : une valeur parmi une liste fixe, jamais traduite ici (sert aux filtres des pages)
//   multi   : plusieurs valeurs parmi une liste fixe
//   months  : 12 valeurs 0 (possible), 1 (bon), 2 (idéal) : tableau « meilleure période »
//   hours   : durée totale en heures (par demi-heure)
//   link    : page ouverte par la carte (facultatif)
//   numbers : nombres { champ: [min, max, pas] } (note sur 5, années d'expérience)
//   textOptional / imageOptional : la description ou la photo peut rester vide
export const KINDS = {
  activity: {
    price: true,
    texts: { type: 40, duration: 60, level: 40, group: 60 },
    months: true,
  },
  excursion: {
    price: true,
    texts: { place: 80, duration: 60, group: 60, level: 40 },
    choices: { region: ['North', 'Highlands', 'West', 'East'], length: ['half', 'day', 'multi'] },
    link: true,
  },
  cruise: {
    price: true,
    choices: { port: ['nosybe', 'diego'], tag: ['Sea', 'Nature', 'Culture'] },
    hours: true,
  },
  longstay: {
    texts: { tab: 40, priceLabel: 60 },
    lists: { points: [10, 200] },
  },
  idea: {
    choices: { travellers: ['Solo', 'Couple', 'Family', 'Friends'] },
    multi: {
      interests: ['Islands & beaches', 'Wildlife', 'Culture & villages', 'Hiking & adventure', 'Sailing & sea', 'Slow & relaxing'],
    },
  },
  // Hébergement : prix par nuit
  stay: {
    price: true,
    textOptional: true,
    texts: { place: 120 },
    numbers: { rating: [0, 5, 0.1] },
    choices: { category: ['hotel', 'lodge', 'bungalow', 'guesthouse'] },
    lists: { amenities: [8, 60] },
  },
  transport: {
    texts: { capacity: 60, duration: 60 },
    choices: { category: ['land', 'air', 'sea'] },
    lists: { perks: [6, 80] },
  },
  // Équipe de guides : le titre est le nom, le texte la présentation
  guide: {
    texts: { role: 60, langs: 120 },
    numbers: { years: [0, 80, 1] },
    lists: { specialties: [6, 40] },
  },
  // Expériences culinaires : prix par personne
  food: {
    price: true,
    texts: { duration: 60 },
    choices: { category: ['tour', 'class', 'meal'] },
  },
  // Séances photo : pas de photo, prix par séance
  session: {
    price: true,
    imageOptional: true,
    texts: { duration: 60, photos: 60, delivery: 40 },
  },
  // Galerie de la page Photographie : le titre est la légende
  photo: {
    textOptional: true,
    choices: { category: ['landscape', 'people', 'sea', 'wildlife'], ratio: ['landscape', 'portrait', 'tall', 'square'] },
  },
  // Location de matériel : prix par jour
  gear: {
    price: true,
    choices: { category: ['water', 'trek', 'ride', 'optics'] },
    lists: { specs: [6, 60] },
  },
  ticket: {
    price: true,
    textOptional: true,
    texts: { place: 120 },
    choices: { category: ['parks', 'sea', 'sites', 'events'] },
    lists: { perks: [6, 80] },
  },
}
export const isKind = (value) => Object.hasOwn(KINDS, value)

const TITLE_MAX = 190
const TEXT_MAX = 1000

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

// Texte traduit s'il existe, sinon l'anglais ; listes traduites ligne par ligne
const pick = (translated, english) => (translated === undefined || translated === null || translated === '' ? english : translated)
const pickList = (translated, english) =>
  Array.isArray(translated) ? english.map((item, i) => translated[i] || item) : english

// `lang` absent ou 'en' : textes anglais. Les valeurs de `choices` restent en anglais.
export function toOffer(row, lang = 'en') {
  const kind = KINDS[row.kind]
  const details = parseJson(row.details, {})
  const tr = (lang !== 'en' && parseJson(row.translations, {})[lang]) || {}
  const offer = {
    id: row.id,
    kind: row.kind,
    title: pick(tr.title, row.title),
    text: pick(tr.text, row.text),
    image: row.image,
  }
  if (kind.price) offer.price = row.price
  for (const key of Object.keys(kind.texts || {})) offer[key] = pick(tr[key], details[key] ?? '')
  for (const key of Object.keys(kind.lists || {})) offer[key] = pickList(tr[key], details[key] || [])
  for (const key of Object.keys(kind.choices || {})) offer[key] = details[key]
  for (const key of Object.keys(kind.multi || {})) offer[key] = details[key] || []
  for (const key of Object.keys(kind.numbers || {})) offer[key] = details[key] ?? null
  if (kind.months) offer.months = details.months || Array(12).fill(0)
  if (kind.hours) offer.hours = details.hours
  if (kind.link) offer.link = details.link || ''
  return offer
}

// Pour l'admin : textes anglais, réglages et toutes les traductions telles qu'enregistrées
export function toOfferForAdmin(row) {
  return {
    ...toOffer(row),
    sortOrder: row.sort_order,
    isPublished: Boolean(row.is_published),
    updatedAt: row.updated_at,
    translations: parseJson(row.translations, {}),
  }
}

/* ------------------------------------------------------------------
   Validation (POST / PUT admin). Le corps a la même forme que toOfferForAdmin.
------------------------------------------------------------------ */
// Image servie par l'API (/uploads/...) ou adresse web complète
const IMAGE_RE = /^(\/uploads\/[\w\-/]+\.(?:png|jpe?g|webp)|https?:\/\/\S+)$/i
// Page du site (/contact, /destinations/...) ou adresse web complète
const LINK_RE = /^(\/[^\s]*|https?:\/\/\S+)$/i

function integer(value, field, min, max, errors) {
  const n = Number(value)
  if (!Number.isInteger(n) || n < min || n > max) errors[field] = `Whole number between ${min} and ${max}.`
  return n
}

// `kindName` : type de l'offre (celui de la ligne existante pour une modification, il ne change pas)
export function validateOffer(body, kindName) {
  const kind = KINDS[kindName]
  const errors = {}
  const required = (key, max, source = body) => {
    const v = clean(source[key], max)
    if (!v) errors[key] = 'This field is required.'
    return v
  }

  const data = {
    kind: kindName,
    title: required('title', TITLE_MAX),
    text: kind.textOptional ? clean(body.text, TEXT_MAX) || '' : required('text', TEXT_MAX),
    image: clean(body.image, 500) || '',
    price: kind.price ? integer(body.price, 'price', 0, 1_000_000, errors) : null,
    sortOrder: body.sortOrder === undefined ? 0 : integer(body.sortOrder, 'sortOrder', -1000, 1000, errors),
    isPublished: body.isPublished === undefined ? true : Boolean(body.isPublished),
    details: {},
  }
  if (data.image ? !IMAGE_RE.test(data.image) || data.image.includes('..') : !kind.imageOptional) {
    errors.image = 'A photo is required (/uploads/... path or http(s) address).'
  }

  const details = data.details
  for (const [key, max] of Object.entries(kind.texts || {})) details[key] = required(key, max)

  for (const [key, [max, maxLength]] of Object.entries(kind.lists || {})) {
    const list = Array.isArray(body[key]) ? body[key].map((item) => clean(item, maxLength)).filter(Boolean) : []
    if (!list.length) errors[key] = 'At least one line.'
    if (list.length > max) errors[key] = `At most ${max} lines.`
    details[key] = list.slice(0, max)
  }

  for (const [key, options] of Object.entries(kind.choices || {})) {
    if (!options.includes(body[key])) errors[key] = `One of: ${options.join(', ')}.`
    details[key] = body[key]
  }

  for (const [key, [min, max, step]] of Object.entries(kind.numbers || {})) {
    const n = Number(body[key])
    // Arrondi au pas (0.1 pour une note) pour éviter les 4.800000001
    const rounded = Math.round(n / step) * step
    if (body[key] === '' || body[key] === null || !Number.isFinite(n) || n < min || n > max || Math.abs(n - rounded) > 1e-9) {
      errors[key] = `Number between ${min} and ${max}${step < 1 ? `, by ${step}` : ', whole'}.`
    }
    details[key] = Number(rounded.toFixed(2))
  }

  for (const [key, options] of Object.entries(kind.multi || {})) {
    const list = Array.isArray(body[key]) ? [...new Set(body[key])] : []
    if (!list.length || list.some((v) => !options.includes(v))) errors[key] = `Pick at least one of: ${options.join(', ')}.`
    details[key] = list
  }

  if (kind.months) {
    const months = body.months
    if (!Array.isArray(months) || months.length !== 12 || months.some((v) => ![0, 1, 2].includes(v))) {
      errors.months = '12 values, each 0 (possible), 1 (good) or 2 (ideal).'
    }
    details.months = months
  }

  if (kind.hours) {
    const hours = Number(body.hours)
    if (!Number.isFinite(hours) || hours < 0.5 || hours > 24 || !Number.isInteger(hours * 2)) {
      errors.hours = 'Between 0.5 and 24 hours, by half hours.'
    }
    details.hours = hours
  }

  if (kind.link) {
    const link = clean(body.link, 300) || ''
    if (link && (!LINK_RE.test(link) || link.includes('..'))) errors.link = 'A page of the site (/contact...) or an http(s) address.'
    details.link = link
  }

  data.translations = validateTranslations(body.translations, kind, errors)

  if (Object.keys(errors).length) throw new ValidationError(errors)
  return data
}

// { fr: { title, text, duration, ..., points: [...] }, de: {...} }
// Tout est facultatif : un champ vide ou absent s'affiche en anglais. On ne garde que ce qui est rempli.
function validateTranslations(value, kind, errors) {
  if (value === undefined || value === null) return {}
  if (typeof value !== 'object' || Array.isArray(value)) {
    errors.translations = 'Must be an object (one entry per language).'
    return {}
  }
  const texts = { title: TITLE_MAX, text: TEXT_MAX, ...kind.texts }
  const result = {}
  for (const lang of LANGUAGES) {
    const src = value[lang]
    if (!src || typeof src !== 'object') continue
    const out = {}
    for (const [field, max] of Object.entries(texts)) {
      const v = clean(src[field], max)
      if (v) out[field] = v
    }
    // Listes alignées sur l'anglais : les lignes vides gardent leur place
    for (const [field, [max, maxLength]] of Object.entries(kind.lists || {})) {
      if (!Array.isArray(src[field])) continue
      const list = src[field].slice(0, max).map((item) => clean(item, maxLength) || '')
      while (list.length && !list[list.length - 1]) list.pop()
      if (list.length) out[field] = list
    }
    if (Object.keys(out).length) result[lang] = out
  }
  return result
}

/* ------------------------------------------------------------------
   Enregistrement
------------------------------------------------------------------ */
const json = (value) => JSON.stringify(value)

export async function saveOffer(db, data, existingId = null) {
  const values = [
    data.title, data.text, data.image, data.price, json(data.details), json(data.translations || {}),
    data.sortOrder, data.isPublished ? 1 : 0,
  ]
  if (existingId) {
    await db.execute(
      `UPDATE offers SET title = ?, text = ?, image = ?, price = ?, details = ?, translations = ?, sort_order = ?, is_published = ?
        WHERE id = ?`,
      [...values, existingId],
    )
    return existingId
  }
  const [result] = await db.execute(
    `INSERT INTO offers (kind, title, text, image, price, details, translations, sort_order, is_published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.kind, ...values],
  )
  return result.insertId
}

// Ajoute les offres de sql/offers.seed.json pour chaque type qui n'en a encore aucune
// (première installation, ou type ajouté depuis). Un type déjà rempli depuis l'admin n'est pas touché.
export async function seedOffers(db) {
  const seed = JSON.parse(await fs.readFile(SEED_FILE, 'utf8'))
  const [counts] = await db.query('SELECT kind, COUNT(*) AS total FROM offers GROUP BY kind')
  const filled = new Set(counts.filter((c) => c.total > 0).map((c) => c.kind))

  let added = 0
  const positions = {}
  for (const offer of seed) {
    if (filled.has(offer.kind)) continue
    positions[offer.kind] = (positions[offer.kind] || 0) + 1
    await saveOffer(db, validateOffer({ ...offer, sortOrder: positions[offer.kind] }, offer.kind))
    added += 1
  }
  return added
}
