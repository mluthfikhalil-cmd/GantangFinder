'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [form, setForm] = useState({ 
    nama_lengkap: '', 
    nomor_wa: '', 
    email: '', 
    kota: '', 
    password: '', 
    confirmPassword: '', 
    role: '' as 'organizer' | 'peserta' | ''
  })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    if (!form.role) {
      setMsg({ type: 'error', text: 'Pilih role terlebih dahulu' })
      setLoading(false)
      return
    }

    if (form.password !== form.confirmPassword) {
      setMsg({ type: 'error', text: 'Password tidak cocok' })
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setMsg({ type: 'success', text: data.message })
        setForm({ nama_lengkap: '', nomor_wa: '', email: '', kota: '', password: '', confirmPassword: '', role: '' })
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
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 16px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏟️</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Daftar di GantangFinder</h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Pilih role sesuai kebutuhan Anda</p>
        </div>

        {/* Role Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[
            { value: 'peserta', emoji: '🐦', title: 'Peserta', desc: 'Ikut lomba & kejar leaderboard' },
            { value: 'organizer', emoji: '🏆', title: 'Organizer', desc: 'Buat & kelola event lomba' },
          ].map(r => (
            <button
              key={r.value}
              type="button"
              onClick={() => setForm({ ...form, role: r.value as 'organizer' | 'peserta' })}
              style={{
                padding: '16px 12px', borderRadius: 14, border: `2px solid ${form.role === r.value ? '#16a34a' : '#e2e8f0'}`,
                background: form.role === r.value ? '#f0fdf4' : '#fff', cursor: 'pointer', textAlign: 'center',
                transition: 'all 0.2s', fontFamily: 'inherit',
                boxShadow: form.role === r.value ? '0 4px 12px rgba(22,163,74,0.15)' : 'none',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>{r.emoji}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: form.role === r.value ? '#16a34a' : '#374151' }}>{r.title}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{r.desc}</div>
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '24px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              <label style={labelStyle}>Email *</label>
              <input
                style={inputStyle}
                type="email"
                placeholder="email@contoh.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
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

            <div>
              <label style={labelStyle}>Password *</label>
              <input
                style={inputStyle}
                type="password"
                placeholder="Minimal 6 karakter"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <div>
              <label style={labelStyle}>Konfirmasi Password *</label>
              <input
                style={inputStyle}
                type="password"
                placeholder="Masukkan password lagi"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
            </div>

            {/* Organizer info */}
            {form.role === 'organizer' && (
              <div style={{
                padding: '16px',
                background: '#f0fdf4',
                borderRadius: 12,
                border: '1.5px solid #bbf7d0',
              }}>
                <p style={{ fontSize: 13, color: '#15803d', margin: 0, fontWeight: 600 }}>
                  🏆 Sebagai Organizer, akun Anda akan menunggu persetujuan admin sebelum bisa membuat event.
                </p>
              </div>
            )}

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
              disabled={loading || !form.role}
              style={{
                width: '100%', padding: 14, 
                background: loading || !form.role ? '#94a3b8' : 'linear-gradient(135deg,#16a34a,#15803d)',
                color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
                fontFamily: 'inherit', cursor: loading || !form.role ? 'not-allowed' : 'pointer',
                boxShadow: loading || !form.role ? 'none' : '0 4px 14px rgba(22,163,74,0.3)',
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
      </div>
    </div>
  )
}