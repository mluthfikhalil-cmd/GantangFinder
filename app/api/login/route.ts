import { NextRequest, NextResponse } from 'next/server'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' }

// Simple base64 hash (for demo - use proper hashing in production)
function simpleHash(str: string): string {
  return Buffer.from(str).toString('base64')
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username dan password wajib diisi' }, { status: 400 })
    }

    const passwordHash = simpleHash(password)

    // Find user by username and password
    const res = await fetch(
      `${SB_URL}/rest/v1/users?username=eq.${encodeURIComponent(username)}&password_hash=eq.${encodeURIComponent(passwordHash)}&select=*`,
      { headers: H }
    )
    const data = await res.json()

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ success: false, error: 'Username atau password salah' }, { status: 401 })
    }

    const user = data[0]

    // Return user data
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username || user.email,
        nama_lengkap: user.full_name,
        wa_number: user.whatsapp_number || '',
      },
    })
  } catch (e) {
    console.error('Login error:', e)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan' }, { status: 500 })
  }
}