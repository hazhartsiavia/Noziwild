// Petites fonctions de validation, sans dépendance externe

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Nettoie une valeur texte : trim + longueur maximale. Renvoie null si vide.
export function clean(value, max = 255) {
  if (value === undefined || value === null) return null
  const text = String(value).trim()
  if (!text) return null
  return text.slice(0, max)
}

export function isEmail(value) {
  return typeof value === 'string' && value.length <= 190 && EMAIL_RE.test(value)
}

// Erreur "400 Bad Request" avec la liste des champs invalides
export class ValidationError extends Error {
  constructor(fields) {
    super('Some fields are invalid.')
    this.status = 400
    this.fields = fields
  }
}

// Vérifie les champs obligatoires et le format de l'email
export function check({ required = {}, email }) {
  const fields = {}
  for (const [key, value] of Object.entries(required)) {
    if (!value) fields[key] = 'This field is required.'
  }
  if (email !== undefined && !fields.email && !isEmail(email)) {
    fields.email = 'Please enter a valid email address.'
  }
  if (Object.keys(fields).length) throw new ValidationError(fields)
}

// Règles du mot de passe. bcrypt ne prend en compte que les 72 premiers octets.
export function checkPassword(password, field = 'password') {
  if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72) {
    throw new ValidationError({ [field]: 'Password must be between 8 and 72 characters.' })
  }
}
