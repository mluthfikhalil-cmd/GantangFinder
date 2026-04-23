'use client'
import { useState, useEffect } from 'react'
import MasteranPlayer from '../components/MasteranPlayer'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }

interface Sound {
  id: string
  title: string
  description?: string | null
  bird_type: string
  audio_url: string
  duration_seconds?: number | null
  play_count: number
  download_count: number
  source: string
  created_at: string
}

const BIRD_TYPES = [
  'all', 'Murai Batu', 'Cucak Rowo', 'Lovebird', 'Kenari',
  'Anis Merah', 'Cendet', 'Pleci', 'Kolibri', 'Trucukan', 'Cucak Hijau', 'Kacer',
]

export default function MasteranPage() {
  const [sounds, setSounds] = useState<Sound[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'play_count' | 'download_count' | 'created_at'>('play_count')
  const [stats, setStats] = useState({ total: 0, birds: 0 })

  useEffect(() => {
    async function fetchSounds() {
      if (!SB_URL || !SB_KEY) { setError('Supabase not configured'); setLoading(false); return }
      try {
        const url = `${SB_URL}/rest/v1/masteran_sounds?select=*&is_active=eq.true&order=${sort}.desc`
        const r = await fetch(url, { headers: H })
        const d = await r.json()
        const arr = Array.isArray(d) ? d : []
        setSounds(arr)
        setStats({ total: arr.length, birds: new Set(arr.map((s: Sound) => s.bird_type)).size })
      } catch (e: unknown) {
        setError(String(e))
      }
      setLoading(false)
    }
    void fetchSounds()
  }, [sort])

  const filtered = sounds.filter(s => {
    const matchBird = filter === 'all' || s.bird_type === filter
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase())
    return matchBird && matchSearch
  })

  return (
    <div style={{ padding: '0 0 100px 0', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        padding: '24px 20px 20px',
        background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.12) 0%, transparent 100%)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
            🎵 Masteran
          </h1>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {stats.total} sounds
          </span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 18 }}>
          Koleksi suara masteran gacor buat latihan burung kesayangan kamu 🐦
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
          <div className="glass" style={{ padding: '12px 16px', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-primary)' }}>{stats.total}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Masteran</div>
          </div>
          <div className="glass" style={{ padding: '12px 16px', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-secondary)' }}>{stats.birds}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Jenis Burung</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
          <input
            type="text"
            placeholder="Cari masteran..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px 12px 44px',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: 14,
              outline: 'none',
            }}
          />
        </div>

        {/* Bird type filter */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {BIRD_TYPES.map(b => (
            <button
              key={b}
              onClick={() => setFilter(b)}
              style={{
                flexShrink: 0,
                padding: '7px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: 12,
                fontWeight: 600,
                background: filter === b ? 'var(--accent-gradient)' : 'var(--glass-bg)',
                border: filter === b ? 'none' : '1px solid var(--glass-border)',
                color: filter === b ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {b === 'all' ? '🏠 Semua' : b}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div style={{ padding: '0 20px 12px', display: 'flex', justifyContent: 'flex-end' }}>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as typeof sort)}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
            fontSize: 12,
            padding: '6px 10px',
            cursor: 'pointer',
          }}
        >
          <option value="play_count">🔥 Terpopuler</option>
          <option value="download_count">⬇️ Paling Banyak Diunduh</option>
          <option value="created_at">🆕 Terbaru</option>
        </select>
      </div>

      {/* Content */}
      <div style={{ padding: '0 20px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass" style={{ padding: 18, opacity: 0.5 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--border-color)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 14, width: '70%', borderRadius: 4, background: 'var(--border-color)', marginBottom: 8 }} />
                    <div style={{ height: 10, width: '40%', borderRadius: 4, background: 'var(--border-color)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <p>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔇</div>
            <p>Belum ada masteran untuk filter ini</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map((sound, i) => (
              <div
                key={sound.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
              >
                <MasteranPlayer sound={sound} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom info bar */}
      <div style={{
        position: 'fixed',
        bottom: 70,
        left: 20,
        right: 20,
        padding: '10px 16px',
        background: 'rgba(13, 13, 13, 0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 12,
        color: 'var(--text-muted)',
        zIndex: 50,
      }}>
        <span style={{ fontSize: 16 }}>💡</span>
        <span>Gunakan headphone untuk hasil terbaik 🎧</span>
      </div>
    </div>
  )
}