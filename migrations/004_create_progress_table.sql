-- Create user_lesson_progress table
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  
  -- Progress
  status VARCHAR(20) DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  score INT DEFAULT 0, -- 0-100
  attempts INT DEFAULT 0,
  correct_answers INT DEFAULT 0,
  total_questions INT DEFAULT 0,
  
  -- XP earned
  xp_earned INT DEFAULT 0,
  
  -- Timestamps
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  last_attempted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  UNIQUE(user_id, lesson_id),
  CONSTRAINT progress_score_check CHECK (score >= 0 AND score <= 100)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_id ON user_lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_progress_status ON user_lesson_progress(status);
CREATE INDEX IF NOT EXISTS idx_progress_completed_at ON user_lesson_progress(completed_at);

-- Create trigger
DROP TRIGGER IF EXISTS update_progress_updated_at ON user_lesson_progress;
CREATE TRIGGER update_progress_updated_at
  BEFORE UPDATE ON user_lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE user_lesson_progress IS 'User progress tracking for lessons';
