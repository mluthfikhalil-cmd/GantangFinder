-- 1. Tabel Roosters (Ayam Jago)
CREATE TABLE IF NOT EXISTS public.roosters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT, -- Misal: "Bangkok", "Birma", "Saigon"
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
  type TEXT NOT NULL, -- 'vaksin', 'obat_cacing', 'vitamin', 'cek_dokter'
  product_name TEXT, -- Nama obat/vitamin
  dosage TEXT, -- Takaran
  next_schedule DATE, -- Jadwal pemberian berikutnya
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Permintaan Sparring (Sparring Requests)
CREATE TABLE IF NOT EXISTS public.sparring_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_rooster_id UUID REFERENCES public.roosters(id) ON DELETE CASCADE, -- Ayam yang mengajak
  target_rooster_id UUID REFERENCES public.roosters(id) ON DELETE CASCADE, -- Ayam yang diajak
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'completed'
  proposed_date DATE,
  location_hint TEXT, -- Misal: "Lapangan A"
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabel Training Logs (Jurnal Performa)
CREATE TABLE IF NOT EXISTS public.training_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rooster_id UUID REFERENCES public.roosters(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  activity_type TEXT, -- 'lari', 'renang', 'latih_tanding', 'jemur'
  duration_minutes INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- RLS POLICIES
-- ========================================

ALTER TABLE public.roosters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own roosters" ON public.roosters
  FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "Everyone can view active sparring roosters" ON public.roosters
  FOR SELECT USING (sparring_status = 'active');

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own medical records" ON public.medical_records 
  FOR ALL USING (EXISTS (SELECT 1 FROM roosters WHERE roosters.id = medical_records.rooster_id AND roosters.owner_id = auth.uid()));

ALTER TABLE public.sparring_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and create sparring requests" ON public.sparring_requests 
  FOR ALL USING (true); 

ALTER TABLE public.training_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own training logs" ON public.training_logs
  FOR ALL USING (EXISTS (SELECT 1 FROM roosters WHERE roosters.id = training_logs.rooster_id AND roosters.owner_id = auth.uid()));
