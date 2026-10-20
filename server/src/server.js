import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import routes from './routes/index.js'
import { notFound, errorHandler } from './middlewares/errorHandler.js'
import { checkOrigin, isAllowedOrigin } from './middlewares/checkOrigin.js'
import { UPLOADS_DIR, CLIENT_DIST } from './config/paths.js'
import { initDatabase } from './utils/database.js'

// Les sessions ne peuvent pas fonctionner sans secret : on arrête tout de suite
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-moi') {
  console.error('JWT_SECRET manquant dans server/.env. Mets-y une longue chaîne aléatoire.')
  process.exit(1)
}

const app = express()
const PORT = Number(process.env.PORT) || 5002

// Derrière un hébergeur (proxy), permet de lire la vraie IP du visiteur pour l'anti-spam
app.set('trust proxy', 1)

// Autorise le frontend à appeler l'API, cookies de session compris
app.use(cors({ origin: (origin, done) => done(null, !origin || isAllowedOrigin(origin)), credentials: true }))
app.use(checkOrigin)

// Photos des circuits et photos envoyées par l'admin : /uploads/...
// nosniff : le navigateur respecte le type annoncé (une image reste une image)
app.use('/uploads', express.static(UPLOADS_DIR, {
  maxAge: '7d',
  setHeaders: (res) => res.set('X-Content-Type-Options', 'nosniff'),
}))

// Lit le JSON envoyé par les formulaires (un circuit complet peut peser quelques dizaines de Ko), et les cookies
app.use(express.json({ limit: '200kb' }))
// Express 5 laisse req.body vide (undefined) quand il n'y a pas de JSON : on met un objet vide
app.use((req, res, next) => {
  req.body ??= {}
  next()
})
app.use(cookieParser())

// Toutes les routes commencent par /api
app.use('/api', routes)

// Site React construit (client/dist) : servi par le même serveur s'il est présent
const INDEX_HTML = path.join(CLIENT_DIST, 'index.html')
if (fs.existsSync(INDEX_HTML)) {
  app.use(express.static(CLIENT_DIST, {
    index: false,
    // Les fichiers de /assets ont un nom qui change à chaque build : cache long. Le reste : revalidé.
    setHeaders: (res, file) => {
      res.set('Cache-Control', file.includes(`${path.sep}assets${path.sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache')
    },
  }))
  // Les adresses du site (/circuits/..., /account...) sont gérées par React : on renvoie index.html
  app.use((req, res, next) => {
    const isPage = (req.method === 'GET' || req.method === 'HEAD') && !req.path.startsWith('/api/') && !req.path.startsWith('/uploads/')
    if (!isPage || !req.accepts('html')) return next()
    res.set('Cache-Control', 'no-cache')
    res.sendFile(INDEX_HTML)
  })
}

app.use(notFound)
app.use(errorHandler)

// Pas de "await" au niveau du fichier : chez Hostinger, le lanceur Node charge ce fichier
// avec require(), qui refuse les modules contenant un await de premier niveau.
async function start() {
  // Tables à jour avant de répondre (sans risque à relancer). DB_AUTO_INIT=false pour le désactiver.
  // Si MySQL ne répond pas, le serveur démarre quand même : /api/health dira "disconnected".
  if (process.env.DB_AUTO_INIT !== 'false') {
    try {
      await initDatabase({ log: () => {} })
    } catch (error) {
      console.error('Base de données non préparée :', error.message || error.code)
    }
  }

  app.listen(PORT, (error) => {
    // Express 5 transmet ici les erreurs de démarrage (ex. port déjà utilisé)
    if (error) {
      console.error(`Impossible de démarrer l'API sur le port ${PORT} :`, error.message)
      process.exit(1)
    }
    const site = fs.existsSync(INDEX_HTML) ? ' (site + API)' : ''
    console.log(`API Noziwild démarrée sur http://localhost:${PORT}${site}`)
  })
}

start()
