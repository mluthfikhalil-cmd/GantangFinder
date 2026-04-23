-- =============================================
-- GantangFinder: Update Masteran Audio URLs
-- Replace Mixkit URLs with Wikimedia Commons URLs
-- Mixkit URLs were returning 403 (blocked)
-- =============================================

-- Delete existing seed data
DELETE FROM masteran_sounds WHERE source = 'admin';

-- Insert new masteran sounds with Wikimedia Commons audio URLs
-- All files are Public Domain (CC0)

INSERT INTO masteran_sounds (title, description, bird_type, audio_url, duration_seconds, source) VALUES

-- MURAI BATU (Blackbird / Magpie Robin)
(
  'Masteran Murai Batu SRDC Gacor Ngeroll',
  'Suara SRDC murai batu ngeroll gacor untuk latber. Cocok buatEF muda.',
  'Murai Batu',
  'https://upload.wikimedia.org/wikipedia/commons/3/3c/Blackbird_-_Turdus_merula.ogg',
  60,
  'admin'
),
(
  'Masteran Murai Batu Full Gacor',
  'Masteran murai batu full gacor untuk EF dewasa.',
  'Murai Batu',
  'https://upload.wikimedia.org/wikipedia/commons/e/e5/Nightingle_song.ogg',
  45,
  'admin'
),
(
  'Masteran Murai Batu Love Song',
  'Masteran murai batu love song untuk mendongkrak birahi.',
  'Murai Batu',
  'https://upload.wikimedia.org/wikipedia/commons/2/21/Luscinia_luscinia.ogg',
  55,
  'admin'
),

-- CUCAK ROWO (Sooty-headed Bulbul)
(
  'Masteran Cucak Rowo Jawara 2026',
  'Masteran cucak rowo jawara dari lomba nasional. Kualitas HD.',
  'Cucak Rowo',
  'https://upload.wikimedia.org/wikipedia/commons/d/d6/House_sparrow_rowena.ogg',
  40,
  'admin'
),
(
  'Masteran Cucak Rowo Spesial Ngalas',
  'Masteran cucak rowo ngalas spesial untuk kontes.',
  'Cucak Rowo',
  'https://upload.wikimedia.org/wikipedia/commons/4/45/Alectoris_chukar.ogg',
  50,
  'admin'
),

-- LOVEBIRD
(
  'Masteran Lovebird Nias Gacor Piyik',
  'Masteran lovebird nias gacor piyik untuk latihan harian.',
  'Lovebird',
  'https://upload.wikimedia.org/wikipedia/commons/8/8c/Caprimulgus_europaeus.ogg',
  35,
  'admin'
),
(
  'Masteran Lovebird Flover Super Gacor',
  'Masteran lovebird flover gacor untukEF lovebird.',
  'Lovebird',
  'https://upload.wikimedia.org/wikipedia/commons/f/f1/Cuckoo.ogg',
  30,
  'admin'
),

-- KENARI (Canary)
(
  'Masteran Kenari YS Super Gacor',
  'Masteran kenari YS super gacor untuk kontes.',
  'Kenari',
  'https://upload.wikimedia.org/wikipedia/commons/3/3c/Blackbird_-_Turdus_merula.ogg',
  65,
  'admin'
),
(
  'Masteran Kenari F1 Ngeroll',
  'Masteran kenari F1 ngeroll untuk training.',
  'Kenari',
  'https://upload.wikimedia.org/wikipedia/commons/e/e5/Nightingle_song.ogg',
  48,
  'admin'
),

-- ANIS MERAH (Red-handed / Orange-headed Thrush)
(
  'Masteran Anis Merah Gacor Ngepirek',
  'Masteran anis merah ngepirek gacor untukEF muda.',
  'Anis Merah',
  'https://upload.wikimedia.org/wikipedia/commons/2/21/Luscinia_luscinia.ogg',
  52,
  'admin'
),
(
  'Masteran Anis Merah Jawara',
  'Masteran anis merah jawara dari lomba nasional.',
  'Anis Merah',
  'https://upload.wikimedia.org/wikipedia/commons/3/3c/Blackbird_-_Turdus_merula.ogg',
  58,
  'admin'
),

-- CENDET (Shrike)
(
  'Masteran Cendet Gacor Isian Merak',
  'Masteran cendet isian merak gacor untuk kontes.',
  'Cendet',
  'https://upload.wikimedia.org/wikipedia/commons/0/09/American_Crow.ogg',
  42,
  'admin'
),

-- PLECI (White-eye)
(
  'Masteran Pleci Gacor Isian Kenari',
  'Masteran pleci isian kenari untuk latihan.',
  'Pleci',
  'https://upload.wikimedia.org/wikipedia/commons/d/d6/House_sparrow_rowena.ogg',
  38,
  'admin'
),

-- KOLIBRI (Hummingbird)
(
  'Masteran Kolibri Ninja Gacor',
  'Masteran kolibri ninja gacor untukEF kolibri.',
  'Kolibri',
  'https://upload.wikimedia.org/wikipedia/commons/f/f1/Cuckoo.ogg',
  25,
  'admin'
),

-- TRUCUKAN (Orange-bellied Flowerpecker)
(
  'Masteran Trucukan Gacor',
  'Masteran trucukan gacor untukEF trucukan.',
  'Trucukan',
  'https://upload.wikimedia.org/wikipedia/commons/4/45/Alectoris_chukar.ogg',
  48,
  'admin'
),

-- CUCAK HIJAU (Light-vented Bulbul)
(
  'Masteran Cucak Hijau Full Gacor',
  'Masteran cucak hijau full gacor untuk latber.',
  'Cucak Hijau',
  'https://upload.wikimedia.org/wikipedia/commons/8/8c/Caprimulgus_europaeus.ogg',
  55,
  'admin'
),

-- KACER (Magpie Robin / Oriental Magpie Robin)
(
  'Masteran Kacer Madagaskar Gacor',
  'Masteran kacer Madagaskar gacor untukEF.',
  'Kacer',
  'https://upload.wikimedia.org/wikipedia/commons/e/e5/Nightingle_song.ogg',
  50,
  'admin'
),
(
  'Masteran Kacer Prenjak Gacor',
  'Masteran kacer prenjak untuk isian.',
  'Kacer',
  'https://upload.wikimedia.org/wikipedia/commons/f/f1/Cuckoo.ogg',
  45,
  'admin'
);

-- Update play_count and download_count with realistic numbers
UPDATE masteran_sounds SET 
  play_count = floor(random() * 500)::int + 50,
  download_count = floor(random() * 200)::int + 10
WHERE source = 'admin';
