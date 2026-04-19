'use client'

import { useState, useEffect } from 'react'
import AddEventModal from './AddEventModal'

interface Event {
  id: string
  nama_event: string
  penyelenggara: string
  lokasi: string
  kota: string
  tanggal: string | null
  jenis_burung: string[]
  is_featured: boolean
}

function getDaysUntil(tanggal: string | null): number | null {
  if (!tanggal) return null
  const diff = new Date(tanggal).getTime() - new Date().setHours(0, 0, 0, 0)
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatTanggal(tanggal: string | null) {
  if (!tanggal) return null
  return new Date(tanggal).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function EventCard({ event, featured = false }: { event: Event; featured?: boolean }) {
  const daysUntil = getDaysUntil(event.tanggal)
  const isUpcoming = daysUntil !== null && daysUntil >= 0
  const isPast = daysUntil !== null && daysUntil < 0

  return (
    <div
      style={{
        background: featured ? 'linear-gradient(135deg,#fffbeb,#fef9c3)' : '#fff',
        borderRadius: 16,
        padding: 16,
        border: featured ? '1.5px solid #fde68a' : '1.5px solid #f1f5f9',
        boxShadow: featured ? '0 4px 16px rgba(245,158,11,.12)' : '0 2px 8px rgba(0,0,0,.05)',
        transition: 'all .2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.transform = 'translateY(-2px)'
        el.style.boxShadow = featured ? '0 8px 24px rgba(245,158,11,.18)' : '0 8px 20px rgba(0,0,0,.1)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.transform = ''
        el.style.boxShadow = featured ? '0 4px 16px rgba(245,158,11,.12)' : '0 2px 8px rgba(0,0,0,.05)'
      }}
    >
      {featured && (
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: 3,
          background: 'linear-gradient(90deg,#f59e0b,#fbbf24)',
        }} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          {featured && (
            <span style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 9999 }}>
              ⭐ FEATURED
            </span>
          )}
          {isUpcoming && daysUntil! <= 7 && (
            <span style={{ background: '#fef2f2', color: '#dc2626', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 9999 }}>
              🔥 {daysUntil === 0 ? 'HARI INI' : `${daysUntil} HARI LAGI`}
            </span>
          )}
          {isPast && (
            <span style={{ background: '#f1f5f9', color: '#94a3b8', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 9999 }}>
              Selesai
            </span>
          )}
        </div>
        {event.tanggal && (
          <div style={{ textAlign: 'center', flexShrink: 0, background: isUpcoming ? '#dcfce7' : '#f1f5f9', borderRadius: 10, padding: '4px 10px', marginLeft: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: isUpcoming ? '#15803d' : '#94a3b8', lineHeight: 1 }}>
              {new Date(event.tanggal).getDate()}
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: isUpcoming ? '#16a34a' : '#94a3b8' }}>
              {new Date(event.tanggal).toLocaleDateString('id-ID', { month: 'short' }).toUpperCase()}
            </div>
          </div>
        )}
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4, lineHeight: 1.3 }}>
        {event.nama_event}
      </h3>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
        oleh <strong style={{ color: '#374151' }}>{event.penyelenggara}</strong>
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: event.tanggal ? 6 : (event.jenis_burung?.length > 0 ? 10 : 0) }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
        <span style={{ fontSize: 13, color: '#64748b' }}>{event.lokasi ? `${event.lokasi}, ` : ''}{event.kota}</span>
      </div>

      {event.tanggal && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: event.jenis_burung?.length > 0 ? 10 : 0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          <span style={{ fontSize: 13, color: '#64748b' }}>{formatTanggal(event.tanggal)}</span>
        </div>
      )}

      {event.jenis_burung?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {event.jenis_burung.map(b => (
            <span key={b} style={{ background: '#f0fdf4', color: '#15803d', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 9999, border: '1px solid #bbf7d0' }}>
              {b}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchEvents() {
    setLoading(true)
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (!url || !key) { setLoading(false); return }

      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(url, key)
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('tanggal', { ascending: true })
      setEvents(data ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEvents() }, [])

  const featuredEvents = events.filter(e => e.is_featured)
  const regularEvents = events.filter(e => !e.is_featured)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 100 }}>
      {/* Hero Header */}
      <header style={{ background: 'linear-gradient(135deg,#14532d 0%,#15803d 50%,#16a34a 100%)', padding: '28px 20px 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'rgba(255,255,255,.06)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -30, width: 220, height: 220, background: 'rgba(255,255,255,.04)', borderRadius: '50%' }} />

        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🐦</div>
            <div>
              <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.1 }}>GantangFinder</h1>
              <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 13, fontWeight: 500 }}>Jadwal Lomba Burung Kicau se-Indonesia</p>
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            {[
              { value: events.length, label: 'Total Event', color: '#fff' },
              { value: featuredEvents.length, label: 'Featured', color: '#fbbf24' },
              { value: events.filter(e => { const d = getDaysUntil(e.tanggal); return d !== null && d >= 0 && d <= 30 }).length, label: 'Bulan Ini', color: '#86efac' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(8px)', borderRadius: 10, padding: '8px 14px', border: '1px solid rgba(255,255,255,.15)' }}>
                <div style={{ color: stat.color, fontSize: 20, fontWeight: 800 }}>{loading ? '—' : stat.value}</div>
                <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 11, fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 12, animation: 'pulse-green 1s ease infinite' }}>🐦</div>
            <p style={{ color: '#64748b', fontSize: 14 }}>Memuat event...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🐦</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Belum ada event</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Jadilah yang pertama menambahkan event lomba burung kicau!</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dcfce7', color: '#15803d', padding: '8px 16px', borderRadius: 9999, fontSize: 13, fontWeight: 600 }}>
              ↓ Tap tombol hijau di bawah
            </div>
          </div>
        ) : (
          <>
            {featuredEvents.length > 0 && (
              <section style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 16 }}>⭐</span>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#92400e' }}>Featured Event</h2>
                </div>
                <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {featuredEvents.map(e => <EventCard key={e.id} event={e} featured />)}
                </div>
              </section>
            )}
            {regularEvents.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 16 }}>📅</span>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Semua Event ({regularEvents.length})</h2>
                </div>
                <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {regularEvents.map(e => <EventCard key={e.id} event={e} />)}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <AddEventModal onEventAdded={fetchEvents} />
    </div>
  )
}
