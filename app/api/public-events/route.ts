import { NextResponse } from 'next/server'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export async function GET() {
  if (!SB_URL || !SB_KEY) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }
  
  try {
    const res = await fetch(`${SB_URL}/rest/v1/events?select=*&order=is_featured.desc,tanggal.asc`, {
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`
      }
    })
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: res.status })
    }
    
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}