import { Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authService } from '../services/authService';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export class UserController {
  /**
   * Get user profile
   * GET /api/v1/user/profile
   */
  getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.uid) {
      throw new AppError('User not authenticated', 401);
    }

    const profile = await authService.getUserProfileByFirebaseUid(req.user.uid);

    res.status(200).json({
      success: true,
      data: profile,
    });
  });

  /**
   * Update user profile
   * PUT /api/v1/user/profile
   */
  updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.uid) {
      throw new AppError('User not authenticated', 401);
    }

    const { name, learningLanguage, photoUrl } = req.body;

    const updatedProfile = await authService.updateUserProfileByFirebaseUid(
      req.user.uid,
      { name, learningLanguage, photoUrl }
    );

    res.status(200).json({
      success: true,
      data: updatedProfile,
    });
  });

  /**
   * Delete user account
   * DELETE /api/v1/user/account
   */
  deleteAccount = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.uid) {
      throw new AppError('User not authenticated', 401);
    }

    // TODO: Implement account deletion
    // - Delete user from database
    // - Delete Firebase account
    // - Delete associated data (pets, progress, etc.)

    res.status(200).json({
      success: true,
      message: 'Account deletion - to be implemented',
    });
  });
}

export const userController = new UserController();
