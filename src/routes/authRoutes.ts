import { Router } from 'express';
import { body } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import { validationHandler } from '../middleware/errorHandler';
import {
  register,
  login,
  refresh,
  getProfile,
  updateProfile,
} from '../controllers/authController';

const router = Router();

/**
 * POST /api/v1/auth/register
 * Register new user
 */
router.post(
  '/register',
  authMiddleware,
  [
    body('displayName').optional().isString().trim(),
  ],
  validationHandler,
  register
);

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post('/login', authMiddleware, login);

/**
 * POST /api/v1/auth/refresh
 * Refresh token
 */
router.post('/refresh', refresh);

/**
 * GET /api/v1/user/profile
 * Get current user profile
 */
router.get('/profile', authMiddleware, getProfile);

/**
 * PUT /api/v1/user/profile
 * Update user profile
 */
router.put(
  '/profile',
  authMiddleware,
  [
    body('displayName').optional().isString().trim().isLength({ min: 1, max: 100 }),
    body('avatar').optional().isURL(),
    body('learningLanguage').optional().isString().isIn(['en', 'ko', 'ja', 'zh', 'fr', 'es']),
  ],
  validationHandler,
  updateProfile
);

export default router;
