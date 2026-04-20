'use client'

import { useState, useEffect, useCallback } from 'react'
import { dbFetchEvents } from '../../lib/supabase'
import EventCard from './EventCard'
import AddEventModal from './AddEventModal'
import WatchlistModal, { Watchlist } from './WatchlistModal'
import { Event, getDaysUntil, LEVELS, BIRDS } from './types'
import SkeletonCard from './SkeletonCard'

async function getReverseGeoCity(lat: number, lon: number): Promise<string> {
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
  const json = await res.json()
  return json.address?.city || json.address?.town || json.address?.county || ''
}

function checkReminders(events: Event[]) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const notified = JSON.parse(localStorage.getItem('gf_notified') || '[]') as string[]
  events.forEach(ev => {
    const days = getDaysUntil(ev.tanggal)
    if (days === 3 || days === 1) {
      const key = `${ev.id}-${days}`
      if (!notified.includes(key)) {
        new Notification(`⏰ Reminder: ${ev.nama_event}`, {
          body: `${days === 1 ? 'Besok' : 'Lusa lusa'} – ${ev.kota}. Jangan lupa persiapkan burungmu!`,
          icon: '/favicon.ico',
        })
        notified.push(key)
        localStorage.setItem('gf_notified', JSON.stringify(notified))
      }
    }
  })
}

function checkWatchlistNotifications(events: Event[], watchlist: Watchlist) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  if (!watchlist.cities.length && !watchlist.birds.length) return
  const seen = JSON.parse(localStorage.getItem('gf_seen') || '[]') as string[]
  events.forEach(ev => {
    if (seen.includes(ev.id)) return
    const cityMatch = !watchlist.cities.length || watchlist.cities.some(c => ev.kota.toLowerCase().includes(c.toLowerCase()))
    const birdMatch = !watchlist.birds.length || watchlist.birds.some(b => ev.jenis_burung?.includes(b))
    if (cityMatch && birdMatch) {
      new Notification(`🐦 Event Baru: ${ev.nama_event}`, {
        body: `${ev.kota} • ${ev.tanggal ? new Date(ev.tanggal).toLocaleDateString('id-ID') : 'Jadwal rutin'}`,
        icon: '/favicon.ico',
      })
      seen.push(ev.id)
      localStorage.setItem('gf_seen', JSON.stringify(seen))
    }
  })
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filterSearch, setFilterSearch] = useState('')
  const [filterBird, setFilterBird] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterKota, setFilterKota] = useState('')
  const [locLoading, setLocLoading] = useState(false)
  const [watchlist, setWatchlist] = useState<Watchlist>({ cities: [], birds: [] })

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const evs = await dbFetchEvents()
      setEvents(evs)
      // Check reminders & watchlist
      const wl = JSON.parse(localStorage.getItem('gf_watchlist') || '{}') as Watchlist
      setWatchlist(wl)
      checkReminders(evs)
      checkWatchlistNotifications(evs, wl)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { void fetchEvents() }, [])

  async function useMyLocation() {
    setLocLoading(true)
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const city = await getReverseGeoCity(pos.coords.latitude, pos.coords.longitude)
        if (city) setFilterKota(city.split(' ').pop() || city)
      } catch {}
      setLocLoading(false)
    }, () => setLocLoading(false))
  }

  // All unique kota
  const allKota = [...new Set(events.map(e => e.kota).filter(Boolean))]

  // Filter logic
  const filtered = events.filter(ev => {
    const searchOk = !filterSearch || ev.nama_event.toLowerCase().includes(filterSearch.toLowerCase())
    const birdOk = !filterBird || ev.jenis_burung?.includes(filterBird)
    const levelOk = !filterLevel || ev.level_event === filterLevel
    const kotaOk = !filterKota || ev.kota.toLowerCase().includes(filterKota.toLowerCase())
    return searchOk && birdOk && levelOk && kotaOk
  })

  const featured = filtered.filter(e => e.is_featured)
  const regular = filtered.filter(e => !e.is_featured)
  const hasFilter = filterSearch || filterBird || filterLevel || filterKota

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', paddingBottom:100 }}>
      {/* Hero */}
      <header style={{ background:'linear-gradient(135deg,#14532d 0%,#15803d 50%,#16a34a 100%)', padding:'28px 20px 32px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-40, right:-40, width:180, height:180, background:'rgba(255,255,255,.06)', borderRadius:'50%' }} />
        <div style={{ maxWidth:640, margin:'0 auto', position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:'rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🐦</div>
            <div>
              <h1 style={{ color:'#fff', fontSize:26, fontWeight:800, letterSpacing:'-0.5px', lineHeight:1.1 }}>GantangFinder</h1>
              <p style={{ color:'rgba(255,255,255,.75)', fontSize:13, fontWeight:500 }}>Jadwal Lomba Burung Kicau se-Indonesia</p>
            </div>
          </div>
          <div style={{ marginTop:20, display:'flex', gap:10, flexWrap:'wrap' }}>
            {[
              { v: events.length, l:'Total Event', c:'#fff' },
              { v: events.filter(e=>e.is_featured).length, l:'Featured', c:'#fbbf24' },
              { v: events.filter(e=>{ const d=getDaysUntil(e.tanggal); return d!==null&&d>=0&&d<=30 }).length, l:'Bulan Ini', c:'#86efac' },
            ].map(s => (
              <div key={s.l} style={{ background:'rgba(255,255,255,.12)', backdropFilter:'blur(8px)', borderRadius:10, padding:'8px 14px', border:'1px solid rgba(255,255,255,.15)' }}>
                <div style={{ color:s.c, fontSize:20, fontWeight:800 }}>{loading ? '—' : s.v}</div>
                <div style={{ color:'rgba(255,255,255,.7)', fontSize:11, fontWeight:500 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div style={{ background:'#fff', borderBottom:'1px solid #f1f5f9', padding:'12px 16px', position:'sticky', top:0, zIndex:30, boxShadow:'0 2px 8px rgba(0,0,0,.06)' }}>
        <div style={{ maxWidth:640, margin:'0 auto', display:'flex', flexDirection:'column', gap:10 }}>
          {/* Search bar */}
          <div style={{ position:'relative' }}>
            <svg style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              value={filterSearch}
              onChange={e => setFilterSearch(e.target.value)}
              placeholder="Cari nama event..."
              style={{ width:'100%', padding:'9px 12px 9px 32px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:13, fontFamily:'inherit', outline:'none', color:'#0f172a' }}
            />
          </div>

          {/* Kota search + lokasi btn */}
          <div style={{ display:'flex', gap:8 }}>
            <div style={{ flex:1, position:'relative' }}>
              <svg style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <input
                value={filterKota}
                onChange={e => setFilterKota(e.target.value)}
                list="kota-list"
                placeholder="Cari kota..."
                style={{ width:'100%', padding:'9px 12px 9px 30px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:13, fontFamily:'inherit', outline:'none', color:'#0f172a' }}
              />
              <datalist id="kota-list">{allKota.map(k => <option key={k} value={k} />)}</datalist>
            </div>
            <button onClick={useMyLocation} disabled={locLoading} title="Gunakan lokasi saya" style={{
              padding:'9px 14px', borderRadius:10, border:'1.5px solid #e2e8f0',
              background: locLoading ? '#f1f5f9' : '#fff', cursor:'pointer', fontSize:16,
              transition:'all 0.2s', flexShrink:0,
            }}>
              {locLoading ? '⏳' : '📍'}
            </button>
            {hasFilter && (
              <button onClick={() => { setFilterSearch(''); setFilterBird(''); setFilterLevel(''); setFilterKota('') }} style={{ padding:'9px 14px', borderRadius:10, border:'1.5px solid #fca5a5', background:'#fef2f2', color:'#dc2626', cursor:'pointer', fontSize:12, fontWeight:600, fontFamily:'inherit', flexShrink:0 }}>
                Reset
              </button>
            )}
          </div>

          {/* Level filter */}
          <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:2 }}>
            <button onClick={() => setFilterLevel('')} style={{ padding:'5px 14px', borderRadius:9999, fontSize:12, fontWeight:600, fontFamily:'inherit', cursor:'pointer', flexShrink:0, border: !filterLevel ? '1.5px solid #0f172a' : '1.5px solid #e2e8f0', background: !filterLevel ? '#0f172a' : '#fff', color: !filterLevel ? '#fff' : '#64748b' }}>Semua</button>
            {LEVELS.map(l => {
              const active = filterLevel === l
              return (
                <button key={l} onClick={() => setFilterLevel(active ? '' : l)} style={{ padding:'5px 14px', borderRadius:9999, fontSize:12, fontWeight:600, fontFamily:'inherit', cursor:'pointer', flexShrink:0, border: active ? '1.5px solid #0f172a' : '1.5px solid #e2e8f0', background: active ? '#0f172a' : '#fff', color: active ? '#fff' : '#64748b' }}>{l}</button>
              )
            })}
          </div>

          {/* Bird filter */}
          <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:2 }}>
            {BIRDS.slice(0, 8).map(b => {
              const active = filterBird === b
              return (
                <button key={b} onClick={() => setFilterBird(active ? '' : b)} style={{ padding:'5px 12px', borderRadius:9999, fontSize:11, fontWeight:600, fontFamily:'inherit', cursor:'pointer', flexShrink:0, border: active ? '1.5px solid #16a34a' : '1.5px solid #e2e8f0', background: active ? '#dcfce7' : '#f8fafc', color: active ? '#15803d' : '#64748b' }}>{b}</button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main style={{ maxWidth:640, margin:'0 auto', padding:'16px 16px' }}>
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[1,2,3].map(i => <SkeletonCard key={i} />)}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:64, marginBottom:16 }}>{hasFilter ? '🔍' : '🐦'}</div>
            <h2 style={{ fontSize:20, fontWeight:700, color:'#0f172a', marginBottom:8 }}>{hasFilter ? 'Tidak ada hasil' : 'Belum ada event'}</h2>
            <p style={{ color:'#64748b', fontSize:14, marginBottom:24 }}>{hasFilter ? 'Coba ubah filter pencarian lo.' : 'Jadilah yang pertama menambahkan event!'}</p>
            {!hasFilter && <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#dcfce7', color:'#15803d', padding:'8px 16px', borderRadius:9999, fontSize:13, fontWeight:600 }}>↓ Tap tombol hijau di bawah</div>}
          </div>
        ) : (
          <>
            {hasFilter && <p style={{ fontSize:13, color:'#64748b', marginBottom:12 }}>Menampilkan <strong>{filtered.length}</strong> dari {events.length} event</p>}
            {featured.length > 0 && (
              <section style={{ marginBottom:24 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <span>⭐</span>
                  <h2 style={{ fontSize:16, fontWeight:700, color:'#92400e' }}>Featured Event</h2>
                </div>
                <div className="stagger" style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {featured.map(e => <EventCard key={e.id} event={e} featured />)}
                </div>
              </section>
            )}
            {regular.length > 0 && (
              <section>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <span>📅</span>
                  <h2 style={{ fontSize:16, fontWeight:700, color:'#0f172a' }}>Semua Event ({regular.length})</h2>
                </div>
                <div className="stagger" style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {regular.map(e => <EventCard key={e.id} event={e} />)}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <WatchlistModal cities={allKota} onSave={setWatchlist} watchlist={watchlist} />
      <AddEventModal onEventAdded={fetchEvents} />
    </div>
  )
}
