-- Create pronunciation_history table
CREATE TABLE IF NOT EXISTS pronunciation_history (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content
  target_text TEXT NOT NULL,
  audio_url VARCHAR(500),
  
  -- Results
  overall_score INT, -- 0-100
  word_scores JSONB, -- Array of {word, score} objects
  transcription TEXT,
  
  -- Metadata
  language VARCHAR(10) NOT NULL,
  duration_ms INT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT pronunciation_score_check CHECK (overall_score >= 0 AND overall_score <= 100)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pronunciation_user_id ON pronunciation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_pronunciation_created_at ON pronunciation_history(created_at);

COMMENT ON TABLE pronunciation_history IS 'User pronunciation practice history';
