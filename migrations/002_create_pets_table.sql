-- Create pets table
CREATE TABLE IF NOT EXISTS pets (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50),
  species VARCHAR(50) NOT NULL, -- 'cat', 'dog', 'dragon', etc.
  variant VARCHAR(20) DEFAULT 'normal', -- 'normal', 'shiny', 'special'
  stage INT DEFAULT 1, -- 1: egg, 2: baby, 3: teen, 4: adult
  
  -- Stats
  level INT DEFAULT 1,
  exp INT DEFAULT 0,
  happiness INT DEFAULT 100,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_fed_at TIMESTAMP,
  last_played_at TIMESTAMP,
  
  -- Constraints
  CONSTRAINT pets_stage_check CHECK (stage >= 1 AND stage <= 4),
  CONSTRAINT pets_happiness_check CHECK (happiness >= 0 AND happiness <= 100)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);
CREATE INDEX IF NOT EXISTS idx_pets_species ON pets(species);

-- Create trigger for pets table
DROP TRIGGER IF EXISTS update_pets_updated_at ON pets;
CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE pets IS 'User pet companions';
COMMENT ON COLUMN pets.stage IS 'Evolution stage: 1=egg, 2=baby, 3=teen, 4=adult';
