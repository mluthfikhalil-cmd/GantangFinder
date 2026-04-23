-- Add birds for dummy users to make them look active
-- Using the correct user IDs from the database

-- Admin's birds (5719a88f-b2e0-44eb-ac90-4e07c004f99c)
INSERT INTO birds (owner_id, nama_burung, jenis_burung, created_at) VALUES
('5719a88f-b2e0-44eb-ac90-4e07c004f99c', 'King Admin', 'Murai Borneo', '2026-02-01 10:00:00+00'),
('5719a88f-b2e0-44eb-ac90-4e07c004f99c', 'Queen Admin', 'Lovebird', '2026-02-05 11:00:00+00')
ON CONFLICT DO NOTHING;

-- Iwan's birds (00dc22c7-f555-434e-bffd-32b454857ce0)
INSERT INTO birds (owner_id, nama_burung, jenis_burung, created_at) VALUES
('00dc22c7-f555-434e-bffd-32b454857ce0', 'Murai Borneo Jr', 'Murai Borneo', '2026-02-10 09:00:00+00'),
('00dc22c7-f555-434e-bffd-32b454857ce0', 'Kacer Hitam', 'Kacer', '2026-02-12 10:00:00+00'),
('00dc22c7-f555-434e-bffd-32b454857ce0', 'Lovebird Green', 'Lovebird', '2026-02-15 08:00:00+00')
ON CONFLICT DO NOTHING;

-- Budi's birds (4fe7664c-62f0-49fd-8000-ec9acf8b31a4)
INSERT INTO birds (owner_id, nama_burung, jenis_burung, created_at) VALUES
('4fe7664c-62f0-49fd-8000-ec9acf8b31a4', 'Mbah Bong', 'Murai Batu', '2026-02-11 09:00:00+00'),
('4fe7664c-62f0-49fd-8000-ec9acf8b31a4', 'Super Kacer', 'Kacer', '2026-02-13 10:00:00+00'),
('4fe7664c-62f0-49fd-8000-ec9acf8b31a4', 'Cantik Love', 'Lovebird', '2026-02-16 08:00:00+00')
ON CONFLICT DO NOTHING;

-- Amin's birds (5fb58757-9657-4753-93f2-99c9a63f3b93)
INSERT INTO birds (owner_id, nama_burung, jenis_burung, created_at) VALUES
('5fb58757-9657-4753-93f2-99c9a63f3b93', 'Merpati Sprint 01', 'Merpati Balap', '2026-02-16 09:00:00+00'),
('5fb58757-9657-4753-93f2-99c9a63f3b93', 'Merpati Sprint 02', 'Merpati Balap', '2026-02-16 10:00:00+00'),
('5fb58757-9657-4753-93f2-99c9a63f3b93', 'Merpati Kolong 01', 'Merpati Kolong', '2026-02-18 08:00:00+00')
ON CONFLICT DO NOTHING;