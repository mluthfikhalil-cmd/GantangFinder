-- ========================================
-- GantangFinder v7: Event Ratings & Reviews
-- Run in Supabase SQL Editor after v6
-- ========================================

-- =============================================
-- 1. Event Ratings Table
-- Allows participants to rate events they registered for
-- =============================================
CREATE TABLE IF NOT EXISTS event_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS event_ratings_event_id_idx ON event_ratings(event_id);
CREATE INDEX IF NOT EXISTS event_ratings_user_id_idx ON event_ratings(user_id);

-- =============================================
-- 2. RLS Policies (PERMISSIVE for custom auth)
-- =============================================
ALTER TABLE event_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for event_ratings" ON event_ratings;
CREATE POLICY "Enable all access for event_ratings" ON event_ratings FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- 3. Comments
-- =============================================
COMMENT ON TABLE event_ratings IS ' ratings (1-5) from participants for events they registered for';
COMMENT ON COLUMN event_ratings.rating IS 'Rating: 1-5 stars';

-- =============================================
-- 4. Update events table - add poster_url
-- =============================================
ALTER TABLE events ADD COLUMN IF NOT EXISTS poster_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS poster_public_id TEXT;