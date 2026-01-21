import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { UserService } from '../services/userService';
import { AppError } from '../middleware/errorHandler';

const userService = new UserService();

export class UserController {
  /**
   * Get user profile
   * GET /api/v1/user/profile
   */
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.uid) {
      throw new AppError('User not authenticated', 401);
    }

    const profile = await userService.getUserByFirebaseUid(req.user.uid);

    res.status(200).json({
      success: true,
      data: profile,
    });
  });

  /**
   * Update user profile
   * PUT /api/v1/user/profile
   */
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.uid) {
      throw new AppError('User not authenticated', 401);
    }

    const { name, learningLanguage, photoUrl } = req.body;

    const user = await userService.getUserByFirebaseUid(req.user.uid);
    
    const updatedProfile = await userService.updateUser(user.id, {
      displayName: name,
      learningLanguage,
      // photoUrl not in current schema, skip for now
    });

    res.status(200).json({
      success: true,
      data: updatedProfile,
    });
  });

  /**
   * Delete user account
   * DELETE /api/v1/user/account
   */
  deleteAccount = asyncHandler(async (req: Request, res: Response) => {
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
