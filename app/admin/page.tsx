'use client'
import { useState, useEffect } from 'react'
import { uploadResultImage } from '../actions'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
const PASS = 'gantang2026'

interface Ev {
  id: string; nama_event: string; kota: string; tanggal?: string|null
  is_featured?: boolean; featured_until?: string|null; featured_package?: string|null; jenis_lomba?: string
  penyelenggara?: string; lokasi?: string; foto_hasil?: string|null
}
interface Sub {
  id: string; nama?: string|null; nomor_wa: string; kota?: string|null
  minat?: string[]|null; created_at: string; is_active?: boolean
}

function fmtDate(t?: string|null) {
  if (!t) return '-'
  return new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
function isActiveFeatured(e: Ev) {
  return e.is_featured && (!e.featured_until || new Date(e.featured_until) > new Date())
}

export default function AdminPage() {
  const [auth, setAuth] = useState(false)
  const [pw, setPw] = useState('')
  const [pwErr, setPwErr] = useState('')
  const [evs, setEvs] = useState<Ev[]>([])
  const [subs, setSubs] = useState<Sub[]>([])
  const [loading, setLoading] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'events'|'subscribers'>('events')
  const [editEv, setEditEv] = useState<Ev | null>(null)

  function login(e: React.FormEvent) {
    e.preventDefault()
    if (pw === PASS) { setAuth(true) }
    else { setPwErr('Password salah. Coba lagi.') }
  }

  useEffect(() => {
    if (!auth) return
    loadData()
  }, [auth])

  async function loadData() {
    setLoading(true)
    try {
      const [evRes, subRes] = await Promise.all([
        fetch(`${SB_URL}/rest/v1/events?select=id,nama_event,penyelenggara,lokasi,kota,tanggal,is_featured,featured_until,featured_package,jenis_lomba,foto_hasil&order=created_at.desc`, { headers: H }),
        fetch(`${SB_URL}/rest/v1/subscribers?select=*&order=created_at.desc`, { headers: H }),
      ])
      const evData = await evRes.json()
      const subData = await subRes.json()
      setEvs(Array.isArray(evData) ? evData : [])
      setSubs(Array.isArray(subData) ? subData : [])
    } catch { /* ignore */ }
    setLoading(false)
  }

  async function toggleFeatured(ev: Ev, days: number = 7) {
    setToggling(ev.id)
    const active = isActiveFeatured(ev)
    const body = active
      ? { is_featured: false, featured_until: null, featured_package: null }
      : { 
          is_featured: true, 
          featured_until: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(), 
          featured_package: days === 7 ? 'basic' : days === 14 ? 'pro' : 'premium' 
        }
    await fetch(`${SB_URL}/rest/v1/events?id=eq.${ev.id}`, {
      method: 'PATCH',
      headers: { ...H, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(body),
    })
    setEvs(prev => prev.map(e => e.id === ev.id ? { ...e, ...body } : e))
    setToggling(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin mau hapus event ini?')) return
    setDeleting(id)
    try {
      await fetch(`${SB_URL}/rest/v1/events?id=eq.${id}`, {
        method: 'DELETE',
        headers: H,
      })
      setEvs(prev => prev.filter(e => e.id !== id))
    } catch { alert('Gagal hapus') }
    setDeleting(null)
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editEv) return
    setLoading(true)
    const f = e.currentTarget
    const g = (n: string) => (f.elements.namedItem(n) as HTMLInputElement)?.value?.trim() || ''
    const body = {
      nama_event: g('nama'),
      penyelenggara: g('penyelenggara'),
      lokasi: g('lokasi'),
      kota: g('kota'),
      tanggal: g('tanggal') || null,
    }
    try {
      await fetch(`${SB_URL}/rest/v1/events?id=eq.${editEv.id}`, {
        method: 'PATCH',
        headers: { ...H, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify(body),
      })
      setEvs(prev => prev.map(ev => ev.id === editEv.id ? { ...ev, ...body } : ev))
      setEditEv(null)
    } catch { alert('Gagal simpan') }
    setLoading(false)
  }

  async function handleUpload(eventId: string, file: File) {
    console.log('Memulai upload untuk event:', eventId);
    setUploading(eventId)
    try {
      const res = await uploadResultImage(eventId, file)
      if (res.success) {
        setEvs(prev => prev.map(e => e.id === eventId ? { ...e, foto_hasil: res.url } : e))
        alert('Foto berhasil diupload!')
      } else {
        console.error('Upload Error:', res.error);
        alert('Upload gagal: ' + res.error)
      }
    } catch (err) {
      console.error('Fatal Error:', err);
      alert('Terjadi kesalahan sistem saat upload.')
    }
    setUploading(null)
  }

  function exportCSV() {
    const header = 'Nama,Nomor WA,Kota,Minat,Tanggal Daftar\n'
    const rows = subs.map(s =>
      `${s.nama || ''},${s.nomor_wa},${s.kota || ''},"${s.minat?.join(', ') || ''}",${fmtDate(s.created_at)}`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscribers-gantangfinder-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ─── Login Screen ───────────────────────────────────────────────────────────
  if (!auth) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '40px 32px', width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,.12)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔐</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>Admin GantangFinder</h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 6, marginBottom: 0 }}>Area khusus pengelola</p>
        </div>
        <form onSubmit={login} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password</label>
            <input
              type="password" value={pw} onChange={e => { setPw(e.target.value); setPwErr('') }}
              placeholder="Masukkan password..." autoFocus
              style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${pwErr ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 10, fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
            />
            {pwErr && <p style={{ color: '#dc2626', fontSize: 13, margin: '6px 0 0' }}>⚠️ {pwErr}</p>}
          </div>
          <button type="submit" style={{ padding: 14, background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', marginTop: 4 }}>
            Masuk →
          </button>
        </form>
      </div>
    </div>
  )

  // ─── Dashboard ───────────────────────────────────────────────────────────────
  const featuredCount = evs.filter(e => isActiveFeatured(e)).length

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#14532d,#16a34a)', padding: '20px 20px 0' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: 0 }}>⚙️ Admin Panel</h1>
              <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13, margin: 0 }}>GantangFinder Dashboard</p>
            </div>
            <a href="/" style={{ color: 'rgba(255,255,255,.85)', fontSize: 13, textDecoration: 'none', background: 'rgba(255,255,255,.15)', padding: '8px 14px', borderRadius: 8, fontWeight: 600 }}>
              ← Lihat Situs
            </a>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { v: evs.length, l: 'Total Event', c: '#fff' },
              { v: featuredCount, l: 'Featured Aktif', c: '#fbbf24' },
              { v: subs.length, l: 'Subscriber WA', c: '#86efac' },
            ].map(s => (
              <div key={s.l} style={{ background: 'rgba(255,255,255,.12)', borderRadius: 10, padding: '10px 16px' }}>
                <div style={{ color: s.c, fontSize: 22, fontWeight: 800 }}>{loading ? '—' : s.v}</div>
                <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Tab nav */}
          <div style={{ display: 'flex', gap: 4 }}>
            {(['events', 'subscribers'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{ padding: '10px 20px', borderRadius: '10px 10px 0 0', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', border: 'none', background: activeTab === t ? '#fff' : 'rgba(255,255,255,.15)', color: activeTab === t ? '#16a34a' : 'rgba(255,255,255,.8)' }}>
                {t === 'events' ? '📋 Event' : '📱 Subscriber'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 36 }}>⏳</div>
            <p style={{ color: '#64748b', marginTop: 8 }}>Memuat data...</p>
          </div>
        ) : activeTab === 'events' ? (
          <>
            {/* Paket Harga */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1.5px solid #f1f5f9', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>💰 Paket Featured Listing</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
                {[
                  { n: 'Basic', d: '7 hari', p: 'Rp 75.000', c: '#f0fdf4', b: '#bbf7d0', t: '#15803d' },
                  { n: 'Pro', d: '14 hari', p: 'Rp 125.000', c: '#eff6ff', b: '#93c5fd', t: '#1d4ed8' },
                  { n: 'Premium', d: '30 hari', p: 'Rp 200.000', c: '#fdf4ff', b: '#e879f9', t: '#a21caf' },
                ].map(pkg => (
                  <div key={pkg.n} style={{ background: pkg.c, borderRadius: 12, padding: '14px 12px', border: `1.5px solid ${pkg.b}`, textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, color: pkg.t, fontSize: 14 }}>{pkg.n}</div>
                    <div style={{ fontSize: 12, color: pkg.t, opacity: .75, margin: '2px 0 6px' }}>{pkg.d}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: pkg.t }}>{pkg.p}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', border: '1px solid #e2e8f0', fontSize: 13, color: '#64748b' }}>
                <strong>Cara kerja:</strong> Panitia transfer → Lo aktifkan di tabel bawah → Event tampil di teratas selama 7–30 hari
              </div>
            </div>

            {/* Tabel Event */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1.5px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>📋 Semua Event ({evs.length})</h2>
                <button onClick={loadData} style={{ padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', color: '#64748b' }}>🔄 Refresh</button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                      {['Nama Event', 'Kota', 'Tanggal', 'Status', 'Featured Sampai', 'Aksi'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Aksi' ? 'right' : 'left', color: '#64748b', fontWeight: 700, whiteSpace: 'nowrap', fontSize: 12 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {evs.map(ev => {
                      const active = isActiveFeatured(ev)
                      // Cek apakah lomba sudah lewat (bandingkan tanggal saja, abaikan jam)
                      const eventDate = ev.tanggal ? new Date(ev.tanggal + 'T00:00:00') : null
                      const today = new Date()
                      today.setHours(0,0,0,0)
                      const isPast = eventDate && eventDate < today
                      
                      return (
                        <tr key={ev.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a', maxWidth: 220 }}>
                            <a href={`/events/${ev.id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0f172a', textDecoration: 'none' }}>
                              {ev.nama_event}
                            </a>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#64748b' }}>{ev.kota}</td>
                          <td style={{ padding: '10px 12px', color: '#64748b', whiteSpace: 'nowrap' }}>{fmtDate(ev.tanggal)}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ background: active ? '#dcfce7' : '#f1f5f9', color: active ? '#15803d' : '#94a3b8', padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 700 }}>
                              {active ? '⭐ Featured' : 'Biasa'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#94a3b8', whiteSpace: 'nowrap', fontSize: 12 }}>
                            {ev.featured_until ? fmtDate(ev.featured_until) : '—'}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                              {isPast && (
                                <div style={{ position: 'relative' }}>
                                  <input 
                                    type="file" 
                                    id={`upload-${ev.id}`} 
                                    accept="image/*" 
                                    style={{ display: 'none' }} 
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) handleUpload(ev.id, file)
                                    }}
                                  />
                                  <label 
                                    htmlFor={`upload-${ev.id}`}
                                    style={{ 
                                      padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, 
                                      background: ev.foto_hasil ? '#dcfce7' : '#fef3c7', 
                                      color: ev.foto_hasil ? '#15803d' : '#b45309', 
                                      cursor: uploading === ev.id ? 'not-allowed' : 'pointer',
                                      display: 'inline-block'
                                    }}>
                                    {uploading === ev.id ? '⏳' : ev.foto_hasil ? '✅ Foto' : '📷 Hasil'}
                                  </label>
                                </div>
                              )}
                              <div style={{ position: 'relative', display: 'inline-block' }}>
                                <button
                                  onClick={() => {
                                    if (active) toggleFeatured(ev)
                                    else {
                                      const d = prompt('Pilih durasi (7, 14, 30 hari):', '7')
                                      if (d) toggleFeatured(ev, parseInt(d))
                                    }
                                  }}
                                  disabled={toggling === ev.id}
                                  style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: toggling === ev.id ? 'not-allowed' : 'pointer', border: 'none', background: active ? '#f1f5f9' : '#16a34a', color: active ? '#64748b' : '#fff', opacity: toggling === ev.id ? .6 : 1, whiteSpace: 'nowrap' }}>
                                  {toggling === ev.id ? '⏳' : active ? 'Nonaktif' : '✨ Featured'}
                                </button>
                              </div>
                              <button
                                onClick={() => setEditEv(ev)}
                                style={{ padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: '#eff6ff', color: '#1d4ed8', border: 'none', cursor: 'pointer' }}>
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDelete(ev.id)}
                                disabled={deleting === ev.id}
                                style={{ padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: '#fef2f2', color: '#dc2626', border: 'none', cursor: deleting === ev.id ? 'not-allowed' : 'pointer', opacity: deleting === ev.id ? .6 : 1 }}>
                                {deleting === ev.id ? '⏳' : '🗑️'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {evs.length === 0 && <p style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>Belum ada event.</p>}
              </div>
            </div>
          </>
        ) : (
          /* Subscribers Tab */
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1.5px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>📱 Subscriber WhatsApp</h2>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>{subs.length} nomor terdaftar</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={loadData} style={{ padding: '7px 12px', background: '#f1f5f9', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', color: '#64748b' }}>🔄</button>
                {subs.length > 0 && (
                  <button onClick={exportCSV} style={{ padding: '7px 16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>
                    📥 Export CSV
                  </button>
                )}
              </div>
            </div>
            {subs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                <div style={{ fontSize: 40 }}>📭</div>
                <p style={{ marginTop: 8 }}>Belum ada subscriber.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                      {['Nama', 'Nomor WA', 'Kota', 'Minat', 'Tanggal Daftar'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#64748b', fontWeight: 700, whiteSpace: 'nowrap', fontSize: 12 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subs.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '10px 12px', color: '#0f172a', fontWeight: 600 }}>{s.nama || '—'}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <a href={`https://wa.me/${s.nomor_wa}`} target="_blank" rel="noopener noreferrer"
                            style={{ color: '#16a34a', textDecoration: 'none', fontFamily: 'monospace', fontWeight: 700 }}>
                            {s.nomor_wa}
                          </a>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#64748b' }}>{s.kota || '—'}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {s.minat?.map(m => (
                              <span key={m} style={{ background: m === 'kicau' ? '#f0fdf4' : '#eff6ff', color: m === 'kicau' ? '#15803d' : '#1d4ed8', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 9999 }}>
                                {m === 'kicau' ? '🐦' : '🕊️'} {m}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{fmtDate(s.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editEv && (
        <>
          <div onClick={() => setEditEv(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)', zIndex: 100 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 20, width: '90%', maxWidth: 450, zIndex: 101, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>✏️ Edit Event</h2>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Nama Event</label>
                <input name="nama" defaultValue={editEv.nama_event} required style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Penyelenggara</label>
                  <input name="penyelenggara" defaultValue={editEv.penyelenggara} required style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Kota</label>
                  <input name="kota" defaultValue={editEv.kota} required style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Lokasi / Venue</label>
                <input name="lokasi" defaultValue={editEv.lokasi} style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Tanggal</label>
                <input name="tanggal" type="date" defaultValue={editEv.tanggal ? editEv.tanggal.split('T')[0] : ''} style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setEditEv(null)} style={{ flex: 1, padding: 12, background: '#f1f5f9', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Batal</button>
                <button type="submit" disabled={loading} style={{ flex: 2, padding: 12, background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}