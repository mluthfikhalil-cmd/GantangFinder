'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }

interface LeaderboardEntry {
  rank: number
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
}

const TINGKAT_OPTIONS = [
  { v: '', l: 'Semua Tingkat' },
  { v: 'lokal', l: '🏡 Lokal' },
  { v: 'kecamatan', l: '🏘️ Kecamatan' },
  { v: 'kabupaten', l: '🏙️ Kabupaten' },
  { v: 'provincial', l: '🌍 Provincial' },
  { v: 'nasional', l: '🇮🇩 Nasional' },
  { v: 'internasional', l: '🌏 Internasional' },
]

const JENIS_OPTIONS = [
  { v: '', l: 'Semua Jenis' },
  { v: 'Lovebird', l: 'Lovebird' },
  { v: 'Kenari', l: 'Kenari' },
  { v: 'Murai Batu', l: 'Murai Batu' },
  { v: 'Kacer', l: 'Kacer' },
  { v: 'Parkit', l: 'Parkit' },
  { v: 'Anis Merah', l: 'Anis Merah' },
  { v: 'Cucak Ijo', l: 'Cucak Ijo' },
  { v: 'Skoci', l: 'Skoci' },
  { v: 'Branjangan', l: 'Branjangan' },
  { v: 'Other', l: 'Lainnya' },
]

function MedalIcon({ rank }: { rank: number }) {
  if (rank === 1) return <span style={{ fontSize: 24 }}>🥇</span>
  if (rank === 2) return <span style={{ fontSize: 24 }}>🥈</span>
  if (rank === 3) return <span style={{ fontSize: 24 }}>🥉</span>
  return <span style={{ fontSize: 20, fontWeight: 800, color: '#94a3b8', width: 24, display: 'inline-block', textAlign: 'center' }}>#{rank}</span>
}

function fmtDate(d: string) {
  return d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [tingkat, setTingkat] = useState('')
  const [jenis, setJenis] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    loadLeaderboard()
  }, [tingkat, jenis])

  async function loadLeaderboard() {
    setLoading(true)
    try {
      // First get all bird_events
      let url = `${SB_URL}/rest/v1/bird_events?select=*`
      const res = await fetch(url, { headers: H })
      let allEvents: any[] = await res.json()
      if (!Array.isArray(allEvents)) allEvents = []

      // Filter by tingkat
      if (tingkat) {
        allEvents = allEvents.filter(e => e.event_tingkat === tingkat)
      }
      // Filter by jenis (bird type in event, not necessarily bird species)
      if (jenis) {
        allEvents = allEvents.filter(e => e.event_jenis_burung?.toLowerCase() === jenis.toLowerCase())
      }

      // Also get bird details
      let birdsUrl = `${SB_URL}/rest/v1/birds?select=*`
      const birdsRes = await fetch(birdsUrl, { headers: H })
      const birdsData: any[] = await birdsRes.json()
      const birdMap = new Map<string, any>()
      for (const b of Array.isArray(birdsData) ? birdsData : []) {
        birdMap.set(b.id, b)
      }

      // Aggregate
      const birdAgg = new Map<string, LeaderboardEntry>()
      for (const ev of allEvents) {
        const bird = birdMap.get(ev.bird_id)
        if (!bird) continue
        if (!birdAgg.has(ev.bird_id)) {
          birdAgg.set(ev.bird_id, {
            rank: 0,
            bird_id: ev.bird_id,
            nama_burung: bird.nama_burung || ev.nama_burung || '?',
            jenis_burung: bird.jenis_burung || ev.event_jenis_burung || '?',
            owner_name: bird.owner_name || ev.owner_name || '?',
            total_points: 0,
            event_count: 0,
            first_places: 0,
            second_places: 0,
            third_places: 0,
            recent_events: [],
          })
        }
        const e = birdAgg.get(ev.bird_id)!
        e.total_points += ev.points_earned || 0
        e.event_count += 1
        if (ev.posisi === 1) e.first_places += 1
        else if (ev.posisi === 2) e.second_places += 1
        else if (ev.posisi === 3) e.third_places += 1
        if (e.recent_events.length < 3) {
          e.recent_events.push({
            event_name: ev.event_name,
            event_date: ev.event_date,
            posisi: ev.posisi,
            points: ev.points_earned,
          })
        }
      }

      const sorted = Array.from(birdAgg.values()).sort((a, b) => b.total_points - a.total_points)
      sorted.forEach((e, i) => { e.rank = i + 1 })
      setLeaderboard(sorted.slice(0, 100))
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'inherit' }}>
      {/* Hero Header */}
      <div style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', padding: '32px 16px 40px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 18 }}>←</Link>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: 0 }}>🏆 Leaderboard</h1>
            <div style={{ width: 30 }} />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, margin: 0, textAlign: 'center' }}>
            Ranking burung berdasarkan poin dari seluruh event di GantangFinder
          </p>

          {/* Filter */}
          <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            <select value={tingkat} onChange={e => setTingkat(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 10, border: 'none', fontSize: 13, fontFamily: 'inherit', background: '#fff', color: '#374151', minWidth: 160 }}>
              {TINGKAT_OPTIONS.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
            </select>
            <select value={jenis} onChange={e => setJenis(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 10, border: 'none', fontSize: 13, fontFamily: 'inherit', background: '#fff', color: '#374151', minWidth: 160 }}>
              {JENIS_OPTIONS.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      {!loading && leaderboard.length >= 3 && (
        <div style={{ maxWidth: 700, margin: '-24px auto 0', padding: '0 16px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 12 }}>
          {/* 2nd */}
          <div style={{ background: '#e2e8f0', borderRadius: '14px 14px 0 0', padding: '16px 20px', textAlign: 'center', minWidth: 120, borderTop: '4px solid #94a3b8' }}>
            <div style={{ fontSize: 28 }}>🥈</div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#475569', marginTop: 4 }}>{leaderboard[1].nama_burung}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{leaderboard[1].owner_name}</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#475569', marginTop: 6 }}>{leaderboard[1].total_points.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>poin</div>
          </div>
          {/* 1st */}
          <div style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', borderRadius: '14px 14px 0 0', padding: '20px 28px', textAlign: 'center', minWidth: 140, borderTop: '4px solid #d97706' }}>
            <div style={{ fontSize: 36 }}>🥇</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#fff', marginTop: 4 }}>{leaderboard[0].nama_burung}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>{leaderboard[0].owner_name}</div>
            <div style={{ fontWeight: 800, fontSize: 22, color: '#fff', marginTop: 6 }}>{leaderboard[0].total_points.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>poin</div>
          </div>
          {/* 3rd */}
          <div style={{ background: '#fef3c7', borderRadius: '14px 14px 0 0', padding: '16px 20px', textAlign: 'center', minWidth: 120, borderTop: '4px solid #d97706' }}>
            <div style={{ fontSize: 28 }}>🥉</div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#92400e', marginTop: 4 }}>{leaderboard[2].nama_burung}</div>
            <div style={{ fontSize: 11, color: '#b45309' }}>{leaderboard[2].owner_name}</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#92400e', marginTop: 6 }}>{leaderboard[2].total_points.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: '#b45309' }}>poin</div>
          </div>
        </div>
      )}

      {/* Rest of Leaderboard */}
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 36 }}>⏳</div>
            <p style={{ color: '#64748b', marginTop: 8 }}>Memuat leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 14, border: '1.5px solid #e2e8f0' }}>
            <div style={{ fontSize: 48 }}>🏆</div>
            <p style={{ color: '#64748b', marginTop: 12, fontWeight: 600 }}>Leaderboard masih kosong</p>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Daftarkan bird lo di menu Birds dan ikut event untuk mulai kumpulkan poin!</p>
            <Link href="/birds" style={{ display: 'inline-block', marginTop: 16, padding: '10px 24px', background: '#16a34a', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
              🐦 Daftar Bird
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Full Table */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                    {['#', 'Bird', 'Owner', 'Poin', 'Event', '🥇', 'Aksi'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: h === '#' || h === 'Poin' || h === 'Event' || h === '🥇' ? 'center' : 'left', color: '#64748b', fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map(entry => {
                    const isExpanded = expanded === entry.bird_id
                    const bgRank = entry.rank <= 3 ? (entry.rank === 1 ? '#fef9c3' : entry.rank === 2 ? '#f1f5f9' : '#fef3c7') : '#fff'
                    return (
                      <>
                        <tr key={entry.bird_id} style={{ borderBottom: '1px solid #f1f5f9', background: bgRank }}>
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            <MedalIcon rank={entry.rank} />
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{entry.nama_burung}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{entry.jenis_burung}</div>
                          </td>
                          <td style={{ padding: '10px 14px', color: '#64748b' }}>{entry.owner_name}</td>
                          <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800, color: '#16a34a', fontSize: 15 }}>{entry.total_points.toLocaleString()}</td>
                          <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>{entry.event_count}</td>
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            {entry.first_places > 0 && (
                              <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 700 }}>
                                {entry.first_places}x
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            <button
                              onClick={() => setExpanded(isExpanded ? null : entry.bird_id)}
                              style={{ padding: '5px 10px', background: '#f1f5f9', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#64748b' }}>
                              {isExpanded ? '▲' : '▼'}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${entry.bird_id}-detail`}>
                            <td colSpan={7} style={{ background: '#f8fafc', padding: '12px 20px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 10 }}>
                                {[
                                  { label: '🥈 Juara 2', val: entry.second_places },
                                  { label: '🥉 Juara 3', val: entry.third_places },
                                  { label: '📊 Event', val: entry.event_count },
                                ].map(s => (
                                  <div key={s.label} style={{ background: '#fff', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: '#374151' }}>{s.val}</div>
                                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{s.label}</div>
                                  </div>
                                ))}
                              </div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>RECENT EVENTS</div>
                              {entry.recent_events.length === 0 ? (
                                <p style={{ color: '#94a3b8', fontSize: 12 }}>No recent events</p>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                  {entry.recent_events.map((ev, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#374151', background: '#fff', padding: '6px 10px', borderRadius: 6 }}>
                                      <span>{ev.event_name}</span>
                                      <span style={{ color: '#94a3b8' }}>{fmtDate(ev.event_date)}</span>
                                      <span style={{ color: ev.posisi ? '#d97706' : '#16a34a', fontWeight: 700 }}>
                                        {ev.posisi ? `#${ev.posisi}` : 'Participant'} +{ev.points}pts
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {leaderboard.length > 0 && (
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 8 }}>
                Menampilkan {leaderboard.length} bird • Update realtime dari hasil event
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <nav style={{position:'fixed',bottom:0,left:0,right:0,background:'#fff',borderTop:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-around',padding:'8px 0 env(safe-area-inset-bottom,8px)',zIndex:40,boxShadow:'0 -4px 12px rgba(0,0,0,0.06)'}}>
        <a href="/" style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'6px 8px',textDecoration:'none',color:'#94a3b8',fontSize:11,fontWeight:600}}>
          <span style={{fontSize:22}}>🏠</span>Home
        </a>
        <a href="/leaderboard" style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'6px 8px',textDecoration:'none',color:'#16a34a',fontSize:11,fontWeight:700}}>
          <span style={{fontSize:22}}>🏆</span>Leaderboard
        </a>
        <a href="/birds" style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'6px 8px',textDecoration:'none',color:'#94a3b8',fontSize:11,fontWeight:600}}>
          <span style={{fontSize:22}}>🐦</span>Profil Burung
        </a>
        <a href="/?add=1" style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'6px 8px',textDecoration:'none',color:'#94a3b8',fontSize:11,fontWeight:600}}>
          <span style={{fontSize:22}}>➕</span>Tambah
        </a>
      </nav>
    </div>
  )
}
