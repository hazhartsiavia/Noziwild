// Offres (activités, excursions, croisière, long séjour, idées sur mesure) :
// lecture publique, et gestion réservée aux administrateurs
import pool from '../config/db.js'
import { pickLanguage } from '../utils/circuits.js'
import { KINDS, isKind, toOffer, toOfferForAdmin, validateOffer, saveOffer } from '../utils/offers.js'

const unknownKind = (res) =>
  res.status(400).json({ ok: false, error: `Unknown kind. Use one of: ${Object.keys(KINDS).join(', ')}.` })
const notFound = (res) => res.status(404).json({ ok: false, error: 'This offer was not found.' })

async function findOfferRow(id) {
  const n = Number(id)
  if (!Number.isInteger(n) || n < 1) return null
  const [rows] = await pool.execute('SELECT * FROM offers WHERE id = ?', [n])
  return rows[0] || null
}

/* ------------------------------ Public ------------------------------ */

// GET /api/offers?kind=activity&lang=fr  → offres publiées d'un type, dans l'ordre du site
export async function listOffers(req, res) {
  if (!isKind(req.query.kind)) return unknownKind(res)
  const lang = pickLanguage(req.query.lang)
  const [rows] = await pool.execute(
    'SELECT * FROM offers WHERE kind = ? AND is_published = 1 ORDER BY sort_order, id',
    [req.query.kind],
  )
  res.json({ ok: true, offers: rows.map((row) => toOffer(row, lang)) })
}

/* ------------------------------ Admin ------------------------------ */

// GET /api/admin/offers?kind=activity  → toutes les offres d'un type, publiées ou non
export async function adminListOffers(req, res) {
  if (!isKind(req.query.kind)) return unknownKind(res)
  const [rows] = await pool.execute('SELECT * FROM offers WHERE kind = ? ORDER BY sort_order, id', [req.query.kind])
  res.json({ ok: true, offers: rows.map(toOfferForAdmin) })
}

// GET /api/admin/offers/:id
export async function adminGetOffer(req, res) {
  const row = await findOfferRow(req.params.id)
  if (!row) return notFound(res)
  res.json({ ok: true, offer: toOfferForAdmin(row) })
}

// POST /api/admin/offers  { kind, title, text, image, ... }
export async function createOffer(req, res) {
  if (!isKind(req.body.kind)) return unknownKind(res)
  const data = validateOffer(req.body, req.body.kind)
  const id = await saveOffer(pool, data)
  res.status(201).json({ ok: true, offer: toOfferForAdmin(await findOfferRow(id)) })
}

// PUT /api/admin/offers/:id  → remplace toute l'offre (son type ne change pas)
export async function updateOffer(req, res) {
  const existing = await findOfferRow(req.params.id)
  if (!existing) return notFound(res)
  const data = validateOffer(req.body, existing.kind)
  await saveOffer(pool, data, existing.id)
  res.json({ ok: true, offer: toOfferForAdmin(await findOfferRow(existing.id)) })
}

// PATCH /api/admin/offers/:id  { isPublished?, sortOrder? }  → réglages rapides depuis la liste
export async function patchOffer(req, res) {
  const changes = []
  const values = []
  if (req.body.isPublished !== undefined) {
    changes.push('is_published = ?')
    values.push(req.body.isPublished ? 1 : 0)
  }
  if (req.body.sortOrder !== undefined) {
    const order = Number(req.body.sortOrder)
    if (!Number.isInteger(order) || order < -1000 || order > 1000) {
      return res.status(400).json({ ok: false, error: 'Some fields are invalid.', fields: { sortOrder: 'Whole number between -1000 and 1000.' } })
    }
    changes.push('sort_order = ?')
    values.push(order)
  }
  if (!changes.length) return res.status(400).json({ ok: false, error: 'Nothing to change.' })

  const row = await findOfferRow(req.params.id)
  if (!row) return notFound(res)
  await pool.execute(`UPDATE offers SET ${changes.join(', ')} WHERE id = ?`, [...values, row.id])
  res.json({ ok: true })
}

// DELETE /api/admin/offers/:id  (les photos restent sur le disque)
export async function deleteOffer(req, res) {
  const row = await findOfferRow(req.params.id)
  if (!row) return notFound(res)
  await pool.execute('DELETE FROM offers WHERE id = ?', [row.id])
  res.json({ ok: true })
}
