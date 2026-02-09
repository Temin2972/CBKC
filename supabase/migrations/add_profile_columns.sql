-- =====================================================
-- ADD PROFILE COLUMNS TO USERS TABLE
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add profile-related columns to the users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Make sure avatar_url exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update RLS policy to allow users to update their own profile
DROP POLICY IF EXISTS "users_update_own" ON users;

CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Verify the columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;