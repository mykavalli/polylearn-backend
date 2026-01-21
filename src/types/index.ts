export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export interface UserProfile {
  id: string;
  firebaseUid: string;
  email: string;
  displayName?: string;
  avatar?: string;
  learningLanguage?: string;
  streakDays: number;
  lastActivityDate?: Date;
  subscriptionTier: 'free' | 'plus' | 'pro';
  subscriptionExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  firebaseUid: string;
  email: string;
  displayName?: string;
}

export interface UpdateUserInput {
  displayName?: string;
  avatar?: string;
  learningLanguage?: string;
}

export interface JwtPayload {
  userId: string;
  firebaseUid: string;
  email: string;
}

export interface SubscriptionStatus {
  tier: 'free' | 'plus' | 'pro';
  expiresAt?: Date;
  autoRenew: boolean;
}
