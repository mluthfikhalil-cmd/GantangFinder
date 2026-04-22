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

  // Gunakan limit & offset yang benar untuk PostgREST
  const res = await supabaseFetch(
    `posts?select=*,users(nama_lengkap,nomor_wa)&order=created_at.desc&limit=${limit}&offset=${from}`,
    { method: 'GET' }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Network error or invalid query' }));
    console.error('Fetch Feed Error:', err);
    return { success: false, data: [], error: err.message };
  }
  
  const data = await res.json();
  return { success: true, data };
}

// 2. Buat Post Baru
export async function createPost(formData: FormData) {
  const userId = formData.get('user_id') as string;
  const content = formData.get('content') as string;
  const type = formData.get('type') as string || 'harian';
  const imageUrl = formData.get('image_url') as string | null;
  const event_id = formData.get('event_id') as string | null;
  
  console.log('Creating post with:', { userId, content, type, imageUrl, event_id });

  if (!userId || !content) {
    return { success: false, message: 'Data tidak lengkap. User ID dan Konten wajib diisi.' };
  }

  // Penting: Pastikan kolom sesuai dengan database (post_type, user_id, dll)
  const payload: any = {
    user_id: userId,
    content: content,
    post_type: type,
    likes_count: 0
  };

  // Opsional: Hanya tambahkan jika ada nilainya
  if (imageUrl) payload.image_url = imageUrl;
  if (event_id) payload.event_id = event_id;

  const res = await supabaseFetch('posts', {
    method: 'POST',
    headers: {
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Gagal menghubungi database' }));
    console.error('Supabase Post Error:', err);
    return { success: false, message: `Gagal membuat post: ${err.message || err.hint || 'Terjadi kesalahan di server database.'}` };
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
