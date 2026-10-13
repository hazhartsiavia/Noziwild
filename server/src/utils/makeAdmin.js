// Donne (ou retire) le rôle administrateur à un compte existant
// Utilisation : npm run make-admin -- ton.email@exemple.com
//               npm run make-admin -- ton.email@exemple.com --remove
import 'dotenv/config'
import pool from '../config/db.js'

const email = process.argv[2]?.trim().toLowerCase()
const remove = process.argv.includes('--remove')

if (!email || email.startsWith('--')) {
  console.error('Indique l\'email du compte : npm run make-admin -- ton.email@exemple.com')
  process.exit(1)
}

try {
  const [result] = await pool.execute('UPDATE users SET role = ? WHERE email = ?', [remove ? 'user' : 'admin', email])
  if (!result.affectedRows) {
    console.error(`Aucun compte avec l'email ${email}. Crée d'abord le compte sur le site (/register ou Google).`)
    process.exitCode = 1
  } else {
    console.log(remove ? `${email} n'est plus administrateur.` : `${email} est maintenant administrateur. Page : /admin`)
  }
} catch (error) {
  console.error('Impossible de modifier le compte :', error.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
