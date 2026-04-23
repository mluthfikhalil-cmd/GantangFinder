-- ========================================
-- GantangFinder Migration Script
-- Run all in Supabase SQL Editor
-- ========================================

-- 1. Add poster_url to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS poster_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS poster_public_id TEXT;

-- 2. Create event_ratings table
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

CREATE INDEX IF NOT EXISTS event_ratings_event_id_idx ON event_ratings(event_id);
CREATE INDEX IF NOT EXISTS event_ratings_user_id_idx ON event_ratings(user_id);

ALTER TABLE event_ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for event_ratings" ON event_ratings;
CREATE POLICY "Enable all access for event_ratings" ON event_ratings FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE event_ratings IS 'Ratings (1-5 stars) from participants for events';
COMMENT ON COLUMN event_ratings.rating IS 'Rating: 1-5 stars';

-- 3. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  instagram TEXT,
  facebook TEXT,
  youtube TEXT,
  bird_interests TEXT[] DEFAULT ARRAY['kicau'],
  kota_preferensi TEXT,
  total_events_registered INTEGER DEFAULT 0,
  total_events_won INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON user_profiles(user_id);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for user_profiles" ON user_profiles;
CREATE POLICY "Enable all access for user_profiles" ON user_profiles FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE user_profiles IS 'Extended user profile: bio, social links, preferences';

-- 4. Create event_reminders table
CREATE TABLE IF NOT EXISTS event_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reminder_type TEXT DEFAULT 'registration_reminder' CHECK (reminder_type IN ('registration_reminder', 'event_reminder', 'result_announcement')),
  reminder_date TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS event_reminders_event_id_idx ON event_reminders(event_id);
CREATE INDEX IF NOT EXISTS event_reminders_user_id_idx ON event_reminders(user_id);
CREATE INDEX IF NOT EXISTS event_reminders_reminder_date_idx ON event_reminders(reminder_date) WHERE status = 'pending';

ALTER TABLE event_reminders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for event_reminders" ON event_reminders;
CREATE POLICY "Enable all access for event_reminders" ON event_reminders FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE event_reminders IS 'Scheduled reminders for event registrations';

-- Done!
SELECT 'Migration complete!' as result;