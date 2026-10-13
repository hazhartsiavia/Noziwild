// Adresses du site autorisées à appeler l'API (CLIENT_URL, plusieurs possibles séparées par des virgules)
const LOCALHOST_RE = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/

function configuredOrigins() {
  return (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean)
}

// Adresse principale du site, utilisée dans les liens envoyés par email
export function clientUrl() {
  return configuredOrigins()[0]
}

export function isAllowedOrigin(origin) {
  if (configuredOrigins().includes(origin)) return true
  // En local (pas de HTTPS), on accepte aussi Vite sur un autre port, ou 127.0.0.1
  return process.env.COOKIE_SECURE !== 'true' && LOCALHOST_RE.test(origin)
}

// Protection CSRF : une requête qui modifie des données (POST, PATCH, DELETE...) envoyée par
// le navigateur depuis un autre site porte un en-tête Origin étranger. On la refuse.
// Les appels sans Origin (curl, scripts serveur) ne viennent pas d'un navigateur et passent.
export function checkOrigin(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next()
  const origin = req.get('origin')
  if (origin && !isAllowedOrigin(origin)) {
    return res.status(403).json({ ok: false, error: 'Request refused: unknown origin.' })
  }
  next()
}
