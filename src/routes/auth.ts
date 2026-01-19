import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import pool from '../config/database';

const router = Router();

// POST /v1/auth/register
router.post('/register', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { name, learningLanguage, nativeLanguage } = req.body;
    const firebaseUid = req.user!.uid;
    const email = req.user!.email;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [firebaseUid]
    );

    if (existingUser.rows.length > 0) {
      throw new AppError('User already exists', 409, 'USER_EXISTS');
    }

    // Create user
    const result = await pool.query(
      `INSERT INTO users (firebase_uid, email, name, learning_language, native_language)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, firebase_uid, email, name, learning_language, native_language, 
                 subscription_tier, total_exp, daily_streak, created_at`,
      [firebaseUid, email, name, learningLanguage || 'en', nativeLanguage || 'vi']
    );

    const user = result.rows[0];

    res.status(201).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
