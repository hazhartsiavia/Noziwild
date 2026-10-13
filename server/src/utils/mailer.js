// Envoi d'emails (réinitialisation du mot de passe).
// Si SMTP_HOST n'est pas rempli dans .env, l'email est affiché dans la console du serveur :
// pratique en local, on peut cliquer sur le lien directement depuis le terminal.
import nodemailer from 'nodemailer'

let transporter = null

function getTransporter() {
  if (!process.env.SMTP_HOST) return null
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 587
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      // Port 465 = connexion chiffrée dès le départ, sinon STARTTLS
      secure: port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    })
  }
  return transporter
}

export async function sendMail({ to, subject, text, html }) {
  const transport = getTransporter()
  if (!transport) {
    console.log(`\n--- Email (SMTP non configuré, affiché ici) ---\nÀ : ${to}\nSujet : ${subject}\n\n${text}\n----------------------------------------------\n`)
    return
  }
  await transport.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  })
}
