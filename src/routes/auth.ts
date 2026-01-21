import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { runValidations } from '../middleware/validation';

const router = Router();

/**
 * POST /api/v1/auth/register
 * Register a new user with Firebase UID
 */
router.post(
  '/register',
  authMiddleware,
  runValidations([
    body('displayName').optional().isString().isLength({ min: 2, max: 100 }),
  ]),
  authController.register
);

/**
 * POST /api/v1/auth/login
 * Login with Firebase token
 */
router.post(
  '/login',
  authMiddleware,
  authController.login
);

/**
 * GET /api/v1/auth/profile
 * Get current user profile
 */
router.get(
  '/profile',
  authMiddleware,
  authController.getProfile
);

/**
 * PUT /api/v1/auth/profile
 * Update current user profile
 */
router.put(
  '/profile',
  authMiddleware,
  runValidations([
    body('displayName').optional().isString().isLength({ min: 2, max: 100 }),
    body('nativeLanguage').optional().isString(),
    body('learningLanguage').optional().isString(),
    body('learningGoal').optional().isString(),
  ]),
  authController.updateProfile
);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token (placeholder for client-side Firebase refresh)
 */
router.post('/refresh', authController.refresh);

export default router;

