// Appels vers l'API Express (dossier /server).
// En développement, Vite redirige /api vers http://localhost:5002 (voir vite.config.js).
// En production, définir VITE_API_URL si l'API est sur un autre domaine.
const API_URL = import.meta.env.VITE_API_URL || ''

async function request(method, path, data) {
  const response = await fetch(`${API_URL}/api${path}`, {
    method,
    // Envoie le cookie de session avec chaque requête
    credentials: 'include',
    headers: data ? { 'Content-Type': 'application/json' } : undefined,
    body: data ? JSON.stringify(data) : undefined,
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(body.error || 'Something went wrong. Please try again later.')
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
export const fetchCircuits = () => getJSON('/circuits')
export const fetchCircuit = (slug) => getJSON(`/circuits/${encodeURIComponent(slug)}`)

// Formulaires du site
export const sendContact = (data) => postJSON('/contact', data)
export const sendTailorMade = (data) => postJSON('/tailor-made', data)
export const sendRequest = (type, data) => postJSON('/requests', { type, ...data })
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
export const adminFetchPhotos = () => getJSON('/admin/uploads')
export const adminFetchResource = (resource, page = 1) => getJSON(`/admin/${resource}?page=${page}&limit=20`)

// Envoi d'une photo : formulaire multipart (le navigateur fixe lui-même le Content-Type)
export async function adminUploadPhoto(file) {
  const form = new FormData()
  form.append('image', file)
  const response = await fetch(`${API_URL}/api/admin/uploads`, { method: 'POST', credentials: 'include', body: form })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || 'The photo could not be sent.')
  return body.path
}
