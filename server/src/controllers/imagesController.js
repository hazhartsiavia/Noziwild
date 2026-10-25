// Photos des pages remplacées depuis l'admin (page « Photos ») :
//   chaque emplacement (bannière du blog, photo d'une région...) a une photo d'origine dans le site ;
//   on n'enregistre ici que celles remplacées : { emplacement: chemin de la photo }.
import pool from '../config/db.js'
import { ValidationError } from '../utils/validate.js'

const KEY_RE = /^[a-z][\w.-]{0,79}$/
const IMAGE_RE = /^(\/uploads\/[\w\-/]+\.(?:png|jpe?g|webp)|https?:\/\/\S+)$/i

// GET /api/images  → { images: { 'blog.hero': '/uploads/files/...', ... } }
export async function listImages(req, res) {
  const [rows] = await pool.execute('SELECT slot, path FROM site_images')
  res.set('Cache-Control', 'no-cache')
  res.json({ ok: true, images: Object.fromEntries(rows.map((row) => [row.slot, row.path])) })
}

function checkKey(req, res) {
  if (KEY_RE.test(req.params.key)) return true
  res.status(400).json({ ok: false, error: 'Unknown photo slot.' })
  return false
}

// PUT /api/admin/images/:key  { path }  → remplace la photo de cet emplacement
export async function adminSaveImage(req, res) {
  if (!checkKey(req, res)) return
  const path = typeof req.body.path === 'string' ? req.body.path.trim() : ''
  if (!IMAGE_RE.test(path) || path.includes('..') || path.length > 500) {
    throw new ValidationError({ path: 'A photo of the library (/uploads/... path) or an http(s) address.' })
  }
  await pool.execute(
    'INSERT INTO site_images (slot, path) VALUES (?, ?) ON DUPLICATE KEY UPDATE path = VALUES(path)',
    [req.params.key, path],
  )
  res.json({ ok: true })
}

// DELETE /api/admin/images/:key  → retour à la photo d'origine
export async function adminResetImage(req, res) {
  if (!checkKey(req, res)) return
  await pool.execute('DELETE FROM site_images WHERE slot = ?', [req.params.key])
  res.json({ ok: true })
}
