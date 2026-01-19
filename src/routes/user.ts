import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import pool from '../config/database';

const router = Router();

// GET /v1/user/profile
router.get('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const firebaseUid = req.user!.uid;

    const result = await pool.query(
      `SELECT id, firebase_uid, email, name, avatar_url, learning_language, 
              native_language, subscription_tier, subscription_expires_at, 
              total_exp, daily_streak, last_activity_date, created_at, updated_at
       FROM users 
       WHERE firebase_uid = $1`,
      [firebaseUid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.json({
      success: true,
      data: { user: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
});

// PUT /v1/user/profile
router.put('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const firebaseUid = req.user!.uid;
    const { name, avatarUrl, learningLanguage } = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    if (name) {
      updates.push(`name = $${paramCounter++}`);
      values.push(name);
    }
    if (avatarUrl) {
      updates.push(`avatar_url = $${paramCounter++}`);
      values.push(avatarUrl);
    }
    if (learningLanguage) {
      updates.push(`learning_language = $${paramCounter++}`);
      values.push(learningLanguage);
    }

    updates.push(`updated_at = NOW()`);
    values.push(firebaseUid);

    const result = await pool.query(
      `UPDATE users 
       SET ${updates.join(', ')}
       WHERE firebase_uid = $${paramCounter}
       RETURNING *`,
      values
    );

    res.json({
      success: true,
      data: { user: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
