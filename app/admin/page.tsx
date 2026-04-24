'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { uploadResultImage, deleteResultImage } from '../actions'
import { generatePoster } from '@/app/actions/generatePoster'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
const PASS = 'gantang2026'

interface Ev {
  id: string; nama_event: string; kota: string; tanggal?: string|null
  is_featured?: boolean; featured_until?: string|null; featured_package?: string|null; jenis_lomba?: string
  penyelenggara?: string; lokasi?: string; foto_hasil?: string[]|string|null
  jenis_burung?: string[]; biaya_daftar?: number|null; kontak?: string|null
  kategori_kelas?: string|null; jarak_meter?: number|null; daftar_juara?: unknown[]|null
}
interface Juara {
  posisi: number; nama_burung: string; pemilik: string
}
interface KelasJuara {
  kelas: string; juara: Juara[]
}
interface Sub {
  id: string; nama?: string|null; nomor_wa: string; kota?: string|null
  minat?: string[]|null; created_at: string; is_active?: boolean
}

const downloadPoster = (htmlContent: string, eventName: string) => {
  const blob = new Blob([`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Poster - ${eventName}</title>
      <style>
        body { margin: 0; padding: 20px; 
               background: #f0f0f0; 
               display: flex; justify-content: center; }
      </style>
    </head>
    <body>${htmlContent}</body>
    </html>
  `], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `poster-${eventName.replace(/\s+/g, '-').toLowerCase()}.html`
  a.click()
  URL.revokeObjectURL(url)
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
  const [users, setUsers] = useState<{id:string; nama_lengkap:string; nomor_wa:string; email?:string; kota:string; role:string; status:string; payment_proof_url?:string; created_at:string}[]>([])
  const [loading, setLoading] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'events'|'subscribers'|'users'>('events')
  const [userFilter, setUserFilter] = useState<'all'|'organizer'|'peserta'>('all')
  const [updatingUser, setUpdatingUser] = useState<string | null>(null)
  const [editEv, setEditEv] = useState<Ev | null>(null)
  const [managePhotosEv, setManagePhotosEv] = useState<Ev | null>(null)
  const [manageJuaraEv, setManageJuaraEv] = useState<Ev | null>(null)
  const [posterLoading, setPosterLoading] = useState<string | null>(null)
  const [posterHtml, setPosterHtml] = useState<{html: string, ev: Ev} | null>(null)

  function login(e: React.FormEvent) {
    e.preventDefault()
    if (pw === PASS) { setAuth(true) }
    else { setPwErr('Password salah. Coba lagi.') }
  }

  async function handleDeletePhoto(eventId: string, url: string) {
    if (!confirm('Yakin mau hapus foto ini?')) return
    const res = await deleteResultImage(eventId, url)
    if (res.success) {
      setEvs(prev => prev.map(e => e.id === eventId ? {
        ...e,
        foto_hasil: Array.isArray(e.foto_hasil) ? e.foto_hasil.filter(p => p !== url) : null
      } : e))
      if (managePhotosEv?.id === eventId) {
        setManagePhotosEv(prev => prev ? {
          ...prev,
          foto_hasil: Array.isArray(prev.foto_hasil) ? prev.foto_hasil.filter(p => p !== url) : null
        } : null)
      }
    } else {
      alert('Gagal hapus: ' + res.error)
    }
  }

  useEffect(() => {
    if (!auth) return
    loadData()
    loadUsers()
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

  async function loadUsers() {
    try {
      const res = await fetch(`${SB_URL}/rest/v1/users?select=*&order=created_at.desc`, { headers: H })
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch { /* ignore */ }
  }

  async function updateUserStatus(id: string, status: string) {
    setUpdatingUser(id)
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PASS}` },
        body: JSON.stringify({ user_id: id, status }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u))
      } else {
        alert(data.error || 'Gagal update status')
      }
    } catch {
      alert('Gagal update status')
    }
    setUpdatingUser(null)
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

  async function handleUpload(eventId: string, files: FileList | null) {
    if (!files || files.length === 0) return
    console.log('Memulai upload untuk event:', eventId, 'Jumlah file:', files.length);
    setUploading(eventId)
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const res = await uploadResultImage(eventId, file)
        if (res.success) {
          setEvs(prev => prev.map(e => e.id === eventId ? { 
            ...e, 
            foto_hasil: Array.isArray(e.foto_hasil) ? [...e.foto_hasil, res.url!] : [res.url!] 
          } : e))
        } else {
          console.error('Upload Error:', res.error);
          alert(`Gagal upload file ke-${i+1}: ` + res.error)
        }
      }
      alert('Proses upload selesai!')
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
            <Link href="/" style={{ color: 'rgba(255,255,255,.85)', fontSize: 13, textDecoration: 'none', background: 'rgba(255,255,255,.15)', padding: '8px 14px', borderRadius: 8, fontWeight: 600 }}>
              ← Lihat Situs
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { v: evs.length, l: 'Total Event', c: '#fff' },
              { v: featuredCount, l: 'Featured Aktif', c: '#fbbf24' },
              { v: users.length, l: 'Total Users', c: '#86efac' },
            ].map(s => (
              <div key={s.l} style={{ background: 'rgba(255,255,255,.12)', borderRadius: 10, padding: '10px 16px' }}>
                <div style={{ color: s.c, fontSize: 22, fontWeight: 800 }}>{loading ? '—' : s.v}</div>
                <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Tab nav */}
          <div style={{ display: 'flex', gap: 4 }}>
            {(['events', 'subscribers', 'users'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{ padding: '10px 20px', borderRadius: '10px 10px 0 0', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', border: 'none', background: activeTab === t ? '#fff' : 'rgba(255,255,255,.15)', color: activeTab === t ? '#16a34a' : 'rgba(255,255,255,.8)' }}>
                {t === 'events' ? '📋 Event' : t === 'subscribers' ? '📱 Subscriber' : '👥 Users'}
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
                              <div style={{ position: 'relative', display: 'inline-block' }}>
                                <button
                                  onClick={async () => {
                                    try {
                                      setPosterLoading(ev.id)
                                      const html = await generatePoster({
                                        nama_event: ev.nama_event,
                                        tanggal: ev.tanggal || '',
                                        kota: ev.kota,
                                        lokasi: ev.lokasi || '',
                                        jenis_burung: ev.jenis_burung || [],
                                        penyelenggara: ev.penyelenggara || '',
                                        biaya_daftar: ev.biaya_daftar ?? null,
                                        kontak: ev.kontak || '',
                                        jenis_lomba: ev.jenis_lomba || 'kicau',
                                        kategori_kelas: ev.kategori_kelas,
                                        jarak_meter: ev.jarak_meter
                                      })
                                      setPosterHtml({ html, ev })
                                    } catch (error) {
                                      alert(error instanceof Error ? error.message : 'Gagal membuat poster')
                                    } finally {
                                      setPosterLoading(null)
                                    }
                                  }}
                                  disabled={posterLoading === ev.id}
                                  style={{ padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: posterLoading === ev.id ? 'not-allowed' : 'pointer', border: 'none', background: '#fdf4ff', color: '#a21caf', opacity: posterLoading === ev.id ? .6 : 1, whiteSpace: 'nowrap' }}>
                                  {posterLoading === ev.id ? '⏳ AI...' : '🎨 AI Poster'}
                                </button>
                              </div>
                              {isPast && (
                                <button
                                  onClick={() => setManageJuaraEv(ev)}
                                  style={{ padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: '#fffbeb', color: '#b45309', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                  🏆 Input Juara
                                </button>
                              )}
                              {isPast && (
                                <div style={{ position: 'relative' }}>
                                  <input 
                                    type="file" 
                                    id={`upload-${ev.id}`} 
                                    accept="image/*" 
                                    multiple
                                    style={{ display: 'none' }} 
                                    onChange={(e) => handleUpload(ev.id, e.target.files)}
                                  />
                                  <label 
                                    htmlFor={`upload-${ev.id}`}
                                    style={{ 
                                      padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, 
                                      background: (Array.isArray(ev.foto_hasil) ? ev.foto_hasil.length > 0 : !!ev.foto_hasil) ? '#dcfce7' : '#fef3c7', 
                                      color: (Array.isArray(ev.foto_hasil) ? ev.foto_hasil.length > 0 : !!ev.foto_hasil) ? '#15803d' : '#b45309', 
                                      cursor: uploading === ev.id ? 'not-allowed' : 'pointer',
                                      display: 'inline-block'
                                    }}>
                                    {uploading === ev.id ? '⏳' : (Array.isArray(ev.foto_hasil) ? ev.foto_hasil.length > 0 : !!ev.foto_hasil) ? `✅ ${Array.isArray(ev.foto_hasil) ? ev.foto_hasil.length : 1} Foto` : '📷 Hasil'}
                                  </label>
                                  {(Array.isArray(ev.foto_hasil) ? ev.foto_hasil.length > 0 : !!ev.foto_hasil) && (
                                    <button 
                                      onClick={() => setManagePhotosEv(ev)}
                                      style={{ padding: '6px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: '#f1f5f9', color: '#64748b', border: 'none', cursor: 'pointer' }}>
                                      🛠️
                                    </button>
                                  )}
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
        ) : activeTab === 'users' ? (
          /* Users Tab */
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1.5px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>👥 Semua User</h2>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>{users.length} user terdaftar</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={loadUsers} style={{ padding: '7px 12px', background: '#f1f5f9', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', color: '#64748b' }}>🔄</button>
              </div>
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {(['all', 'organizer', 'peserta'] as const).map(f => (
                <button key={f} onClick={() => setUserFilter(f)}
                  style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', border: 'none', background: userFilter === f ? '#16a34a' : '#f1f5f9', color: userFilter === f ? '#fff' : '#64748b' }}>
                  {f === 'all' ? 'Semua' : f === 'organizer' ? '🎯 Organizer' : '🐦 Peserta'}
                </button>
              ))}
            </div>

            {users.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                <div style={{ fontSize: 40 }}>👥</div>
                <p style={{ marginTop: 8 }}>Belum ada user.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                      {['Nama', 'Nomor WA', 'Kota', 'Role', 'Status', 'Tanggal Daftar', 'Aksi'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Aksi' ? 'right' : 'left', color: '#64748b', fontWeight: 700, whiteSpace: 'nowrap', fontSize: 12 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => userFilter === 'all' || u.role === userFilter).map(u => {
                      const statusColor = u.status === 'active' ? '#15803d' : u.status === 'pending_approval' ? '#d97706' : '#dc2626'
                      const statusBg = u.status === 'active' ? '#dcfce7' : u.status === 'pending_approval' ? '#fef3c7' : '#fef2f2'
                      const roleColor = u.role === 'organizer' ? '#1d4ed8' : '#7c3aed'
                      const roleBg = u.role === 'organizer' ? '#eff6ff' : '#f5f3ff'
                      return (
                        <tr key={u.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '10px 12px', color: '#0f172a', fontWeight: 600 }}>{u.nama_lengkap || '—'}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <a href={`https://wa.me/${u.nomor_wa}`} target="_blank" rel="noopener noreferrer"
                              style={{ color: '#16a34a', textDecoration: 'none', fontFamily: 'monospace', fontWeight: 700 }}>
                              {u.nomor_wa}
                            </a>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#64748b' }}>{u.kota || '—'}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ background: roleBg, color: roleColor, padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700 }}>
                              {u.role === 'organizer' ? '🎯 Org' : '🐦 Peserta'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ background: statusBg, color: statusColor, padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700 }}>
                              {u.status === 'pending_approval' ? '⏳ Pending' : u.status === 'active' ? '✅ Aktif' : '❌ Ditolak'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{fmtDate(u.created_at)}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                            {u.role === 'organizer' && u.status === 'pending_approval' && (
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => updateUserStatus(u.id, 'active')}
                                  disabled={updatingUser === u.id}
                                  style={{ padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: '#dcfce7', color: '#15803d', border: 'none', cursor: updatingUser === u.id ? 'not-allowed' : 'pointer', opacity: updatingUser === u.id ? .6 : 1 }}>
                                  {updatingUser === u.id ? '⏳' : '✅'} Approve
                                </button>
                                <button
                                  onClick={() => updateUserStatus(u.id, 'rejected')}
                                  disabled={updatingUser === u.id}
                                  style={{ padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: '#fef2f2', color: '#dc2626', border: 'none', cursor: updatingUser === u.id ? 'not-allowed' : 'pointer', opacity: updatingUser === u.id ? .6 : 1 }}>
                                  ❌ Tolak
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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

      {/* Poster Modal */}
      {posterHtml && (
        <div className="modal-overlay animate-fade-in" style={{position:'fixed',inset:0,background:'rgba(0,0,0,.8)',zIndex:100,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20}}>
          <div className="modal-content animate-slide-up" style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:640,maxHeight:'80vh',overflow:'hidden',display:'flex',flexDirection:'column'}}>
            <div style={{padding:'16px 20px',borderBottom:'1px solid #e2e8f0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h3 style={{margin:0,fontSize:16,fontWeight:700}}>🎨 Hasil Poster AI: {posterHtml.ev.nama_event}</h3>
              <button onClick={()=>setPosterHtml(null)} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#64748b'}}>×</button>
            </div>
            <div style={{flex:1,overflow:'auto',padding:20,background:'#f1f5f9',display:'flex',justifyContent:'center'}}>
              <div style={{transformOrigin:'top center',transform:'scale(0.8)'}} dangerouslySetInnerHTML={{__html: posterHtml.html}} />
            </div>
            <div style={{padding:'16px 20px',borderTop:'1px solid #e2e8f0',display:'flex',gap:12}}>
              <button onClick={()=>downloadPoster(posterHtml.html, posterHtml.ev.nama_event)} style={{flex:1,padding:'12px',background:'#1d4ed8',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer'}}>
                💾 Download HTML (Buka di Chrome → Save PDF)
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Manage Photos Modal */}
      {managePhotosEv && (
        <>
          <div onClick={() => setManagePhotosEv(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)', zIndex: 100 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 20, width: '90%', maxWidth: 500, zIndex: 101, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>🖼️ Kelola Foto Hasil</h2>
              <button onClick={() => setManagePhotosEv(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, maxHeight: 400, overflowY: 'auto', padding: 4 }}>
              {(Array.isArray(managePhotosEv.foto_hasil) ? managePhotosEv.foto_hasil : managePhotosEv.foto_hasil ? [managePhotosEv.foto_hasil] : []).map((url, i) => (
                <div key={i} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0', aspectRatio: '1/1' }}>
                  <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Hasil" />
                  <button 
                    onClick={() => handleDeletePhoto(managePhotosEv.id, url)}
                    style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(220,38,38,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontSize: 14, fontWeight: 'bold' }}>
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            {(!managePhotosEv.foto_hasil || (Array.isArray(managePhotosEv.foto_hasil) && managePhotosEv.foto_hasil.length === 0)) && (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: 20 }}>Belum ada foto.</p>
            )}

            <button onClick={() => setManagePhotosEv(null)} style={{ width: '100%', padding: 12, background: '#f1f5f9', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 20 }}>
              Tutup
            </button>
          </div>
        </>
      )}

      {/* Manage Juara Modal */}
      {manageJuaraEv && (
        <ManageJuaraModal 
          ev={manageJuaraEv} 
          onClose={() => setManageJuaraEv(null)} 
          onSaved={(updatedJuara) => {
            setEvs(prev => prev.map(e => e.id === manageJuaraEv.id ? { ...e, daftar_juara: updatedJuara } : e))
            setManageJuaraEv(null)
          }} 
        />
      )}
    </div>
  )
}

function ManageJuaraModal({ ev, onClose, onSaved }: { ev: Ev, onClose: () => void, onSaved: (juara: KelasJuara[]) => void }) {
  const [juaraList, setJuaraList] = useState<KelasJuara[]>(ev.daftar_juara as KelasJuara[] || [])
  const [loading, setLoading] = useState(false)

  const addKelas = () => setJuaraList([...juaraList, { kelas: '', juara: [] }])
  const addJuara = (kelasIndex: number) => {
    const newList = [...juaraList]
    newList[kelasIndex].juara.push({ posisi: newList[kelasIndex].juara.length + 1, nama_burung: '', pemilik: '' })
    setJuaraList(newList)
  }

  const updateKelas = (index: number, val: string) => {
    const newList = [...juaraList]; newList[index].kelas = val; setJuaraList(newList)
  }
  const updateJuara = (kelasIndex: number, juaraIndex: number, field: 'posisi' | 'nama_burung' | 'pemilik', val: string | number) => {
    const newList = [...juaraList]; (newList[kelasIndex].juara[juaraIndex] as unknown as Record<string, string | number>)[field] = val; setJuaraList(newList)
  }
  const removeKelas = (index: number) => {
    const newList = [...juaraList]; newList.splice(index, 1); setJuaraList(newList)
  }
  const removeJuara = (kelasIndex: number, juaraIndex: number) => {
    const newList = [...juaraList]; newList[kelasIndex].juara.splice(juaraIndex, 1); setJuaraList(newList)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${SB_URL}/rest/v1/events?id=eq.${ev.id}`, {
        method: 'PATCH',
        headers: { ...H, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ daftar_juara: juaraList }),
      })
      if (!res.ok) throw new Error('Gagal menyimpan juara')
      onSaved(juaraList)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error')
    }
    setLoading(false)
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)', zIndex: 100 }} />
      <div className="animate-slide-up" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 20, width: '90%', maxWidth: 600, maxHeight: '85vh', overflowY: 'auto', zIndex: 101, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>🏆 Input Daftar Juara</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 24 }}>
          {juaraList.map((k, i) => (
            <div key={i} style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <input 
                  placeholder="Nama Kelas (cth: Murai Batu Utama)" 
                  value={k.kelas} 
                  onChange={e => updateKelas(i, e.target.value)}
                  style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, fontWeight: 600 }}
                />
                <button onClick={() => removeKelas(i)} style={{ padding: '0 12px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>Hapus Kelas</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(k.juara as Array<Juara>).map((j, ji: number) => (
                  <div key={ji} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ width: 40, textAlign: 'center', fontWeight: 'bold', color: '#64748b', fontSize: 14 }}>#{j.posisi}</div>
                    <input 
                      placeholder="Nama Burung" 
                      value={j.nama_burung} 
                      onChange={e => updateJuara(i, ji, 'nama_burung', e.target.value)}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13 }}
                    />
                    <input 
                      placeholder="Pemilik" 
                      value={j.pemilik} 
                      onChange={e => updateJuara(i, ji, 'pemilik', e.target.value)}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13 }}
                    />
                    <button onClick={() => removeJuara(i, ji)} style={{ padding: '8px', background: 'none', color: '#94a3b8', border: 'none', cursor: 'pointer' }}>✖</button>
                  </div>
                ))}
                <button onClick={() => addJuara(i)} style={{ alignSelf: 'flex-start', padding: '6px 12px', background: '#eff6ff', color: '#1d4ed8', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>+ Tambah Juara</button>
              </div>
            </div>
          ))}
          <button onClick={addKelas} style={{ padding: '12px', background: '#f1f5f9', color: '#475569', border: '2px dashed #cbd5e1', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            + Tambah Kelas Lomba
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 14, background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Batal</button>
          <button onClick={handleSave} disabled={loading} style={{ flex: 2, padding: 14, background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? '⏳ Menyimpan...' : '💾 Simpan Daftar Juara'}
          </button>
        </div>
      </div>
    </>
  )
}