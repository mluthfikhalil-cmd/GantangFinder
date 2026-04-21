-- GantangFinder v4: Event Participation System
-- Run in Supabase SQL Editor after 003_birds.sql

-- =============================================
-- 1. Event Participants table
-- Tracks which bird registers for which event
-- Status: pending_payment (paid) | registered (free) | confirmed (admin approved) | cancelled
-- =============================================
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  bird_id UUID NOT NULL REFERENCES birds(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  bird_name TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_date TIMESTAMPTZ,
  event_kota TEXT,
  event_tingkat TEXT,
  event_jenis_burung TEXT,
  is_paid_event BOOLEAN DEFAULT FALSE,
  biaya_daftar INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'free' CHECK (payment_status IN ('free', 'pending_payment', 'paid', 'confirmed', 'rejected', 'cancelled')),
  payment_proof_url TEXT,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  UNIQUE(event_id, bird_id)
);

CREATE INDEX IF NOT EXISTS event_participants_event_id_idx ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS event_participants_bird_id_idx ON event_participants(bird_id);
CREATE INDEX IF NOT EXISTS event_participants_owner_id_idx ON event_participants(owner_id);
CREATE INDEX IF NOT EXISTS event_participants_payment_status_idx ON event_participants(payment_status);

-- =============================================
-- 2. RLS Policies
-- =============================================
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- Anyone can view participants (for public event participant lists)
CREATE POLICY "Anyone can view event_participants" ON event_participants FOR SELECT USING (true);

-- Participants can register themselves (insert)
CREATE POLICY "Participants can register for events" ON event_participants
  FOR INSERT WITH CHECK (true);

-- Participants can view their own registrations
CREATE POLICY "Participants can view own registrations" ON event_participants
  FOR SELECT USING (auth.uid() = owner_id);

-- Participants can cancel their own registrations
CREATE POLICY "Participants can cancel own registrations" ON event_participants
  FOR UPDATE USING (auth.uid() = owner_id);

-- =============================================
-- 3. Comments
-- =============================================
COMMENT ON TABLE event_participants IS 'Tracks bird registration for events. For free events: status=registered. For paid events: pending_payment -> paid -> confirmed.';
COMMENT ON COLUMN event_participants.payment_status IS 'free | pending_payment | paid | confirmed | rejected | cancelled';
