-- GantangFinder v3: Bird Profiles + Leaderboard System
-- Run in Supabase SQL Editor after 002_users.sql

-- =============================================
-- 1. Birds table
-- =============================================
CREATE TABLE IF NOT EXISTS birds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_burung TEXT NOT NULL,
  jenis_burung TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS birds_owner_id_idx ON birds(owner_id);
CREATE INDEX IF NOT EXISTS birds_jenis_burung_idx ON birds(jenis_burung);

-- =============================================
-- 2. Bird Events (participation + ranking log)
-- =============================================
CREATE TABLE IF NOT EXISTS bird_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bird_id UUID NOT NULL REFERENCES birds(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  event_kota TEXT,
  event_jenis_lomba TEXT,
  event_jenis_burung TEXT,
  event_tingkat TEXT DEFAULT 'lokal' CHECK (event_tingkat IN ('lokal', 'kecamatan', 'kabupaten', 'provincial', 'nasional', 'internasional')),
  kelas TEXT,
  posisi INTEGER CHECK (posisi >= 1 AND posisi <= 100),
  is_peserta_only BOOLEAN DEFAULT FALSE,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bird_id, event_id, kelas)
);

CREATE INDEX IF NOT EXISTS bird_events_bird_id_idx ON bird_events(bird_id);
CREATE INDEX IF NOT EXISTS bird_events_event_id_idx ON bird_events(event_id);
CREATE INDEX IF NOT EXISTS bird_events_event_date_idx ON bird_events(event_date DESC);

-- =============================================
-- 3. Points calculation reference
-- =============================================
-- Base points:
--   posisi 1 = 100 pts
--   posisi 2 = 75 pts
--   posisi 3 = 50 pts
--   participant (no ranking) = 10 pts
--
-- Multipliers by event_tingkat:
--   lokal        = 1.0x
--   kecamatan     = 1.1x
--   kabupaten     = 1.2x
--   provincial    = 1.5x
--   nasional      = 2.0x
--   internasional = 3.0x
--
-- Final points = base_points * multiplier (rounded to nearest integer)

-- =============================================
-- 4. Helper function to calculate points
-- =============================================
CREATE OR REPLACE FUNCTION calculate_bird_points(
  p_posisi INTEGER,
  p_tingkat TEXT,
  p_is_peserta_only BOOLEAN DEFAULT FALSE
) RETURNS INTEGER AS $$
DECLARE
  base_pts INTEGER;
  multiplier FLOAT;
BEGIN
  IF p_is_peserta_only THEN
    base_pts := 10;
  ELSIF p_posisi = 1 THEN
    base_pts := 100;
  ELSIF p_posisi = 2 THEN
    base_pts := 75;
  ELSIF p_posisi = 3 THEN
    base_pts := 50;
  ELSIF p_posisi IS NOT NULL AND p_posisi > 3 THEN
    base_pts := 10;
  ELSE
    base_pts := 10;
  END IF;

  CASE p_tingkat
    WHEN 'lokal'        THEN multiplier := 1.0;
    WHEN 'kecamatan'    THEN multiplier := 1.1;
    WHEN 'kabupaten'    THEN multiplier := 1.2;
    WHEN 'provincial'   THEN multiplier := 1.5;
    WHEN 'nasional'     THEN multiplier := 2.0;
    WHEN 'internasional' THEN multiplier := 3.0;
    ELSE multiplier := 1.0;
  END CASE;

  RETURN ROUND(base_pts * multiplier);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================
-- 5. RLS Policies
-- =============================================
ALTER TABLE birds ENABLE ROW LEVEL SECURITY;
ALTER TABLE bird_events ENABLE ROW LEVEL SECURITY;

-- Everyone can view birds (for leaderboard)
CREATE POLICY "Anyone can view birds" ON birds FOR SELECT USING (true);

-- Users can manage their own birds
CREATE POLICY "Users can manage own birds" ON birds
  FOR ALL USING (auth.uid() = owner_id);

-- Everyone can view bird events (for leaderboard)
CREATE POLICY "Anyone can view bird_events" ON bird_events FOR SELECT USING (true);

-- Users can insert their own bird events (via organizer/admin)
CREATE POLICY "Users can insert own bird_events" ON bird_events
  FOR INSERT WITH CHECK (true);

-- Note: In production, bird_events entries are created by admin/organizer
-- when inputting competition results. This policy allows that flow.
