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

// Renvoie { user, sessionVersion }, ou null si le compte n'existe pas
export async function findUser(id) {
  const [rows] = await pool.execute(`SELECT ${PUBLIC_USER_COLUMNS}, session_version FROM users WHERE id = ?`, [id])
  if (!rows[0]) return null
  return { user: toPublicUser(rows[0]), sessionVersion: rows[0].session_version }
}

// Ouvre une session pour ce compte et renvoie l'utilisateur à envoyer au frontend
export async function signIn(res, userId) {
  const { user, sessionVersion } = await findUser(userId)
  startSession(res, userId, sessionVersion)
  return user
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
