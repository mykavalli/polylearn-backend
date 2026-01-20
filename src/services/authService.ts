import jwt, { SignOptions } from 'jsonwebtoken';
import { query } from '../config/database';
import { auth as firebaseAuth } from '../config/firebase';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config/logger';

interface UserData {
  email: string;
  name?: string;
  firebaseUid: string;
}

export class AuthService {
  /**
   * Register user with Firebase UID
   */
  async register(userData: UserData): Promise<any> {
    const { email, name, firebaseUid } = userData;

    try {
      // Check if user already exists
      const existingUser = await query(
        'SELECT * FROM users WHERE email = $1 OR firebase_uid = $2',
        [email, firebaseUid]
      );

      if (existingUser.rows.length > 0) {
        throw new AppError('User already exists', 409);
      }

      // Insert new user
      const result = await query(
        `INSERT INTO users (email, name, firebase_uid, created_at, last_login_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING id, email, name, streak, total_xp, level, is_premium, subscription_tier, created_at`,
        [email, name || null, firebaseUid]
      );

      const user = result.rows[0];

      // Generate JWT token
      const token = this.generateToken({
        userId: user.id,
        email: user.email,
      });

      logger.info('User registered successfully', { userId: user.id, email });

      return {
        user,
        token,
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login with Firebase token verification
   */
  async loginWithFirebase(firebaseToken: string): Promise<any> {
    try {
      // Verify Firebase token
      const decodedToken = await firebaseAuth.verifyIdToken(firebaseToken);
      const { uid: firebaseUid, email } = decodedToken;

      if (!email) {
        throw new AppError('Email not found in Firebase token', 400);
      }

      // Find or create user
      let userResult = await query(
        'SELECT * FROM users WHERE firebase_uid = $1',
        [firebaseUid]
      );

      let user;

      if (userResult.rows.length === 0) {
        // Auto-register user
        const registerResult = await query(
          `INSERT INTO users (email, firebase_uid, created_at, last_login_at)
           VALUES ($1, $2, NOW(), NOW())
           RETURNING id, email, name, streak, total_xp, level, is_premium, subscription_tier, created_at`,
          [email, firebaseUid]
        );
        user = registerResult.rows[0];
        logger.info('User auto-registered via Firebase', { userId: user.id });
      } else {
        user = userResult.rows[0];
        
        // Update last login
        await query(
          'UPDATE users SET last_login_at = NOW() WHERE id = $1',
          [user.id]
        );
      }

      // Generate JWT token
      const token = this.generateToken({
        userId: user.id,
        email: user.email,
      });

      logger.info('User logged in', { userId: user.id, email });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          streak: user.streak,
          totalXp: user.total_xp,
          level: user.level,
          isPremium: user.is_premium,
          subscriptionTier: user.subscription_tier,
          createdAt: user.created_at,
        },
        token,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Get user profile by Firebase UID
   */
  async getUserProfileByFirebaseUid(firebaseUid: string): Promise<any> {
    const result = await query(
      `SELECT id, email, name, learning_language, streak, total_xp, level, 
              is_premium, subscription_tier, created_at, last_login_at
       FROM users WHERE firebase_uid = $1`,
      [firebaseUid]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    const user = result.rows[0];

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      learningLanguage: user.learning_language,
      streak: user.streak,
      totalXp: user.total_xp,
      level: user.level,
      isPremium: user.is_premium,
      subscriptionTier: user.subscription_tier,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at,
    };
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<any> {
    const result = await query(
      `SELECT id, email, name, learning_language, streak, total_xp, level, 
              is_premium, subscription_tier, created_at, last_login_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    const user = result.rows[0];

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      learningLanguage: user.learning_language,
      streak: user.streak,
      totalXp: user.total_xp,
      level: user.level,
      isPremium: user.is_premium,
      subscriptionTier: user.subscription_tier,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at,
    };
  }

  /**
   * Update user profile by Firebase UID
   */
  async updateUserProfileByFirebaseUid(firebaseUid: string, updates: any): Promise<any> {
    const { name, learningLanguage, photoUrl } = updates;

    const result = await query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           learning_language = COALESCE($2, learning_language),
           photo_url = COALESCE($3, photo_url),
           updated_at = NOW()
       WHERE firebase_uid = $4
       RETURNING id, email, name, learning_language, streak, total_xp, level, 
                 is_premium, subscription_tier`,
      [name || null, learningLanguage || null, photoUrl || null, firebaseUid]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    logger.info('User profile updated', { firebaseUid });

    return result.rows[0];
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: any): Promise<any> {
    const { name, learningLanguage, photoUrl } = updates;

    const result = await query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           learning_language = COALESCE($2, learning_language),
           photo_url = COALESCE($3, photo_url),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, email, name, learning_language, streak, total_xp, level, 
                 is_premium, subscription_tier`,
      [name || null, learningLanguage || null, photoUrl || null, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    logger.info('User profile updated', { userId });

    return result.rows[0];
  }

  /**
   * Generate JWT token
   */
  private generateToken(payload: { userId: string; email: string }): string {
    const jwtSecret = process.env.JWT_SECRET;
    const expiresIn: string = process.env.JWT_EXPIRES_IN || '7d';

    if (!jwtSecret) {
      throw new AppError('JWT secret not configured', 500, 'JWT_SECRET_MISSING');
    }

    const options: SignOptions = { expiresIn: expiresIn as any };
    return jwt.sign(payload, jwtSecret, options);
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): any {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new AppError('JWT secret not configured', 500, 'JWT_SECRET_MISSING');
    }

    try {
      return jwt.verify(token, jwtSecret);
    } catch (error) {
      throw new AppError('Invalid token', 401);
    }
  }
}

export const authService = new AuthService();
