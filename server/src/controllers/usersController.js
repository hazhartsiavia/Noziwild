// Gestion des comptes depuis l'admin (onglet « Users ») : liste, fiche, création, rôle, suspension,
// lien de mot de passe, déconnexion partout, suppression.
// Garde-fous : on ne change ni son propre rôle ni son propre état, et il reste toujours un administrateur actif.
import pool from '../config/db.js'
import { clean, check, ValidationError } from '../utils/validate.js'
import { requestsOf } from '../utils/users.js'
import { sendPasswordLink } from '../utils/passwordLinks.js'

const ROLES = ['user', 'admin']

const COLUMNS = `u.id, u.name, u.email, u.role, u.avatar_url, u.google_id IS NOT NULL AS has_google,
  u.password_hash IS NOT NULL AS has_password, u.email_verified_at, u.disabled_at, u.created_at, u.last_login_at,
  (SELECT COUNT(*) FROM quote_requests q WHERE q.user_id = u.id)
    + (SELECT COUNT(*) FROM contact_messages c WHERE c.user_id = u.id)
    + (SELECT COUNT(*) FROM tailor_made_requests t WHERE t.user_id = u.id)
    + (SELECT COUNT(*) FROM quick_requests r WHERE r.user_id = u.id) AS requests`

const toAccount = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  avatarUrl: row.avatar_url,
  hasGoogle: Boolean(row.has_google),
  hasPassword: Boolean(row.has_password),
  emailVerified: Boolean(row.email_verified_at),
  disabled: Boolean(row.disabled_at),
  disabledAt: row.disabled_at,
  createdAt: row.created_at,
  lastLoginAt: row.last_login_at,
  requests: Number(row.requests),
})

const notFound = (res) => res.status(404).json({ ok: false, error: 'This account was not found.' })
const refuse = (res, error) => res.status(400).json({ ok: false, error })

async function findAccount(id) {
  const n = Number(id)
  if (!Number.isInteger(n) || n < 1) return null
  const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM users u WHERE u.id = ?`, [n])
  return rows[0] ? toAccount(rows[0]) : null
}

// Administrateurs actifs autres que ce compte
async function otherActiveAdmins(id) {
  const [[{ total }]] = await pool.execute(
    "SELECT COUNT(*) AS total FROM users WHERE role = 'admin' AND disabled_at IS NULL AND id <> ?",
    [id],
  )
  return total
}

// Le compte connecté (absent avec l'en-tête ADMIN_TOKEN)
const isSelf = (req, account) => req.user?.id === account.id

// GET /api/admin/accounts?search=&role=all|admin|user&status=all|active|suspended&page=1&limit=25
export async function listAccounts(req, res) {
  const where = []
  const values = []
  const search = clean(req.query.search, 100)
  if (search) {
    // % et _ tapés dans la recherche sont cherchés tels quels
    const like = `%${search.replace(/[\\%_]/g, (c) => `\\${c}`)}%`
    where.push('(u.name LIKE ? OR u.email LIKE ?)')
    values.push(like, like)
  }
  if (ROLES.includes(req.query.role)) {
    where.push('u.role = ?')
    values.push(req.query.role)
  }
  if (req.query.status === 'active') where.push('u.disabled_at IS NULL')
  if (req.query.status === 'suspended') where.push('u.disabled_at IS NOT NULL')

  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 25, 1), 100)
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1)
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''

  // LIMIT/OFFSET sont des entiers validés ci-dessus, donc sûrs à insérer
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM users u ${clause} ORDER BY u.created_at DESC, u.id DESC LIMIT ${limit} OFFSET ${(page - 1) * limit}`,
    values,
  )
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM users u ${clause}`, values)
  const [[counts]] = await pool.query(
    "SELECT COUNT(*) AS everyone, SUM(role = 'admin') AS admins, SUM(disabled_at IS NOT NULL) AS suspended FROM users",
  )
  res.json({
    ok: true,
    page,
    limit,
    total,
    counts: { everyone: Number(counts.everyone), admins: Number(counts.admins || 0), suspended: Number(counts.suspended || 0) },
    accounts: rows.map(toAccount),
  })
}

// GET /api/admin/accounts/:id  → le compte et ses demandes
export async function getAccount(req, res) {
  const account = await findAccount(req.params.id)
  if (!account) return notFound(res)
  res.json({ ok: true, account, requests: await requestsOf(account.id), isSelf: isSelf(req, account) })
}

// POST /api/admin/accounts  { name, email, role }  → crée le compte et envoie un lien pour choisir le mot de passe
export async function createAccount(req, res) {
  const name = clean(req.body.name, 120)
  const email = clean(req.body.email, 190)?.toLowerCase()
  const role = req.body.role === undefined ? 'user' : req.body.role
  check({ required: { name, email }, email })
  if (!ROLES.includes(role)) throw new ValidationError({ role: 'user or admin.' })

  const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email])
  if (existing.length) {
    return res.status(409).json({ ok: false, error: 'An account already exists with this email.', fields: { email: 'Already registered.' } })
  }
  let insertId
  try {
    ;[{ insertId }] = await pool.execute('INSERT INTO users (name, email, role) VALUES (?, ?, ?)', [name, email, role])
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ ok: false, error: 'An account already exists with this email.', fields: { email: 'Already registered.' } })
    }
    throw error
  }
  await sendPasswordLink({ id: insertId, name, email }, 'invite')
  res.status(201).json({ ok: true, account: await findAccount(insertId) })
}

// PATCH /api/admin/accounts/:id  { name?, role?, disabled? }
export async function updateAccount(req, res) {
  const account = await findAccount(req.params.id)
  if (!account) return notFound(res)
  const changes = []
  const values = []

  if (req.body.name !== undefined) {
    const name = clean(req.body.name, 120)
    if (!name) throw new ValidationError({ name: 'This field is required.' })
    changes.push('name = ?')
    values.push(name)
  }

  const losesAdmin =
    account.role === 'admin' && !account.disabled &&
    ((req.body.role !== undefined && req.body.role !== 'admin') || req.body.disabled === true)

  if (req.body.role !== undefined) {
    if (!ROLES.includes(req.body.role)) throw new ValidationError({ role: 'user or admin.' })
    if (isSelf(req, account) && req.body.role !== account.role) return refuse(res, 'You cannot change your own role.')
    changes.push('role = ?')
    values.push(req.body.role)
  }

  if (req.body.disabled !== undefined) {
    if (isSelf(req, account)) return refuse(res, 'You cannot suspend your own account.')
    // Suspendre ferme aussi toutes les sessions ouvertes
    changes.push(req.body.disabled ? 'disabled_at = COALESCE(disabled_at, CURRENT_TIMESTAMP), session_version = session_version + 1' : 'disabled_at = NULL')
  }

  if (!changes.length) return refuse(res, 'Nothing to change.')
  if (losesAdmin && (await otherActiveAdmins(account.id)) === 0) {
    return refuse(res, 'This is the last active administrator: make another account admin first.')
  }

  await pool.execute(`UPDATE users SET ${changes.join(', ')} WHERE id = ?`, [...values, account.id])
  res.json({ ok: true, account: await findAccount(account.id) })
}

// POST /api/admin/accounts/:id/password-link  → envoie un lien pour choisir un nouveau mot de passe
export async function sendAccountPasswordLink(req, res) {
  const account = await findAccount(req.params.id)
  if (!account) return notFound(res)
  if (account.disabled) return refuse(res, 'Reactivate the account first: a suspended account cannot sign in.')
  await sendPasswordLink(account, 'reset')
  res.json({ ok: true })
}

// POST /api/admin/accounts/:id/sign-out  → ferme toutes les sessions de ce compte
export async function signOutAccount(req, res) {
  const account = await findAccount(req.params.id)
  if (!account) return notFound(res)
  await pool.execute('UPDATE users SET session_version = session_version + 1 WHERE id = ?', [account.id])
  res.json({ ok: true })
}

// DELETE /api/admin/accounts/:id  → supprime le compte ; ses demandes restent (user_id passe à NULL)
export async function deleteAccountByAdmin(req, res) {
  const account = await findAccount(req.params.id)
  if (!account) return notFound(res)
  if (isSelf(req, account)) return refuse(res, 'You cannot delete your own account from here.')
  if (account.role === 'admin' && !account.disabled && (await otherActiveAdmins(account.id)) === 0) {
    return refuse(res, 'This is the last active administrator: make another account admin first.')
  }
  await pool.execute('DELETE FROM users WHERE id = ?', [account.id])
  res.json({ ok: true })
}
