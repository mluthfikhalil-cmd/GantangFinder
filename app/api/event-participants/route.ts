const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const headers = () => ({
  'apikey': SB_KEY,
  'Authorization': `Bearer ${SB_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_id, bird_id, user_id } = body;

    if (!event_id || !bird_id || !user_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if already registered
    const checkRes = await fetch(
      `${SB_URL}/rest/v1/event_participants?event_id=eq.${event_id}&user_id=eq.${user_id}&bird_id=eq.${bird_id}`,
      { headers: headers() }
    );
    const existing = await checkRes.json();
    
    if (Array.isArray(existing) && existing.length > 0) {
      return Response.json({ error: 'Already registered with this bird' }, { status: 400 });
    }

    // Create registration
    const res = await fetch(`${SB_URL}/rest/v1/event_participants`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ event_id, bird_id, user_id, status: 'pending' }),
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data.message || 'Failed to register' }, { status: 500 });
    }

    return Response.json({ data: Array.isArray(data) ? data[0] : data });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const event_id = searchParams.get('event_id');

    if (!event_id) {
      return Response.json({ error: 'event_id required' }, { status: 400 });
    }

    const res = await fetch(
      `${SB_URL}/rest/v1/event_participants?event_id=eq.${event_id}&select=*,birds:bird_id(id,nama_burung,jenis_burung),users:user_id(id,nama_lengkap,nomor_wa)`,
      { headers: headers() }
    );

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data.message || 'Failed to fetch' }, { status: 500 });
    }

    return Response.json({ data: Array.isArray(data) ? data : [] });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}