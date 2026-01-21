import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { logger } from '../config/logger';

const userService = new UserService();

/**
 * POST /api/v1/auth/register
 * Register new user (verify Firebase token, create user in DB)
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { displayName } = req.body;
    const firebaseUser = req.user!;

    // Check if user already exists
    const exists = await userService.userExists(firebaseUser.uid);
    
    if (exists) {
      const user = await userService.getUserByFirebaseUid(firebaseUser.uid);
      res.json({
        success: true,
        data: {
          user,
          message: 'User already registered',
        },
      });
      return;
    }

    // Create new user
    const user = await userService.createUser({
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: displayName || firebaseUser.decodedToken.name,
    });

    logger.info(`New user registered: ${user.id}`);

    res.status(201).json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    logger.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTER_ERROR',
        message: 'Failed to register user',
        details: error.message,
      },
    });
  }
}

/**
 * POST /api/v1/auth/login
 * Login user (verify Firebase token, return user data)
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const firebaseUser = req.user!;

    // Get or create user
    let user;
    const exists = await userService.userExists(firebaseUser.uid);
    
    if (!exists) {
      // Auto-register if user doesn't exist
      user = await userService.createUser({
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.decodedToken.name,
      });
      logger.info(`Auto-registered user on login: ${user.id}`);
    } else {
      user = await userService.getUserByFirebaseUid(firebaseUser.uid);
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_ERROR',
        message: 'Failed to login',
        details: error.message,
      },
    });
  }
}

/**
 * POST /api/v1/auth/refresh
 * Refresh Firebase token (handled client-side, this is placeholder)
 */
export async function refresh(_req: Request, res: Response): Promise<void> {
  try {
    // Firebase handles token refresh on client side
    // This endpoint can be used for custom JWT if needed
    res.json({
      success: true,
      data: {
        message: 'Token refresh handled by Firebase client SDK',
      },
    });
  } catch (error: any) {
    logger.error('Refresh error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REFRESH_ERROR',
        message: 'Failed to refresh token',
      },
    });
  }
}

/**
 * GET /api/v1/user/profile
 * Get current user profile
 */
export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const firebaseUser = req.user!;
    const user = await userService.getUserByFirebaseUid(firebaseUser.uid);

    res.json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    logger.error('Get profile error:', error);
    
    if (error.message === 'User not found') {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'GET_PROFILE_ERROR',
        message: 'Failed to get profile',
      },
    });
  }
}

/**
 * PUT /api/v1/user/profile
 * Update user profile
 */
export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    const firebaseUser = req.user!;
    const { displayName, avatar, learningLanguage } = req.body;

    const user = await userService.updateUser(firebaseUser.uid, {
      displayName,
      avatar,
      learningLanguage,
    });

    res.json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_PROFILE_ERROR',
        message: 'Failed to update profile',
      },
    });
  }
}
