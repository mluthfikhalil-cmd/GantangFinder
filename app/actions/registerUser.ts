'use server'

import bcrypt from 'bcryptjs'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const H = { 
  apikey: SB_KEY, 
  Authorization: `Bearer ${SB_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
}

export async function registerUserAction(formData: any) {
  try {
    // 1. Cek apakah email sudah terdaftar
    const checkRes = await fetch(`${SB_URL}/rest/v1/users?email=eq.${encodeURIComponent(formData.email)}&select=id`, { 
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
      cache: 'no-store'
    })
    
    const existing = await checkRes.json()
    if (existing && existing.length > 0) {
      return { success: false, error: 'Email sudah terdaftar. Silakan gunakan email lain.' }
    }

    // 2. Hash Password (mengacak password biar aman)
    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(formData.password, salt)

    // 3. Masukkan data ke Supabase (sesuai skema Qwen)
    const body = {
      full_name: formData.nama_lengkap,
      whatsapp_number: formData.nomor_wa,
      email: formData.email,
      city: formData.kota,
      password_hash: password_hash
    }

    const res = await fetch(`${SB_URL}/rest/v1/users`, {
      method: 'POST',
      headers: H,
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP Error ${res.status}`)
    }

    return { success: true, message: 'Registrasi berhasil! Silakan login.' }
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal menyimpan data ke server.' }
  }
}
