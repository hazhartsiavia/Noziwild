// Circuits : lecture publique, et gestion réservée aux administrateurs
import pool from '../config/db.js'
import {
  CARD_COLUMNS, toCircuitCard, toCircuit, toCircuitForAdmin, validateCircuit, saveCircuit, pickLanguage,
} from '../utils/circuits.js'

async function findCircuitRow(slug, { publishedOnly }) {
  const [rows] = await pool.execute(
    `SELECT * FROM circuits WHERE slug = ?${publishedOnly ? ' AND is_published = 1' : ''}`,
    [slug],
  )
  return rows[0] || null
}

async function loadDays(circuitId) {
  const [rows] = await pool.execute('SELECT * FROM circuit_days WHERE circuit_id = ? ORDER BY position', [circuitId])
  return rows
}

// Une connexion dédiée : la transaction de saveCircuit porte sur toutes ses requêtes
async function withConnection(task) {
  const connection = await pool.getConnection()
  try {
    return await task(connection)
  } finally {
    connection.release()
  }
}

function slugTaken(res) {
  return res.status(409).json({ ok: false, error: 'Another circuit already uses this slug.', fields: { slug: 'Already used.' } })
}

/* ------------------------------ Public ------------------------------ */

// GET /api/circuits?lang=fr  → cartes de la page /circuits (textes dans la langue demandée, sinon anglais)
export async function listCircuits(req, res) {
  const lang = pickLanguage(req.query.lang)
  const [rows] = await pool.query(
    `SELECT ${CARD_COLUMNS} FROM circuits WHERE is_published = 1 ORDER BY sort_order, id`,
  )
  res.json({ ok: true, circuits: rows.map((row) => toCircuitCard(row, lang)) })
}

// GET /api/circuits/:slug?lang=fr  → détail complet + 3 autres circuits (même région d'abord)
export async function getCircuit(req, res) {
  const lang = pickLanguage(req.query.lang)
  const row = await findCircuitRow(req.params.slug, { publishedOnly: true })
  if (!row) return res.status(404).json({ ok: false, error: 'This circuit was not found.' })

  const [related] = await pool.execute(
    `SELECT ${CARD_COLUMNS} FROM circuits
      WHERE is_published = 1 AND id <> ?
      ORDER BY region = ? DESC, sort_order, id
      LIMIT 3`,
    [row.id, row.region],
  )

  res.json({
    ok: true,
    circuit: toCircuit(row, await loadDays(row.id), lang),
    related: related.map((r) => toCircuitCard(r, lang)),
  })
}

/* ------------------------------ Admin ------------------------------ */

// GET /api/admin/circuits  → tous les circuits, publiés ou non
export async function adminListCircuits(req, res) {
  const [rows] = await pool.query(
    `SELECT ${CARD_COLUMNS}, sort_order, is_published, updated_at FROM circuits ORDER BY sort_order, id`,
  )
  res.json({
    ok: true,
    circuits: rows.map((row) => ({
      ...toCircuitCard(row),
      sortOrder: row.sort_order,
      isPublished: Boolean(row.is_published),
      updatedAt: row.updated_at,
    })),
  })
}

// GET /api/admin/circuits/:slug  → détail, même s'il n'est pas publié (pour le modifier)
export async function adminGetCircuit(req, res) {
  const row = await findCircuitRow(req.params.slug, { publishedOnly: false })
  if (!row) return res.status(404).json({ ok: false, error: 'This circuit was not found.' })
  res.json({ ok: true, circuit: toCircuitForAdmin(row, await loadDays(row.id)) })
}

// POST /api/admin/circuits  { ...circuit, itinerary: [...] }
export async function createCircuit(req, res) {
  const data = validateCircuit(req.body)
  if (await findCircuitRow(data.slug, { publishedOnly: false })) return slugTaken(res)

  let id
  try {
    id = await withConnection((db) => saveCircuit(db, data))
  } catch (error) {
    // Deux enregistrements en même temps avec le même slug : la contrainte UNIQUE tranche
    if (error.code === 'ER_DUP_ENTRY') return slugTaken(res)
    throw error
  }
  const [[row]] = await pool.execute('SELECT * FROM circuits WHERE id = ?', [id])
  res.status(201).json({ ok: true, circuit: toCircuitForAdmin(row, await loadDays(id)) })
}

// PUT /api/admin/circuits/:slug  → remplace tout le circuit (le slug peut changer)
export async function updateCircuit(req, res) {
  const existing = await findCircuitRow(req.params.slug, { publishedOnly: false })
  if (!existing) return res.status(404).json({ ok: false, error: 'This circuit was not found.' })

  const data = validateCircuit(req.body)
  if (data.slug !== existing.slug && (await findCircuitRow(data.slug, { publishedOnly: false }))) return slugTaken(res)

  try {
    await withConnection((db) => saveCircuit(db, data, existing.id))
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return slugTaken(res)
    throw error
  }
  const [[row]] = await pool.execute('SELECT * FROM circuits WHERE id = ?', [existing.id])
  res.json({ ok: true, circuit: toCircuitForAdmin(row, await loadDays(existing.id)) })
}

// DELETE /api/admin/circuits/:slug  → supprime le circuit et ses jours (les photos restent sur le disque)
export async function deleteCircuit(req, res) {
  const [result] = await pool.execute('DELETE FROM circuits WHERE slug = ?', [req.params.slug])
  if (!result.affectedRows) return res.status(404).json({ ok: false, error: 'This circuit was not found.' })
  res.json({ ok: true })
}

// PATCH /api/admin/circuits/:slug  { isPublished?, sortOrder? }  → réglages rapides depuis la liste
export async function patchCircuit(req, res) {
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

  const [result] = await pool.execute(`UPDATE circuits SET ${changes.join(', ')} WHERE slug = ?`, [...values, req.params.slug])
  if (!result.affectedRows) return res.status(404).json({ ok: false, error: 'This circuit was not found.' })
  res.json({ ok: true })
}
