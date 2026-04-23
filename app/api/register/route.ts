import { NextRequest, NextResponse } from 'next/server'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const H = { 
  apikey: SB_KEY, 
  Authorization: `Bearer ${SB_KEY}`, 
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

// Simple base64 hash (for demo - use proper hashing in production)
function simpleHash(str: string): string {
  return Buffer.from(str).toString('base64')
}

export async function POST(req: NextRequest) {
  try {
    const { username, password, namaLengkap, waNumber } = await req.json()

    if (!username || !password || !namaLengkap) {
      return NextResponse.json({ success: false, error: 'Username, password, dan nama lengkap wajib diisi' }, { status: 400 })
    }

    if (password.length < 4) {
      return NextResponse.json({ success: false, error: 'Password minimal 4 karakter' }, { status: 400 })
    }

    // Check if username or email exists
    const checkRes = await fetch(
      `${SB_URL}/rest/v1/users?or=(username.eq.${encodeURIComponent(username)},email.eq.${encodeURIComponent(username+'@demo.com')})&select=id`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
    )
    const checkData = await checkRes.json()

    if (Array.isArray(checkData) && checkData.length > 0) {
      return NextResponse.json({ success: false, error: 'Username sudah terdaftar' }, { status: 409 })
    }

    // Create new user
    const passwordHash = simpleHash(password)
    const res = await fetch(`${SB_URL}/rest/v1/users`, {
      method: 'POST',
      headers: H,
      body: JSON.stringify({
        username,
        email: username + '@demo.com', -- Use username as email for compatibility
        password_hash: passwordHash,
        full_name: namaLengkap,
        whatsapp_number: waNumber || null,
      }),
    })

    if (!res.ok) {
      const errorData = await res.json()
      return NextResponse.json({ success: false, error: errorData?.message || 'Gagal mendaftar' }, { status: res.status })
    }

    const data = await res.json()
    const user = Array.isArray(data) ? data[0] : data

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
    console.error('Register error:', e)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan' }, { status: 500 })
  }
}