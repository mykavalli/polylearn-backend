import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { logger } from '../config/logger';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header'
        }
      });
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);
    
    // Attach user info to request (matches express.d.ts interface)
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      decodedToken: decodedToken
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token'
      }
    });
  }
};

// Export as authMiddleware for consistency
export const authMiddleware = authenticate;
export default authenticate;
