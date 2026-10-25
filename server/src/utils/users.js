// Fonctions partagées autour des comptes utilisateurs
import pool from '../config/db.js'
import { startSession } from './session.js'

// Colonnes renvoyées au frontend (jamais le mot de passe)
export const PUBLIC_USER_COLUMNS =
  'id, name, email, avatar_url, role, google_id IS NOT NULL AS has_google, ' +
  'password_hash IS NOT NULL AS has_password, email_verified_at IS NOT NULL AS email_verified, created_at'

export function toPublicUser(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatarUrl: row.avatar_url,
    role: row.role,
    hasGoogle: Boolean(row.has_google),
    hasPassword: Boolean(row.has_password),
    emailVerified: Boolean(row.email_verified),
    createdAt: row.created_at,
  }
}

// Renvoie { user, sessionVersion, disabled }, ou null si le compte n'existe pas
export async function findUser(id) {
  const [rows] = await pool.execute(`SELECT ${PUBLIC_USER_COLUMNS}, session_version, disabled_at FROM users WHERE id = ?`, [id])
  if (!rows[0]) return null
  return { user: toPublicUser(rows[0]), sessionVersion: rows[0].session_version, disabled: Boolean(rows[0].disabled_at) }
}

// Compte suspendu depuis l'admin : pas de connexion possible
export class AccountDisabledError extends Error {
  constructor() {
    super('This account is suspended. Please contact the Noziwild team.')
    this.status = 403
  }
}

// Ouvre une session pour ce compte et renvoie l'utilisateur à envoyer au frontend
export async function signIn(res, userId) {
  const { user, sessionVersion, disabled } = await findUser(userId)
  if (disabled) throw new AccountDisabledError()
  startSession(res, userId, sessionVersion)
  return user
}

// Demandes envoyées par un compte, toutes pages confondues (les 50 plus récentes)
export async function requestsOf(id) {
  const [rows] = await pool.execute(
    `SELECT 'contact' AS kind, id, inquiry_type AS subject, message AS details, status, created_at
       FROM contact_messages WHERE user_id = ?
     UNION ALL
     SELECT 'tailor-made', id, CONCAT_WS(' · ', trip_length, travel_month), interests, status, created_at
       FROM tailor_made_requests WHERE user_id = ?
     UNION ALL
     SELECT type, id, subject, message, status, created_at
       FROM quick_requests WHERE user_id = ?
     UNION ALL
     SELECT 'quote', q.id, NULL,
            (SELECT GROUP_CONCAT(i.title ORDER BY i.position SEPARATOR ' · ') FROM quote_items i WHERE i.quote_id = q.id),
            q.status, q.created_at
       FROM quote_requests q WHERE q.user_id = ?
     ORDER BY created_at DESC
     LIMIT 50`,
    [id, id, id, id],
  )
  return rows.map((row) => ({
    kind: row.kind,
    id: row.id,
    subject: row.subject,
    details: row.details,
    status: row.status,
    createdAt: row.created_at,
  }))
}

export async function touchLastLogin(id) {
  await pool.execute('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [id])
}

// Rattache au compte les demandes envoyées avant qu'il existe avec la même adresse.
// À n'appeler que lorsque l'email est prouvé (Google, lien reçu par email),
// sinon n'importe qui pourrait lire les demandes d'un autre en créant un compte à son adresse.
export async function claimRequests(userId, email) {
  for (const table of ['contact_messages', 'tailor_made_requests', 'quick_requests']) {
    await pool.execute(`UPDATE ${table} SET user_id = ? WHERE user_id IS NULL AND LOWER(email) = ?`, [userId, email])
  }
}
