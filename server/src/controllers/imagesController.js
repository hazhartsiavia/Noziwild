// Photos des pages remplacées depuis l'admin (page « Pages & photos ») :
//   chaque emplacement (bannière du blog, photo d'une région...) a une photo d'origine dans le site ;
//   on n'enregistre ici que celles remplacées : { emplacement: chemin de la photo }.
//   Les fonds peuvent aussi recevoir une vidéo, jouée par-dessus leur photo : { emplacement: chemin de la vidéo }.
//   Et l'admin choisit quelles pages sont affichées aux visiteurs.
import pool from '../config/db.js'
import { ValidationError } from '../utils/validate.js'
import { HIDEABLE_PAGES, readHiddenPages } from '../utils/sitePages.js'

const KEY_RE = /^[a-z][\w.-]{0,79}$/
const IMAGE_RE = /^(\/uploads\/[\w\-/]+\.(?:png|jpe?g|webp)|https?:\/\/\S+)$/i
const VIDEO_RE = /^(\/uploads\/files\/[\w-]+\.(?:mp4|webm)|https?:\/\/\S+\.(?:mp4|webm))$/i

const bySlot = (rows) => Object.fromEntries(rows.map((row) => [row.slot, row.path]))

// GET /api/images  → { images: { 'blog.hero': '/uploads/files/...', ... }, videos: { 'blog.hero': '/uploads/files/....mp4' } }
export async function listImages(req, res) {
  const [images] = await pool.execute('SELECT slot, path FROM site_images')
  const [videos] = await pool.execute('SELECT slot, path FROM site_videos')
  res.set('Cache-Control', 'no-cache')
  res.json({ ok: true, images: bySlot(images), videos: bySlot(videos) })
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

// PUT /api/admin/videos/:key  { path }  → vidéo de fond de cet emplacement
export async function adminSaveVideo(req, res) {
  if (!checkKey(req, res)) return
  const path = typeof req.body.path === 'string' ? req.body.path.trim() : ''
  if (!VIDEO_RE.test(path) || path.includes('..') || path.length > 500) {
    throw new ValidationError({ path: 'A video of the library or an http(s) address ending in .mp4 or .webm.' })
  }
  await pool.execute(
    'INSERT INTO site_videos (slot, path) VALUES (?, ?) ON DUPLICATE KEY UPDATE path = VALUES(path)',
    [req.params.key, path],
  )
  res.json({ ok: true })
}

// DELETE /api/admin/videos/:key  → retour à la photo
export async function adminResetVideo(req, res) {
  if (!checkKey(req, res)) return
  await pool.execute('DELETE FROM site_videos WHERE slot = ?', [req.params.key])
  res.json({ ok: true })
}

// GET /api/pages  → { hidden: ['/transport', ...] }
export async function listPages(req, res) {
  res.set('Cache-Control', 'no-cache')
  res.json({ ok: true, hidden: await readHiddenPages() })
}

// PUT /api/admin/pages  { path, visible }  → affiche ou masque une page
export async function adminSetPage(req, res) {
  const { path, visible } = req.body
  if (!HIDEABLE_PAGES.includes(path) || typeof visible !== 'boolean') {
    throw new ValidationError({ path: `One of: ${HIDEABLE_PAGES.join(', ')}, with visible true or false.` })
  }
  if (visible) await pool.execute('DELETE FROM site_hidden_pages WHERE path = ?', [path])
  else await pool.execute('INSERT IGNORE INTO site_hidden_pages (path) VALUES (?)', [path])
  res.json({ ok: true, hidden: await readHiddenPages() })
}
