import { Pool } from 'pg';
import { pool } from '../config/database';
import { CreateUserInput, UpdateUserInput, UserProfile } from '../types';
import { logger } from '../config/logger';

export class UserService {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  /**
   * Create new user in database
   */
  async createUser(input: CreateUserInput): Promise<UserProfile> {
    const query = `
      INSERT INTO users (firebase_uid, email, display_name, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING 
        id, firebase_uid as "firebaseUid", email, display_name as "displayName",
        avatar, learning_language as "learningLanguage", streak_days as "streakDays",
        last_activity_date as "lastActivityDate", subscription_tier as "subscriptionTier",
        subscription_expires_at as "subscriptionExpiresAt", created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    try {
      const result = await this.pool.query(query, [
        input.firebaseUid,
        input.email,
        input.displayName || null,
      ]);

      logger.info(`User created: ${result.rows[0].id}`);
      return result.rows[0];
    } catch (error: any) {
      // Handle duplicate user
      if (error.code === '23505') {
        logger.warn(`Duplicate user attempt: ${input.firebaseUid}`);
        return this.getUserByFirebaseUid(input.firebaseUid);
      }
      throw error;
    }
  }

  /**
   * Get user by Firebase UID
   */
  async getUserByFirebaseUid(firebaseUid: string): Promise<UserProfile> {
    const query = `
      SELECT 
        id, firebase_uid as "firebaseUid", email, display_name as "displayName",
        avatar, learning_language as "learningLanguage", streak_days as "streakDays",
        last_activity_date as "lastActivityDate", subscription_tier as "subscriptionTier",
        subscription_expires_at as "subscriptionExpiresAt", created_at as "createdAt",
        updated_at as "updatedAt"
      FROM users
      WHERE firebase_uid = $1
    `;

    const result = await this.pool.query(query, [firebaseUid]);
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0];
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserProfile> {
    const query = `
      SELECT 
        id, firebase_uid as "firebaseUid", email, display_name as "displayName",
        avatar, learning_language as "learningLanguage", streak_days as "streakDays",
        last_activity_date as "lastActivityDate", subscription_tier as "subscriptionTier",
        subscription_expires_at as "subscriptionExpiresAt", created_at as "createdAt",
        updated_at as "updatedAt"
      FROM users
      WHERE id = $1
    `;

    const result = await this.pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0];
  }

  /**
   * Update user profile
   */
  async updateUser(firebaseUid: string, input: UpdateUserInput): Promise<UserProfile> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.displayName !== undefined) {
      updates.push(`display_name = $${paramCount++}`);
      values.push(input.displayName);
    }

    if (input.avatar !== undefined) {
      updates.push(`avatar = $${paramCount++}`);
      values.push(input.avatar);
    }

    if (input.learningLanguage !== undefined) {
      updates.push(`learning_language = $${paramCount++}`);
      values.push(input.learningLanguage);
    }

    updates.push(`updated_at = NOW()`);
    values.push(firebaseUid);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE firebase_uid = $${paramCount}
      RETURNING 
        id, firebase_uid as "firebaseUid", email, display_name as "displayName",
        avatar, learning_language as "learningLanguage", streak_days as "streakDays",
        last_activity_date as "lastActivityDate", subscription_tier as "subscriptionTier",
        subscription_expires_at as "subscriptionExpiresAt", created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await this.pool.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    logger.info(`User updated: ${firebaseUid}`);
    return result.rows[0];
  }

  /**
   * Check if user exists
   */
  async userExists(firebaseUid: string): Promise<boolean> {
    const query = 'SELECT id FROM users WHERE firebase_uid = $1';
    const result = await this.pool.query(query, [firebaseUid]);
    return result.rows.length > 0;
  }

  /**
   * Update user streak
   */
  async updateStreak(firebaseUid: string): Promise<void> {
    const query = `
      UPDATE users
      SET 
        streak_days = CASE
          WHEN last_activity_date::date = CURRENT_DATE - INTERVAL '1 day' THEN streak_days + 1
          WHEN last_activity_date::date = CURRENT_DATE THEN streak_days
          ELSE 1
        END,
        last_activity_date = CURRENT_DATE,
        updated_at = NOW()
      WHERE firebase_uid = $1
    `;

    await this.pool.query(query, [firebaseUid]);
    logger.info(`Streak updated for user: ${firebaseUid}`);
  }
}
