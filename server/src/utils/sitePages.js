// Pages du site que l'admin peut masquer, et réglages envoyés avec chaque page HTML.
// L'accueil, la connexion, le compte et « Mon voyage » restent toujours affichés.
import pool from '../config/db.js'

export const HIDEABLE_PAGES = [
  '/about', '/activities', '/accommodation', '/blog', '/circuits', '/contact', '/cruise-excursions', '/destinations',
  '/equipment-rentals', '/excursions', '/food-dining', '/guides', '/long-stay', '/photography', '/tailor-made',
  '/ticket-reservation', '/transport',
]

// Une page masquée entraîne ses sous-pages (/circuits/mon-circuit)
export const isHiddenPath = (hidden, path) => hidden.some((page) => path === page || path.startsWith(`${page}/`))

export async function readHiddenPages() {
  const [rows] = await pool.execute('SELECT path FROM site_hidden_pages')
  return rows.map((row) => row.path)
}

// Photos, vidéos et pages masquées posées dans le HTML : le site les connaît dès le premier affichage.
// Base injoignable : null, le site retombe sur l'API.
export async function readSiteState() {
  try {
    const [[images], [videos], hidden] = await Promise.all([
      pool.execute('SELECT slot, path FROM site_images'),
      pool.execute('SELECT slot, path FROM site_videos'),
      readHiddenPages(),
    ])
    const bySlot = (rows) => Object.fromEntries(rows.map((row) => [row.slot, row.path]))
    return { images: bySlot(images), videos: bySlot(videos), hidden }
  } catch (error) {
    console.error('Réglages du site non lus :', error.code || error.message)
    return null
  }
}
