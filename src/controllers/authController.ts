import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authService } from '../services/authService';
import { AppError } from '../middleware/errorHandler';

export class AuthController {
  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, name, firebaseUid } = req.body;

    if (!email || !firebaseUid) {
      throw new AppError('Email and Firebase UID are required', 400);
    }

    const result = await authService.register({ email, name, firebaseUid });

    res.status(201).json({
      success: true,
      data: result,
    });
  });

  /**
   * Login with Firebase token
   * POST /api/v1/auth/login
   */
  loginWithFirebase = asyncHandler(async (req: Request, res: Response) => {
    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      throw new AppError('Firebase token is required', 400);
    }

    const result = await authService.loginWithFirebase(firebaseToken);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * Verify token
   * POST /api/v1/auth/verify
   */
  verifyToken = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) {
      throw new AppError('Token is required', 400);
    }

    const decoded = authService.verifyToken(token);

    res.status(200).json({
      success: true,
      data: {
        valid: true,
        decoded,
      },
    });
  });

  /**
   * Refresh token
   * POST /api/v1/auth/refresh
   */
  refreshToken = asyncHandler(async (_req: Request, res: Response) => {
    // For now, just return success - implement proper refresh token logic later
    res.status(200).json({
      success: true,
      message: 'Token refresh endpoint - to be implemented',
    });
  });

  /**
   * Logout
   * POST /api/v1/auth/logout
   */
  logout = asyncHandler(async (_req: Request, res: Response) => {
    // Client-side handles token removal
    // Optional: Add token to blacklist in Redis
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  });
}

export const authController = new AuthController();
