// Demandes de devis de la page « Mon voyage » : plusieurs offres du site envoyées en une seule demande.
// Les "?" dans les requêtes SQL protègent contre les injections SQL.
import pool from '../config/db.js'
import { clean, check, ValidationError } from '../utils/validate.js'
import { pickLanguage } from '../utils/circuits.js'
import { sendMail } from '../utils/mailer.js'

// Types d'éléments acceptés (voir quote_items dans sql/schema.sql)
const KINDS = ['circuit', 'activity', 'excursion', 'cruise', 'longstay', 'place', 'stay', 'food', 'gear', 'ticket', 'photo', 'guide', 'transport', 'plan']
// Ces offres sont en base : leur prix est relu ici plutôt que pris tel quel du navigateur
const OFFER_KINDS = ['activity', 'excursion', 'cruise', 'longstay']
const UNITS = ['person', 'night', 'unit', 'fixed']
const STATUSES = ['new', 'quoted', 'accepted', 'declined']
const MAX_ITEMS = 30

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const toDate = (value) => (typeof value === 'string' && DATE_RE.test(value) && !Number.isNaN(Date.parse(value)) ? value : null)
const toInt = (value, min, max) => {
  const n = Number.parseInt(value, 10)
  return Number.isInteger(n) ? Math.min(Math.max(n, min), max) : null
}

function readItems(list) {
  if (!Array.isArray(list) || list.length === 0) {
    throw new ValidationError({ items: 'Add at least one offer to your trip.' })
  }
  if (list.length > MAX_ITEMS) {
    throw new ValidationError({ items: `A request can hold up to ${MAX_ITEMS} offers.` })
  }
  return list.map((raw, i) => {
    const kind = clean(raw?.kind, 20)
    const title = clean(raw?.title, 190)
    if (!KINDS.includes(kind) || !title) throw new ValidationError({ items: `Offer ${i + 1} is not valid.` })
    const unit = UNITS.includes(raw.unit) ? raw.unit : null
    return {
      kind,
      ref: clean(raw.ref, 120),
      title,
      details: clean(raw.details, 500),
      date: toDate(raw.date),
      quantity: unit === 'fixed' ? 1 : toInt(raw.qty, 1, 99) || 1,
      unit,
      price: unit ? toInt(raw.price, 0, 1_000_000) : null,
      note: clean(raw.note, 500),
    }
  })
}

// Prix à jour des circuits et des offres en base ; une offre introuvable (retirée du site) passe sur devis
async function refreshPrices(items) {
  const slugs = items.filter((i) => i.kind === 'circuit' && i.ref).map((i) => i.ref)
  const ids = items.filter((i) => OFFER_KINDS.includes(i.kind) && /^\d+$/.test(i.ref || '')).map((i) => Number(i.ref))
  const circuits = new Map()
  const offers = new Map()
  if (slugs.length) {
    const [rows] = await pool.query('SELECT slug, price FROM circuits WHERE slug IN (?)', [slugs])
    rows.forEach((row) => circuits.set(row.slug, row.price))
  }
  if (ids.length) {
    const [rows] = await pool.query('SELECT id, kind, price FROM offers WHERE id IN (?)', [ids])
    rows.forEach((row) => offers.set(`${row.kind}:${row.id}`, row.price))
  }
  for (const item of items) {
    if (item.kind !== 'circuit' && !OFFER_KINDS.includes(item.kind)) continue
    const key = item.kind === 'circuit' ? item.ref : `${item.kind}:${item.ref}`
    const known = item.kind === 'circuit' ? circuits : offers
    const price = known.get(key) ?? null
    item.price = price
    // Circuits et offres en base ont tous un prix par personne
    item.unit = price === null ? null : 'person'
  }
}

const lineTotal = (item) => (item.unit && item.price !== null ? item.price * item.quantity : 0)

// Résumé texte de la demande, pour l'email envoyé à l'équipe
function summary(quote, items) {
  const lines = items.map((item, i) => {
    const price = item.unit && item.price !== null
      ? ` — ${item.unit === 'fixed' ? `€${item.price}` : `€${item.price} × ${item.quantity}`}`
      : ` — price on request${item.quantity > 1 ? ` (${item.quantity} people)` : ''}`
    const extra = [item.details, item.date && `date: ${item.date}`, item.note && `note: ${item.note}`].filter(Boolean)
    return `${i + 1}. [${item.kind}] ${item.title}${price}${extra.length ? `\n   ${extra.join('\n   ')}` : ''}`
  })
  return [
    `New quote request #${quote.id} from ${quote.name} <${quote.email}>${quote.phone ? `, ${quote.phone}` : ''}`,
    `Dates: ${quote.arrival || '?'} → ${quote.departure || '?'} · Travellers: ${quote.travellers ?? '?'} · Budget: ${quote.budget || '?'} · Language: ${quote.lang}`,
    '',
    ...lines,
    '',
    `Estimated total: ${quote.estimate !== null ? `€${quote.estimate}` : 'unknown'}`,
    quote.message ? `\nMessage:\n${quote.message}` : '',
  ].join('\n')
}

// POST /api/quotes  (page Mon voyage)
export async function createQuote(req, res) {
  const quote = {
    name: clean(req.body.name, 120),
    email: clean(req.body.email, 190),
    phone: clean(req.body.phone, 40),
    arrival: toDate(req.body.arrival),
    departure: toDate(req.body.departure),
    travellers: toInt(req.body.travellers, 1, 99),
    budget: clean(req.body.budget, 60),
    message: clean(req.body.message, 5000),
    lang: pickLanguage(req.body.lang),
  }
  check({ required: { name: quote.name, email: quote.email }, email: quote.email })
  if (quote.arrival && quote.departure && quote.departure < quote.arrival) {
    throw new ValidationError({ departure: 'The departure date must be after the arrival date.' })
  }

  const items = readItems(req.body.items)
  await refreshPrices(items)
  const priced = items.filter((item) => item.unit && item.price !== null)
  quote.estimate = priced.length ? priced.reduce((sum, item) => sum + lineTotal(item), 0) : null

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [result] = await connection.execute(
      `INSERT INTO quote_requests
         (user_id, name, email, phone, arrival_date, departure_date, travellers, budget, message, lang, estimate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user?.id ?? null, quote.name, quote.email, quote.phone, quote.arrival, quote.departure,
        quote.travellers, quote.budget, quote.message, quote.lang, quote.estimate],
    )
    quote.id = result.insertId
    for (const [position, item] of items.entries()) {
      await connection.execute(
        `INSERT INTO quote_items (quote_id, position, kind, ref, title, details, item_date, quantity, unit, unit_price, note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [quote.id, position, item.kind, item.ref, item.title, item.details, item.date, item.quantity, item.unit, item.price, item.note],
      )
    }
    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }

  // Prévient l'équipe si QUOTES_EMAIL est rempli dans .env ; un échec d'envoi ne bloque pas la demande
  if (process.env.QUOTES_EMAIL) {
    sendMail({
      to: process.env.QUOTES_EMAIL,
      subject: `Quote request #${quote.id} · ${quote.name} · ${items.length} offer${items.length > 1 ? 's' : ''}`,
      text: summary(quote, items),
    }).catch((error) => console.error('Email de devis non envoyé :', error.message))
  }

  res.status(201).json({ ok: true, id: quote.id, estimate: quote.estimate })
}

/* ------------------------------ Admin ------------------------------ */

const toItem = (row) => ({
  kind: row.kind,
  ref: row.ref,
  title: row.title,
  details: row.details,
  date: row.item_date,
  quantity: row.quantity,
  unit: row.unit,
  price: row.unit_price,
  note: row.note,
})

// GET /api/admin/quotes?page=1&limit=20  → demandes de devis, avec leurs éléments
export async function adminListQuotes(req, res) {
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100)
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1)
  const offset = (page - 1) * limit

  // LIMIT/OFFSET sont des entiers validés ci-dessus, donc sûrs à insérer.
  // Dates renvoyées en texte (AAAA-MM-JJ) : un objet Date se décalerait selon le fuseau du serveur.
  const [rows] = await pool.query(
    `SELECT id, user_id, name, email, phone, DATE_FORMAT(arrival_date, '%Y-%m-%d') AS arrival_date,
            DATE_FORMAT(departure_date, '%Y-%m-%d') AS departure_date, travellers, budget, message, lang,
            estimate, status, created_at
       FROM quote_requests ORDER BY created_at DESC, id DESC LIMIT ${limit} OFFSET ${offset}`,
  )
  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM quote_requests')

  const items = new Map(rows.map((row) => [row.id, []]))
  if (rows.length) {
    const [itemRows] = await pool.query(
      `SELECT quote_id, kind, ref, title, details, DATE_FORMAT(item_date, '%Y-%m-%d') AS item_date, quantity, unit, unit_price, note
         FROM quote_items WHERE quote_id IN (?) ORDER BY quote_id, position`,
      [rows.map((row) => row.id)],
    )
    itemRows.forEach((row) => items.get(row.quote_id).push(toItem(row)))
  }

  res.json({ ok: true, page, limit, total, data: rows.map((row) => ({ ...row, items: items.get(row.id) })) })
}

// PATCH /api/admin/quotes/:id  { status }
export async function adminPatchQuote(req, res) {
  const { status } = req.body
  if (!STATUSES.includes(status)) {
    throw new ValidationError({ status: `Allowed values: ${STATUSES.join(', ')}.` })
  }
  const [result] = await pool.execute('UPDATE quote_requests SET status = ? WHERE id = ?', [status, req.params.id])
  if (!result.affectedRows) return res.status(404).json({ ok: false, error: 'This quote request was not found.' })
  res.json({ ok: true, status })
}
