// Articles du blog : lecture publique, et gestion réservée aux administrateurs
import pool from '../config/db.js'
import { pickLanguage } from '../utils/circuits.js'
import { toPost, toPostCard, toPostForAdmin, validatePost, savePost } from '../utils/posts.js'

const notFound = (res) => res.status(404).json({ ok: false, error: 'This article was not found.' })
const slugTaken = (res) =>
  res.status(409).json({ ok: false, error: 'Another article already uses this address.', fields: { slug: 'Already used.' } })

async function findRow(slug, { publishedOnly = false } = {}) {
  const [rows] = await pool.execute(
    `SELECT * FROM blog_posts WHERE slug = ?${publishedOnly ? ' AND is_published = 1' : ''}`,
    [String(slug)],
  )
  return rows[0] || null
}

/* ------------------------------ Public ------------------------------ */

// GET /api/posts?lang=fr  → articles publiés, les plus récents d'abord (sans le corps)
export async function listPosts(req, res) {
  const lang = pickLanguage(req.query.lang)
  const [rows] = await pool.execute('SELECT * FROM blog_posts WHERE is_published = 1 ORDER BY published_on DESC, id DESC')
  res.json({ ok: true, posts: rows.map((row) => toPostCard(row, lang)) })
}

// GET /api/posts/:slug?lang=fr  → l'article complet + 3 autres articles récents
export async function getPost(req, res) {
  const lang = pickLanguage(req.query.lang)
  const row = await findRow(req.params.slug, { publishedOnly: true })
  if (!row) return notFound(res)
  const [others] = await pool.execute(
    'SELECT * FROM blog_posts WHERE is_published = 1 AND id <> ? ORDER BY published_on DESC, id DESC LIMIT 3',
    [row.id],
  )
  res.json({ ok: true, post: toPost(row, lang), related: others.map((r) => toPostCard(r, lang)) })
}

/* ------------------------------ Admin ------------------------------ */

export async function adminListPosts(req, res) {
  const [rows] = await pool.execute('SELECT * FROM blog_posts ORDER BY published_on DESC, id DESC')
  res.json({ ok: true, posts: rows.map(toPostForAdmin) })
}

export async function adminGetPost(req, res) {
  const row = await findRow(req.params.slug)
  if (!row) return notFound(res)
  res.json({ ok: true, post: toPostForAdmin(row) })
}

export async function createPost(req, res) {
  const data = validatePost(req.body)
  if (await findRow(data.slug)) return slugTaken(res)
  try {
    await savePost(pool, data)
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return slugTaken(res)
    throw error
  }
  res.status(201).json({ ok: true, post: toPostForAdmin(await findRow(data.slug)) })
}

// PUT /api/admin/posts/:slug  → remplace tout l'article (l'adresse peut changer)
export async function updatePost(req, res) {
  const existing = await findRow(req.params.slug)
  if (!existing) return notFound(res)
  const data = validatePost(req.body)
  if (data.slug !== existing.slug && (await findRow(data.slug))) return slugTaken(res)
  try {
    await savePost(pool, data, existing.id)
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return slugTaken(res)
    throw error
  }
  res.json({ ok: true, post: toPostForAdmin(await findRow(data.slug)) })
}

// PATCH /api/admin/posts/:slug  { isPublished?, isFeatured? }  → réglages rapides depuis la liste
export async function patchPost(req, res) {
  const changes = []
  const values = []
  for (const [field, column] of [['isPublished', 'is_published'], ['isFeatured', 'is_featured']]) {
    if (req.body[field] === undefined) continue
    changes.push(`${column} = ?`)
    values.push(req.body[field] ? 1 : 0)
  }
  if (!changes.length) return res.status(400).json({ ok: false, error: 'Nothing to change.' })
  const [result] = await pool.execute(`UPDATE blog_posts SET ${changes.join(', ')} WHERE slug = ?`, [...values, req.params.slug])
  if (!result.affectedRows) return notFound(res)
  res.json({ ok: true })
}

export async function deletePost(req, res) {
  const [result] = await pool.execute('DELETE FROM blog_posts WHERE slug = ?', [req.params.slug])
  if (!result.affectedRows) return notFound(res)
  res.json({ ok: true })
}
