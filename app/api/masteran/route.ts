import { NextRequest, NextResponse } from 'next/server'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }

const RES = (d: unknown, s = 200) => NextResponse.json(d, { status: s })
const ERR = (m: string, s = 400) => RES({ error: m }, s)

// GET /api/masteran — List all sounds
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const birdType = searchParams.get('bird_type')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const sort = searchParams.get('sort') ?? 'play_count'
    const order = searchParams.get('order') ?? 'desc'

    if (!SB_URL || !SB_KEY) return ERR('Supabase not configured', 500)

    let url = `${SB_URL}/rest/v1/masteran_sounds?select=*&is_active=eq.true&order=${sort}.${order}&limit=${limit}`

    if (birdType && birdType !== 'all') {
      url += `&bird_type=eq.${encodeURIComponent(birdType)}`
    }

    if (search) {
      url += `&title=ilike.*${encodeURIComponent(search)}*`
    }

    const r = await fetch(url, { headers: H })
    if (!r.ok) return ERR('Failed to fetch sounds', 500)
    const data = await r.json()
    return RES(Array.isArray(data) ? data : [])
  } catch (e: unknown) {
    return ERR(String(e), 500)
  }
}

// POST /api/masteran — Increment play or download count
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, action } = body

    if (!id || !action) return ERR('Missing id or action')
    if (!['play', 'download'].includes(action)) return ERR('Invalid action')

    const fn = action === 'play' ? 'increment_masteran_play_count' : 'increment_masteran_download_count'

    const rpcUrl = `${SB_URL}/rest/v1/rpc/${fn}`
    const r = await fetch(rpcUrl, {
      method: 'POST',
      headers: { ...H, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sound_id: id }),
    })

    if (!r.ok) return ERR('Failed to update count', 500)
    return RES({ success: true })
  } catch (e: unknown) {
    return ERR(String(e), 500)
  }
}

// PUT /api/masteran — Admin: add new sound
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, description, bird_type, audio_url, duration_seconds, source } = body

    if (!title || !bird_type || !audio_url) {
      return ERR('title, bird_type, audio_url are required')
    }

    if (!SB_URL || !SB_KEY) return ERR('Supabase not configured', 500)

    const payload = {
      title,
      description: description ?? null,
      bird_type,
      audio_url,
      duration_seconds: duration_seconds ?? null,
      source: source ?? 'admin',
      is_active: true,
    }

    const r = await fetch(`${SB_URL}/rest/v1/masteran_sounds`, {
      method: 'POST',
      headers: { ...H, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(payload),
    })

    if (!r.ok) return ERR('Failed to insert sound', 500)
    const data = await r.json()
    return RES(data, 201)
  } catch (e: unknown) {
    return ERR(String(e), 500)
  }
}

// DELETE /api/masteran — Admin: delete sound
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return ERR('Missing id')

    if (!SB_URL || !SB_KEY) return ERR('Supabase not configured', 500)

    const r = await fetch(`${SB_URL}/rest/v1/masteran_sounds?id=eq.${id}`, {
      method: 'DELETE',
      headers: H,
    })

    if (!r.ok) return ERR('Failed to delete', 500)
    return RES({ success: true })
  } catch (e: unknown) {
    return ERR(String(e), 500)
  }
}