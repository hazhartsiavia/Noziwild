import { Router } from 'express'
import {
  updateProfile,
  changePassword,
  linkGoogle,
  unlinkGoogle,
  deleteAccount,
  myRequests,
} from '../controllers/accountController.js'
import { requireAuth } from '../middlewares/auth.js'
import { rateLimit } from '../middlewares/rateLimit.js'

const router = Router()

// Tout ce qui suit est réservé à un utilisateur connecté
router.use(requireAuth)

// Ces routes vérifient le mot de passe actuel : on limite les essais
const sensitiveLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 })

router.patch('/', updateProfile)
router.delete('/', sensitiveLimiter, deleteAccount)
router.post('/password', sensitiveLimiter, changePassword)
router.post('/google', sensitiveLimiter, linkGoogle)
router.delete('/google', unlinkGoogle)
router.get('/requests', myRequests)

export default router
