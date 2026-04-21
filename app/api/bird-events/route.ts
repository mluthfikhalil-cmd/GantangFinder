import { NextRequest, NextResponse } from 'next/server'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const SB_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? SB_KEY
const H_PUBLIC = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
const H_ADMIN = { apikey: SB_SERVICE_KEY, Authorization: `Bearer ${SB_SERVICE_KEY}`, 'Content-Type': 'application/json' }

function calcPoints(posisi: number | null, tingkat: string, isPesertaOnly: boolean): number {
  let base = 10
  if (!isPesertaOnly && posisi === 1) base = 100
  else if (!isPesertaOnly && posisi === 2) base = 75
  else if (!isPesertaOnly && posisi === 3) base = 50
  else if (!isPesertaOnly && posisi != null && posisi > 3) base = 10
  else base = 10 // participant

  const mult: Record<string, number> = {
    lokal: 1.0, kecamatan: 1.1, kabupaten: 1.2, provincial: 1.5, nasional: 2.0, internasional: 3.0,
  }
  return Math.round(base * (mult[tingkat] ?? 1.0))
}

// GET - List bird events (for leaderboard aggregation)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const bird_id = searchParams.get('bird_id')
    const event_id = searchParams.get('event_id')
    const tingkat = searchParams.get('tingkat')

    let url = `${SB_URL}/rest/v1/bird_events?select=*&order=event_date.desc`
    if (bird_id) url += `&bird_id=eq.${bird_id}`
    if (event_id) url += `&event_id=eq.${event_id}`

    const res = await fetch(url, { headers: H_PUBLIC })
    const data = await res.json()

    let events: unknown[] = Array.isArray(data) ? data : []
    if (tingkat) {
      events = events.filter((e: any) => e.event_tingkat === tingkat)
    }

    return NextResponse.json({ bird_events: events })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// GET - Leaderboard aggregation
export async function POST(req: NextRequest) {
  try {
    const { jenis_burung, tingkat, limit = 50 } = await req.json()

    // Fetch all bird events, optionally filtered
    let url = `${SB_URL}/rest/v1/bird_events?select=*&order=event_date.desc`
    const res = await fetch(url, { headers: H_PUBLIC })
    let allEvents: any[] = Array.isArray(await res.json()) ? await res.json() : []

    // Filter
    if (jenis_burung) {
      allEvents = allEvents.filter(e => e.event_jenis_burung?.toLowerCase() === jenis_burung.toLowerCase())
    }
    if (tingkat) {
      allEvents = allEvents.filter(e => e.event_tingkat === tingkat)
    }

    // Aggregate points per bird
    const birdMap = new Map<string, {
      bird_id: string
      nama_burung: string
      jenis_burung: string
      owner_name: string
      total_points: number
      event_count: number
      first_places: number
      second_places: number
      third_places: number
      recent_events: { event_name: string; event_date: string; posisi: number | null; points: number }[]
    }>()

    for (const ev of allEvents) {
      if (!birdMap.has(ev.bird_id)) {
        birdMap.set(ev.bird_id, {
          bird_id: ev.bird_id,
          nama_burung: ev.nama_burung ?? '',
          jenis_burung: ev.event_jenis_burung ?? '',
          owner_name: ev.owner_name ?? '',
          total_points: 0,
          event_count: 0,
          first_places: 0,
          second_places: 0,
          third_places: 0,
          recent_events: [],
        })
      }
      const b = birdMap.get(ev.bird_id)!
      b.total_points += ev.points_earned ?? 0
      b.event_count += 1
      if (ev.posisi === 1) b.first_places += 1
      else if (ev.posisi === 2) b.second_places += 1
      else if (ev.posisi === 3) b.third_places += 1
      if (b.recent_events.length < 5) {
        b.recent_events.push({
          event_name: ev.event_name,
          event_date: ev.event_date,
          posisi: ev.posisi,
          points: ev.points_earned,
        })
      }
    }

    // Sort by total_points desc
    const leaderboard = Array.from(birdMap.values())
      .sort((a, b) => b.total_points - a.total_points)
      .slice(0, limit)
      .map((entry, idx) => ({ rank: idx + 1, ...entry }))

    return NextResponse.json({ leaderboard })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Log bird participation in an event (created by organizer/admin when inputting results)
export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? 'gantang2026'
    if (!authHeader || authHeader !== `Bearer ${ADMIN_TOKEN}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      bird_id, event_id, event_name, event_date, event_kota,
      event_jenis_lomba, event_jenis_burung, event_tingkat,
      kelas, posisi, is_peserta_only, nama_burung, owner_name,
    } = await req.json()

    if (!bird_id || !event_id || !event_name || !event_date) {
      return NextResponse.json({ error: 'Field wajib kurang: bird_id, event_id, event_name, event_date' }, { status: 400 })
    }

    const points = calcPoints(posisi ?? null, event_tingkat ?? 'lokal', is_peserta_only ?? false)

    // Upsert (in case re-submitting results)
    const res = await fetch(
      `${SB_URL}/rest/v1/bird_events?bird_id=eq.${bird_id}&event_id=eq.${event_id}&kelas=eq.${kelas ?? ''}`,
      { headers: H_ADMIN }
    )
    const existing: any[] = await res.json()

    if (existing.length > 0) {
      // Update existing
      const updateRes = await fetch(
        `${SB_URL}/rest/v1/bird_events?id=eq.${existing[0].id}`,
        {
          method: 'PATCH',
          headers: H_ADMIN,
          body: JSON.stringify({ posisi, points_earned: points, event_tingkat, is_peserta_only }),
        }
      )
      if (!updateRes.ok) return NextResponse.json({ error: 'Gagal update' }, { status: 500 })
    } else {
      // Insert new
      const insertRes = await fetch(`${SB_URL}/rest/v1/bird_events`, {
        method: 'POST',
        headers: H_ADMIN,
        body: JSON.stringify({
          bird_id, event_id, event_name, event_date, event_kota,
          event_jenis_lomba, event_jenis_burung, event_tingkat: event_tingkat ?? 'lokal',
          kelas, posisi: posisi ?? null, is_peserta_only: is_peserta_only ?? false,
          points_earned: points, nama_burung, owner_name,
        }),
      })
      if (!insertRes.ok) {
        const err = await insertRes.json()
        return NextResponse.json({ error: err.message || 'Gagal insert' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, points_earned: points })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
