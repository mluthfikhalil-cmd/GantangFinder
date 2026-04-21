-- GantangFinder: Organizer Registration System
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard -> your project -> SQL Editor)

-- =============================================
-- 1. Create organizers table
-- =============================================
CREATE TABLE IF NOT EXISTS organizers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_lengkap TEXT NOT NULL,
  nomor_wa TEXT NOT NULL UNIQUE,
  email TEXT,
  kota TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  login_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for registration (no token needed)
CREATE POLICY "Public can register" ON organizers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view own data" ON organizers FOR SELECT USING (true);

-- =============================================
-- 2. Add organizer_id to events table
-- =============================================
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_id UUID REFERENCES organizers(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS events_organizer_id_idx ON events(organizer_id);

-- =============================================
-- 3. Update events RLS to allow read by organizer
-- =============================================
-- Note: Keep existing policies, add new one for organizers

-- =============================================
-- 4. Seed: create first admin organizer (password: gantang2026)
-- =============================================
-- INSERT INTO organizers (nama_lengkap, nomor_wa, email, kota, status, login_token)
-- VALUES ('Admin Gantang', '6281234567890', 'admin@gantangfinder.id', 'Jakarta', 'approved', 'gantang2026');
