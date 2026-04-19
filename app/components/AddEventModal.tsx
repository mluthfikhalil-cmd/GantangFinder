'use client'

import { useState, useRef, useEffect } from 'react'
import { addEvent } from './actions'

const JENIS_BURUNG_OPTIONS = [
  'Murai Batu', 'Kacer', 'Cucak Rowo', 'Cendet', 'Kenari',
  'Lovebird', 'Cucak Hijau', 'Anis Merah', 'Pleci', 'Kolibri',
  'Trucukan', 'Prenjak', 'Tledekan', 'Jalak Suren', 'Jalak Bali',
]

export default function AddEventModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [selectedBurung, setSelectedBurung] = useState<string[]>([])
  const formRef = useRef<HTMLFormElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  function toggleBurung(val: string) {
    setSelectedBurung(prev =>
      prev.includes(val) ? prev.filter(b => b !== val) : [...prev, val]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    formData.set('jenis_burung', selectedBurung.join(','))

    const result = await addEvent(formData)

    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        setSelectedBurung([])
        formRef.current?.reset()
        window.location.reload()
      }, 1200)
    }
  }

  return (
    <>
      {/* Floating Add Button */}
      <button
        id="btn-tambah-event"
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'linear-gradient(135deg, #16a34a, #15803d)',
          color: '#fff',
          border: 'none',
          borderRadius: '9999px',
          padding: '14px 22px',
          fontSize: '15px',
          fontWeight: '700',
          fontFamily: 'inherit',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(22,163,74,0.4)',
          transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          zIndex: 40,
          animation: 'pulse-green 2.5s ease infinite',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget
          el.style.transform = 'scale(1.06) translateY(-2px)'
          el.style.boxShadow = '0 12px 32px rgba(22,163,74,0.5)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget
          el.style.transform = ''
          el.style.boxShadow = '0 8px 24px rgba(22,163,74,0.4)'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Tambah Event
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 50,
            animation: 'fadeIn 0.2s ease forwards',
          }}
        />
      )}

      {/* Modal Sheet */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 0, left: 0, right: 0,
            background: '#fff',
            borderRadius: '24px 24px 0 0',
            zIndex: 51,
            maxHeight: '92vh',
            overflowY: 'auto',
            animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
          }}
        >
          {/* Handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
            <div style={{ width: 40, height: 4, background: '#e2e8f0', borderRadius: 2 }} />
          </div>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 24px 0',
          }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                Tambah Event Lomba 🏆
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: 2 }}>
                Isi detail event lomba burung kicau
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: '#f1f5f9', border: 'none', borderRadius: '50%',
                width: 36, height: 36, cursor: 'pointer', fontSize: '18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#64748b', transition: 'all 0.2s',
              }}
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} style={{ padding: '20px 24px 32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Nama Event */}
              <div>
                <label style={labelStyle}>Nama Event <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  name="nama_event"
                  required
                  placeholder="cth: Kejuaraan Burung Kicau Nasional 2025"
                  style={inputStyle}
                />
              </div>

              {/* Penyelenggara */}
              <div>
                <label style={labelStyle}>Penyelenggara <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  name="penyelenggara"
                  required
                  placeholder="cth: Paguyuban Kicau Jaya"
                  style={inputStyle}
                />
              </div>

              {/* 2 col: Lokasi & Kota */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Lokasi / Venue</label>
                  <input
                    name="lokasi"
                    placeholder="cth: GOR Satria"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Kota <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    name="kota"
                    required
                    placeholder="cth: Purwokerto"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Tanggal */}
              <div>
                <label style={labelStyle}>Tanggal</label>
                <input
                  name="tanggal"
                  type="date"
                  style={{ ...inputStyle, colorScheme: 'light' }}
                />
              </div>

              {/* Jenis Burung */}
              <div>
                <label style={labelStyle}>Jenis Burung</label>
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '8px',
                  padding: '12px', background: '#f8fafc',
                  borderRadius: '10px', border: '1.5px solid #e2e8f0',
                }}>
                  {JENIS_BURUNG_OPTIONS.map(burung => (
                    <button
                      key={burung}
                      type="button"
                      onClick={() => toggleBurung(burung)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 600,
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        border: selectedBurung.includes(burung)
                          ? '1.5px solid #16a34a'
                          : '1.5px solid #e2e8f0',
                        background: selectedBurung.includes(burung) ? '#dcfce7' : '#fff',
                        color: selectedBurung.includes(burung) ? '#15803d' : '#64748b',
                      }}
                    >
                      {burung}
                    </button>
                  ))}
                </div>
                {selectedBurung.length > 0 && (
                  <p style={{ fontSize: '12px', color: '#16a34a', marginTop: 6 }}>
                    ✓ {selectedBurung.length} kelas dipilih
                  </p>
                )}
              </div>

              {/* Featured Toggle */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px',
                background: '#fef3c7',
                borderRadius: '10px',
                border: '1.5px solid #fde68a',
              }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#92400e' }}>⭐ Tandai sebagai Featured</p>
                  <p style={{ fontSize: '12px', color: '#b45309' }}>Event akan tampil di bagian teratas</p>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, flexShrink: 0 }}>
                  <input
                    type="checkbox"
                    name="is_featured_check"
                    id="is_featured_check"
                    style={{ opacity: 0, width: 0, height: 0 }}
                    onChange={e => {
                      const hiddenInput = document.querySelector('input[name="is_featured"]') as HTMLInputElement
                      if (hiddenInput) hiddenInput.value = e.target.checked ? 'true' : 'false'
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute', cursor: 'pointer',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: '#d1d5db', borderRadius: 24,
                      transition: '0.3s',
                    }}
                    onClick={() => {
                      const checkbox = document.getElementById('is_featured_check') as HTMLInputElement
                      checkbox.click()
                      const span = checkbox.nextElementSibling as HTMLElement
                      if (checkbox.checked) {
                        span.style.background = '#16a34a'
                        const ball = span.querySelector('span') as HTMLElement
                        if (ball) ball.style.transform = 'translateX(20px)'
                      } else {
                        span.style.background = '#d1d5db'
                        const ball = span.querySelector('span') as HTMLElement
                        if (ball) ball.style.transform = 'translateX(0)'
                      }
                    }}
                  >
                    <span style={{
                      position: 'absolute',
                      height: 18, width: 18, left: 3, bottom: 3,
                      background: 'white', borderRadius: '50%',
                      transition: '0.3s',
                    }} />
                  </span>
                </label>
                <input type="hidden" name="is_featured" defaultValue="false" />
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  padding: '12px 14px',
                  background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: '10px', color: '#b91c1c', fontSize: '13px',
                }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div style={{
                  padding: '12px 14px',
                  background: '#f0fdf4', border: '1px solid #bbf7d0',
                  borderRadius: '10px', color: '#15803d', fontSize: '13px',
                  fontWeight: 600,
                }}>
                  ✅ Event berhasil ditambahkan!
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || success}
                style={{
                  width: '100%',
                  padding: '15px',
                  background: loading || success
                    ? '#86efac'
                    : 'linear-gradient(135deg, #16a34a, #15803d)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  cursor: loading || success ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: loading || success ? 'none' : '0 4px 14px rgba(22,163,74,0.35)',
                }}
              >
                {loading ? '⏳ Menyimpan...' : success ? '✅ Tersimpan!' : '🏆 Tambah Event'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '6px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  border: '1.5px solid #e2e8f0',
  borderRadius: '10px',
  fontSize: '14px',
  fontFamily: 'inherit',
  color: '#0f172a',
  background: '#fff',
  outline: 'none',
  transition: 'border-color 0.2s',
}
