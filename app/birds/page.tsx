'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }

interface Bird {
  id: string
  nama_burung: string
  jenis_burung: string
  owner_id: string
  owner_name: string
  created_at: string
}

interface BirdEvent {
  id: string
  bird_id: string
  event_id: string
  event_name: string
  event_date: string
  event_kota: string
  event_jenis_burung: string
  event_tingkat: string
  kelas: string
  posisi: number | null
  points_earned: number
  is_peserta_only: boolean
}

interface User {
  id: string
  nama_lengkap: string
  role: 'organizer' | 'peserta'
}

const JENIS_BURUNG_OPTIONS = [
  'Lovebird', 'Kenari', 'Parkit', 'Murai Batu', 'Kacer', 'Skoci', 'B任提出',
  'Anis Merah', 'Branjangan', 'Cucak Ijo', 'Cucak Jenggot', 'Ekek Geling',
  'Hwaingu', 'Jalak', 'Kapodang', 'K核桃', 'Lemon Ikan', 'Merbah', 'Migrika',
  'Og的事情', 'Pipit', 'Prenjak', 'Rajaapi', 'Sikatan', 'Tledekan', 'Tresnak',
  'Walets', '其他',
]

function fmtDate(d: string) {
  return d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
}

export default function BirdsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [birds, setBirds] = useState<Bird[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedBird, setSelectedBird] = useState<Bird | null>(null)
  const [birdEvents, setBirdEvents] = useState<BirdEvent[]>([])

  // Form state
  const [form, setForm] = useState({ nama_burung: '', jenis_burung: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formErr, setFormErr] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('gf_user')
    if (!stored) { router.push('/login'); return }
    const u = JSON.parse(stored) as User
    setUser(u)
    loadBirds(u.id)
  }, [router])

  async function loadBirds(ownerId: string) {
    setLoading(true)
    try {
      const res = await fetch(`${SB_URL}/rest/v1/birds?owner_id=eq.${ownerId}&select=*&order=created_at.desc`, { headers: H })
      const d = await res.json()
      setBirds(Array.isArray(d) ? d : [])
    } catch { /* ignore */ }
    setLoading(false)
  }

  async function loadBirdEvents(birdId: string) {
    const res = await fetch(`${SB_URL}/rest/v1/bird_events?bird_id=eq.${birdId}&select=*&order=event_date.desc`, { headers: H })
    const d = await res.json()
    setBirdEvents(Array.isArray(d) ? d : [])
  }

  async function handleAddBird(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!form.nama_burung.trim() || !form.jenis_burung) {
      setFormErr('Nama burung dan jenis wajib diisi')
      return
    }
    setSubmitting(true)
    setFormErr('')
    try {
      const res = await fetch('/api/birds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, owner_id: user.id, owner_name: user.nama_lengkap }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setBirds(prev => [{ ...data.bird, ...form, owner_id: user.id, owner_name: user.nama_lengkap }, ...prev])
        setForm({ nama_burung: '', jenis_burung: '' })
        setShowAdd(false)
      } else {
        setFormErr(data.error || 'Gagal menambahkan bird')
      }
    } catch {
      setFormErr('Terjadi kesalahan')
    }
    setSubmitting(false)
  }

  async function handleDeleteBird(bird: Bird) {
    if (!confirm(`Hapus bird "${bird.nama_burung}"? Event history akan tetap tersimpan.`)) return
    const res = await fetch(`/api/birds?id=${bird.id}&owner_id=${user?.id}`, { method: 'DELETE' })
    if (res.ok) {
      setBirds(prev => prev.filter(b => b.id !== bird.id))
      if (selectedBird?.id === bird.id) setSelectedBird(null)
    }
  }

  function openBirdDetail(bird: Bird) {
    setSelectedBird(bird)
    loadBirdEvents(bird.id)
  }

  const totalPoints = birdEvents.reduce((sum, e) => sum + (e.points_earned || 0), 0)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', padding: '24px 16px 20px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 20 }}>←</Link>
            <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: 0 }}>🐦 Bird Profiles</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: '0 0 16px' }}>
            Daftarkan burung lo untuk mulai kumpulkan poin di leaderboard!
          </p>
          <button
            onClick={() => setShowAdd(v => !v)}
            style={{
              padding: '10px 20px', background: '#fff', color: '#16a34a', border: 'none',
              borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>
            {showAdd ? '✕ Batal' : '+ Tambah Bird'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px' }}>
        {/* Add Bird Form */}
        {showAdd && (
          <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1.5px solid #e2e8f0', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>🐦 Tambah Bird Baru</h3>
            <form onSubmit={handleAddBird} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Nama Burung</label>
                <input
                  value={form.nama_burung}
                  onChange={e => setForm(p => ({ ...p, nama_burung: e.target.value }))}
                  placeholder="cth: Lovebird Andika, Kacer Silver"
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Jenis Burung</label>
                <select
                  value={form.jenis_burung}
                  onChange={e => setForm(p => ({ ...p, jenis_burung: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}>
                  <option value="">— Pilih Jenis —</option>
                  {JENIS_BURUNG_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              {formErr && <p style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>{formErr}</p>}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '12px', background: '#16a34a', color: '#fff', border: 'none',
                  borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: submitting ? .7 : 1,
                }}>
                {submitting ? '⏳ Menyimpan...' : '💾 Simpan Bird'}
              </button>
            </form>
          </div>
        )}

        {/* Bird List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>Memuat...</div>
        ) : birds.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 14, border: '1.5px solid #e2e8f0' }}>
            <div style={{ fontSize: 48 }}>🐦</div>
            <p style={{ color: '#64748b', marginTop: 12 }}>Belum ada bird terdaftar.</p>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Klik "Tambah Bird" di atas untuk mulai!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {birds.map(bird => (
              <div key={bird.id} style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1.5px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{bird.nama_burung}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      {bird.jenis_burung} • Ditambahkan {fmtDate(bird.created_at)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => openBirdDetail(bird)}
                      style={{ padding: '6px 12px', background: '#eff6ff', color: '#1d4ed8', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      📊 Riwayat
                    </button>
                    <button
                      onClick={() => handleDeleteBird(bird)}
                      style={{ padding: '6px 10px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Leaderboard Link */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Link href="/leaderboard" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
            🏆 Lihat Leaderboard →
          </Link>
        </div>
      </div>

      {/* Bird Detail Modal */}
      {selectedBird && (
        <>
          <div onClick={() => setSelectedBird(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)', zIndex: 100 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 20, width: '90%', maxWidth: 500, zIndex: 101, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,.2)', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{selectedBird.nama_burung}</h2>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>{selectedBird.jenis_burung}</p>
              </div>
              <button onClick={() => setSelectedBird(null)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#94a3b8' }}>×</button>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px', marginBottom: 16, display: 'flex', gap: 16 }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#16a34a' }}>{totalPoints}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Total Poin</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1, borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#1d4ed8' }}>{birdEvents.length}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Event Diikuti</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#d97706' }}>{birdEvents.filter(e => e.posisi === 1).length}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Juara 1</div>
              </div>
            </div>

            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#64748b', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Riwayat Event</h3>
            {birdEvents.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Belum ada event yang diikuti.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {birdEvents.map(ev => (
                  <div key={ev.id} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{ev.event_name}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                          {fmtDate(ev.event_date)} • {ev.event_kota || '—'} • {ev.event_tingkat}
                        </div>
                        {ev.kelas && <div style={{ fontSize: 11, color: '#94a3b8' }}>Kelas: {ev.kelas}</div>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {ev.posisi ? (
                          <span style={{ background: ev.posisi === 1 ? '#fef3c7' : '#f1f5f9', color: ev.posisi === 1 ? '#d97706' : '#64748b', padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 700 }}>
                            🥇 #{ev.posisi}
                          </span>
                        ) : (
                          <span style={{ background: '#f0fdf4', color: '#15803d', padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700 }}>
                            Participant
                          </span>
                        )}
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', marginTop: 4 }}>+{ev.points_earned} pts</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
