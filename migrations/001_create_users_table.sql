-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  firebase_uid VARCHAR(128) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  photo_url VARCHAR(500),
  learning_language VARCHAR(10) DEFAULT 'en',
  native_language VARCHAR(10) DEFAULT 'vi',
  
  -- Gamification
  streak INT DEFAULT 0,
  total_xp INT DEFAULT 0,
  level INT DEFAULT 1,
  daily_goal INT DEFAULT 3,
  last_activity_date DATE,
  
  -- Subscription
  is_premium BOOLEAN DEFAULT FALSE,
  subscription_tier VARCHAR(20) DEFAULT 'free', -- 'free', 'plus', 'pro'
  subscription_expires_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE users IS 'User accounts and profiles';
COMMENT ON COLUMN users.firebase_uid IS 'Firebase Authentication UID';
COMMENT ON COLUMN users.streak IS 'Current daily streak count';
COMMENT ON COLUMN users.total_xp IS 'Total experience points earned';
COMMENT ON COLUMN users.level IS 'Current user level';
COMMENT ON COLUMN users.subscription_tier IS 'Subscription tier: free, plus, or pro';
