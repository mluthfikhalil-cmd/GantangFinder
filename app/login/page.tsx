'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [nomor_wa, setNomorWa] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomor_wa }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        // Save to localStorage
        localStorage.setItem('gf_organizer', JSON.stringify(data.organizer))
        localStorage.setItem('gf_token', data.token)
        setMsg({ type: 'success', text: 'Login berhasil!' })
        setTimeout(() => router.push('/dashboard'), 800)
      } else {
        setMsg({ type: 'error', text: data.error })
      }
    } catch {
      setMsg({ type: 'error', text: 'Terjadi kesalahan. Coba lagi.' })
    }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 12, border: '1.5px solid #e2e8f0',
    fontSize: 16, fontFamily: 'inherit', outline: 'none', textAlign: 'center', letterSpacing: 2,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0fdf4', fontFamily: 'inherit', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: 380, margin: '0 auto', padding: '32px 16px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔑</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Login Organizer</h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Masuk dengan nomor WhatsApp</p>
        </div>

        {/* Form */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6, textAlign: 'center' }}>
                Nomor WhatsApp
              </label>
              <input
                style={inputStyle}
                placeholder="08xxxxxxxxxx"
                value={nomor_wa}
                onChange={e => setNomorWa(e.target.value)}
                required
              />
            </div>

            {msg && (
              <div style={{
                padding: '12px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: msg.type === 'success' ? '#dcfce7' : '#fef2f2',
                color: msg.type === 'success' ? '#15803d' : '#dc2626',
                border: `1px solid ${msg.type === 'success' ? '#86efac' : '#fecaca'}`,
                textAlign: 'center',
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
              {loading ? 'Memproses...' : 'Login'}
            </button>
          </form>
        </div>

        {/* Footer links */}
        <div style={{ textAlign: 'center', marginTop: 20, display: 'flex', justifyContent: 'center', gap: 16, fontSize: 13 }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>← Beranda</Link>
          <Link href="/register" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}>Belum punya akun? Daftar</Link>
        </div>
      </div>
    </div>
  )
}
