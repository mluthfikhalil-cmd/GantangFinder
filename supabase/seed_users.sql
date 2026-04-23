-- Seed dummy users to make the app look active
-- Uses the original users table schema (email, nomor_wa)

-- 1. Seed users (using email + nomor_wa as unique identifiers)
INSERT INTO users (id, email, password_hash, nama_lengkap, nomor_wa, role, status, kota, created_at) VALUES
-- admin@demo.com / pass1234
('11111111-1111-1111-1111-111111111111', 'admin@demo.com', 'cGFzc3EyMzQ=', 'Admin GantangFinder', '6281234567890', 'organizer', 'active', 'Jakarta', '2026-01-15 08:00:00+00'),
-- iwan@kicau.com / icuwang2026
('22222222-2222-2222-2222-222222222222', 'iwan@kicau.com', 'aWN1d2FuZzIwMjY=', 'H. Iwan Setiawan', '6282345678901', 'organizer', 'active', 'Banjarmasin', '2026-02-01 09:00:00+00'),
-- budi@kicau.com / burung123
('33333333-3333-3333-3333-333333333333', 'budi@kicau.com', 'YnVydW5nMTIz', 'Bpk. Budi Santoso', '6283456789012', 'organizer', 'active', 'Surabaya', '2026-02-10 10:00:00+00'),
-- amin@merpati.com / aceh2026
('44444444-4444-4444-4444-444444444444', 'amin@merpati.com', 'YWNlaDIwMjY=', 'Tgk. M. Amin', '6285678901234', 'organizer', 'active', 'Banda Aceh', '2026-02-15 11:00:00+00')
ON CONFLICT (email) DO NOTHING;

-- 2. Link existing events to organizers
UPDATE events SET organizer_id = '22222222-2222-2222-2222-222222222222' 
WHERE lower(penyelenggara) LIKE '%dps kurnia%' OR lower(penyelenggara) LIKE '%kmn%';

UPDATE events SET organizer_id = '33333333-3333-3333-3333-333333333333' 
WHERE lower(penyelenggara) LIKE '%komunitas lovebird%' OR lower(penyelenggara) LIKE '%pjlb%';

UPDATE events SET organizer_id = '44444444-4444-4444-4444-444444444444' 
WHERE lower(penyelenggara) LIKE '%ppmbsi%' OR lower(penyelenggara) LIKE '%merpati palembang%';

-- 3. Add subscribers
INSERT INTO subscribers (id, nama, nomor_wa, kota, minat, created_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Admin GantangFinder', '6281234567890', 'Jakarta', ARRAY['kicau', 'merpati'], '2026-01-15 08:00:00+00'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'H. Iwan Setiawan', '6282345678901', 'Banjarmasin', ARRAY['kicau', 'merpati'], '2026-02-01 09:00:00+00'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Bpk. Budi Santoso', '6283456789012', 'Surabaya', ARRAY['kicau'], '2026-02-10 10:00:00+00'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Tgk. M. Amin', '6285678901234', 'Banda Aceh', ARRAY['merpati'], '2026-02-15 11:00:00+00')
ON CONFLICT (nomor_wa) DO NOTHING;

-- 4. Add event participants
INSERT INTO event_participants (id, event_id, bird_name, bird_owner, payment_status, registered_at) VALUES
-- Luna Cup Banjarbaru
('eeee1-eeee-eeee-eeee-eeeeeeeeeeee', 'd5f3cf32-e60e-4c93-b69c-86fe481bb6f6', 'Murai Borneo Jr', 'H. Iwan Setiawan', 'paid', '2026-04-20 10:00:00+00'),
('eeee2-eeee-eeee-eeee-eeeeeeeeeeee', 'd5f3cf32-e60e-4c93-b69c-86fe481bb6f6', 'Lovebird Green', 'Bpk. Budi Santoso', 'paid', '2026-04-20 11:00:00+00'),
-- KMN Tour Riau  
('eeee3-eeee-eeee-eeee-eeeeeeeeeeee', '14cf3251-1d74-45c5-bfaa-dd7b7cf9d934', 'Kacer Hitam', 'H. Iwan Setiawan', 'paid', '2026-04-21 09:00:00+00'),
('eeee4-eeee-eeee-eeee-eeeeeeeeeeee', '14cf3251-1d74-45c5-bfaa-dd7b7cf9d934', 'Murai Borneo Raja', 'Bpk. Budi Santoso', 'pending', '2026-04-21 10:00:00+00'),
-- Merpati Sprint Palembang
('eeee5-eeee-eeee-eeee-eeeeeeeeeeee', '9d3c5cbe-8ec2-4812-895a-252342234ca4', 'Merpati Sprint 01', 'Tgk. M. Amin', 'paid', '2026-04-22 08:00:00+00'),
('eeee6-eeee-eeee-eeee-eeeeeeeeeeee', '9d3c5cbe-8ec2-4812-895a-252342234ca4', 'Merpati Sprint 02', 'H. Iwan Setiawan', 'paid', '2026-04-22 09:00:00+00')
ON CONFLICT DO NOTHING;