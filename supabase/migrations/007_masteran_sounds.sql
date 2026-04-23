-- =============================================
-- GantangFinder: Masteran Sounds Library
-- =============================================

-- 1. Create masteran_sounds table
CREATE TABLE IF NOT EXISTS masteran_sounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Sound Info
  title TEXT NOT NULL,
  description TEXT,
  bird_type TEXT NOT NULL,
  
  -- Audio
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER,
  
  -- Stats
  play_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  
  -- Attribution
  uploaded_by TEXT,
  source TEXT, -- 'admin', 'community'
  
  -- Status
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_masteran_bird_type ON masteran_sounds(bird_type);
CREATE INDEX IF NOT EXISTS idx_masteran_play_count ON masteran_sounds(play_count DESC);
CREATE INDEX IF NOT EXISTS idx_masteran_is_active ON masteran_sounds(is_active);
CREATE INDEX IF NOT EXISTS idx_masteran_created_at ON masteran_sounds(created_at DESC);

-- 3. Enable RLS
ALTER TABLE masteran_sounds ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Public read: everyone can view active sounds
CREATE POLICY "Public can view active masteran"
  ON masteran_sounds
  FOR SELECT
  USING (is_active = true);

-- Admin write: only authenticated admin can insert/update/delete
CREATE POLICY "Admin can insert masteran"
  ON masteran_sounds
  FOR INSERT
  WITH CHECK (true); -- TODO: add auth check based on user role

CREATE POLICY "Admin can update masteran"
  ON masteran_sounds
  FOR UPDATE
  USING (true); -- TODO: add auth check

CREATE POLICY "Admin can delete masteran"
  ON masteran_sounds
  FOR DELETE
  USING (true); -- TODO: add auth check

-- 5. Play count increment function
CREATE OR REPLACE FUNCTION increment_masteran_play_count(sound_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE masteran_sounds
  SET play_count = play_count + 1
  WHERE id = sound_id;
END;
$$;

-- 6. Download count increment function
CREATE OR REPLACE FUNCTION increment_masteran_download_count(sound_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE masteran_sounds
  SET download_count = download_count + 1
  WHERE id = sound_id;
END;
$$;

-- 7. Insert sample masteran sounds
INSERT INTO masteran_sounds (title, description, bird_type, audio_url, duration_seconds, source) VALUES
  (
    'Masteran SRDC Murai Batu Gacor Full',
    'Suara SRDC gacor untuk latihan murai batu. Kualitas audio HQ.',
    'Murai Batu',
    'https://example.com/audio/srdc-murai-full.mp3',
    204,
    'admin'
  ),
  (
    'Masteran Cucak Rowo Jawara 2026',
    'Masteran cucak rowo jawara dari lomba nasional. Cocok untukEF.',
    'Cucak Rowo',
    'https://example.com/audio/cucak-rowo-jawara.mp3',
    312,
    'admin'
  ),
  (
    'Lovebird Nias Gacor Super',
    'Masteran lovebird nias gacor super untuk lovebird mania.',
    'Lovebird',
    'https://example.com/audio/lb-nias-gacor.mp3',
    180,
    'admin'
  ),
  (
    'Kenari F1 Super Gacor',
    'Masteran kenari F1 super gacor untuk kenari lokal.',
    'Kenari',
    'https://example.com/audio/kenari-f1-gacor.mp3',
    240,
    'admin'
  ),
  (
    'Anis Merah Prenjak Gacor',
    'Kombinasi anis merah dan prenjak gacor. Cocok untuk latber.',
    'Anis Merah',
    'https://example.com/audio/anis-prenjak-gacor.mp3',
    195,
    'admin'
  ),
  (
    'Cendet Jawara Pak Togu',
    'Masteran cendet jawara dari Pak Togu. Kualitas bagus.',
    'Cendet',
    'https://example.com/audio/cendet-jawara.mp3',
    267,
    'admin'
  ),
  (
    'Pleci Gacor Maksimal',
    'Masteran pleci gacor maksimal untuk pleci mania.',
    'Pleci',
    'https://example.com/audio/pleci-gacor.mp3',
    158,
    'admin'
  ),
  (
    'Kolibri Ninja Gacor',
    'Masteran kolibri ninja gacor super. Jarang dan berkualitas.',
    'Kolibri',
    'https://example.com/audio/kolibri-ninja.mp3',
    142,
    'admin'
  ),
  (
    'Murai Batu Borneo Super BF',
    'Masteran MB Borneo Super BF dari Kalimantan.',
    'Murai Batu',
    'https://example.com/audio/mb-borneo-bf.mp3',
    289,
    'admin'
  ),
  (
    'Lovebird AF Agat Joss',
    'Masteran lovebird AF Agat Joss untuk kontes.',
    'Lovebird',
    'https://example.com/audio/lb-af-agat.mp3',
    215,
    'admin'
  ),
  (
    'Trucukan Gacor Jawara',
    'Masteran trucukan gacor jawara dari lomba.',
    'Trucukan',
    'https://example.com/audio/trucukan-jawara.mp3',
    178,
    'admin'
  ),
  (
    'Cucak Hijau Gacor Alami',
    'Masteran cucak hijau gacor alami. Suara natural.',
    'Cucak Hijau',
    'https://example.com/audio/ch-gacor-alami.mp3',
    203,
    'admin'
  );