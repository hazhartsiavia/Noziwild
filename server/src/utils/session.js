// Gestion de la session : un jeton JWT signé, stocké dans un cookie httpOnly.
// httpOnly = le JavaScript du navigateur ne peut pas lire le cookie (protège contre le vol par XSS).
import jwt from 'jsonwebtoken'

export const COOKIE_NAME = 'noziwild_session'

function secret() {
  const value = process.env.JWT_SECRET
  if (!value || value === 'change-moi') {
    throw new Error('JWT_SECRET manquant dans .env')
  }
  return value
}

function sessionDays() {
  return Number(process.env.SESSION_DAYS) || 7
}

function cookieOptions() {
  const secure = process.env.COOKIE_SECURE === 'true'
  return {
    httpOnly: true,
    secure,
    // "none" est nécessaire si le site et l'API sont sur des domaines différents (HTTPS obligatoire)
    sameSite: secure ? 'none' : 'lax',
    path: '/',
  }
}

// Crée la session de l'utilisateur.
// `version` = users.session_version : si elle change (nouveau mot de passe), les anciens cookies ne valent plus rien.
export function startSession(res, userId, version = 0) {
  const token = jwt.sign({ sub: String(userId), v: version }, secret(), { expiresIn: `${sessionDays()}d` })
  res.cookie(COOKIE_NAME, token, { ...cookieOptions(), maxAge: sessionDays() * 24 * 60 * 60 * 1000 })
}

export function endSession(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions())
}

// Renvoie { userId, version } lus dans le cookie, ou null si absent / invalide / expiré
export function readSession(req) {
  const token = req.cookies?.[COOKIE_NAME]
  if (!token) return null
  try {
    const payload = jwt.verify(token, secret())
    const userId = Number(payload.sub)
    return userId ? { userId, version: Number(payload.v) || 0 } : null
  } catch {
    return null
  }
}
