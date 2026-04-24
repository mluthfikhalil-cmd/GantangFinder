-- Add organizer_id column to events table for linking events to users
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_id UUID REFERENCES users(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);

-- Update existing events that match user names to link them
-- This is a one-time migration for existing data
-- UPDATE events e
-- SET organizer_id = u.id
-- FROM users u
-- WHERE e.penyelenggara = u.nama_lengkap
--   AND e.organizer_id IS NULL;