-- Add avatar_url to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Add gender to profiles table (optional, but useful for avatar selection)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender text;
