// Photos Noziwild : remplace les photos d'origine des contenus de départ (offres, circuits, destinations,
// articles) par les vraies photos de Noziwild, dans une base déjà remplie.
// La liste vient de sql/photos.update.json : { table, where, circuit?, column, path, old, new }.
// Une photo n'est remplacée que si elle est encore celle d'origine : un choix fait dans l'admin est gardé.
// Sans risque à relancer : une fois remplacée, l'ancienne photo n'est plus trouvée.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const UPDATE_FILE = path.join(here, '..', '..', 'sql', 'photos.update.json')

const TABLES = new Set(['offers', 'circuits', 'circuit_days', 'destinations', 'blog_posts'])
const COLUMNS = new Set(['image', 'cover_image', 'gallery', 'images', 'details', 'body'])
const KEYS = new Set(['kind', 'title', 'slug', 'position'])

const parse = (value) => {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

const read = (value, keys) => keys.reduce((node, key) => (node == null ? undefined : node[key]), value)

function write(value, keys, next) {
  let node = value
  for (const key of keys.slice(0, -1)) node = node[key]
  node[keys[keys.length - 1]] = next
}

export async function updateSeedPhotos(db) {
  const updates = JSON.parse(await fs.readFile(UPDATE_FILE, 'utf8'))
  const circuitIds = new Map()
  let changed = 0

  for (const u of updates) {
    if (!TABLES.has(u.table) || !COLUMNS.has(u.column) || !Object.keys(u.where).every((k) => KEYS.has(k))) continue

    const where = { ...u.where }
    if (u.table === 'circuit_days') {
      if (!circuitIds.has(u.circuit)) {
        const [rows] = await db.execute('SELECT id FROM circuits WHERE slug = ?', [u.circuit])
        circuitIds.set(u.circuit, rows[0]?.id ?? null)
      }
      if (!circuitIds.get(u.circuit)) continue
      where.circuit_id = circuitIds.get(u.circuit)
    }
    const clause = Object.keys(where).map((k) => `\`${k}\` = ?`).join(' AND ')
    const params = Object.values(where)

    const [rows] = await db.execute(`SELECT id, \`${u.column}\` AS value FROM \`${u.table}\` WHERE ${clause}`, params)
    for (const row of rows) {
      if (!u.path.length) {
        if (row.value !== u.old) continue
        await db.execute(`UPDATE \`${u.table}\` SET \`${u.column}\` = ? WHERE id = ?`, [u.new, row.id])
      } else {
        const value = parse(row.value)
        if (value == null || read(value, u.path) !== u.old) continue
        write(value, u.path, u.new)
        await db.execute(`UPDATE \`${u.table}\` SET \`${u.column}\` = ? WHERE id = ?`, [JSON.stringify(value), row.id])
      }
      changed += 1
    }
  }
  return changed
}
