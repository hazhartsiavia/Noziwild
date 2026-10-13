// Route inconnue
export function notFound(req, res) {
  res.status(404).json({ ok: false, error: `Route not found: ${req.method} ${req.originalUrl}` })
}

// Toutes les erreurs arrivent ici.
// Express 5 transmet aussi automatiquement les erreurs des fonctions async.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, error: 'Invalid JSON.' })
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ ok: false, error: 'Request is too large.' })
  }
  // Erreurs prévues par notre code (ValidationError, GoogleAuthError...) : le message est destiné au visiteur
  if (err.status && err.status !== 500) {
    return res.status(err.status).json({ ok: false, error: err.message, fields: err.fields })
  }
  console.error(err)
  res.status(500).json({ ok: false, error: 'Something went wrong on our side. Please try again later.' })
}
