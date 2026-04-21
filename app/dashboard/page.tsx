'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }

interface Ev {
  id: string; nama_event: string; kota: string; tanggal?: string|null
  level_event?: string|null; jenis_lomba?: string; status_event?: string
  is_featured?: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [org, setOrg] = useState<{ id: string; nama_lengkap: string; nomor_wa: string; kota: string } | null>(null)
  const [events, setEvents] = useState<Ev[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('gf_organizer')
    const token = localStorage.getItem('gf_token')
    if (!stored || !token) { router.push('/login'); return }

    const orgData = JSON.parse(stored)
    setOrg(orgData)

    // Fetch events created by this organizer
    fetch(`${SB_URL}/rest/v1/events?organizer_id=eq.${orgData.id}&select=*&order=created_at.desc`, { headers: H })
      .then(r => r.json())
      .then(d => { setEvents(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('gf_organizer')
    localStorage.removeItem('gf_token')
    router.push('/login')
  }

  const cardStyle: React.CSSProperties = {
    background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  }

  const statusBadge = (status?: string) => {
    const s = status || 'draft'
    const colors: Record<string, { bg: string; color: string }> = {
      draft: { bg: '#f1f5f9', color: '#64748b' },
      published: { bg: '#dcfce7', color: '#15803d' },
      cancelled: { bg: '#fef2f2', color: '#dc2626' },
    }
    const c = colors[s] || colors.draft
    return <span style={{ background: c.bg, color: c.color, padding: '2px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700 }}>{s}</span>
  }

  if (!org) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', padding: '24px 20px', color: '#fff' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 2px' }}>👋 {org.nama_lengkap}</h1>
              <p style={{ fontSize: 13, margin: 0, opacity: 0.85 }}>📍 {org.kota} • {org.nomor_wa}</p>
            </div>
            <button onClick={handleLogout} style={{
              background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8,
              padding: '8px 14px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>Logout</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Event', val: events.length },
            { label: 'Published', val: events.filter(e => e.status_event === 'published').length },
            { label: 'Featured', val: events.filter(e => e.is_featured).length },
          ].map(s => (
            <div key={s.label} style={{ ...cardStyle, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#16a34a' }}>{s.val}</div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* My Events */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>Event Saya</h2>
          <Link href="/admin" style={{
            background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff',
            padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700,
            textDecoration: 'none', boxShadow: '0 2px 8px rgba(22,163,74,0.25)',
          }}>+ Buat Event</Link>
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>Memuat...</p>
        ) : events.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
            <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 16px' }}>Belum ada event. Yuk buat event pertama lo!</p>
            <Link href="/admin" style={{
              background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff',
              padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
              textDecoration: 'none',
            }}>+ Buat Event Baru</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {events.map(ev => (
              <Link key={ev.id} href={`/events/${ev.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{ev.nama_event}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>📍 {ev.kota} {ev.tanggal ? `• ${new Date(ev.tanggal+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}` : ''}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {statusBadge(ev.status_event)}
                    {ev.is_featured && <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: 9999, fontSize: 10, fontWeight: 700 }}>⭐</span>}
                    <span style={{ color: '#94a3b8', fontSize: 16 }}>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
