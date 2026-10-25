// Gestion du compte de l'utilisateur connecté (toutes ces routes passent par requireAuth)
import bcrypt from 'bcryptjs'
import pool from '../config/db.js'
import { clean, check, checkPassword } from '../utils/validate.js'
import { endSession } from '../utils/session.js'
import { findUser, signIn, claimRequests, requestsOf } from '../utils/users.js'
import { verifyGoogleCredential } from '../utils/google.js'

async function passwordMatches(userId, password) {
  if (typeof password !== 'string' || !password) return false
  const [rows] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [userId])
  return Boolean(rows[0]?.password_hash) && bcrypt.compare(password, rows[0].password_hash)
}

// PATCH /api/account  { name }
export async function updateProfile(req, res) {
  const name = clean(req.body.name, 120)
  check({ required: { name } })

  await pool.execute('UPDATE users SET name = ? WHERE id = ?', [name, req.user.id])
  const { user } = await findUser(req.user.id)
  res.json({ ok: true, user })
}

// POST /api/account/password  { currentPassword?, newPassword }
// Change le mot de passe, ou en crée un pour un compte Google.
// Les autres appareils sont déconnectés ; l'appareil actuel reçoit une nouvelle session.
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body

  if (req.user.hasPassword && !(await passwordMatches(req.user.id, currentPassword))) {
    return res.status(400).json({
      ok: false,
      error: 'Your current password is incorrect.',
      fields: { currentPassword: 'Incorrect password.' },
    })
  }
  checkPassword(newPassword, 'newPassword')

  const passwordHash = await bcrypt.hash(newPassword, 12)
  await pool.execute(
    'UPDATE users SET password_hash = ?, session_version = session_version + 1 WHERE id = ?',
    [passwordHash, req.user.id],
  )
  // Un ancien lien "mot de passe oublié" ne doit plus pouvoir servir
  await pool.execute('DELETE FROM password_resets WHERE user_id = ?', [req.user.id])

  const user = await signIn(res, req.user.id)
  res.json({ ok: true, user })
}

// POST /api/account/google  { credential }  → relie un compte Google au compte actuel
export async function linkGoogle(req, res) {
  const google = await verifyGoogleCredential(req.body.credential)

  const [owners] = await pool.execute('SELECT id FROM users WHERE google_id = ? AND id <> ?', [google.googleId, req.user.id])
  if (owners.length) {
    return res.status(409).json({ ok: false, error: 'This Google account is already linked to another Noziwild account.' })
  }

  // Si l'adresse Google est celle du compte, elle est désormais prouvée
  const sameEmail = google.email === req.user.email.toLowerCase()
  await pool.execute(
    `UPDATE users
        SET google_id = ?, avatar_url = COALESCE(avatar_url, ?),
            email_verified_at = IF(?, COALESCE(email_verified_at, CURRENT_TIMESTAMP), email_verified_at)
      WHERE id = ?`,
    [google.googleId, google.avatar, sameEmail ? 1 : 0, req.user.id],
  )
  if (sameEmail) await claimRequests(req.user.id, google.email)

  const { user } = await findUser(req.user.id)
  res.json({ ok: true, user })
}

// DELETE /api/account/google  → détache Google (seulement s'il reste un mot de passe pour se connecter)
export async function unlinkGoogle(req, res) {
  if (!req.user.hasPassword) {
    return res.status(400).json({
      ok: false,
      error: 'Set a password first: without it, you could no longer log in to your account.',
    })
  }
  // La photo de profil venait de Google : on la retire avec lui
  await pool.execute('UPDATE users SET google_id = NULL, avatar_url = NULL WHERE id = ?', [req.user.id])
  const { user } = await findUser(req.user.id)
  res.json({ ok: true, user })
}

// DELETE /api/account  { password }  ou  { confirmEmail }  pour un compte sans mot de passe
// Les demandes déjà envoyées restent chez Noziwild (user_id passe à NULL) pour pouvoir y répondre.
export async function deleteAccount(req, res) {
  if (req.user.hasPassword) {
    if (!(await passwordMatches(req.user.id, req.body.password))) {
      return res.status(400).json({ ok: false, error: 'Incorrect password.', fields: { password: 'Incorrect password.' } })
    }
  } else if (clean(req.body.confirmEmail, 190)?.toLowerCase() !== req.user.email.toLowerCase()) {
    return res.status(400).json({
      ok: false,
      error: 'Type your email address to confirm.',
      fields: { confirmEmail: 'This does not match your email address.' },
    })
  }

  await pool.execute('DELETE FROM users WHERE id = ?', [req.user.id])
  endSession(res)
  res.json({ ok: true })
}

// GET /api/account/requests  → les demandes envoyées par l'utilisateur, toutes pages confondues
export async function myRequests(req, res) {
  res.json({ ok: true, requests: await requestsOf(req.user.id) })
}
