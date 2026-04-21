import { NextRequest, NextResponse } from 'next/server'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' }

export async function POST(req: NextRequest) {
  try {
    const { nama_lengkap, nomor_wa, email, kota } = await req.json()

    // Validation
    if (!nama_lengkap || !nomor_wa || !kota) {
      return NextResponse.json({ error: 'Nama, nomor WA, dan kota wajib diisi' }, { status: 400 })
    }

    // Normalize WA number
    let wa = nomor_wa.replace(/\D/g, '')
    if (wa.startsWith('0')) wa = '62' + wa.slice(1)
    if (!wa.startsWith('62')) wa = '62' + wa
    if (wa.length < 10) {
      return NextResponse.json({ error: 'Nomor WA tidak valid' }, { status: 400 })
    }

    // Check if already exists
    const check = await fetch(`${SB_URL}/rest/v1/organizers?nomor_wa=eq.${wa}&select=id,status`, { headers: H })
    const existing = await check.json()
    if (Array.isArray(existing) && existing.length > 0) {
      if (existing[0].status === 'pending') {
        return NextResponse.json({ error: 'Pendaftaran sedang menunggu approval. Mohon tunggu konfirmasi dari admin.' }, { status: 409 })
      }
      if (existing[0].status === 'approved') {
        return NextResponse.json({ error: 'Nomor WA ini sudah terdaftar. Silakan login.' }, { status: 409 })
      }
    }

    // Create organizer
    const payload = {
      nama_lengkap,
      nomor_wa: wa,
      email: email || null,
      kota,
      status: 'pending',
      login_token: null,
    }

    const res = await fetch(`${SB_URL}/rest/v1/organizers`, {
      method: 'POST',
      headers: H,
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json()
      return NextResponse.json({ error: err?.message || 'Gagal mendaftar' }, { status: 500 })
    }

    const data = await res.json()
    return NextResponse.json({
      success: true,
      message: 'Pendaftaran berhasil! Silakan tunggu approval dari admin (biasanya 1x24 jam).',
      id: data[0]?.id
    })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
