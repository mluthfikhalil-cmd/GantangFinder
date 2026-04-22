'use server';

import { revalidatePath } from 'next/cache';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Supabase environment variables are missing!');
}

async function supabaseFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  // console.log(`Fetching: ${url}`); // Uncomment for local debugging if needed
  
  return fetch(url, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY!,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation', 
      ...options.headers,
    },
  });
}

// 1. Ambil Feed (Optimized with Join)
export async function getFeed(page = 1, limit = 20) {
  const from = (page - 1) * limit;

  try {
    // Mencoba join dengan kolom yang sudah dikonfirmasi (nama_lengkap, nomor_wa)
    // Gunakan limit & offset (standar PostgREST) daripada range query param
    const res = await supabaseFetch(
      `posts?select=*,users(nama_lengkap,nomor_wa)&order=created_at.desc&limit=${limit}&offset=${from}`,
      { method: 'GET' }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Query failed' }));
      console.error('Supabase GET Error:', errorData);
      
      // Fallback: Jika join gagal, coba ambil posts saja tanpa join
      if (res.status === 400 || res.status === 403) {
         const fallbackRes = await supabaseFetch(
           `posts?select=*&order=created_at.desc&limit=${limit}&offset=${from}`,
           { method: 'GET' }
         );
         if (fallbackRes.ok) {
           const fallbackData = await fallbackRes.json();
           return { success: true, data: fallbackData, warning: 'Using fallback (no users join)' };
         }
      }
      
      return { success: false, message: errorData.message || 'Gagal mengambil data.', data: [] };
    }
    
    const posts = await res.json();
    return { success: true, data: posts };

  } catch (error) {
    console.error('Network Error in getFeed:', error);
    return { success: false, message: 'Kesalahan jaringan.', data: [] };
  }
}

// 2. Buat Post Baru
export async function createPost(formData: FormData) {
  const userId = formData.get('user_id') as string;
  const content = formData.get('content') as string;
  const type = formData.get('type') as string || 'harian';
  
  // console.log('Creating post with:', { userId, content, type }); 

  if (!userId || !content) {
    return { success: false, message: 'User ID dan Konten wajib diisi.' };
  }

  const payload = {
    user_id: userId,
    content: content,
    post_type: type,
    likes_count: 0
  };

  try {
    const res = await supabaseFetch('posts', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Database unreachable' }));
      console.error('Supabase POST Error:', err);
      return { success: false, message: `Gagal membuat post: ${err.message || 'Unknown error'}` };
    }

    const data = await res.json();
    revalidatePath('/feed');
    return { success: true, message: 'Post berhasil diterbitkan!', data: data[0] };

  } catch (error) {
    console.error('Network Error in createPost:', error);
    return { success: false, message: 'Kesalahan jaringan saat mengirim post.' };
  }
}

// 3. Like/Unlike Post
export async function toggleLike(postId: string, userId: string) {
  if (!postId || !userId) return { success: false, liked: false };

  try {
    // Cek apakah sudah like
    const checkRes = await supabaseFetch(`post_likes?post_id=eq.${postId}&user_id=eq.${userId}`, { method: 'GET' });
    const existingLike = await checkRes.json();

    if (existingLike && existingLike.length > 0) {
      // Unlike: Hapus record like
      const deleteRes = await supabaseFetch(`post_likes?id=eq.${existingLike[0].id}`, { method: 'DELETE' });
      
      if (!deleteRes.ok) throw new Error('Failed to delete like');

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
      const insertRes = await supabaseFetch('post_likes', {
        method: 'POST',
        body: JSON.stringify({ post_id: postId, user_id: userId })
      });

      if (!insertRes.ok) throw new Error('Failed to insert like');

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
  } catch (error) {
    console.error('Error in toggleLike:', error);
    return { success: false, liked: false };
  }
}
