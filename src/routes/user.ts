import { Router } from 'express';
import { body } from 'express-validator';
import { userController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { runValidations } from '../middleware/validation';

const router = Router();

/**
 * GET /api/v1/user/profile
 * Get user profile (requires authentication)
 */
router.get('/profile', authenticate, userController.getProfile);

/**
 * PUT /api/v1/user/profile
 * Update user profile (requires authentication)
 */
router.put(
  '/profile',
  authenticate,
  runValidations([
    body('name').optional().isString().isLength({ min: 2, max: 100 }),
    body('learningLanguage').optional().isString().isLength({ min: 2, max: 10 }),
    body('photoUrl').optional().isURL(),
  ]),
  userController.updateProfile
);

/**
 * DELETE /api/v1/user/account
 * Delete user account (requires authentication)
 */
router.delete('/account', authenticate, userController.deleteAccount);

export default router;

