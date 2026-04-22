-- 1. Tabel Posts (Feed Utama)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'harian', -- 'harian', 'lomba', 'jual', 'curhat'
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  image_url TEXT,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Post Likes (Untuk fitur Like)
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id) -- User hanya bisa like 1x per post
);

-- ========================================
-- RLS POLICIES (KEAMANAN)
-- ========================================

-- Pastikan RLS aktif
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Policy untuk Posts: Siapa saja boleh baca (Select), 
-- Hanya user terautentikasi yang boleh tulis (Insert)
DROP POLICY IF EXISTS "Enable read access for everyone" ON public.posts;
CREATE POLICY "Enable read access for everyone" ON public.posts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON public.posts;
CREATE POLICY "Enable insert for all users" ON public.posts
  FOR INSERT WITH CHECK (true);

-- Policy untuk Likes: Siapa saja boleh baca dan tulis (untuk kemudahan testing)
DROP POLICY IF EXISTS "Enable all access for post_likes" ON public.post_likes;
CREATE POLICY "Enable all access for post_likes" ON public.post_likes
  FOR ALL USING (true) WITH CHECK (true);
