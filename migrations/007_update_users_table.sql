-- Add missing columns to users table to match backend expectations

-- Add photo_url (alias for avatar_url or separate column)
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500);

-- Add streak (rename from daily_streak or add new)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'daily_streak') THEN
        -- Rename daily_streak to streak
        ALTER TABLE users RENAME COLUMN daily_streak TO streak;
    ELSE
        ALTER TABLE users ADD COLUMN IF NOT EXISTS streak INT DEFAULT 0;
    END IF;
END$$;

-- Add total_xp (rename from total_exp or add new)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'total_exp') THEN
        ALTER TABLE users RENAME COLUMN total_exp TO total_xp;
    ELSE
        ALTER TABLE users ADD COLUMN IF NOT EXISTS total_xp INT DEFAULT 0;
    END IF;
END$$;

-- Add missing columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INT DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_goal INT DEFAULT 3;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update photo_url from avatar_url if empty
UPDATE users SET photo_url = avatar_url WHERE photo_url IS NULL AND avatar_url IS NOT NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_users_streak ON users(streak);
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level);

-- Add comments
COMMENT ON COLUMN users.streak IS 'Current daily streak count';
COMMENT ON COLUMN users.total_xp IS 'Total experience points earned';
COMMENT ON COLUMN users.level IS 'Current user level (1-100)';
COMMENT ON COLUMN users.is_premium IS 'Premium subscription status';

COMMIT;
