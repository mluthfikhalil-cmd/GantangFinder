'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }

interface User {
  id: string
  email: string
  nama_lengkap: string
  nomor_wa: string
  role: 'organizer' | 'peserta'
  kota: string
}

interface Event {
  id: string
  nama_event: string
  kota: string
  tanggal?: string | null
  level_event?: string | null
  status_event?: string
  is_featured?: boolean
  is_paid?: boolean
  harga_pendaftaran?: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('gf_user')
    const token = localStorage.getItem('gf_token')
    
    if (!storedUser || !token) {
      router.push('/login')
      return
    }

    const userData = JSON.parse(storedUser) as User
    setUser(userData)

    if (userData.role === 'organizer') {
      // Fetch organizer's events
      fetch(`${SB_URL}/rest/v1/events?organizer_id=eq.${userData.id}&select=*&order=created_at.desc`, { headers: H })
        .then(r => r.json())
        .then(d => { setEvents(Array.isArray(d) ? d : []); setLoading(false) })
        .catch(() => setLoading(false))
    } else {
      // For peserta, show all available events they can join
      fetch(`${SB_URL}/rest/v1/events?status_event=eq.published&select=*&order=tanggal.asc`, { headers: H })
        .then(r => r.json())
        .then(d => { setEvents(Array.isArray(d) ? d : []); setLoading(false) })
        .catch(() => setLoading(false))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('gf_user')
    localStorage.removeItem('gf_token')
    router.push('/login')
  }

  if (!user) return null

  const isOrganizer = user.role === 'organizer'

  const cardStyle: React.CSSProperties = {
    background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', padding: '24px 20px', color: '#fff' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 2px' }}>👋 {user.nama_lengkap}</h1>
              <p style={{ fontSize: 13, margin: 0, opacity: 0.85 }}>{user.kota || ''} • {user.nomor_wa}</p>
              <span style={{
                display: 'inline-block', marginTop: 6, padding: '2px 10px', borderRadius: 9999,
                background: isOrganizer ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)',
                fontSize: 11, fontWeight: 700,
              }}>
                {isOrganizer ? '🏆 Organizer' : '🐦 Peserta'}
              </span>
            </div>
            <button onClick={handleLogout} style={{
              background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8,
              padding: '8px 14px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>Logout</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px' }}>
        {/* Role-specific content */}
        {isOrganizer ? (
          <>
            {/* Organizer Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Total Event', val: events.length, emoji: '📋' },
                { label: 'Published', val: events.filter(e => e.status_event === 'published').length, emoji: '✅' },
                { label: 'Featured', val: events.filter(e => e.is_featured).length, emoji: '⭐' },
              ].map(s => (
                <div key={s.label} style={{ ...cardStyle, textAlign: 'center' }}>
                  <div style={{ fontSize: 24 }}>{s.emoji}</div>
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
              <div style={{ ...cardStyle, textAlign: 'center', padding: 32 }}>
                <p style={{ color: '#64748b' }}>Memuat...</p>
              </div>
            ) : events.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', padding: 32 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
                <p style={{ color: '#64748b', marginBottom: 12 }}>Belum ada event</p>
                <Link href="/admin" style={{
                  background: '#16a34a', color: '#fff',
                  padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  textDecoration: 'none',
                }}>Buat Event Pertama</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {events.map(ev => (
                  <Link key={ev.id} href={`/events/${ev.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{ev.nama_event}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                          📍 {ev.kota} {ev.tanggal ? `• ${new Date(ev.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {ev.is_paid && <span style={{ fontSize: 10, padding: '2px 6px', background: '#fef3c7', color: '#92400e', borderRadius: 4, fontWeight: 600 }}>💰 Berbayar</span>}
                        <span style={{
                          padding: '4px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
                          background: ev.status_event === 'published' ? '#dcfce7' : '#f1f5f9',
                          color: ev.status_event === 'published' ? '#15803d' : '#64748b',
                        }}>
                          {ev.status_event || 'draft'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Peserta Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Event', val: events.length, emoji: '🎯', href: '/dashboard' },
                { label: 'Ayam Jago', val: 'Manager', emoji: '🐓', href: '/birds?tab=rooster' },
                { label: 'Juara', val: 'Top 10', emoji: '🏆', href: '/leaderboard' },
              ].map(s => (
                <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
                  <div style={{ ...cardStyle, textAlign: 'center' }}>
                    <div style={{ fontSize: 24 }}>{s.emoji}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a' }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Browse Events */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>Event Tersedia</h2>
            </div>

            {loading ? (
              <div style={{ ...cardStyle, textAlign: 'center', padding: 32 }}>
                <p style={{ color: '#64748b' }}>Memuat...</p>
              </div>
            ) : events.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', padding: 32 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🏟️</div>
                <p style={{ color: '#64748b' }}>Belum ada event tersedia</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {events.map(ev => (
                  <Link key={ev.id} href={`/events/${ev.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ ...cardStyle }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{ev.nama_event}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                        📍 {ev.kota} {ev.tanggal && `• ${new Date(ev.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                        {ev.level_event && ` • ${ev.level_event}`}
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                        {ev.is_paid ? (
                          <span style={{ fontSize: 11, padding: '4px 10px', background: '#fef3c7', color: '#92400e', borderRadius: 6, fontWeight: 600 }}>
                            💰 Rp {(ev.harga_pendaftaran || 0).toLocaleString('id-ID')}
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, padding: '4px 10px', background: '#dcfce7', color: '#15803d', borderRadius: 6, fontWeight: 600 }}>
                            🎉 Gratis
                          </span>
                        )}
                        {ev.is_featured && (
                          <span style={{ fontSize: 11, padding: '4px 10px', background: '#fef9c3', color: '#854d0e', borderRadius: 6, fontWeight: 600 }}>
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Quick Link to Leaderboard */}
            <div style={{ marginTop: 24, ...cardStyle, textAlign: 'center', background: 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none' }}>
              <Link href="/leaderboard" style={{ textDecoration: 'none' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Leaderboard Burung</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>Lihat performa burung terbaik</div>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}