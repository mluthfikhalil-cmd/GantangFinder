import { NextRequest, NextResponse } from 'next/server'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const SB_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? SB_KEY
const H = { apikey: SB_SERVICE_KEY, Authorization: `Bearer ${SB_SERVICE_KEY}`, 'Content-Type': 'application/json' }
const ADMIN_TOKEN = process.env.ADMIN_SECRET_TOKEN ?? 'gantang2026'

// GET - List all users (admin only)
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${ADMIN_TOKEN}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role')
    const status = searchParams.get('status')

    let url = `${SB_URL}/rest/v1/users?select=*&order=created_at.desc`
    if (role) url += `&role=eq.${role}`
    if (status) url += `&status=eq.${status}`

    const res = await fetch(url, { headers: H })
    const data = await res.json()

    return NextResponse.json({ users: Array.isArray(data) ? data : [] })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PATCH - Update user status (approve/reject organizer)
export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${ADMIN_TOKEN}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user_id, status } = await req.json()

    if (!user_id || !status) {
      return NextResponse.json({ error: 'user_id dan status wajib diisi' }, { status: 400 })
    }

    if (!['active', 'rejected', 'pending_approval'].includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
    }

    // Update user status
    const res = await fetch(`${SB_URL}/rest/v1/users?id=eq.${user_id}`, {
      method: 'PATCH',
      headers: { ...H, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        status,
        updated_at: new Date().toISOString(),
      }),
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Gagal update status' }, { status: 500 })
    }

    // If approving organizer, verify the payment too
    if (status === 'active') {
      await fetch(`${SB_URL}/rest/v1/organizer_payments?user_id=eq.${user_id}&status=eq.pending`, {
        method: 'PATCH',
        headers: H,
        body: JSON.stringify({ status: 'verified' }),
      })
    }

    return NextResponse.json({ success: true, message: `User status diupdate ke ${status}` })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}