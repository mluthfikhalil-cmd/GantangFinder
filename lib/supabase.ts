// Supabase REST API helper — no supabase-js, no GoTrueClient, no init issues
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

const headers = () => ({
  'apikey': KEY,
  'Authorization': `Bearer ${KEY}`,
  'Content-Type': 'application/json',
})

export async function dbFetchEvents() {
  if (!URL || !KEY) return []
  const res = await fetch(
    `${URL}/rest/v1/events?select=*&order=is_featured.desc,tanggal.asc`,
    { headers: headers() }
  )
  if (!res.ok) return []
  return res.json()
}

export async function dbInsertEvent(data: Record<string, unknown>) {
  if (!URL || !KEY) throw new Error('Konfigurasi database tidak ditemukan.')
  const res = await fetch(`${URL}/rest/v1/events`, {
    method: 'POST',
    headers: { ...headers(), 'Prefer': 'return=minimal' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Gagal menyimpan (HTTP ${res.status})`)
  }
}