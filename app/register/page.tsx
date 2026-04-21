'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [form, setForm] = useState({ nama_lengkap: '', nomor_wa: '', email: '', kota: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setMsg({ type: 'success', text: data.message })
        setForm({ nama_lengkap: '', nomor_wa: '', email: '', kota: '' })
      } else {
        setMsg({ type: 'error', text: data.error })
      }
    } catch {
      setMsg({ type: 'error', text: 'Terjadi kesalahan. Coba lagi.' })
    }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0',
    fontSize: 14, fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0fdf4', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: 440, margin: '0 auto', padding: '32px 16px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏟️</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Daftar Jadi Organizer</h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Buat dankelola event lomba burung kicau</p>
        </div>

        {/* Form */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '24px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>Nama Lengkap *</label>
              <input
                style={inputStyle}
                placeholder="Contoh: Budi Santoso"
                value={form.nama_lengkap}
                onChange={e => setForm({ ...form, nama_lengkap: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Nomor WhatsApp *</label>
              <input
                style={inputStyle}
                placeholder="08xxxxxxxxxx"
                value={form.nomor_wa}
                onChange={e => setForm({ ...form, nomor_wa: e.target.value })}
                required
              />
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Contoh: 081234567890</p>
            </div>

            <div>
              <label style={labelStyle}>Email (opsional)</label>
              <input
                style={inputStyle}
                type="email"
                placeholder="email@contoh.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label style={labelStyle}>Kota *</label>
              <input
                style={inputStyle}
                placeholder="Contoh: Palembang"
                value={form.kota}
                onChange={e => setForm({ ...form, kota: e.target.value })}
                required
              />
            </div>

            {msg && (
              <div style={{
                padding: '12px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: msg.type === 'success' ? '#dcfce7' : '#fef2f2',
                color: msg.type === 'success' ? '#15803d' : '#dc2626',
                border: `1px solid ${msg.type === 'success' ? '#86efac' : '#fecaca'}`,
              }}>
                {msg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: 14, background: loading ? '#94a3b8' : 'linear-gradient(135deg,#16a34a,#15803d)',
                color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
                fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(22,163,74,0.3)',
                transition: 'all 0.2s',
              }}
            >
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>
          </form>
        </div>

        {/* Footer links */}
        <div style={{ textAlign: 'center', marginTop: 20, display: 'flex', justifyContent: 'center', gap: 16, fontSize: 13 }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>← Beranda</Link>
          <Link href="/login" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}>Sudah punya akun? Login</Link>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 16 }}>
          Setelah daftar, akun akan dicek oleh admin dalam 1x24 jam sebelum bisa membuat event.
        </p>
      </div>
    </div>
  )
}
