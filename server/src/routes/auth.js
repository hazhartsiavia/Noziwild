import { Router } from 'express'
import {
  register,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  me,
  logout,
  authConfig,
} from '../controllers/authController.js'
import { rateLimit } from '../middlewares/rateLimit.js'

const router = Router()

// Limite les tentatives pour freiner les attaques par force brute
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 })
// Chaque demande envoie un email : limite plus stricte
const resetLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 })

router.get('/config', authConfig)
router.get('/me', me)
router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.post('/google', authLimiter, googleLogin)
router.post('/forgot-password', resetLimiter, forgotPassword)
router.post('/reset-password', authLimiter, resetPassword)
router.post('/logout', logout)

export default router
