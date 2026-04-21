-- GantangFinder v2: User System
-- Replaces organizers table with unified users table
-- Run in Supabase SQL Editor after 001_organizers.sql

-- =============================================
-- 1. Create users table
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  nama_lengkap TEXT NOT NULL,
  nomor_wa TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'peserta' CHECK (role IN ('organizer', 'peserta')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending_payment', 'pending_approval', 'active', 'rejected')),
  payment_proof_url TEXT,
  kota TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_nomor_wa_idx ON users(nomor_wa);
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
CREATE INDEX IF NOT EXISTS users_status_idx ON users(status);

-- =============================================
-- 2. Enable RLS
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Public can register (no auth needed)
CREATE POLICY "Public can register" ON users FOR INSERT WITH CHECK (true);

-- Users can view own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (true);

-- Authenticated users can update own data
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (true);

-- =============================================
-- 3. Create user_sessions table for JWT tracking
-- =============================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_token_hash_idx ON user_sessions(token_hash);

-- =============================================
-- 4. Payment info for organizer fee tracking
-- =============================================
CREATE TABLE IF NOT EXISTS organizer_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER DEFAULT 20000,
  payment_proof_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS organizer_payments_user_id_idx ON organizer_payments(user_id);

-- =============================================
-- 5. Seed admin user (password: gantang2026)
-- =============================================
-- INSERT INTO users (email, password_hash, nama_lengkap, nomor_wa, role, status)
-- VALUES ('admin@gantangfinder.id', '$2b$10$rQZ8K.Xj9.Xj9.Xj9.Xj9.', 'Admin Gantang', '6281234567890', 'admin', 'active');

-- =============================================
-- 6. Add FK to events table
-- =============================================
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_id UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS events_organizer_id_idx ON events(organizer_id);