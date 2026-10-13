// Crée la base et les tables à partir de sql/schema.sql,
// puis ajoute les colonnes apparues depuis (pour une base déjà existante),
// et remplit les circuits si la table est vide.
// Utilisation : npm run db:init   (peut être relancé sans risque)
import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'
import { seedCircuits } from './circuits.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const schemaPath = path.join(here, '..', '..', 'sql', 'schema.sql')

const dbName = process.env.DB_NAME || 'noziwild'
const sql = (await fs.readFile(schemaPath, 'utf8')).replaceAll('noziwild', dbName)

// Colonnes ajoutées après la première version du schéma.
// CREATE TABLE IF NOT EXISTS ne modifie pas une table existante : on les ajoute ici si elles manquent.
const COLUMNS = [
  { table: 'users', column: 'email_verified_at', definition: 'TIMESTAMP NULL AFTER role' },
  { table: 'users', column: 'session_version', definition: 'INT UNSIGNED NOT NULL DEFAULT 0 AFTER email_verified_at' },
  { table: 'contact_messages', column: 'user_id', definition: 'INT UNSIGNED NULL AFTER id' },
  { table: 'tailor_made_requests', column: 'user_id', definition: 'INT UNSIGNED NULL AFTER id' },
  { table: 'quick_requests', column: 'user_id', definition: 'INT UNSIGNED NULL AFTER id' },
]

// Liens entre les formulaires et le compte qui les a envoyés
const FOREIGN_KEYS = [
  { table: 'contact_messages', name: 'fk_contact_user' },
  { table: 'tailor_made_requests', name: 'fk_tailor_user' },
  { table: 'quick_requests', name: 'fk_quick_user' },
]

// Listes de valeurs (ENUM) agrandies depuis : on remplace la définition si une valeur manque
const ENUMS = [
  {
    table: 'quick_requests',
    column: 'type',
    value: 'circuit',
    definition: "ENUM('place', 'gear', 'food', 'trip', 'circuit') NOT NULL",
  },
]

async function migrate(connection) {
  for (const { table, column, definition } of COLUMNS) {
    const [rows] = await connection.execute(
      'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
      [dbName, table, column],
    )
    if (!rows.length) {
      await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`)
      console.log(`  + colonne ${table}.${column}`)
    }
  }

  for (const { table, column, value, definition } of ENUMS) {
    const [rows] = await connection.execute(
      'SELECT COLUMN_TYPE AS type FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
      [dbName, table, column],
    )
    if (rows[0] && !rows[0].type.includes(`'${value}'`)) {
      await connection.query(`ALTER TABLE \`${table}\` MODIFY COLUMN \`${column}\` ${definition}`)
      console.log(`  + valeur '${value}' dans ${table}.${column}`)
    }
  }

  for (const { table, name } of FOREIGN_KEYS) {
    const [rows] = await connection.execute(
      'SELECT 1 FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?',
      [dbName, table, name],
    )
    if (!rows.length) {
      // La clé étrangère crée aussi l'index sur user_id
      await connection.query(
        `ALTER TABLE \`${table}\` ADD CONSTRAINT \`${name}\` FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL`,
      )
      console.log(`  + lien ${table}.user_id -> users.id`)
    }
  }
}

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
})

try {
  await connection.query(sql)
  await migrate(connection)
  const seeded = await seedCircuits(connection)
  if (seeded) console.log(`  + ${seeded} circuits ajoutés (sql/circuits.seed.json)`)
  console.log(`Base "${dbName}" et tables prêtes.`)
} catch (error) {
  console.error('Échec de la création du schéma :', error.message)
  process.exitCode = 1
} finally {
  await connection.end()
}
