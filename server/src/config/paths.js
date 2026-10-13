// Dossiers du serveur
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))

// Photos servies sur /uploads/... :
//   uploads/circuits/  photos des circuits de départ (dans git)
//   uploads/files/     photos envoyées par l'admin (hors git)
export const UPLOADS_DIR = path.join(here, '..', '..', 'uploads')

// Site React construit (npm run build dans client/). S'il existe, le serveur le sert aussi :
// le site et l'API partagent alors la même adresse (pas de CORS, cookies simples).
export const CLIENT_DIST = path.join(here, '..', '..', '..', 'client', 'dist')
