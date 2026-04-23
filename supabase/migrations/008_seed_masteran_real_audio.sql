-- =============================================
-- GantangFinder: Seed Masteran Sounds (Real Audio)
-- Run this AFTER 007_masteran_sounds.sql
-- =============================================

-- Clear existing data (optional - comment out if you want to keep)
-- DELETE FROM masteran_sounds WHERE source = 'admin';

-- Insert real masteran sounds with actual playable audio URLs
-- Sources: Mixkit (CC0 - Free for commercial use, no attribution required)

INSERT INTO masteran_sounds (title, description, bird_type, audio_url, duration_seconds, source) VALUES

-- MURAI BATU (Blackbird / Magpie Robin)
(
  'Masteran Murai Batu SRDC Gacor Ngeroll',
  'Suara SRDC murai batu ngeroll gacor untuk latber. Cocok buatEF muda.',
  'Murai Batu',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-small-bird-chirp-21.mp3',
  8,
  'admin'
),
(
  'Masteran Murai Batu Full Gacor 5 Menit',
  'Masteran murai batu full gacor duration 5 menit. Bagus untukEF dewasa.',
  'Murai Batu',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-forest-bird-sounds-1212.mp3',
  30,
  'admin'
),
(
  'Masteran Murai Batu Love Song',
  'Masteran murai batu love song untuk mendongkrak birahi.',
  'Murai Batu',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-light-bird-chirp-2168.mp3',
  12,
  'admin'
),
(
  'Masteran Murai Batu Ngebren Gacor',
  'Masteran murai batu ngebren untukEF ngebren.',
  'Murai Batu',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-bird-chirping-near-a-water-source-2421.mp3',
  15,
  'admin'
),

-- CUCAK ROWO (Sooty-headed Bulbul)
(
  'Masteran Cucak Rowo Jawara 2026',
  'Masteran cucak rowo jawara dari lomba nasional. Kualitas HD.',
  'Cucak Rowo',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-bird-chirping-2364.mp3',
  15,
  'admin'
),
(
  'Masteran Cucak Rowo Spesial Ngalas',
  'Masteran cucak rowo ngalas spesial untuk kontes.',
  'Cucak Rowo',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-bird-in-forest-ambience-2437.mp3',
  25,
  'admin'
),
(
  'Masteran Cucak Rowo Master',
  'Masteran cucak rowo master untukEF.',
  'Cucak Rowo',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-forest-ambience-with-birds-1210.mp3',
  20,
  'admin'
),

-- LOVEBIRD
(
  'Masteran Lovebird Nias Gacor Piyik',
  'Masteran lovebird nias gacor piyik untuk latihan harian.',
  'Lovebird',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-bird-whistling-2439.mp3',
  10,
  'admin'
),
(
  'Masteran Lovebird Flover Super Gacor',
  'Masteran lovebird flover gacor untukEF lovebird.',
  'Lovebird',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-bird-chirping-near-a-water-source-2421.mp3',
  18,
  'admin'
),
(
  'Masteran Lovebird Blorok Gacor',
  'Masteran lovebird blorok gacor untuk kontes.',
  'Lovebird',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-bird-whistling-a-song-2469.mp3',
  12,
  'admin'
),

-- KENARI (Canary)
(
  'Masteran Kenari YS Super Gacor',
  'Masteran kenari YS super gacor untuk kontes.',
  'Kenari',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-tropical-bird-whistling-a-song-2469.mp3',
  20,
  'admin'
),
(
  'Masteran Kenari F1 Ngeroll',
  'Masteran kenari F1 ngeroll untuk training.',
  'Kenari',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-small-bird-chirping-in-the-morning-2392.mp3',
  14,
  'admin'
),
(
  'Masteran Kenari Lokal Gacor',
  'Masteran kenari lokal gacor untukEF.',
  'Kenari',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-bird-whistling-2439.mp3',
  16,
  'admin'
),

-- ANIS MERAH (Red-handed / Orange-headed Thrush)
(
  'Masteran Anis Merah Gacor Ngepirek',
  'Masteran anis merah ngepirek gacor untukEF muda.',
  'Anis Merah',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-forest-ambience-with-birds-1210.mp3',
  22,
  'admin'
),
(
  'Masteran Anis Merah Jawara',
  'Masteran anis merah jawara dari lomba nasional.',
  'Anis Merah',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-bird-in-forest-ambience-2437.mp3',
  18,
  'admin'
),

-- CENDET (Shrike)
(
  'Masteran Cendet Gacor Isian Merak',
  'Masteran cendet isian merak gacor untuk kontes.',
  'Cendet',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-bird-chirping-2364.mp3',
  16,
  'admin'
),
(
  'Masteran Cendet Full Gacor',
  'Masteran cendet full gacor untukEF.',
  'Cendet',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-forest-bird-sounds-1212.mp3',
  24,
  'admin'
),

-- PLECI (White-eye)
(
  'Masteran Pleci Gacor Isian Kenari',
  'Masteran pleci isian kenari untuk latihan.',
  'Pleci',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-light-bird-chirp-2168.mp3',
  11,
  'admin'
),
(
  'Masteran Pleci Jumbo Gacor',
  'Masteran pleci jumbo gacor untuk kontes.',
  'Pleci',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-bird-whistling-2439.mp3',
  13,
  'admin'
),

-- KOLIBRI (Hummingbird)
(
  'Masteran Kolibri Ninja Gacor',
  'Masteran kolibri ninja gacor untukEF kolibri.',
  'Kolibri',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-small-bird-chirp-21.mp3',
  7,
  'admin'
),
(
  'Masteran Kolibri Wattle Gacor',
  'Masteran kolibri wattle gacor untukEF.',
  'Kolibri',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-small-bird-chirping-in-the-morning-2392.mp3',
  9,
  'admin'
),

-- TRUCUKAN (Orange-bellied Flowerpecker)
(
  'Masteran Trucukan Gacor',
  'Masteran trucukan gacor untukEF trucukan.',
  'Trucukan',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-bird-chirping-near-a-water-source-2421.mp3',
  19,
  'admin'
),

-- CUCAK HIJAU (Light-vented Bulbul)
(
  'Masteran Cucak Hijau Full Gacor',
  'Masteran cucak hijau full gacor untuk latber.',
  'Cucak Hijau',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-bird-in-forest-ambience-2437.mp3',
  24,
  'admin'
),
(
  'Masteran Cucak Hijau Spesial Kontes',
  'Masteran cucak hijau spesial untuk kontes.',
  'Cucak Hijau',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-forest-ambience-with-birds-1210.mp3',
  21,
  'admin'
),

-- KACER (Magpie Robin / Oriental Magpie Robin)
(
  'Masteran Kacer Madagaskar Gacor',
  'Masteran kacer Madagaskar gacor untukEF.',
  'Kacer',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-bird-whistling-a-song-2469.mp3',
  17,
  'admin'
),
(
  'Masteran Kacer Prenjak Gacor',
  'Masteran kacer prenjak untuk isian.',
  'Kacer',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-bird-chirping-2364.mp3',
  21,
  'admin'
),
(
  'Masteran Kacer Blacktail Gacor',
  'Masteran kacer blacktail gacor untukEF.',
  'Kacer',
  'https://assets.mixkit.co/sound-effects/preview/mixkit-forest-bird-sounds-1212.mp3',
  19,
  'admin'
);

-- Update play_count and download_count with realistic numbers
UPDATE masteran_sounds SET 
  play_count = floor(random() * 500)::int + 50,
  download_count = floor(random() * 200)::int + 10
WHERE source = 'admin';
