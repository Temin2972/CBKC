-- Add topic column to posts table
-- Topics: 'mental' (Tâm lý), 'others' (Ngoài lề)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS topic VARCHAR(20) DEFAULT 'mental';

-- Add constraint for valid topics
ALTER TABLE posts ADD CONSTRAINT posts_topic_check 
  CHECK (topic IN ('mental', 'others'));

-- Add topic column to pending_content table
ALTER TABLE pending_content ADD COLUMN IF NOT EXISTS topic VARCHAR(20) DEFAULT 'mental';

-- Add constraint for valid topics in pending_content
ALTER TABLE pending_content ADD CONSTRAINT pending_content_topic_check 
  CHECK (topic IN ('mental', 'others'));

-- Create index for topic filtering
CREATE INDEX IF NOT EXISTS idx_posts_topic ON posts(topic);