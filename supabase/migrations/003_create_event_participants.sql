-- Create event_participants table for registration system
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  bird_id UUID NOT NULL REFERENCES birds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, bird_id, user_id)
);

-- Enable RLS
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- Policies for participants
CREATE POLICY "Participants can view event registrations" ON event_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own registrations" ON event_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own registrations" ON event_participants
  FOR DELETE USING (auth.uid() = user_id);

-- Organizer can update status
CREATE POLICY "Organizers can update participant status" ON event_participants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_participants.event_id
      AND events.organizer_id = auth.uid()
    )
  );

-- Add foreign key for events (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'event_participants_event_id_fkey'
  ) THEN
    ALTER TABLE event_participants 
    ADD CONSTRAINT event_participants_event_id_fkey 
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key for birds (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'event_participants_bird_id_fkey'
  ) THEN
    ALTER TABLE event_participants 
    ADD CONSTRAINT event_participants_bird_id_fkey 
    FOREIGN KEY (bird_id) REFERENCES birds(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key for user (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'event_participants_user_id_fkey'
  ) THEN
    ALTER TABLE event_participants 
    ADD CONSTRAINT event_participants_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_status ON event_participants(status);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS updated_at_event_participants ON event_participants;
CREATE TRIGGER updated_at_event_participants
  BEFORE UPDATE ON event_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();