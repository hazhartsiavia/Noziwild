// Crée la base et les tables à partir de sql/schema.sql,
// puis ajoute les colonnes apparues depuis (pour une base déjà existante),
// et remplit les circuits si la table est vide.
// Utilisation : npm run db:init   (peut être relancé sans risque)
// Le serveur le fait aussi tout seul au démarrage (voir DB_AUTO_INIT dans .env.example).
import 'dotenv/config'
import { initDatabase } from './database.js'

try {
  await initDatabase()
} catch (error) {
  console.error('Échec de la création du schéma :', error.message || error.code)
  process.exitCode = 1
}
