import { NextRequest, NextResponse } from 'next/server'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const SB_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? SB_KEY
const H_PUBLIC = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
const H_ADMIN = { apikey: SB_SERVICE_KEY, Authorization: `Bearer ${SB_SERVICE_KEY}`, 'Content-Type': 'application/json' }

// GET - List participants for an event (public) or user's registrations
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const event_id = searchParams.get('event_id')
    const owner_id = searchParams.get('owner_id')

    let url = `${SB_URL}/rest/v1/event_participants?select=*&order=registered_at.desc`
    if (event_id) url += `&event_id=eq.${event_id}`
    if (owner_id) url += `&owner_id=eq.${owner_id}`

    const res = await fetch(url, { headers: H_PUBLIC })
    const data = await res.json()

    return NextResponse.json({ participants: Array.isArray(data) ? data : [] })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Register a bird for an event (peserta registers their own bird)
export async function POST(req: NextRequest) {
  try {
    const {
      event_id, bird_id, owner_id, owner_name, bird_name,
      event_name, event_date, event_kota, event_tingkat,
      event_jenis_burung, is_paid_event, biaya_daftar,
    } = await req.json()

    // Validation
    if (!event_id || !bird_id || !owner_id || !event_name) {
      return NextResponse.json({ error: 'Field wajib kurang: event_id, bird_id, owner_id, event_name' }, { status: 400 })
    }

    // Verify bird exists and belongs to owner
    const birdRes = await fetch(`${SB_URL}/rest/v1/birds?id=eq.${bird_id}&owner_id=eq.${owner_id}&select=id,nama_burung,jenis_burung`, { headers: H_PUBLIC })
    const birdData = await birdRes.json()
    if (!Array.isArray(birdData) || birdData.length === 0) {
      return NextResponse.json({ error: 'Bird tidak ditemukan atau bukan milik Anda' }, { status: 400 })
    }

    const bird = birdData[0]

    // Check if already registered
    const checkRes = await fetch(`${SB_URL}/rest/v1/event_participants?event_id=eq.${event_id}&bird_id=eq.${bird_id}&select=id`, { headers: H_PUBLIC })
    const existing = await checkRes.json()
    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json({ error: 'Bird ini sudah terdaftar untuk event ini' }, { status: 409 })
    }

    // Determine payment status
    const payment_status = is_paid_event ? 'pending_payment' : 'free'

    const payload = {
      event_id,
      bird_id,
      owner_id,
      owner_name: owner_name || bird.owner_name || '',
      bird_name: bird.nama_burung || bird_name || '',
      event_name,
      event_date: event_date || null,
      event_kota: event_kota || null,
      event_tingkat: event_tingkat || null,
      event_jenis_burung: event_jenis_burung || bird.jenis_burung || null,
      is_paid_event: is_paid_event ?? false,
      biaya_daftar: biaya_daftar ?? 0,
      payment_status,
    }

    const res = await fetch(`${SB_URL}/rest/v1/event_participants`, {
      method: 'POST',
      headers: H_ADMIN,
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json()
      return NextResponse.json({ error: err?.message || 'Gagal mendaftar' }, { status: 500 })
    }

    const newParticipant = await res.json()
    return NextResponse.json({
      success: true,
      participant: newParticipant,
      payment_status,
      is_paid_event,
    }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PATCH - Update participant status (admin confirms payment, or participant cancels)
export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? 'gantang2026'
    const isAdmin = authHeader === `Bearer ${ADMIN_TOKEN}`

    const { id, payment_status, payment_proof_url, action } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'id wajib diisi' }, { status: 400 })
    }

    // Get current participant
    const getRes = await fetch(`${SB_URL}/rest/v1/event_participants?id=eq.${id}&select=*`, { headers: H_PUBLIC })
    const data = await getRes.json()
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: 'Participant tidak ditemukan' }, { status: 404 })
    }
    const participant = data[0]

    // Non-admin actions
    if (!isAdmin) {
      // Participant cancels their own registration
      if (action === 'cancel') {
        const updRes = await fetch(`${SB_URL}/rest/v1/event_participants?id=eq.${id}`, {
          method: 'PATCH',
          headers: H_ADMIN,
          body: JSON.stringify({ payment_status: 'cancelled' }),
        })
        if (!updRes.ok) return NextResponse.json({ error: 'Gagal batalkan' }, { status: 500 })
        return NextResponse.json({ success: true, message: 'Pendaftaran dibatalkan' })
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin actions
    const updates: Record<string, unknown> = {}

    if (payment_status) {
      updates.payment_status = payment_status
      if (payment_status === 'confirmed') {
        updates.confirmed_at = new Date().toISOString()
      }
    }
    if (payment_proof_url !== undefined) {
      updates.payment_proof_url = payment_proof_url
    }

    const res = await fetch(`${SB_URL}/rest/v1/event_participants?id=eq.${id}`, {
      method: 'PATCH',
      headers: H_ADMIN,
      body: JSON.stringify(updates),
    })

    if (!res.ok) {
      const err = await res.json()
      return NextResponse.json({ error: err?.message || 'Gagal update' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
