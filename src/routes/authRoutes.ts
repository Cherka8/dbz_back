import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Route pour l'inscription
// POST /api/auth/register
router.post('/register', register);

// Route pour la connexion
// POST /api/auth/login
router.post('/login', login);

// Route pour obtenir les informations de l'utilisateur connecté (protégée)
// GET /api/auth/me
router.get('/me', protect, getMe);

export default router;
