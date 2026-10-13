import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import routes from './routes/index.js'
import { notFound, errorHandler } from './middlewares/errorHandler.js'
import { checkOrigin, isAllowedOrigin } from './middlewares/checkOrigin.js'
import { UPLOADS_DIR } from './config/paths.js'

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

app.use(notFound)
app.use(errorHandler)

app.listen(PORT, (error) => {
  // Express 5 transmet ici les erreurs de démarrage (ex. port déjà utilisé)
  if (error) {
    console.error(`Impossible de démarrer l'API sur le port ${PORT} :`, error.message)
    process.exit(1)
  }
  console.log(`API Noziwild démarrée sur http://localhost:${PORT}`)
})
