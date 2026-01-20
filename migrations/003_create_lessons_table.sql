-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  language VARCHAR(10) NOT NULL, -- 'en', 'ko', 'ja'
  topic VARCHAR(50) NOT NULL, -- 'greetings', 'numbers', 'colors'
  title VARCHAR(100) NOT NULL,
  description TEXT,
  difficulty VARCHAR(20) DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  
  -- XP reward
  xp_reward INT DEFAULT 50,
  
  -- Content (JSON)
  exercises JSONB NOT NULL, -- Array of exercise objects
  
  -- Order
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lessons_language ON lessons(language);
CREATE INDEX IF NOT EXISTS idx_lessons_topic ON lessons(topic);
CREATE INDEX IF NOT EXISTS idx_lessons_difficulty ON lessons(difficulty);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(order_index);

-- Create trigger
DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE lessons IS 'Language learning lessons and exercises';
COMMENT ON COLUMN lessons.exercises IS 'JSON array of exercise objects with type, question, answer, etc.';
