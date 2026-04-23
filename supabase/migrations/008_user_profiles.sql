-- ========================================
-- GantangFinder v8: User Profiles Extension
-- Run in Supabase SQL Editor after v7
-- ========================================

-- =============================================
-- 1. User Profiles Table (extended)
-- Stores additional profile info beyond users table
-- =============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  -- Basic info (mirrors users, for display)
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  -- Additional social
  instagram TEXT,
  facebook TEXT,
  youtube TEXT,
  -- Bird interests
  Bird_interests TEXT[] DEFAULT ARRAY['kicau'],
  -- Location preferences
  kota_preferensi TEXT,
  -- Stats (auto-calculated)
  total_events_registered INTEGER DEFAULT 0,
  total_events_won INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON user_profiles(user_id);

-- =============================================
-- 2. RLS Policies
-- =============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for user_profiles" ON user_profiles;
CREATE POLICY "Enable all access for user_profiles" ON user_profiles FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- 3. Comments
-- =============================================
COMMENT ON TABLE user_profiles IS 'Extended user profile: bio, social links, preferences';
COMMENT ON COLUMN user_profiles.Bird_interests IS 'Bird types user interested in: kicau, merpati, rooster,邮局';

-- =============================================
-- 4. Event Reminders Table
-- For push notification / reminder system
-- =============================================
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

-- Index
CREATE INDEX IF NOT EXISTS event_reminders_event_id_idx ON event_reminders(event_id);
CREATE INDEX IF NOT EXISTS event_reminders_user_id_idx ON event_reminders(user_id);
CREATE INDEX IF NOT EXISTS event_reminders_reminder_date_idx ON event_reminders(reminder_date) WHERE status = 'pending';

-- RLS
ALTER TABLE event_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for event_reminders" ON event_reminders;
CREATE POLICY "Enable all access for event_reminders" ON event_reminders FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE event_reminders IS 'Scheduled reminders for event registrations';
COMMENT ON COLUMN event_reminders.reminder_type IS 'registration_reminder (3 days before), event_reminder (day of), result_announcement';