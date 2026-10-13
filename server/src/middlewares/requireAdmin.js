// Protège les routes de lecture /api/admin/...
// Deux façons d'y accéder :
//   1. être connecté avec un compte dont role = 'admin'
//   2. envoyer l'en-tête  Authorization: Bearer <ADMIN_TOKEN>  (pratique pour curl ou un script)
export function requireAdmin(req, res, next) {
  if (req.user?.role === 'admin') return next()

  const expected = process.env.ADMIN_TOKEN
  const header = req.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (token && expected && expected !== 'change-moi' && token === expected) {
    return next()
  }
  res.status(req.user ? 403 : 401).json({ ok: false, error: 'Administrators only.' })
}
