/*
  # Add tags column to notes table

  1. Changes
    - Add `tags` column to `notes` table as text array
    - Set default value to empty array
    - Update existing notes to have empty tags array

  2. Security
    - No RLS changes needed as the column is part of existing table with RLS enabled
*/

-- Add tags column to notes table
ALTER TABLE notes ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Update existing notes to have empty tags array if null
UPDATE notes SET tags = '{}' WHERE tags IS NULL;