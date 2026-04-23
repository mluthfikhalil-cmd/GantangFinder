'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isRegister, setIsRegister] = useState(false)
  
  // Form fields
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [namaLengkap, setNamaLengkap] = useState('')
  const [waNumber, setWaNumber] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    try {
      const endpoint = isRegister ? '/api/register' : '/api/login'
      const body = isRegister 
        ? { username, password, namaLengkap, waNumber }
        : { username, password }
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        // Save to localStorage (must match what page.tsx checks)
        localStorage.setItem('gantang_user', JSON.stringify(data.user))
        setMsg({ type: 'success', text: isRegister ? 'Pendaftaran berhasil!' : 'Login berhasil!' })
        
        // Redirect
        const redirect = searchParams.get('redirect') || '/'
        setTimeout(() => router.push(redirect), 800)
      } else {
        setMsg({ type: 'error', text: data.error || 'Terjadi kesalahan' })
      }
    } catch {
      setMsg({ type: 'error', text: 'Terjadi kesalahan. Coba lagi.' })
    }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 12, border: '1.5px solid var(--border-color)',
    fontSize: 16, fontFamily: 'inherit', outline: 'none', background: 'var(--bg-primary)', color: 'var(--text-primary)',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', fontFamily: 'inherit', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: 400, margin: '0 auto', padding: '32px 16px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔑</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            {isRegister ? 'Daftar' : 'Login'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
            {isRegister ? 'Buat akun organizer' : 'Masuk dengan username'}
          </p>
        </div>

        {/* Form */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '28px 24px', border: '1px solid var(--border-color)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Username *
              </label>
              <input
                style={inputStyle}
                type="text"
                placeholder="pilih_username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Password *
              </label>
              <input
                style={inputStyle}
                type="password"
                placeholder={isRegister ? 'Min 4 karakter' : 'Password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={isRegister ? 4 : undefined}
              />
            </div>

            {isRegister && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    Nama Lengkap *
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder="Nama lengkap Anda"
                    value={namaLengkap}
                    onChange={e => setNamaLengkap(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    No. WhatsApp (opsional)
                  </label>
                  <input
                    style={inputStyle}
                    type="tel"
                    placeholder="628xxxxxxxxxx"
                    value={waNumber}
                    onChange={e => setWaNumber(e.target.value)}
                  />
                </div>
              </>
            )}

            {msg && (
              <div style={{
                padding: '12px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: msg.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                color: msg.type === 'success' ? '#10b981' : '#ef4444',
                border: `1px solid ${msg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                textAlign: 'center',
              }}>
                {msg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: 14, background: loading ? 'var(--text-muted)' : 'var(--accent-gradient)',
                color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
                fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Memproses...' : (isRegister ? 'Daftar' : 'Login')}
            </button>
          </form>
        </div>

        {/* Footer links */}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
          <button 
            onClick={() => { setIsRegister(!isRegister); setMsg(null); }}
            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: 600, cursor: 'pointer' }}
          >
            {isRegister ? 'Sudah punya akun? Login' : 'Belum punya akun? Daftar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={(
      <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Memuat...</div>
      </div>
    )}>
      <LoginForm />
    </Suspense>
  )
}