'use server'
import { headers } from 'next/headers'

// Simple hash using base64 (for demo purposes only - use proper hashing in production)
function simpleHash(str: string): string {
  return Buffer.from(str).toString('base64')
}

export async function loginUser(username: string, password: string) {
  if (!username || !password) {
    return { success: false, error: 'Username dan password wajib diisi' }
  }
  
  const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!SB_URL || !SB_KEY) {
    return { success: false, error: 'Konfigurasi server tidak valid' }
  }
  
  const passwordHash = simpleHash(password)
  const headersList = await headers()
  const headers = {
    apikey: SB_KEY,
    Authorization: `Bearer ${SB_KEY}`,
    'Content-Type': 'application/json',
  }
  
  try {
    // Find user by username and password
    const res = await fetch(
      `${SB_URL}/rest/v1/users?username=eq.${encodeURIComponent(username)}&password_hash=eq.${encodeURIComponent(passwordHash)}&select=*`,
      { headers }
    )
    const data = await res.json()
    
    if (!Array.isArray(data) || data.length === 0) {
      return { success: false, error: 'Username atau password salah' }
    }
    
    const user = data[0]
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        wa_number: user.wa_number,
      }
    }
  } catch (e) {
    return { success: false, error: 'Terjadi kesalahan saat login' }
  }
}

export async function registerUser(
  username: string,
  password: string,
  namaLengkap: string,
  waNumber?: string
) {
  if (!username || !password || !namaLengkap) {
    return { success: false, error: 'Username, password, dan nama lengkap wajib diisi' }
  }
  
  if (password.length < 4) {
    return { success: false, error: 'Password minimal 4 karakter' }
  }
  
  const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!SB_URL || !SB_KEY) {
    return { success: false, error: 'Konfigurasi server tidak valid' }
  }
  
  const headers = {
    apikey: SB_KEY,
    Authorization: `Bearer ${SB_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  }
  
  try {
    // Check if username already exists
    const checkRes = await fetch(
      `${SB_URL}/rest/v1/users?username=eq.${encodeURIComponent(username)}&select=id`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
    )
    const checkData = await checkRes.json()
    
    if (Array.isArray(checkData) {
      return { success: false, error: 'Username sudah terdaftar' }
    }
    
    // Create new user
    const passwordHash = simpleHash(password)
    const res = await fetch(`${SB_URL}/rest/v1/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        username,
        password_hash: passwordHash,
        nama_lengkap: namaLengkap,
        wa_number: waNumber || null,
      }),
    })
    
    if (!res.ok) {
      const errorData = await res.json()
      return { success: false, error: errorData?.message || 'Gagal mendaftar' }
    }
    
    const data = await res.json()
    const user = Array.isArray(data) ? data[0] : data
    
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        wa_number: user.wa_number,
      }
    }
  } catch (e) {
    return { success: false, error: 'Terjadi kesalahan saat mendaftar' }
  }
}

export async function getCurrentUser() {
  // This will be called client-side from the page
  return null
}