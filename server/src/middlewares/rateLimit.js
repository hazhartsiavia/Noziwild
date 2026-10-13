// Limite simple anti-spam : au plus `max` requêtes par adresse IP
// pendant `windowMs` millisecondes. Stocké en mémoire (suffisant pour un seul serveur).
export function rateLimit({ windowMs = 10 * 60 * 1000, max = 20 } = {}) {
  const hits = new Map()

  // Nettoyage régulier pour ne pas remplir la mémoire
  setInterval(() => {
    const now = Date.now()
    for (const [ip, entry] of hits) {
      if (entry.reset <= now) hits.delete(ip)
    }
  }, windowMs).unref()

  return (req, res, next) => {
    const now = Date.now()
    const entry = hits.get(req.ip)

    if (!entry || entry.reset <= now) {
      hits.set(req.ip, { count: 1, reset: now + windowMs })
      return next()
    }
    entry.count += 1
    if (entry.count > max) {
      return res.status(429).json({ ok: false, error: 'Too many attempts. Please try again later.' })
    }
    next()
  }
}
