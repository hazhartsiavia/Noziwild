// Destinations et lieux à visiter : lecture publique, et gestion réservée aux administrateurs
import pool from '../config/db.js'
import { pickLanguage } from '../utils/circuits.js'
import { toDestination, toDestinationForAdmin, validateDestination, saveDestination } from '../utils/destinations.js'

const notFound = (res) => res.status(404).json({ ok: false, error: 'This destination was not found.' })
const slugTaken = (res) =>
  res.status(409).json({ ok: false, error: 'Another destination already uses this address.', fields: { slug: 'Already used.' } })

async function findRow(slug) {
  const [rows] = await pool.execute('SELECT * FROM destinations WHERE slug = ?', [String(slug)])
  return rows[0] || null
}

/* ------------------------------ Public ------------------------------ */

// GET /api/destinations?lang=fr  → destinations publiées, dans l'ordre du site, avec leurs lieux
export async function listDestinations(req, res) {
  const lang = pickLanguage(req.query.lang)
  const [rows] = await pool.execute('SELECT * FROM destinations WHERE is_published = 1 ORDER BY sort_order, id')
  res.json({ ok: true, destinations: rows.map((row) => toDestination(row, lang)) })
}

/* ------------------------------ Admin ------------------------------ */

// GET /api/admin/destinations  → toutes, publiées ou non
export async function adminListDestinations(req, res) {
  const [rows] = await pool.execute('SELECT * FROM destinations ORDER BY sort_order, id')
  res.json({ ok: true, destinations: rows.map(toDestinationForAdmin) })
}

// GET /api/admin/destinations/:slug
export async function adminGetDestination(req, res) {
  const row = await findRow(req.params.slug)
  if (!row) return notFound(res)
  res.json({ ok: true, destination: toDestinationForAdmin(row) })
}

// POST /api/admin/destinations
export async function createDestination(req, res) {
  const data = validateDestination(req.body)
  if (await findRow(data.slug)) return slugTaken(res)
  try {
    await saveDestination(pool, data)
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return slugTaken(res)
    throw error
  }
  res.status(201).json({ ok: true, destination: toDestinationForAdmin(await findRow(data.slug)) })
}

// PUT /api/admin/destinations/:slug  → remplace toute la destination (l'adresse peut changer)
export async function updateDestination(req, res) {
  const existing = await findRow(req.params.slug)
  if (!existing) return notFound(res)
  const data = validateDestination(req.body)
  if (data.slug !== existing.slug && (await findRow(data.slug))) return slugTaken(res)
  try {
    await saveDestination(pool, data, existing.id)
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return slugTaken(res)
    throw error
  }
  res.json({ ok: true, destination: toDestinationForAdmin(await findRow(data.slug)) })
}

// PATCH /api/admin/destinations/:slug  { isPublished?, sortOrder? }  → réglages rapides depuis la liste
export async function patchDestination(req, res) {
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
  const [result] = await pool.execute(`UPDATE destinations SET ${changes.join(', ')} WHERE slug = ?`, [...values, req.params.slug])
  if (!result.affectedRows) return notFound(res)
  res.json({ ok: true })
}

// DELETE /api/admin/destinations/:slug  (les photos restent sur le disque)
export async function deleteDestination(req, res) {
  const [result] = await pool.execute('DELETE FROM destinations WHERE slug = ?', [req.params.slug])
  if (!result.affectedRows) return notFound(res)
  res.json({ ok: true })
}
