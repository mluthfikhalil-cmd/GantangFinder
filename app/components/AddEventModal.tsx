'use client'

import { useState, useRef, useEffect } from 'react'
import { addEvent } from '../actions'
import { LEVELS, BIRDS } from './types'

interface User {
  id: string
  nama_lengkap: string
  role: 'organizer' | 'peserta'
  status: 'pending_approval' | 'active' | 'rejected'
  nomor_wa: string
}

const SANGKAR_OPTIONS = [
  'Bebas',
  'Standar Panitia',
  'Wajib Merek Tertentu',
]

const LEVEL_COLORS: Record<string, { bg: string; border: string; color: string }> = {
  'Latber':   { bg: '#f0fdf4', border: '#86efac', color: '#15803d' },
  'Latpres':  { bg: '#eff6ff', border: '#93c5fd', color: '#1d4ed8' },
  'Regional': { bg: '#fef3c7', border: '#fcd34d', color: '#b45309' },
  'Nasional': { bg: '#fdf4ff', border: '#e879f9', color: '#a21caf' },
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '13px', fontWeight: 600,
  color: '#374151', marginBottom: '6px',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  border: '1.5px solid #e2e8f0', borderRadius: '10px',
  fontSize: '14px', fontFamily: 'inherit', color: '#0f172a',
  background: '#fff', outline: 'none', transition: 'border-color 0.2s',
}

export default function AddEventModal({ onEventAdded }: { onEventAdded?: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [selectedBurung, setSelectedBurung] = useState<string[]>([])
  const [selectedLevel, setSelectedLevel] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Load current user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('gf_user')
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored) as User)
      } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  function toggleBurung(val: string) {
    setSelectedBurung(prev => prev.includes(val) ? prev.filter(b => b !== val) : [...prev, val])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Client-side check: must be logged in active organizer
    if (!currentUser || currentUser.role !== 'organizer' || currentUser.status !== 'active') {
      setError('Anda belum login atau belum disetujui sebagai organizer.')
      setLoading(false)
      return
    }

    try {
      const form = e.currentTarget
      const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement)?.value || ''

      // Build FormData to pass to server action
      const fd = new FormData()
      fd.append('nama_event', get('nama_event'))
      fd.append('penyelenggara', get('penyelenggara'))
      fd.append('lokasi', get('lokasi'))
      fd.append('kota', get('kota'))
      fd.append('tanggal', get('tanggal'))
      fd.append('jenis_burung', selectedBurung.join(','))
      fd.append('is_featured', String(isFeatured))
      fd.append('level_event', get('level_event'))
      fd.append('aturan_sangkar', get('aturan_sangkar'))

      const result = await addEvent(fd, currentUser.id)
      if (result && 'error' in result) {
        setError(result.error as string)
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        setSelectedBurung([])
        setSelectedLevel('')
        setIsFeatured(false)
        formRef.current?.reset()
        onEventAdded?.()
      }, 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  }

  const canAddEvent = currentUser?.role === 'organizer' && currentUser?.status === 'active'

  return (
    <>
      {/* Floating Button - only shown to active organizers */}
      {canAddEvent && (
        <button
          id="btn-tambah-event"
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed', bottom: 24, right: 24,
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg,#16a34a,#15803d)',
            color: '#fff', border: 'none', borderRadius: 9999,
            padding: '14px 22px', fontSize: 15, fontWeight: 700,
            fontFamily: 'inherit', cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(22,163,74,0.4)',
            transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
            zIndex: 40, animation: 'pulse-green 2.5s ease infinite',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06) translateY(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = '' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Tambah Event
        </button>
      )}

      {/* Overlay */}
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 50 }} />}

      {/* Modal */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#fff', borderRadius: '24px 24px 0 0',
          zIndex: 51, maxHeight: '92vh', overflowY: 'auto',
          animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
        }}>
          {/* Handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
            <div style={{ width: 40, height: 4, background: '#e2e8f0', borderRadius: 2 }} />
          </div>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px 0' }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Tambah Event Lomba 🏆</h2>
              <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Isi detail event lomba burung kicau</p>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>✕</button>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} style={{ padding: '20px 24px 32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Nama Event */}
              <div>
                <label style={labelStyle}>Nama Event <span style={{ color: '#ef4444' }}>*</span></label>
                <input name="nama_event" required placeholder="cth: Kejuaraan Burung Kicau Nasional 2025" style={inputStyle} />
              </div>

              {/* Penyelenggara */}
              <div>
                <label style={labelStyle}>Penyelenggara <span style={{ color: '#ef4444' }}>*</span></label>
                <input name="penyelenggara" required placeholder="cth: Paguyuban Kicau Jaya" style={inputStyle} />
              </div>

              {/* Level Event */}
              <div>
                <label style={labelStyle}>Level Event</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {LEVELS.map(level => {
                    const active = selectedLevel === level
                    const colors = LEVEL_COLORS[level]
                    return (
                      <label key={level} style={{ cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="level_event"
                          value={level}
                          checked={selectedLevel === level}
                          onChange={() => setSelectedLevel(level)}
                          style={{ display: 'none' }}
                        />
                        <span style={{
                          padding: '6px 14px',
                          borderRadius: 9999,
                          fontSize: 13,
                          fontWeight: 600,
                          border: `1.5px solid ${active ? colors.border : '#e2e8f0'}`,
                          background: active ? colors.bg : '#f8fafc',
                          color: active ? colors.color : '#64748b',
                          transition: 'all 0.15s',
                          display: 'inline-block',
                        }}>{level}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Lokasi & Kota */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Lokasi / Venue</label>
                  <input name="lokasi" placeholder="cth: GOR Satria" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Kota <span style={{ color: '#ef4444' }}>*</span></label>
                  <input name="kota" required placeholder="cth: Purwokerto" style={inputStyle} />
                </div>
              </div>

              {/* Tanggal */}
              <div>
                <label style={labelStyle}>Tanggal</label>
                <input name="tanggal" type="date" style={{ ...inputStyle, colorScheme: 'light' }} />
              </div>

              {/* Aturan Sangkar */}
              <div>
                <label style={labelStyle}>Aturan Sangkar</label>
                <select name="aturan_sangkar" style={{ ...inputStyle, appearance: 'none' }}>
                  <option value="">-- Pilih aturan sangkar --</option>
                  {SANGKAR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              {/* Jenis Burung */}
              <div>
                <label style={labelStyle}>Kelas / Jenis Burung</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 12, background: '#f8fafc', borderRadius: 10, border: '1.5px solid #e2e8f0' }}>
                  {BIRDS.map(b => (
                    <button key={b} type="button" onClick={() => toggleBurung(b)}
                      style={{
                        padding: '5px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600,
                        fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s',
                        border: selectedBurung.includes(b) ? '1.5px solid #16a34a' : '1.5px solid #e2e8f0',
                        background: selectedBurung.includes(b) ? '#dcfce7' : '#fff',
                        color: selectedBurung.includes(b) ? '#15803d' : '#64748b',
                      }}>
                      {b}
                    </button>
                  ))}
                </div>
                {selectedBurung.length > 0 && <p style={{ fontSize: 12, color: '#16a34a', marginTop: 6 }}>✓ {selectedBurung.length} kelas dipilih</p>}
              </div>

              {/* Featured */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#fef3c7', borderRadius: 10, border: '1.5px solid #fde68a' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>⭐ Tandai sebagai Featured</p>
                  <p style={{ fontSize: 12, color: '#b45309' }}>Event akan tampil di bagian teratas</p>
                </div>
                <button type="button" onClick={() => setIsFeatured(f => !f)} style={{
                  width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                  background: isFeatured ? '#16a34a' : '#d1d5db', transition: 'background 0.3s',
                  position: 'relative', flexShrink: 0,
                }}>
                  <span style={{
                    position: 'absolute', top: 3, left: isFeatured ? 24 : 3,
                    width: 20, height: 20, background: '#fff', borderRadius: '50%',
                    transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  }} />
                </button>
              </div>

              {error && <div style={{ padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#b91c1c', fontSize: 13 }}>⚠️ {error}</div>}
              {success && <div style={{ padding: '12px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, color: '#15803d', fontSize: 13, fontWeight: 600 }}>✅ Event berhasil ditambahkan!</div>}

              <button type="submit" disabled={loading || success} style={{
                width: '100%', padding: 15,
                background: loading || success ? '#86efac' : 'linear-gradient(135deg,#16a34a,#15803d)',
                color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
                fontFamily: 'inherit', cursor: loading || success ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', boxShadow: loading || success ? 'none' : '0 4px 14px rgba(22,163,74,0.35)',
              }}>
                {loading ? '⏳ Menyimpan...' : success ? '✅ Tersimpan!' : '🏆 Tambah Event'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
