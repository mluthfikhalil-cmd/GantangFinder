import { NextRequest, NextResponse } from 'next/server'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const SB_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? SB_KEY
const H_PUBLIC = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
const H_ADMIN = { apikey: SB_SERVICE_KEY, Authorization: `Bearer ${SB_SERVICE_KEY}`, 'Content-Type': 'application/json' }

// GET - List birds (public for leaderboard, filtered by owner for my birds)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const owner_id = searchParams.get('owner_id')
    const jenis = searchParams.get('jenis')
    const search = searchParams.get('search')

    let url = `${SB_URL}/rest/v1/birds?select=*&order=nama_burung.asc`

    if (owner_id) url += `&owner_id=eq.${owner_id}`
    if (jenis) url += `&jenis_burung=ilike.%25${jenis}%25`
    if (search) url += `&nama_burung=ilike.%25${search}%25`

    const res = await fetch(url, { headers: H_PUBLIC })
    const data = await res.json()

    return NextResponse.json({ birds: Array.isArray(data) ? data : [] })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Register a new bird (participant registers their own bird)
export async function POST(req: NextRequest) {
  try {
    const { nama_burung, jenis_burung, owner_id, owner_name } = await req.json()

    if (!nama_burung || !jenis_burung || !owner_id || !owner_name) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }

    // Verify owner exists and is active
    const userRes = await fetch(`${SB_URL}/rest/v1/users?id=eq.${owner_id}&status=eq.active&select=id`, { headers: H_PUBLIC })
    const userData = await userRes.json()
    if (!Array.isArray(userData) || userData.length === 0) {
      return NextResponse.json({ error: 'User tidak valid atau belum aktif' }, { status: 400 })
    }

    const res = await fetch(`${SB_URL}/rest/v1/birds`, {
      method: 'POST',
      headers: H_ADMIN,
      body: JSON.stringify({
        nama_burung,
        jenis_burung,
        owner_id,
        owner_name,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      return NextResponse.json({ error: err.message || 'Gagal register bird' }, { status: 500 })
    }

    const newBird = await res.json()
    return NextResponse.json({ success: true, bird: newBird }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE - Remove a bird profile
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const owner_id = searchParams.get('owner_id')

    if (!id || !owner_id) {
      return NextResponse.json({ error: 'id dan owner_id wajib' }, { status: 400 })
    }

    const res = await fetch(`${SB_URL}/rest/v1/birds?id=eq.${id}&owner_id=eq.${owner_id}`, {
      method: 'DELETE',
      headers: H_ADMIN,
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Gagal hapus bird' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
