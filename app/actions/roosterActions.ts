'use server';

import { revalidatePath } from 'next/cache';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function supabaseFetch(endpoint: string, options: RequestInit = {}) {
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

export async function getRoosterProfile(id: string) {
  const res = await supabaseFetch(`roosters?id=eq.${id}&select=*`, {
    method: 'GET'
  });
  if (!res.ok) return { success: false, message: 'Gagal mengambil profil ayam' };
  const data = await res.json();
  return { success: true, profile: data[0] || null };
}

export async function createRooster(formData: FormData) {
  const ownerId = formData.get('owner_id') as string;
  const name = formData.get('name') as string;
  const breed = formData.get('breed') as string;
  const weight = formData.get('weight_kg') as string;
  const height = formData.get('height_cm') as string;

  const payload = {
    owner_id: ownerId,
    name,
    breed,
    weight_kg: weight ? parseFloat(weight) : null,
    height_cm: height ? parseInt(height) : null,
    sparring_status: 'inactive'
  };

  const res = await supabaseFetch('roosters', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (!res.ok) return { success: false, message: 'Gagal mendaftarkan ayam' };
  
  revalidatePath('/birds');
  return { success: true, message: 'Ayam berhasil didaftarkan' };
}
