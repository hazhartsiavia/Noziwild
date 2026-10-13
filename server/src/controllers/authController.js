import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import pool from '../config/db.js'
import { clean, check, checkPassword } from '../utils/validate.js'
import { endSession } from '../utils/session.js'
import { signIn, touchLastLogin, claimRequests } from '../utils/users.js'
import { verifyGoogleCredential } from '../utils/google.js'
import { sendMail } from '../utils/mailer.js'
import { clientUrl } from '../middlewares/checkOrigin.js'

const RESET_LINK_MINUTES = 60

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')

// POST /api/auth/register  { name, email, password }
export async function register(req, res) {
  const name = clean(req.body.name, 120)
  const email = clean(req.body.email, 190)?.toLowerCase()
  const password = req.body.password

  check({ required: { name, email, password }, email })
  checkPassword(password)

  const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email])
  if (existing.length) {
    return res.status(409).json({
      ok: false,
      error: 'An account already exists with this email. Log in instead, or use Google if you signed up with it.',
      fields: { email: 'This email is already registered.' },
    })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password_hash, last_login_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
    [name, email, passwordHash],
  )

  const user = await signIn(res, result.insertId)
  res.status(201).json({ ok: true, user })
}

// POST /api/auth/login  { email, password }
export async function login(req, res) {
  const email = clean(req.body.email, 190)?.toLowerCase()
  const password = typeof req.body.password === 'string' ? req.body.password : ''

  check({ required: { email, password }, email })

  const [rows] = await pool.execute('SELECT id, password_hash, google_id FROM users WHERE email = ?', [email])
  const row = rows[0]

  if (row && !row.password_hash && row.google_id) {
    return res.status(400).json({
      ok: false,
      error: 'This account uses Google sign-in. Use the Google button, or set a password with "Forgot password?".',
    })
  }

  // Même message que l'email existe ou non : on ne révèle pas quels emails ont un compte
  const valid = row?.password_hash && (await bcrypt.compare(password, row.password_hash))
  if (!valid) {
    return res.status(401).json({ ok: false, error: 'Incorrect email or password.' })
  }

  await touchLastLogin(row.id)
  const user = await signIn(res, row.id)
  res.json({ ok: true, user })
}

// POST /api/auth/google  { credential }
// `credential` est le jeton d'identité (ID token) fourni par le bouton Google côté React.
export async function googleLogin(req, res) {
  const google = await verifyGoogleCredential(req.body.credential)

  // 1. Compte déjà lié à ce Google ?  2. Sinon compte existant avec le même email ?  3. Sinon nouveau compte
  const [byGoogle] = await pool.execute('SELECT id FROM users WHERE google_id = ?', [google.googleId])
  let userId = byGoogle[0]?.id

  if (!userId) {
    const [byEmail] = await pool.execute(
      'SELECT id, google_id, email_verified_at FROM users WHERE email = ?',
      [google.email],
    )
    const existing = byEmail[0]

    if (existing?.google_id) {
      // L'utilisateur a relié un autre compte Google depuis sa page Compte
      return res.status(409).json({
        ok: false,
        error: 'This email is already linked to a different Google account. Log in with that one, or with your password.',
      })
    }

    if (existing) {
      userId = existing.id
      if (existing.email_verified_at) {
        await pool.execute(
          'UPDATE users SET google_id = ?, avatar_url = COALESCE(avatar_url, ?) WHERE id = ?',
          [google.googleId, google.avatar, userId],
        )
      } else {
        // Le compte a été créé avec un mot de passe, mais personne n'a jamais prouvé posséder cet email.
        // Google vient de le prouver : on retire ce mot de passe et on ferme les autres sessions.
        // Sinon, quelqu'un aurait pu créer un compte à l'adresse d'autrui avant lui, et garder l'accès.
        await pool.execute(
          `UPDATE users
              SET google_id = ?, avatar_url = COALESCE(avatar_url, ?), password_hash = NULL,
                  email_verified_at = CURRENT_TIMESTAMP, session_version = session_version + 1
            WHERE id = ?`,
          [google.googleId, google.avatar, userId],
        )
      }
    } else {
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, google_id, avatar_url, email_verified_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [google.name, google.email, google.googleId, google.avatar],
      )
      userId = result.insertId
    }
    await claimRequests(userId, google.email)
  }

  await touchLastLogin(userId)
  const user = await signIn(res, userId)
  res.json({ ok: true, user })
}

// POST /api/auth/forgot-password  { email }
// Envoie un lien valable 1 heure. La réponse est toujours la même, que le compte existe ou non.
export async function forgotPassword(req, res) {
  const email = clean(req.body.email, 190)?.toLowerCase()
  check({ required: { email }, email })

  const [rows] = await pool.execute('SELECT id, name FROM users WHERE email = ?', [email])
  const user = rows[0]

  if (user) {
    const token = crypto.randomBytes(32).toString('hex')
    // Un seul lien actif à la fois : les précédents ne marchent plus
    await pool.execute('DELETE FROM password_resets WHERE user_id = ?', [user.id])
    await pool.execute(
      `INSERT INTO password_resets (user_id, token_hash, expires_at)
       VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ${RESET_LINK_MINUTES} MINUTE))`,
      [user.id, sha256(token)],
    )

    const link = `${clientUrl()}/reset-password?token=${token}`
    // Pas de "await" : la réponse part aussi vite que l'email existe ou non
    sendMail({
      to: email,
      subject: 'Reset your Noziwild password',
      text:
        `Hello ${user.name},\n\n` +
        `Someone asked to reset the password of your Noziwild account. To choose a new password, open this link:\n\n${link}\n\n` +
        `The link works once and expires in ${RESET_LINK_MINUTES} minutes.\n` +
        `If you did not ask for this, you can ignore this email: your password stays the same.\n\nThe Noziwild team`,
      html:
        `<p>Hello ${escapeHtml(user.name)},</p>` +
        `<p>Someone asked to reset the password of your Noziwild account. To choose a new password, click the button below.</p>` +
        `<p><a href="${link}" style="display:inline-block;padding:12px 24px;border-radius:999px;background:#C49849;color:#fff;text-decoration:none">Choose a new password</a></p>` +
        `<p style="color:#64748b;font-size:14px">The link works once and expires in ${RESET_LINK_MINUTES} minutes. ` +
        `If you did not ask for this, you can ignore this email: your password stays the same.</p>` +
        `<p>The Noziwild team</p>`,
    }).catch((error) => console.error('Envoi de l\'email de réinitialisation impossible :', error.message))
  }

  res.json({ ok: true, message: 'If an account exists with this email, we have sent a link to reset your password.' })
}

// POST /api/auth/reset-password  { token, password }
export async function resetPassword(req, res) {
  const token = typeof req.body.token === 'string' ? req.body.token : ''
  const password = req.body.password
  checkPassword(password)

  const invalid = () =>
    res.status(400).json({ ok: false, error: 'This link is invalid or has expired. Please ask for a new one.' })
  if (!/^[a-f0-9]{64}$/.test(token)) return invalid()

  const [rows] = await pool.execute(
    `SELECT r.id, r.user_id, u.email FROM password_resets r JOIN users u ON u.id = r.user_id
      WHERE r.token_hash = ? AND r.used_at IS NULL AND r.expires_at > CURRENT_TIMESTAMP`,
    [sha256(token)],
  )
  const reset = rows[0]
  if (!reset) return invalid()

  // used_at IS NULL dans le WHERE : si le lien est utilisé deux fois en même temps, un seul passe
  const [used] = await pool.execute(
    'UPDATE password_resets SET used_at = CURRENT_TIMESTAMP WHERE id = ? AND used_at IS NULL',
    [reset.id],
  )
  if (!used.affectedRows) return invalid()

  // Le lien a été reçu dans la boîte mail : l'email est prouvé.
  // Les anciennes sessions sont fermées (session_version + 1).
  const passwordHash = await bcrypt.hash(password, 12)
  await pool.execute(
    `UPDATE users
        SET password_hash = ?, email_verified_at = COALESCE(email_verified_at, CURRENT_TIMESTAMP),
            session_version = session_version + 1, last_login_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
    [passwordHash, reset.user_id],
  )
  await pool.execute('DELETE FROM password_resets WHERE user_id = ? AND id <> ?', [reset.user_id, reset.id])
  await claimRequests(reset.user_id, reset.email)

  const user = await signIn(res, reset.user_id)
  res.json({ ok: true, user })
}

// GET /api/auth/me  → utilisateur connecté, ou null
export function me(req, res) {
  res.json({ ok: true, user: req.user })
}

// POST /api/auth/logout
export function logout(req, res) {
  endSession(res)
  res.json({ ok: true })
}

// GET /api/auth/config  → indique au frontend si Google est configuré
export function authConfig(req, res) {
  res.json({ ok: true, googleClientId: process.env.GOOGLE_CLIENT_ID || null })
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}
