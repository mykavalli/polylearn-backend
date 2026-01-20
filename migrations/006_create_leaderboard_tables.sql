-- Create leaderboard tables

-- Weekly leaderboard
CREATE TABLE IF NOT EXISTS leaderboard_weekly (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  total_xp INT DEFAULT 0,
  lessons_completed INT DEFAULT 0,
  rank INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, week_start_date)
);

-- All-time leaderboard (can use users.total_xp directly, but this is for caching)
CREATE TABLE IF NOT EXISTS leaderboard_alltime (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  total_xp INT DEFAULT 0,
  rank INT,
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_weekly_week ON leaderboard_weekly(week_start_date);
CREATE INDEX IF NOT EXISTS idx_leaderboard_weekly_xp ON leaderboard_weekly(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_alltime_xp ON leaderboard_alltime(total_xp DESC);

-- Create triggers
DROP TRIGGER IF EXISTS update_leaderboard_weekly_updated_at ON leaderboard_weekly;
CREATE TRIGGER update_leaderboard_weekly_updated_at
  BEFORE UPDATE ON leaderboard_weekly
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leaderboard_alltime_updated_at ON leaderboard_alltime;
CREATE TRIGGER update_leaderboard_alltime_updated_at
  BEFORE UPDATE ON leaderboard_alltime
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE leaderboard_weekly IS 'Weekly leaderboard rankings';
COMMENT ON TABLE leaderboard_alltime IS 'All-time leaderboard rankings cache';
