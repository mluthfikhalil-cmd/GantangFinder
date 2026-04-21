import { NextRequest, NextResponse } from 'next/server'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' }
const PASS = process.env.ADMIN_PASS || 'gantang2026'

// GET - List all organizers (admin only via header auth)
export async function GET(req: NextRequest) {
  const adminPass = req.headers.get('x-admin-pass')
  if (adminPass !== PASS) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') // pending | approved | rejected

  let url = `${SB_URL}/rest/v1/organizers?select=*&order=created_at.desc`
  if (status) url += `&status=eq.${status}`

  const res = await fetch(url, { headers: H })
  const data = await res.json()
  return NextResponse.json(data)
}

// PATCH - Update organizer status (approve/reject)
export async function PATCH(req: NextRequest) {
  const adminPass = req.headers.get('x-admin-pass')
  if (adminPass !== PASS) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id, status } = await req.json()
    if (!id || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const res = await fetch(`${SB_URL}/rest/v1/organizers?id=eq.${id}`, {
      method: 'PATCH',
      headers: H,
      body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
    })

    if (!res.ok) return NextResponse.json({ error: 'Failed' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
