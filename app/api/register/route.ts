import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomBytes } from 'crypto'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' }
const ADMIN_TOKEN = process.env.ADMIN_SECRET_TOKEN ?? 'gantang2026'

function simpleHash(password: string): string {
  return createHash('sha256').update(password + 'gantang_salt_2026').digest('hex')
}

function generateToken(): string {
  return randomBytes(32).toString('hex')
}

function normalizeWA(wa: string): string {
  let w = wa.replace(/\D/g, '')
  if (w.startsWith('0')) w = '62' + w.slice(1)
  if (!w.startsWith('62')) w = '62' + w
  return w
}

export async function POST(req: NextRequest) {
  try {
    const { 
      nama_lengkap, 
      nomor_wa, 
      email, 
      kota, 
      password, 
      role,
    } = await req.json()

    // Validation
    if (!nama_lengkap || !nomor_wa || !password || !role) {
      return NextResponse.json({ error: 'Nama, nomor WA, password, dan role wajib diisi' }, { status: 400 })
    }

    if (!['organizer', 'peserta'].includes(role)) {
      return NextResponse.json({ error: 'Role harus organizer atau peserta' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
    }

    // Normalize WA number
    const wa = normalizeWA(nomor_wa)
    if (wa.length < 10) {
      return NextResponse.json({ error: 'Nomor WA tidak valid' }, { status: 400 })
    }

    // Check if already exists
    const check = await fetch(`${SB_URL}/rest/v1/users?nomor_wa=eq.${wa}&select=id,status`, { headers: H })
    const existing = await check.json()
    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json({ error: 'Nomor WA sudah terdaftar. Silakan login.' }, { status: 409 })
    }

    // Check email uniqueness if provided
    if (email) {
      const emailCheck = await fetch(`${SB_URL}/rest/v1/users?email=eq.${email}&select=id`, { headers: H })
      const emailExisting = await emailCheck.json()
      if (Array.isArray(emailExisting) && emailExisting.length > 0) {
        return NextResponse.json({ error: 'Email sudah terdaftar. Gunakan email lain.' }, { status: 409 })
      }
    }

    const password_hash = simpleHash(password)

    // Organizer needs admin approval before creating events
    const status = role === 'organizer' ? 'pending_approval' : 'active'

    // Create user
    const payload: Record<string, unknown> = {
      email: email || null,
      password_hash,
      nama_lengkap,
      nomor_wa: wa,
      role,
      status,
      kota: kota || null,
    }

    const res = await fetch(`${SB_URL}/rest/v1/users`, {
      method: 'POST',
      headers: { ...H, 'Prefer': 'return=representation' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json()
      return NextResponse.json({ error: err?.message || 'Gagal mendaftar' }, { status: 500 })
    }

    const data = await res.json()
    const user = data[0]

    const message = role === 'organizer'
      ? 'Pendaftaran berhasil! Akun organizer Anda menunggu persetujuan admin. Anda akan bisa login setelah diterima.'
      : 'Pendaftaran berhasil! Selamat datang di GantangFinder.'

    return NextResponse.json({
      success: true,
      message,
      userId: user.id,
      role,
    })
  } catch (e) {
    console.error('Register error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}