'use server';

import { revalidatePath } from 'next/cache';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Helper function untuk fetch Supabase REST
async function supabaseFetch(endpoint: string, options: RequestInit) {
  return fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY!,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

// 1. Ambil Feed (Pagination sederhana)
export async function getFeed(page = 1, limit = 10) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const res = await supabaseFetch(
    `posts?select=*,users(nama_lengkap,nomor_wa)&order=created_at.desc&range=${from}.${to}`,
    { method: 'GET' }
  );

  if (!res.ok) return { success: false, data: [] };
  
  const data = await res.json();
  return { success: true, data };
}

// 2. Buat Post Baru
export async function createPost(formData: FormData) {
  const userId = formData.get('user_id') as string;
  const content = formData.get('content') as string;
  const type = formData.get('type') as string || 'harian';
  const imageUrl = formData.get('image_url') as string | null;
  const eventId = formData.get('event_id') as string | null;
  
  console.log('Creating post with:', { userId, content, type, imageUrl, eventId }); // Debug log

  if (!userId || !content) {
    console.error('Missing data:', { userId, content });
    return { success: false, message: 'Data tidak lengkap. User ID dan Konten wajib diisi.' };
  }

  const payload = {
    user_id: userId,
    content,
    post_type: type,
    image_url: imageUrl,
    event_id: eventId,
    likes_count: 0
  };

  const res = await supabaseFetch('posts', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json();
    console.error('Supabase Error:', err);
    return { success: false, message: `Gagal membuat post: ${err.message || 'Unknown error'}` };
  }

  revalidatePath('/feed');
  return { success: true, message: 'Post berhasil diterbitkan!' };
}

// 3. Like/Unlike Post
export async function toggleLike(postId: string, userId: string) {
  // Cek apakah sudah like
  const checkRes = await supabaseFetch(`post_likes?post_id=eq.${postId}&user_id=eq.${userId}`, { method: 'GET' });
  const existingLike = await checkRes.json();

  if (existingLike.length > 0) {
    // Unlike: Hapus record like
    await supabaseFetch(`post_likes?id=eq.${existingLike[0].id}`, { method: 'DELETE' });
    
    // Kurangi counter di posts
    const postRes = await supabaseFetch(`posts?id=eq.${postId}`, { method: 'GET' });
    const postData = await postRes.json();
    const newCount = Math.max(0, (postData[0]?.likes_count || 0) - 1);
    
    await supabaseFetch(`posts?id=eq.${postId}`, {
      method: 'PATCH',
      body: JSON.stringify({ likes_count: newCount })
    });
    
    return { success: true, liked: false };
  } else {
    // Like: Insert record like
    await supabaseFetch('post_likes', {
      method: 'POST',
      body: JSON.stringify({ post_id: postId, user_id: userId })
    });

    // Tambah counter di posts
    const postRes = await supabaseFetch(`posts?id=eq.${postId}`, { method: 'GET' });
    const postData = await postRes.json();
    const newCount = (postData[0]?.likes_count || 0) + 1;
    
    await supabaseFetch(`posts?id=eq.${postId}`, {
      method: 'PATCH',
      body: JSON.stringify({ likes_count: newCount })
    });

    return { success: true, liked: true };
  }
}
