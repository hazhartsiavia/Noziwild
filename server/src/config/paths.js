// Dossiers du serveur
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const SERVER_DIR = path.join(here, '..', '..')

// Photos servies sur /uploads/... :
//   uploads/circuits/  photos des circuits de départ (dans git)
//   /uploads/files/    photos envoyées par l'admin (hors git), rangées dans UPLOADS_FILES_DIR
export const UPLOADS_DIR = path.join(SERVER_DIR, 'uploads')

// Chez Hostinger, chaque déploiement arrive dans un dossier neuf : <domaine>/hbuilds/versions/<id>/...
// Ce qui est écrit dans la version en cours disparaît au déploiement suivant.
const hostinger = here.match(/^(.*)[\\/]hbuilds[\\/]versions[\\/]([^\\/]+)[\\/]/)

// Dossier des photos envoyées, dans l'ordre :
//   1. UPLOADS_FILES_DIR (chemin absolu, ou relatif au dossier server/)
//   2. chez Hostinger : <domaine>/noziwild-uploads, hors des versions, donc conservé
//   3. sinon : server/uploads/files
export const UPLOADS_FILES_DIR = process.env.UPLOADS_FILES_DIR
  ? path.resolve(SERVER_DIR, process.env.UPLOADS_FILES_DIR)
  : hostinger
    ? path.join(hostinger[1], 'noziwild-uploads')
    : path.join(UPLOADS_DIR, 'files')

// Crée le dossier des photos envoyées et renvoie son état (affiché par /api/health) :
//   'persistent'   hors du dossier de l'application : survit aux déploiements
//   'local'        dans le dossier de l'application (server/uploads/files en local)
//   'not writable' impossible d'y écrire
// Chez Hostinger, récupère aussi les photos restées dans les anciennes versions (avant ce dossier commun).
export function prepareUploadsDir() {
  try {
    fs.mkdirSync(UPLOADS_FILES_DIR, { recursive: true })
    fs.accessSync(UPLOADS_FILES_DIR, fs.constants.W_OK)
  } catch (error) {
    console.error(`Dossier des photos ${UPLOADS_FILES_DIR} inutilisable :`, error.code || error.message)
    return 'not writable'
  }
  if (hostinger) {
    try {
      recoverOldUploads()
    } catch (error) {
      console.error('Photos des anciennes versions non récupérées :', error.code || error.message)
    }
  }
  const inApp = path.relative(path.join(SERVER_DIR, '..'), UPLOADS_FILES_DIR)
  return inApp.startsWith('..') || path.isAbsolute(inApp) ? 'persistent' : 'local'
}

function recoverOldUploads() {
  const versions = path.join(hostinger[1], 'hbuilds', 'versions')
  // Emplacement de server/uploads/files dans une version, ex. nodejs/server/uploads/files
  const inVersion = path.relative(path.join(versions, hostinger[2]), path.join(UPLOADS_DIR, 'files'))
  for (const version of fs.readdirSync(versions)) {
    const dir = path.join(versions, version, inVersion)
    if (dir === UPLOADS_FILES_DIR || !fs.existsSync(dir)) continue
    for (const name of fs.readdirSync(dir)) {
      const target = path.join(UPLOADS_FILES_DIR, name)
      if (/\.(png|jpe?g|webp)$/i.test(name) && !fs.existsSync(target)) fs.copyFileSync(path.join(dir, name), target)
    }
  }
}

// Site React construit (npm run build dans client/). S'il existe, le serveur le sert aussi :
// le site et l'API partagent alors la même adresse (pas de CORS, cookies simples).
export const CLIENT_DIST = path.join(SERVER_DIR, '..', 'client', 'dist')
