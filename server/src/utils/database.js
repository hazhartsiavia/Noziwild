// Prépare la base : tables de sql/schema.sql, colonnes ajoutées depuis, circuits de départ.
// Sans risque à relancer. Utilisé par `npm run db:init` et au démarrage du serveur.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'
import { seedCircuits } from './circuits.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const schemaPath = path.join(here, '..', '..', 'sql', 'schema.sql')

// Colonnes ajoutées après la première version du schéma.
// CREATE TABLE IF NOT EXISTS ne modifie pas une table existante : on les ajoute ici si elles manquent.
const COLUMNS = [
  { table: 'users', column: 'email_verified_at', definition: 'TIMESTAMP NULL AFTER role' },
  { table: 'users', column: 'session_version', definition: 'INT UNSIGNED NOT NULL DEFAULT 0 AFTER email_verified_at' },
  { table: 'contact_messages', column: 'user_id', definition: 'INT UNSIGNED NULL AFTER id' },
  { table: 'tailor_made_requests', column: 'user_id', definition: 'INT UNSIGNED NULL AFTER id' },
  { table: 'quick_requests', column: 'user_id', definition: 'INT UNSIGNED NULL AFTER id' },
  { table: 'circuits', column: 'translations', definition: 'JSON NULL AFTER excluded' },
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

// Liens entre les formulaires et le compte qui les a envoyés
const FOREIGN_KEYS = [
  { table: 'contact_messages', name: 'fk_contact_user' },
  { table: 'tailor_made_requests', name: 'fk_tailor_user' },
  { table: 'quick_requests', name: 'fk_quick_user' },
]

function settings() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    charset: 'utf8mb4',
    multipleStatements: true,
  }
}

// Se connecte à la base. Si elle n'existe pas (en local avec XAMPP), on la crée.
// Chez un hébergeur, la base est déjà créée depuis son panneau et l'utilisateur n'a souvent
// pas le droit de créer une base : on ne le tente donc que si elle manque.
async function connect(dbName, log) {
  try {
    return await mysql.createConnection({ ...settings(), database: dbName })
  } catch (error) {
    if (error.code !== 'ER_BAD_DB_ERROR') throw error
    const server = await mysql.createConnection(settings())
    await server.query(`CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
    await server.end()
    log(`  + base "${dbName}" créée`)
    return mysql.createConnection({ ...settings(), database: dbName })
  }
}

async function migrate(connection, dbName, log) {
  for (const { table, column, definition } of COLUMNS) {
    const [rows] = await connection.execute(
      'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
      [dbName, table, column],
    )
    if (!rows.length) {
      await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`)
      log(`  + colonne ${table}.${column}`)
    }
  }

  for (const { table, column, value, definition } of ENUMS) {
    const [rows] = await connection.execute(
      'SELECT COLUMN_TYPE AS type FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
      [dbName, table, column],
    )
    if (rows[0] && !rows[0].type.includes(`'${value}'`)) {
      await connection.query(`ALTER TABLE \`${table}\` MODIFY COLUMN \`${column}\` ${definition}`)
      log(`  + valeur '${value}' dans ${table}.${column}`)
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
      log(`  + lien ${table}.user_id -> users.id`)
    }
  }
}

export async function initDatabase({ log = console.log } = {}) {
  const dbName = process.env.DB_NAME || 'noziwild'
  // La connexion choisit déjà la base : on retire du schéma les lignes CREATE DATABASE / USE
  const schema = (await fs.readFile(schemaPath, 'utf8'))
    .replace(/CREATE DATABASE[\s\S]*?;/i, '')
    .replace(/^USE\s+\w+;/im, '')

  const connection = await connect(dbName, log)
  try {
    await connection.query(schema)
    await migrate(connection, dbName, log)
    const { added, translated } = await seedCircuits(connection)
    if (added) log(`  + ${added} circuits ajoutés (sql/circuits.seed.json)`)
    if (translated) log(`  + traductions ajoutées à ${translated} circuits de départ`)
    log(`Base "${dbName}" et tables prêtes.`)
  } finally {
    await connection.end()
  }
}
