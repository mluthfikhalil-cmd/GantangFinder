-- 1. Tabel Roosters (Ayam Jago)
CREATE TABLE IF NOT EXISTS public.roosters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT, 
  birth_date DATE,
  gender TEXT DEFAULT 'male',
  weight_kg NUMERIC(4, 2),
  height_cm INT,
  sparring_status TEXT DEFAULT 'inactive', -- 'active', 'inactive', 'resting'
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Rekam Medis (Medical Records)
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rooster_id UUID REFERENCES public.roosters(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL, 
  product_name TEXT, 
  dosage TEXT, 
  next_schedule DATE, 
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Permintaan Sparring (Sparring Requests)
CREATE TABLE IF NOT EXISTS public.sparring_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_rooster_id UUID REFERENCES public.roosters(id) ON DELETE CASCADE, 
  target_rooster_id UUID REFERENCES public.roosters(id) ON DELETE CASCADE, 
  status TEXT DEFAULT 'pending', 
  proposed_date DATE,
  location_hint TEXT, 
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabel Training Logs (Jurnal Performa)
CREATE TABLE IF NOT EXISTS public.training_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rooster_id UUID REFERENCES public.roosters(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  activity_type TEXT, 
  duration_minutes INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- RLS POLICIES (PERMISSIVE FOR CUSTOM AUTH)
-- ========================================

-- Pastikan RLS aktif (atau nonaktifkan jika ingin bebas akses)
ALTER TABLE public.roosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sparring_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_logs ENABLE ROW LEVEL SECURITY;

-- Roosters: Izinkan semua akses (karena kita pakai custom auth session)
DROP POLICY IF EXISTS "Enable all access for roosters" ON public.roosters;
CREATE POLICY "Enable all access for roosters" ON public.roosters FOR ALL USING (true) WITH CHECK (true);

-- Medical Records: Izinkan semua akses
DROP POLICY IF EXISTS "Enable all access for medical_records" ON public.medical_records;
CREATE POLICY "Enable all access for medical_records" ON public.medical_records FOR ALL USING (true) WITH CHECK (true);

-- Sparring Requests: Izinkan semua akses
DROP POLICY IF EXISTS "Enable all access for sparring_requests" ON public.sparring_requests;
CREATE POLICY "Enable all access for sparring_requests" ON public.sparring_requests FOR ALL USING (true) WITH CHECK (true);

-- Training Logs: Izinkan semua akses
DROP POLICY IF EXISTS "Enable all access for training_logs" ON public.training_logs;
CREATE POLICY "Enable all access for training_logs" ON public.training_logs FOR ALL USING (true) WITH CHECK (true);
