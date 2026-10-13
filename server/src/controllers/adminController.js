// Lecture des données reçues (protégé par requireAdmin)
import pool from '../config/db.js'

// Seules ces tables peuvent être lues : on ne met jamais un nom de table
// venant de l'utilisateur directement dans une requête SQL.
// Pour "users", on choisit les colonnes à la main pour ne jamais renvoyer les mots de passe.
const TABLES = {
  contacts: { table: 'contact_messages', columns: '*' },
  'tailor-made': { table: 'tailor_made_requests', columns: '*' },
  requests: { table: 'quick_requests', columns: '*' },
  newsletter: { table: 'newsletter_subscribers', columns: '*' },
  users: {
    table: 'users',
    columns: 'id, name, email, role, avatar_url, google_id IS NOT NULL AS has_google, password_hash IS NOT NULL AS has_password, email_verified_at, created_at, last_login_at',
  },
}

// GET /api/admin/:resource?page=1&limit=20
export async function listResource(req, res) {
  const resource = TABLES[req.params.resource]
  if (!resource) {
    return res.status(404).json({ ok: false, error: 'Unknown resource.', available: Object.keys(TABLES) })
  }
  const { table, columns } = resource

  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100)
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1)
  const offset = (page - 1) * limit

  // LIMIT/OFFSET sont des entiers validés ci-dessus, donc sûrs à insérer
  const [rows] = await pool.query(
    `SELECT ${columns} FROM ${table} ORDER BY created_at DESC, id DESC LIMIT ${limit} OFFSET ${offset}`,
  )
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM ${table}`)

  res.json({ ok: true, page, limit, total, data: rows })
}
