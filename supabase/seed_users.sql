-- Fix users table schema - add missing columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nama_lengkap TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS wa_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index if not exists
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Now seed users
INSERT INTO users (username, password_hash, nama_lengkap, wa_number, created_at) VALUES
('admin123', 'cGFzc3EyMzQ=', 'Admin GantangFinder', '6281234567890', '2026-01-15 08:00:00+00'),
('organizer01', 'aWN1d2FuZzIwMjY=', 'H. Iwan Setiawan', '6282345678901', '2026-02-01 09:00:00+00'),
('kicau_master', 'YnVydW5nMTIz', 'Bpk. Budi Santoso', '6283456789012', '2026-02-10 10:00:00+00'),
('merpati_aceh', 'YWNlaDIwMjY=', 'Tgk. M. Amin', '6285678901234', '2026-02-15 11:00:00+00')
ON CONFLICT (username) DO NOTHING;

-- Link existing events to organizers
UPDATE events SET organizer_id = '22222222-2222-2222-2222-222222222222' 
WHERE lower(penyelenggara) LIKE '%dps kurnia%' OR lower(penyelenggara) LIKE '%kmn%';

UPDATE events SET organizer_id = '33333333-3333-3333-3333-333333333333' 
WHERE lower(penyelenggara) LIKE '%komunitas lovebird%';

UPDATE events SET organizer_id = '44444444-4444-4444-4444-444444444444' 
WHERE lower(penyelenggara) LIKE '%ppmbsi%' OR lower(penyelenggara) LIKE '%merpati palembang%';

-- Seed subscribers
INSERT INTO subscribers (nama, nomor_wa, kota, minat, created_at) VALUES
('Admin GantangFinder', '6281234567890', 'Jakarta', ARRAY['kicau', 'merpati'], '2026-01-15 08:00:00+00'),
('H. Iwan Setiawan', '6282345678901', 'Banjarmasin', ARRAY['kicau', 'merpati'], '2026-02-01 09:00:00+00'),
('Bpk. Budi Santoso', '6283456789012', 'Surabaya', ARRAY['kicau'], '2026-02-10 10:00:00+00'),
('Tgk. M. Amin', '6285678901234', 'Banda Aceh', ARRAY['merpati'], '2026-02-15 11:00:00+00')
ON CONFLICT (nomor_wa) DO NOTHING;

-- Seed event participants
INSERT INTO event_participants (event_id, bird_name, bird_owner, payment_status, registered_at) VALUES
('d5f3cf32-e60e-4c93-b69c-86fe481bb6f6', 'Murai Borneo Jr', 'H. Iwan Setiawan', 'paid', '2026-04-20 10:00:00+00'),
('d5f3cf32-e60e-4c93-b69c-86fe481bb6f6', 'Lovebird Green', 'Bpk. Budi Santoso', 'paid', '2026-04-20 11:00:00+00'),
('14cf3251-1d74-45c5-bfaa-dd7b7cf9d934', 'Kacer Hitam', 'H. Iwan Setiawan', 'paid', '2026-04-21 09:00:00+00'),
('14cf3251-1d74-45c5-bfaa-dd7b7cf9d934', 'Murai Borneo Raja', 'Bpk. Budi Santoso', 'pending', '2026-04-21 10:00:00+00'),
('9d3c5cbe-8ec2-4812-895a-252342234ca4', 'Merpati Sprint 01', 'Tgk. M. Amin', 'paid', '2026-04-22 08:00:00+00'),
('9d3c5cbe-8ec2-4812-895a-252342234ca4', 'Merpati Sprint 02', 'H. Iwan Setiawan', 'paid', '2026-04-22 09:00:00+00')
ON CONFLICT DO NOTHING;