import { NextRequest, NextResponse } from 'next/server'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' }

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) token += chars.charAt(Math.floor(Math.random() * chars.length))
  return token
}

export async function POST(req: NextRequest) {
  try {
    const { nomor_wa } = await req.json()

    if (!nomor_wa) {
      return NextResponse.json({ error: 'Nomor WA wajib diisi' }, { status: 400 })
    }

    // Normalize WA number
    let wa = nomor_wa.replace(/\D/g, '')
    if (wa.startsWith('0')) wa = '62' + wa.slice(1)
    if (!wa.startsWith('62')) wa = '62' + wa

    // Find organizer
    const res = await fetch(`${SB_URL}/rest/v1/organizers?nomor_wa=eq.${wa}&select=*`, { headers: H })
    const data = await res.json()

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: 'Nomor WA belum terdaftar. Silakan register dulu.' }, { status: 404 })
    }

    const organizer = data[0]

    if (organizer.status === 'pending') {
      return NextResponse.json({ error: 'Pendaftaran Anda masih menunggu approval admin. Mohon tunggu.' }, { status: 403 })
    }

    if (organizer.status === 'rejected') {
      return NextResponse.json({ error: 'Pendaftaran Anda ditolak. Hubungi admin untuk info lebih lanjut.' }, { status: 403 })
    }

    // Generate new token
    const token = generateToken()

    // Update token in DB
    await fetch(`${SB_URL}/rest/v1/organizers?id=eq.${organizer.id}`, {
      method: 'PATCH',
      headers: H,
      body: JSON.stringify({ login_token: token, updated_at: new Date().toISOString() }),
    })

    return NextResponse.json({
      success: true,
      organizer: {
        id: organizer.id,
        nama_lengkap: organizer.nama_lengkap,
        nomor_wa: organizer.nomor_wa,
        kota: organizer.kota,
        email: organizer.email,
      },
      token,
    })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
