-- Ensure tags column exists in tasks table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'tags') THEN
        ALTER TABLE tasks ADD COLUMN tags text[] DEFAULT '{}';
    END IF;
END $$;

-- Update any null tags to empty array
UPDATE tasks SET tags = '{}' WHERE tags IS NULL;
