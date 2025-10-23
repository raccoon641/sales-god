-- Sales God Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'rep',
  team_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  manager_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recordings table
CREATE TABLE IF NOT EXISTS recordings (
  id SERIAL PRIMARY KEY,
  recording_id UUID UNIQUE NOT NULL,
  user_id VARCHAR(255) REFERENCES users(user_id),
  meeting_code VARCHAR(255),
  meeting_title VARCHAR(500),
  meeting_url TEXT,
  duration INTEGER, -- in seconds
  audio_file_path TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transcription segments table
CREATE TABLE IF NOT EXISTS transcription_segments (
  id SERIAL PRIMARY KEY,
  recording_id UUID REFERENCES recordings(recording_id) ON DELETE CASCADE,
  segment_index INTEGER NOT NULL,
  text TEXT NOT NULL,
  speaker VARCHAR(50),
  timestamp BIGINT,
  confidence DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Metrics table
CREATE TABLE IF NOT EXISTS metrics (
  id SERIAL PRIMARY KEY,
  recording_id UUID REFERENCES recordings(recording_id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10, 2),
  metric_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Call analysis table
CREATE TABLE IF NOT EXISTS call_analysis (
  id SERIAL PRIMARY KEY,
  recording_id UUID UNIQUE REFERENCES recordings(recording_id) ON DELETE CASCADE,
  
  -- Talk metrics
  total_words INTEGER,
  rep_words INTEGER,
  prospect_words INTEGER,
  talk_ratio DECIMAL(5, 2),
  
  -- Engagement metrics
  questions_asked INTEGER,
  filler_words_count INTEGER,
  average_speaking_pace DECIMAL(5, 2),
  
  -- Sentiment
  overall_sentiment VARCHAR(50),
  sentiment_score DECIMAL(3, 2),
  
  -- Key insights
  topics JSONB,
  objections JSONB,
  next_steps JSONB,
  
  -- Scores
  overall_score DECIMAL(5, 2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_recordings_user_id ON recordings(user_id);
CREATE INDEX idx_recordings_created_at ON recordings(created_at);
CREATE INDEX idx_transcription_recording_id ON transcription_segments(recording_id);
CREATE INDEX idx_metrics_recording_id ON metrics(recording_id);
CREATE INDEX idx_call_analysis_recording_id ON call_analysis(recording_id);

-- Add foreign key for team_id in users
ALTER TABLE users 
  ADD CONSTRAINT fk_users_team 
  FOREIGN KEY (team_id) 
  REFERENCES teams(id);

