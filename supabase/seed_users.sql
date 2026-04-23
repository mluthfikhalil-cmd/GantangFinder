-- Seed users with correct column names (full_name, whatsapp_number)
-- Add username column first
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nama_lengkap TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS wa_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Seed users with both old and new column names for compatibility
INSERT INTO users (username, password_hash, nama_lengkap, wa_number, full_name, whatsapp_number, created_at) VALUES
('admin123', 'cGFzc3EyMzQ=', 'Admin GantangFinder', '6281234567890', 'Admin GantangFinder', '6281234567890', '2026-01-15 08:00:00+00'),
('organizer01', 'aWN1d2FuZzIwMjY=', 'H. Iwan Setiawan', '6282345678901', 'H. Iwan Setiawan', '6282345678901', '2026-02-01 09:00:00+00'),
('kicau_master', 'YnVydW5nMTIz', 'Bpk. Budi Santoso', '6283456789012', 'Bpk. Budi Santoso', '6283456789012', '2026-02-10 10:00:00+00'),
('merpati_aceh', 'YWNlaDIwMjY=', 'Tgk. M. Amin', '6285678901234', 'Tgk. M. Amin', '6285678901234', '2026-02-15 11:00:00+00')
ON CONFLICT (username) DO NOTHING;

-- Seed subscribers
INSERT INTO subscribers (nama, nomor_wa, kota, minat, created_at) VALUES
('Admin GantangFinder', '6281234567890', 'Jakarta', ARRAY['kicau', 'merpati'], '2026-01-15 08:00:00+00'),
('H. Iwan Setiawan', '6282345678901', 'Banjarmasin', ARRAY['kicau', 'merpati'], '2026-02-01 09:00:00+00'),
('Bpk. Budi Santoso', '6283456789012', 'Surabaya', ARRAY['kicau'], '2026-02-10 10:00:00+00'),
('Tgk. M. Amin', '6285678901234', 'Banda Aceh', ARRAY['merpati'], '2026-02-15 11:00:00+00')
ON CONFLICT (nomor_wa) DO NOTHING;

-- Seed event participants (cek event_id dulu ada di sistem)
--Insert INTO event_participants (event_id, bird_name, bird_owner, payment_status, registered_at) VALUES...