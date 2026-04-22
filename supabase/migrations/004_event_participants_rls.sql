-- Database migration for event_participants
-- Run this in Supabase SQL Editor

-- Create table if not exists
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

-- Allow public read
CREATE POLICY "Public can view event participants" ON event_participants
  FOR SELECT USING (true);

-- Users can insert their own
CREATE POLICY "Users can create registrations" ON event_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own
CREATE POLICY "Users can update their registrations" ON event_participants
  FOR UPDATE USING (auth.uid() = user_id);