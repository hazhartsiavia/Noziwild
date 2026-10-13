// Dossiers du serveur
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))

// Photos servies sur /uploads/... :
//   uploads/circuits/  photos des circuits de départ (dans git)
//   uploads/files/     photos envoyées par l'admin (hors git)
export const UPLOADS_DIR = path.join(here, '..', '..', 'uploads')
