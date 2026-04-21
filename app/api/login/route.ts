import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' }

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 48; i++) token += chars.charAt(Math.floor(Math.random() * chars.length))
  return token
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 })
    }

    // Find user by email
    const res = await fetch(`${SB_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=*`, { headers: H })
    const data = await res.json()

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: 'Email belum terdaftar.' }, { status: 404 })
    }

    const user = data[0]

    // Verify password with bcrypt
    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      // Fallback checking for old sha256 hash if bcrypt fails (backward compatibility)
      const crypto = require('crypto')
      const oldHash = crypto.createHash('sha256').update(password + 'gantang_salt_2026').digest('hex')
      if (oldHash !== user.password_hash) {
        return NextResponse.json({ error: 'Password salah.' }, { status: 401 })
      }
    }

    // Check status (default to active since new Qwen schema doesn't have status column)
    const status = user.status || 'active'
    if (status === 'pending_approval') {
      return NextResponse.json({ 
        error: 'Akun Anda sedang menunggu approval admin. Mohon tunggu.' 
      }, { status: 403 })
    }

    if (status === 'rejected') {
      return NextResponse.json({ 
        error: 'Akun Anda ditolak. Hubungi admin untuk info lebih lanjut.' 
      }, { status: 403 })
    }

    if (status !== 'active') {
      return NextResponse.json({ 
        error: 'Akun belum diaktifkan. Hubungi admin.' 
      }, { status: 403 })
    }

    // Generate session token
    const token = generateToken()
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days

    // Store session
    await fetch(`${SB_URL}/rest/v1/user_sessions`, {
      method: 'POST',
      headers: H,
      body: JSON.stringify({
        user_id: user.id,
        token_hash: token,
        expires_at,
      }),
    })

    // Return user data (exclude sensitive fields)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nama_lengkap: user.full_name || user.nama_lengkap || 'User',
        nomor_wa: user.whatsapp_number || user.nomor_wa || '',
        role: user.role || 'peserta', // Default role if missing
        kota: user.city || user.kota || '',
      },
      token,
    })
  } catch (e) {
    console.error('Login error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}