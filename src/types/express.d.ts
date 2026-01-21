import { DecodedIdToken } from 'firebase-admin/auth';

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        decodedToken: DecodedIdToken;
      };
      userId?: string;
    }
  }
}

export {};
