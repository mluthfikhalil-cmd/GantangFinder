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

// ==========================================
// FITUR D: MEDICAL RECORD
// ==========================================

export async function addMedicalRecord(formData: FormData) {
  const roosterId = formData.get('rooster_id') as string;
  const type = formData.get('type') as string;
  const productName = formData.get('product_name') as string;
  const date = formData.get('date') as string;
  const nextSchedule = formData.get('next_schedule') as string;
  const notes = formData.get('notes') as string;

  const payload = {
    rooster_id: roosterId,
    type,
    product_name: productName,
    date,
    next_schedule: nextSchedule || null,
    notes
  };

  const res = await supabaseFetch('medical_records', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (!res.ok) return { success: false, message: 'Gagal simpan rekam medis.' };
  
  revalidatePath(`/roosters/${roosterId}`);
  return { success: true, message: 'Rekam medis tersimpan.' };
}

export async function getMedicalHistory(roosterId: string) {
  const res = await supabaseFetch(`medical_records?rooster_id=eq.${roosterId}&order=date.desc`, {
    method: 'GET'
  });
  if (!res.ok) return { success: false, data: [] };
  return { success: true, data: await res.json() };
}

// ==========================================
// FITUR E: SPARRING PARTNER FINDER
// ==========================================

export async function findSparringPartners(myRoosterId: string, myWeight: number, myCity: string) {
  // Cari ayam lain yang:
  // 1. Bukan milik sendiri
  // 2. Status 'active'
  // 3. Bobot mirip (± 0.5 kg)
  
  const minWeight = myWeight - 0.5;
  const maxWeight = myWeight + 0.5;

  // Query: ambil roosters yang active dan bobotnya sesuai
  const res = await supabaseFetch(
    `roosters?sparring_status=eq.active&weight_kg=gte.${minWeight}&weight_kg=lte.${maxWeight}&id=neq.${myRoosterId}&select=id,name,breed,weight_kg,height_cm,owner_id,users(nama_lengkap,nomor_wa)`,
    { method: 'GET' }
  );

  if (!res.ok) return { success: false, data: [] };
  return { success: true, data: await res.json() };
}

export async function sendSparringRequest(requesterId: string, targetId: string, date: string, notes: string) {
  const payload = {
    requester_rooster_id: requesterId,
    target_rooster_id: targetId,
    proposed_date: date,
    notes,
    status: 'pending'
  };

  const res = await supabaseFetch('sparring_requests', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (!res.ok) return { success: false, message: 'Gagal kirim permintaan.' };
  return { success: true, message: 'Permintaan sparring terkirim!' };
}

// ==========================================
// FITUR F: JURNAL PERFORMA (Training Log)
// ==========================================

export async function addTrainingLog(formData: FormData) {
  const roosterId = formData.get('rooster_id') as string;
  const date = formData.get('date') as string;
  const activity = formData.get('activity') as string; // 'lari', 'renang', 'latih_tanding'
  const duration = formData.get('duration') as string;
  const condition = formData.get('condition') as string; // 'fit', 'lelah', 'cedera_ringan'
  const notes = formData.get('notes') as string;

  const payload = {
    rooster_id: roosterId,
    date,
    activity_type: activity,
    duration_minutes: duration ? parseInt(duration) : 0,
    notes: `${condition}. ${notes}`
  };

  const res = await supabaseFetch('training_logs', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (!res.ok) return { success: false, message: 'Gagal catat latihan.' };
  
  revalidatePath(`/roosters/${roosterId}`);
  return { success: true, message: 'Jurnal latihan tersimpan.' };
}

export async function getPerformanceStats(roosterId: string) {
  // Ambil 7 hari terakhir untuk grafik sederhana
  const res = await supabaseFetch(`training_logs?rooster_id=eq.${roosterId}&order=date.desc&limit=7`, {
    method: 'GET'
  });
  if (!res.ok) return { success: false, data: [] };
  return { success: true, data: await res.json() };
}
