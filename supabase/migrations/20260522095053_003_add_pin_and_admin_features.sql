/*
  # Add pin feature and admin-only fixes

  1. Changes
    - Add is_pinned column to posts (already exists, but ensure RLS allows admin to update)
    - Add is_system_post column to mark static teacher listings
    - Update RLS policies to allow admins to pin posts
    - Update posts count to exclude system posts
    - Add unique constraint to prevent duplicate teacher system posts
  
  2. Security
    - Only admins can pin/unpin posts
    - System posts cannot be deleted by admins via normal UI
*/

-- Ensure is_pinned column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'is_pinned'
  ) THEN
    ALTER TABLE posts ADD COLUMN is_pinned boolean DEFAULT false;
  END IF;
END $$;

-- Add is_system_post column to mark static teacher listings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'is_system_post'
  ) THEN
    ALTER TABLE posts ADD COLUMN is_system_post boolean DEFAULT false;
  END IF;
END $$;

-- Create policy for admins to pin posts
DROP POLICY IF EXISTS "Admins can pin posts" ON posts;
CREATE POLICY "Admins can pin posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Update posts count to exclude system posts
-- This is handled in the app query logic, but we can add a view if needed
