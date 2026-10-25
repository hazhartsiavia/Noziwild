import { readSession } from '../utils/session.js'
import { findUser } from '../utils/users.js'

// Lit la session sur toutes les requêtes : req.user vaut l'utilisateur connecté, ou null
export async function loadUser(req, res, next) {
  req.user = null
  const session = readSession(req)
  if (session) {
    const found = await findUser(session.userId)
    // Un cookie émis avant un changement de mot de passe n'est plus accepté, ni celui d'un compte suspendu
    if (found && !found.disabled && found.sessionVersion === session.version) req.user = found.user
  }
  next()
}

// Bloque la route si personne n'est connecté
export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ ok: false, error: 'Please log in first.' })
  }
  next()
}
