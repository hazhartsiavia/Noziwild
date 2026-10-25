// Liens « choisir un mot de passe » envoyés par email :
//   'reset'  : mot de passe oublié, ou lien envoyé par l'équipe depuis l'admin (valable 1 heure)
//   'invite' : compte créé par l'équipe depuis l'admin, le nouvel utilisateur choisit son mot de passe (valable 7 jours)
// On ne stocke que l'empreinte SHA-256 du jeton (table password_resets) ; un seul lien actif par compte.
import crypto from 'node:crypto'
import pool from '../config/db.js'
import { sendMail } from './mailer.js'
import { clientUrl } from '../middlewares/checkOrigin.js'

export const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')

export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

const KINDS = {
  reset: {
    minutes: 60,
    validity: '60 minutes',
    subject: 'Reset your Noziwild password',
    intro: 'Someone asked to reset the password of your Noziwild account. To choose a new password, click the button below.',
    textIntro: 'Someone asked to reset the password of your Noziwild account. To choose a new password, open this link:',
    button: 'Choose a new password',
    outro: 'If you did not ask for this, you can ignore this email: your password stays the same.',
  },
  invite: {
    minutes: 7 * 24 * 60,
    validity: '7 days',
    subject: 'Your Noziwild account is ready',
    intro: 'The Noziwild team has created an account for you. To start using it, choose your password with the button below.',
    textIntro: 'The Noziwild team has created an account for you. To start using it, choose your password with this link:',
    button: 'Choose my password',
    outro: 'You can also sign in with Google if this address is a Google account.',
  },
}

// Crée un lien pour ce compte et l'envoie. `user` : { id, name, email }.
// L'envoi n'est pas attendu : un serveur mail lent ne bloque pas la réponse.
export async function sendPasswordLink(user, kind = 'reset') {
  const k = KINDS[kind]
  const token = crypto.randomBytes(32).toString('hex')
  // Un seul lien actif à la fois : les précédents ne marchent plus
  await pool.execute('DELETE FROM password_resets WHERE user_id = ?', [user.id])
  await pool.execute(
    `INSERT INTO password_resets (user_id, token_hash, expires_at)
     VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ${k.minutes} MINUTE))`,
    [user.id, sha256(token)],
  )

  const link = `${clientUrl()}/reset-password?token=${token}`
  sendMail({
    to: user.email,
    subject: k.subject,
    text:
      `Hello ${user.name},\n\n${k.textIntro}\n\n${link}\n\n` +
      `The link works once and expires in ${k.validity}.\n${k.outro}\n\nThe Noziwild team`,
    html:
      `<p>Hello ${escapeHtml(user.name)},</p>` +
      `<p>${k.intro}</p>` +
      `<p><a href="${link}" style="display:inline-block;padding:12px 24px;border-radius:999px;background:#C49849;color:#fff;text-decoration:none">${k.button}</a></p>` +
      `<p style="color:#64748b;font-size:14px">The link works once and expires in ${k.validity}. ${k.outro}</p>` +
      `<p>The Noziwild team</p>`,
  }).catch((error) => console.error('Envoi du lien de mot de passe impossible :', error.message))
}
