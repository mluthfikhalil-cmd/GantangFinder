'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createRooster, getRoosterProfile } from '@/app/actions/roosterActions'

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
  foto_burung?: string
}

interface User {
  id: string
  nama_lengkap: string
  role: 'organizer' | 'peserta'
}

const JENIS_BURUNG_OPTIONS = [
  'Lovebird', 'Kenari', 'Parkit', 'Murai Batu', 'Kacer', 'Skoci', 'Anis Merah', 'Branjangan', 'Cucak Ijo', 'Cucak Jenggot', 'Jalak', 'Prenjak', 'Sikatan', 'Lainnya'
]

function fmtDate(d: string) {
  return d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
}

export default function PetManagementPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<'bird' | 'rooster'>('bird')
  
  const [birds, setBirds] = useState<Bird[]>([])
  const [roosters, setRoosters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  
  // Form state
  const [form, setForm] = useState({ name: '', type: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formErr, setFormErr] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('gf_user')
    if (!stored) { router.push('/login'); return }
    const u = JSON.parse(stored) as User
    setUser(u)
    loadAll(u.id)

    const params = new URLSearchParams(window.location.search)
    if (params.get('tab') === 'rooster') setActiveTab('rooster')
  }, [router])

  async function loadAll(ownerId: string) {
    setLoading(true)
    await Promise.all([loadBirds(ownerId), loadRoosters(ownerId)])
    setLoading(false)
  }

  async function loadBirds(ownerId: string) {
    try {
      const res = await fetch(`${SB_URL}/rest/v1/birds?owner_id=eq.${ownerId}&select=*&order=created_at.desc`, { headers: H })
      const d = await res.json()
      setBirds(Array.isArray(d) ? d : [])
    } catch (e) { console.error(e) }
  }

  async function loadRoosters(ownerId: string) {
    try {
      const res = await fetch(`${SB_URL}/rest/v1/roosters?owner_id=eq.${ownerId}&select=*&order=created_at.desc`, { headers: H })
      const d = await res.json()
      setRoosters(Array.isArray(d) ? d : [])
    } catch (e) { console.error(e) }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!form.name.trim()) {
      setFormErr('Nama wajib diisi')
      return
    }
    
    setSubmitting(true)
    setFormErr('')

    try {
      if (activeTab === 'bird') {
        const res = await fetch('/api/birds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nama_burung: form.name, jenis_burung: form.type, owner_id: user.id, owner_name: user.nama_lengkap }),
        })
        if (res.ok) {
          await loadBirds(user.id)
          setForm({ name: '', type: '' })
          setShowAdd(false)
        } else {
          setFormErr('Gagal menambahkan burung')
        }
      } else {
        const formData = new FormData()
        formData.append('owner_id', user.id)
        formData.append('name', form.name)
        formData.append('breed', form.type)
        
        const res = await createRooster(formData)
        if (res.success) {
          await loadRoosters(user.id)
          setForm({ name: '', type: '' })
          setShowAdd(false)
        } else {
          setFormErr(res.message || 'Gagal menambahkan ayam')
        }
      }
    } catch (err) {
      setFormErr('Terjadi kesalahan')
    }
    setSubmitting(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
      
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', padding: '24px 16px 20px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 20 }}>←</Link>
            <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: 0 }}>🛡️ Manajemen Peliharaan</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: '0 0 16px' }}>
            Kelola profil Burung dan Ayam Jago lo di sini!
          </p>
          <button
            onClick={() => setShowAdd(v => !v)}
            style={{
              padding: '10px 20px', background: '#fff', color: '#16a34a', border: 'none',
              borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>
            {showAdd ? '✕ Batal' : `+ Tambah ${activeTab === 'bird' ? 'Burung' : 'Ayam'}`}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px' }}>
        
        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: 'var(--bg-secondary)', padding: 4, borderRadius: 12, border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setActiveTab('bird')}
            style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: activeTab === 'bird' ? 'var(--bg-primary)' : 'transparent', fontWeight: 700, fontSize: 13, color: activeTab === 'bird' ? 'var(--accent-green)' : 'var(--text-secondary)', cursor: 'pointer', boxShadow: activeTab === 'bird' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>
            🐦 Burung
          </button>
          <button 
            onClick={() => setActiveTab('rooster')}
            style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: activeTab === 'rooster' ? 'var(--bg-primary)' : 'transparent', fontWeight: 700, fontSize: 13, color: activeTab === 'rooster' ? 'var(--accent-green)' : 'var(--text-secondary)', cursor: 'pointer', boxShadow: activeTab === 'rooster' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>
            🐓 Ayam Jago
          </button>
        </div>

        {/* Add Form */}
        {showAdd && (
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: 20, border: '1.5px solid var(--border-color)', marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>✨ Tambah {activeTab === 'bird' ? 'Burung' : 'Ayam'} Baru</h3>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder={`Nama ${activeTab === 'bird' ? 'Burung' : 'Ayam'}`}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border-color)', borderRadius: 10, background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
              />
              {activeTab === 'bird' ? (
                <select
                  value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border-color)', borderRadius: 10, background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}>
                  <option value="">— Pilih Jenis Burung —</option>
                  {JENIS_BURUNG_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              ) : (
                <input
                  value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  placeholder="Ras/Breed (cth: Bangkok)"
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border-color)', borderRadius: 10, background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                />
              )}
              {formErr && <p style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>{formErr}</p>}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '12px', background: 'var(--accent-green)', color: '#fff', border: 'none',
                  borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? .7 : 1,
                }}>
                {submitting ? '⏳ Menyimpan...' : '💾 Simpan Data'}
              </button>
            </form>
          </div>
        )}

        {/* List Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>Memuat...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeTab === 'bird' ? (
              birds.length === 0 ? <p style={{ textAlign: 'center', py: 8 }}>Belum ada burung.</p> :
              birds.map(b => (
                <div key={b.id} style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: 16, border: '1px solid var(--border-color)', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ fontSize: 24 }}>🐦</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{b.nama_burung}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{b.jenis_burung}</div>
                  </div>
                </div>
              ))
            ) : (
              roosters.length === 0 ? <p style={{ textAlign: 'center', py: 8 }}>Belum ada ayam jago.</p> :
              roosters.map(r => (
                <Link key={r.id} href={`/roosters/${r.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: 16, border: '1px solid var(--border-color)', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ fontSize: 24 }}>🐓</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.breed || 'Campuran'} • {r.weight_kg || '—'} kg</div>
                    </div>
                    <div style={{ background: 'var(--accent-green)', color: '#fff', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>Manager</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Leaderboard Link */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Link href="/leaderboard" style={{ color: 'var(--accent-green)', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
            🏆 Lihat Leaderboard →
          </Link>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav style={{position:'fixed',bottom:0,left:0,right:0,background:'var(--bg-primary)',borderTop:'1px solid var(--border-color)',display:'flex',alignItems:'center',justifyContent:'space-around',padding:'8px 0 max(8px, env(safe-area-inset-bottom))',zIndex:40}}>
        <Link href="/" style={{flex:1,textAlign:'center',textDecoration:'none',color:'var(--text-secondary)',fontSize:11}}><span style={{fontSize:20,display:'block'}}>🏠</span>Home</Link>
        <Link href="/feed" style={{flex:1,textAlign:'center',textDecoration:'none',color:'var(--text-secondary)',fontSize:11}}><span style={{fontSize:20,display:'block'}}>💬</span>Komunitas</Link>
        <Link href="/birds" style={{flex:1,textAlign:'center',textDecoration:'none',color:'var(--accent-green)',fontSize:11}}><span style={{fontSize:20,display:'block'}}>🐦</span>Profil</Link>
        <Link href="/dashboard" style={{flex:1,textAlign:'center',textDecoration:'none',color:'var(--text-secondary)',fontSize:11}}><span style={{fontSize:20,display:'block'}}>👤</span>Akun</Link>
      </nav>
    </div>
  )
}
