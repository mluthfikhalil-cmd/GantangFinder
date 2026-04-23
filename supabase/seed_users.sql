-- Seed users with CORRECT column names (email required!)
-- First add username column if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Seed users with existing schema columns (email REQUIRED, full_name, whatsapp_number)
INSERT INTO users (email, username, password_hash, full_name, whatsapp_number, city, created_at) VALUES
('admin@gantang.id', 'admin123', 'cGFzc3EyMzQ=', 'Admin GantangFinder', '6281234567890', 'Jakarta', '2026-01-15 08:00:00+00'),
('iwan@kicau.id', 'organizer01', 'aWN1d2FuZzIwMjY=', 'H. Iwan Setiawan', '6282345678901', 'Banjarmasin', '2026-02-01 09:00:00+00'),
('budi@kicau.id', 'kicau_master', 'YnVydW5nMTIz', 'Bpk. Budi Santoso', '6283456789012', 'Surabaya', '2026-02-10 10:00:00+00'),
('amin@merpati.id', 'merpati_aceh', 'YWNlaDIwMjY=', 'Tgk. M. Amin', '6285678901234', 'Banda Aceh', '2026-02-15 11:00:00+00')
ON CONFLICT (email) DO NOTHING;

-- Seed subscribers
INSERT INTO subscribers (nama, nomor_wa, kota, minat, created_at) VALUES
('Admin GantangFinder', '6281234567890', 'Jakarta', ARRAY['kicau', 'merpati'], '2026-01-15 08:00:00+00'),
('H. Iwan Setiawan', '6282345678901', 'Banjarmasin', ARRAY['kicau', 'merpati'], '2026-02-01 09:00:00+00'),
('Bpk. Budi Santoso', '6283456789012', 'Surabaya', ARRAY['kicau'], '2026-02-10 10:00:00+00'),
('Tgk. M. Amin', '6285678901234', 'Banda Aceh', ARRAY['merpati'], '2026-02-15 11:00:00+00')
ON CONFLICT (nomor_wa) DO NOTHING;