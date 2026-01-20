import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers/authController';
import { runValidations } from '../middleware/validation';

const router = Router();

/**
 * POST /api/v1/auth/register
 * Register a new user with Firebase UID
 */
router.post(
  '/register',
  runValidations([
    body('email').isEmail().withMessage('Valid email is required'),
    body('firebaseUid').notEmpty().withMessage('Firebase UID is required'),
    body('name').optional().isString().isLength({ min: 2, max: 100 }),
  ]),
  authController.register
);

/**
 * POST /api/v1/auth/login
 * Login with Firebase token
 */
router.post(
  '/login',
  runValidations([
    body('firebaseToken').notEmpty().withMessage('Firebase token is required'),
  ]),
  authController.loginWithFirebase
);

/**
 * POST /api/v1/auth/verify
 * Verify JWT token
 */
router.post(
  '/verify',
  runValidations([
    body('token').notEmpty().withMessage('Token is required'),
  ]),
  authController.verifyToken
);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post('/refresh', authController.refreshToken);

/**
 * POST /api/v1/auth/logout
 * Logout user
 */
router.post('/logout', authController.logout);

export default router;

