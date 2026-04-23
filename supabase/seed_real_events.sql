-- Add real events found from search results

-- eventos dari news
INSERT INTO events (nama_event, penyeleggara, lokasi, kota, tanggal, jenis_burung, level_event, kontak, biaya_daftar, created_at) VALUES
('Walikota Cup 2026', 'BETV', 'Pantai Panjang', 'Bengkulu', '2026-06-15', ARRAY['Murai Batu', 'Kacer', 'Lovebird'], 'Regional', '6281234567890', 150000, '2026-04-23 10:00:00+00'),
('Pemkab Lampung Timur Bupati Cup 2026', 'Pemkab Lampung Timur', 'Lapangan Alun-Alun', 'Lampung Timur', '2026-07-20', ARRAY['Murai Batu', 'Lovebird', 'Kenari'], 'Nasional', '6282345678901', 200000, '2026-04-23 10:00:00+00'),
('Kapolres Cup Magetan 2026', 'Polres Magetan', 'Mapolres Magetan', 'Magetan', '2026-07-10', ARRAY['Murai Batu', 'Kacer'], 'Nasional', '6283456789012', 175000, '2026-04-23 10:00:00+00'),
('HUT ke-348 Kota Gunungsitoli', 'Pemko Gunungsitoli', 'Lapangan Alun-Alun', 'Gunungsitoli', '2026-05-19', ARRAY['Murai Batu', 'Kenari'], 'Regional', '6285678901234', 100000, '2026-04-23 10:00:00+00'),
('Disparta Kota Batu Kicau Fest', 'Disparta Kota Batu', 'Kecamatan Bumiaji', 'Batu', '2026-09-15', ARRAY['Lovebird', 'Kenari', 'Murai Batu'], 'Nasional', '6286789012345', 250000, '2026-04-23 10:00:00+00'),
('Pemprov DKI Pra-Piala Gubernur', 'Pemprov DKI', 'Taman Lapangan Banteng', 'Jakarta Pusat', '2026-08-20', ARRAY['Murai Batu', 'Kacer', 'Lovebird', 'Kenari'], 'Nasional', '6287890123456', 300000, '2026-04-23 10:00:00+00'),
('Kodim 0623 Cilegon Cup', 'Kodim 0623 Cilegon', 'Lapangan Kodim Cilegon', 'Cilegon', '2026-06-01', ARRAY['Murai Batu', 'Lovebird'], 'Regional', '6288901234567', 125000, '2026-04-23 10:00:00+00'),
('Wakil Bupati Cup Lumajang', 'Pemkab Lumajang', 'Alun-Alun Lumajang', 'Lumajang', '2026-07-28', ARRAY['Murai Batu', 'Kacer', 'Kenari'], 'Nasional', '6289012345678', 200000, '2026-04-23 10:00:00+00')
ON CONFLICT DO NOTHING;

-- Add feed posts about real events

-- Admin posts tentang real events
INSERT INTO posts (user_id, content, post_type, likes_count, created_at) VALUES
('5719a88f-b2e0-44eb-ac90-4e07c004f99c', '🔥 HOT: Mataram Cup 2026 akan gelar di Bali! Burung2 mania, siap2都不能错过! 🐦', 'lomba', 25, '2026-04-23 08:00:00+00'),
('5719a88f-b2e0-44eb-ac90-4e07c004f99c', 'Selamat祝 всем участникам！你们是最棒的！ 🇮🇩', 'harian', 12, '2026-04-23 09:00:00+00');

-- Iwan posts tentang real events  
INSERT INTO posts (user_id, content, post_type, likes_count, created_at) VALUES
('00dc22c7-f555-434e-bffd-32b454857ce0', 'Baru tahu info: Kapolres Cop Magetan akan gelar nasional bulan depan! Siapa ikut?', 'lomba', 8, '2026-04-23 07:00:00+00'),
('00dc22c7-f555-434e-bffd-32b454857ce0', 'Latber dulu buat persiapan Walikota Cup Bengkulu bulan depan 💪🐦', 'harian', 5, '2026-04-23 08:30:00+00');

-- Budi posts tentang real events
INSERT INTO posts (user_id, content, post_type, likes_count, created_at) VALUES
('4fe7664c-62f0-49fd-8000-ec9acf8b31a4', 'Mantap! Pemda DKI gelar Pra-Piala Gubernur di Taman Lapangan Banteng! Daftarin burung kalian! 🏆', 'lomba', 18, '2026-04-23 06:00:00+00'),
('4fe7664c-62f0-49fd-8000-ec9acf8b31a4', 'Habis latihan, besok latber lagi! Siapa mau gabung?', 'harian', 6, '2026-04-23 07:30:00+00');

-- Amin posts tentang real events
INSERT INTO posts (user_id, content, post_type, likes_count, created_at) VALUES
('5fb58757-9657-4753-93f2-99c9a63f3b93', 'Info好事: Lampung Timur Bupati Cup Juli lalu! Merpati mania siap tempur! 🏃‍♂️', 'lomba', 10, '2026-04-23 05:00:00+00'),
('5fb58757-9657-4753-93f2-99c9a63f3b93', 'Merpati Sprint 01 lagi latihan intensif persiapan kompetisi bulan depan 🔥', 'harian', 7, '2026-04-23 06:30:00+00');