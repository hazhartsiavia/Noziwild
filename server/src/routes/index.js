import { Router } from 'express'
import pool from '../config/db.js'
import {
  createContact,
  createTailorMade,
  createQuickRequest,
  subscribeNewsletter,
} from '../controllers/formsController.js'
import { listResource } from '../controllers/adminController.js'
import {
  listCircuits,
  getCircuit,
  adminListCircuits,
  adminGetCircuit,
  createCircuit,
  updateCircuit,
  deleteCircuit,
  patchCircuit,
} from '../controllers/circuitsController.js'
import {
  listOffers,
  adminListOffers,
  adminGetOffer,
  createOffer,
  updateOffer,
  patchOffer,
  deleteOffer,
} from '../controllers/offersController.js'
import { listUploads, uploadImage } from '../controllers/uploadsController.js'
import { requireAdmin } from '../middlewares/requireAdmin.js'
import { rateLimit } from '../middlewares/rateLimit.js'
import { loadUser } from '../middlewares/auth.js'
import authRoutes from './auth.js'
import accountRoutes from './account.js'

const router = Router()

// Vérifie que l'API et MySQL répondent, et que les photos envoyées peuvent être enregistrées
router.get('/health', async (req, res) => {
  const { uploads } = req.app.locals
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true, database: 'connected', uploads })
  } catch (error) {
    res.status(503).json({ ok: false, database: 'disconnected', uploads, error: error.code })
  }
})

// À partir d'ici, req.user contient l'utilisateur connecté (ou null)
router.use(loadUser)

// Inscription, connexion (email ou Google), déconnexion
router.use('/auth', authRoutes)

// Profil, mot de passe, Google, suppression du compte, demandes envoyées
router.use('/account', accountRoutes)

// Formulaires publics du site
const formLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 20 })
router.post('/contact', formLimiter, createContact)
router.post('/tailor-made', formLimiter, createTailorMade)
router.post('/requests', formLimiter, createQuickRequest)
router.post('/newsletter', formLimiter, subscribeNewsletter)

// Circuits (pages /circuits et /circuits/:slug)
router.get('/circuits', listCircuits)
router.get('/circuits/:slug', getCircuit)

// Offres des pages Activités, Excursions, Excursions croisière, Long séjour, Sur mesure
router.get('/offers', listOffers)

// Gestion des circuits, des offres et des photos (réservé à l'équipe Noziwild)
// Déclarées avant /admin/:resource, sinon "circuits" ou "offers" serait pris pour une ressource générique
router.get('/admin/circuits', requireAdmin, adminListCircuits)
router.get('/admin/circuits/:slug', requireAdmin, adminGetCircuit)
router.post('/admin/circuits', requireAdmin, createCircuit)
router.put('/admin/circuits/:slug', requireAdmin, updateCircuit)
router.patch('/admin/circuits/:slug', requireAdmin, patchCircuit)
router.delete('/admin/circuits/:slug', requireAdmin, deleteCircuit)
router.get('/admin/offers', requireAdmin, adminListOffers)
router.get('/admin/offers/:id', requireAdmin, adminGetOffer)
router.post('/admin/offers', requireAdmin, createOffer)
router.put('/admin/offers/:id', requireAdmin, updateOffer)
router.patch('/admin/offers/:id', requireAdmin, patchOffer)
router.delete('/admin/offers/:id', requireAdmin, deleteOffer)
router.get('/admin/uploads', requireAdmin, listUploads)
router.post('/admin/uploads', requireAdmin, uploadImage)

// Lecture des données (réservé à l'équipe Noziwild)
router.get('/admin/:resource', requireAdmin, listResource)

export default router
