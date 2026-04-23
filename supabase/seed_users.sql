-- Seed dummy users for GantangFinder
-- Username: admin123 / Password: pass1234
-- Username: organizer01 / Password: icuwang2026
-- Username: kicau_master / Password: burung123
-- Username: merpati_aceh / Password: aceh2026

INSERT INTO users (id, username, password_hash, nama_lengkap, wa_number, created_at) VALUES
-- admin123 / pass1234
('11111111-1111-1111-1111-111111111111', 'admin123', 'cGFzc3EyMzQ=', 'Admin GantangFinder', '6281234567890', NOW()),
-- organizer01 / icuwang2026
('22222222-2222-2222-2222-222222222222', 'organizer01', 'aWN1d2FuZzIwMjY=', 'H. Iwan Setiawan', '6282345678901', NOW()),
-- kicau_master / burung123
('33333333-3333-3333-3333-333333333333', 'kicau_master', 'YnVydW5nMTIz', 'Bpk. Budi Santoso', '6283456789012', NOW()),
-- merpati_aceh / aceh2026
('44444444-4444-4444-4444-444444444444', 'merpati_aceh', 'YWNlaDIwMjY=', 'Tgk. M. Amin', '6285678901234', NOW())
ON CONFLICT (username) DO NOTHING;