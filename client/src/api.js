// Appels vers l'API Express (dossier /server).
// En développement, Vite redirige /api vers http://localhost:5002 (voir vite.config.js).
// En production, définir VITE_API_URL si l'API est sur un autre domaine.
const API_URL = import.meta.env.VITE_API_URL || ''

// Messages d'erreur de ce fichier, dans la langue du site (posée sur <html lang> par LanguageContext)
const MESSAGES = {
  en: { offline: 'Our server is not reachable right now. Please try again later.', failed: 'Something went wrong. Please try again later.', photo: 'The photo could not be sent.' },
  fr: { offline: 'Notre serveur est injoignable pour le moment. Réessayez plus tard.', failed: 'Une erreur est survenue. Réessayez plus tard.', photo: "La photo n'a pas pu être envoyée." },
  de: { offline: 'Unser Server ist gerade nicht erreichbar. Bitte versuchen Sie es später erneut.', failed: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es später erneut.', photo: 'Das Foto konnte nicht gesendet werden.' },
  it: { offline: 'Il nostro server non è raggiungibile al momento. Riprova più tardi.', failed: 'Qualcosa è andato storto. Riprova più tardi.', photo: 'Non è stato possibile inviare la foto.' },
  es: { offline: 'Nuestro servidor no está disponible en este momento. Inténtelo más tarde.', failed: 'Algo ha salido mal. Inténtelo más tarde.', photo: 'No se ha podido enviar la foto.' },
}
const message = (key) => (MESSAGES[document.documentElement.lang] || MESSAGES.en)[key]

async function request(method, path, data) {
  const response = await fetch(`${API_URL}/api${path}`, {
    method,
    // Envoie le cookie de session avec chaque requête
    credentials: 'include',
    headers: data ? { 'Content-Type': 'application/json' } : undefined,
    body: data ? JSON.stringify(data) : undefined,
  })

  // Pas du JSON : ce n'est pas l'API qui a répondu (ex. l'hébergeur renvoie la page du site
  // parce que l'API n'est pas déployée à cette adresse)
  if (!response.headers.get('content-type')?.includes('application/json')) {
    const error = new Error(message('offline'))
    error.status = response.ok ? 502 : response.status
    throw error
  }

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(body.error || message('failed'))
    error.status = response.status
    error.fields = body.fields
    throw error
  }
  return body
}

export const getJSON = (path) => request('GET', path)
export const postJSON = (path, data = {}) => request('POST', path, data)
export const putJSON = (path, data = {}) => request('PUT', path, data)
export const patchJSON = (path, data = {}) => request('PATCH', path, data)
export const deleteJSON = (path, data = {}) => request('DELETE', path, data)

// Photo servie par l'API ("/uploads/...") : préfixée par l'adresse de l'API si elle est sur un autre domaine
export const assetUrl = (path) => (path && path.startsWith('/') ? `${API_URL}${path}` : path)

// Circuits
// Textes dans la langue du site (l'anglais si une traduction manque)
export const fetchCircuits = (lang = 'en') => getJSON(`/circuits?lang=${lang}`)
export const fetchCircuit = (slug, lang = 'en') => getJSON(`/circuits/${encodeURIComponent(slug)}?lang=${lang}`)

// Offres des pages Activités, Excursions, Excursions croisière, Long séjour, Sur mesure
//   kind : 'activity' | 'excursion' | 'cruise' | 'longstay' | 'idea'
export const fetchOffers = (kind, lang = 'en') => getJSON(`/offers?kind=${kind}&lang=${lang}`)

// Formulaires du site
export const sendContact = (data) => postJSON('/contact', data)
export const sendTailorMade = (data) => postJSON('/tailor-made', data)
export const sendRequest = (type, data) => postJSON('/requests', { type, ...data })
// Demande de devis de la page Mon voyage : coordonnées, dates et offres choisies (items)
export const sendQuote = (data) => postJSON('/quotes', data)
export const subscribeNewsletter = (email) => postJSON('/newsletter', { email })

// Authentification
export const fetchMe = () => getJSON('/auth/me')
export const fetchAuthConfig = () => getJSON('/auth/config')
export const registerUser = (data) => postJSON('/auth/register', data)
export const loginUser = (data) => postJSON('/auth/login', data)
export const loginWithGoogle = (credential) => postJSON('/auth/google', { credential })
export const logoutUser = () => postJSON('/auth/logout')
export const requestPasswordReset = (email) => postJSON('/auth/forgot-password', { email })
export const resetPassword = (token, password) => postJSON('/auth/reset-password', { token, password })

// Compte de l'utilisateur connecté
export const updateProfile = (data) => patchJSON('/account', data)
export const changePassword = (data) => postJSON('/account/password', data)
export const linkGoogle = (credential) => postJSON('/account/google', { credential })
export const unlinkGoogle = () => deleteJSON('/account/google')
export const deleteAccount = (data) => deleteJSON('/account', data)
export const fetchMyRequests = () => getJSON('/account/requests')

// Administration (comptes "admin" uniquement)
const circuitPath = (slug) => `/admin/circuits/${encodeURIComponent(slug)}`
export const adminFetchCircuits = () => getJSON('/admin/circuits')
export const adminFetchCircuit = (slug) => getJSON(circuitPath(slug))
export const adminCreateCircuit = (circuit) => postJSON('/admin/circuits', circuit)
export const adminUpdateCircuit = (slug, circuit) => putJSON(circuitPath(slug), circuit)
export const adminPatchCircuit = (slug, changes) => patchJSON(circuitPath(slug), changes)
export const adminDeleteCircuit = (slug) => deleteJSON(circuitPath(slug))
const offerPath = (id) => `/admin/offers/${encodeURIComponent(id)}`
export const adminFetchOffers = (kind) => getJSON(`/admin/offers?kind=${kind}`)
export const adminFetchOffer = (id) => getJSON(offerPath(id))
export const adminCreateOffer = (offer) => postJSON('/admin/offers', offer)
export const adminUpdateOffer = (id, offer) => putJSON(offerPath(id), offer)
export const adminPatchOffer = (id, changes) => patchJSON(offerPath(id), changes)
export const adminDeleteOffer = (id) => deleteJSON(offerPath(id))
export const adminFetchPhotos = () => getJSON('/admin/uploads')
export const adminFetchResource = (resource, page = 1) => getJSON(`/admin/${resource}?page=${page}&limit=20`)
export const adminSetQuoteStatus = (id, status) => patchJSON(`/admin/quotes/${id}`, { status })

// Envoi d'une photo : formulaire multipart (le navigateur fixe lui-même le Content-Type)
export async function adminUploadPhoto(file) {
  const form = new FormData()
  form.append('image', file)
  const response = await fetch(`${API_URL}/api/admin/uploads`, { method: 'POST', credentials: 'include', body: form })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || message('photo'))
  return body.path
}
