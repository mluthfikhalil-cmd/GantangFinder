'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }

interface User {
  id: string
  email: string
  nama_lengkap: string
  nomor_wa: string
  role: string
  status: string
  kota?: string
  created_at: string
}

interface UserProfile {
  id: string
  user_id: string
  display_name?: string
  bio?: string
  avatar_url?: string
  instagram?: string
  facebook?: string
  youtube?: string
  bird_interests?: string[]
  kota_preferensi?: string
  total_events_registered?: number
  total_events_won?: number
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [tab, setTab] = useState<'profile' | 'account'>('profile')
  
  // Form fields
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')
  const [youtube, setYoutube] = useState('')
  const [kotaPref, setKotaPref] = useState('')
  const [birdInterests, setBirdInterests] = useState<string[]>(['kicau'])

  useEffect(() => {
    // Load user from localStorage
    const stored = localStorage.getItem('gf_user')
    if (!stored) {
      router.push('/login')
      return
    }
    try {
      const u = JSON.parse(stored) as User
      setUser(u)
      setDisplayName(u.nama_lengkap)
      loadProfile(u.id)
    } catch {
      router.push('/login')
    }
  }, [router])

  async function loadProfile(userId: string) {
    try {
      // Load extended profile
      const res = await fetch(`${SB_URL}/rest/v1/user_profiles?user_id=eq.${userId}`, { headers: H })
      const data = await res.json()
      if (Array.isArray(data) && data[0]) {
        setProfile(data[0])
        setDisplayName(data[0].display_name || user?.nama_lengkap || '')
        setBio(data[0].bio || '')
        setInstagram(data[0].instagram || '')
        setFacebook(data[0].facebook || '')
        setYoutube(data[0].youtube || '')
        setKotaPref(data[0].kota_preferensi || '')
        setBirdInterests(data[0].bird_interests || ['kicau'])
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  async function saveProfile() {
    if (!user) return
    setSaving(true)
    try {
      const payload = {
        user_id: user.id,
        display_name: displayName,
        bio: bio || null,
        instagram: instagram || null,
        facebook: facebook || null,
        youtube: youtube || null,
        bird_interests: birdInterests,
        kota_preferensi: kotaPref || null,
        updated_at: new Date().toISOString()
      }
      
      let res
      if (profile?.id) {
        // Update
        res = await fetch(`${SB_URL}/rest/v1/user_profiles?id=eq.${profile.id}`, {
          method: 'PATCH',
          headers: { ...H, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify(payload)
        })
      } else {
        // Insert
        res = await fetch(`${SB_URL}/rest/v1/user_profiles`, {
          method: 'POST',
          headers: { ...H, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify(payload)
        })
        if (res.ok) {
          // Reload to get ID
          loadProfile(user.id)
        }
      }
      
      if (res.ok) {
        setToast('Profil berhasil disimpan!')
        setEditing(false)
      } else {
        setToast('Gagal menyimpan profil')
      }
    } catch (e) {
      setToast('Terjadi kesalahan')
    }
    setSaving(false)
    setTimeout(() => setToast(''), 3000)
  }

  function toggleBirdInterest(bird: string) {
    setBirdInterests(prev => 
      prev.includes(bird) 
        ? prev.filter(b => b !== bird)
        : [...prev, bird]
    )
  }

  function logout() {
    localStorage.removeItem('gf_user')
    router.push('/login')
  }

  if (loading) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-primary)',color:'var(--text-primary)'}}>
        <div style={{textAlign:'center'}}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-primary)',color:'var(--text-primary)'}}>
      {/* Header */}
      <header style={{background:'var(--header-bg)',borderBottom:'1px solid var(--border-color)',padding:'16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <Link href="/" style={{textDecoration:'none',color:'var(--text-primary)',fontWeight:800,fontSize:18}}>Profil</Link>
        <button onClick={() => router.push('/')} style={{background:'var(--bg-secondary)',border:'none',borderRadius:8,padding:'8px 14px',color:'var(--text-secondary)',fontSize:13,cursor:'pointer'}}>Beranda</button>
      </header>

      <main style={{maxWidth:500,margin:'0 auto',padding:16}}>
        {toast && <div style={{position:'fixed',top:16,left:16,right:16,background:'var(--accent-green)',color:'#fff',padding:12,borderRadius:10,fontSize:14,fontWeight:600,zIndex:50,textAlign:'center'}}>{toast}</div>}
        
        {/* Profile Card */}
        <div style={{background:'var(--bg-card)',borderRadius:20,padding:24,border:'1px solid var(--border-color)',marginBottom:16}}>
          <div style={{textAlign:'center',marginBottom:20}}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={user?.nama_lengkap} style={{width:80,height:80,borderRadius:'50%',objectFit:'cover'}} />
            ) : (
              <div style={{width:80,height:80,borderRadius:'50%',background:'var(--accent-gradient)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,color:'#fff',margin:'0 auto'}}>
                {user?.nama_lengkap?.charAt(0) || 'U'}
              </div>
            )}
            <h2 style={{fontSize:18,fontWeight:800,marginTop:12,marginBottom:4}}>{editing ? displayName : user?.nama_lengkap}</h2>
            <p style={{fontSize:13,color:'var(--text-secondary)',margin:0}}>@{user?.email?.split('@')[0]}</p>
            <div style={{marginTop:8,display:'flex',gap:8,justifyContent:'center'}}>
              <span style={{padding:'4px 12px',background:user?.role === 'organizer' ? 'var(--accent-primary)' : 'var(--bg-secondary)',borderRadius:20,fontSize:12,fontWeight:600}}>
                {user?.role === 'organizer' ? 'Organizer' : 'Peserta'}
              </span>
              <span style={{padding:'4px 12px',background:user?.status === 'active' ? 'var(--accent-green)' : '#f59e0b',borderRadius:20,fontSize:12,fontWeight:600,color: user?.status === 'active' ? '#fff' : '#000'}}>
                {user?.status === 'active' ? 'Aktif' : user?.status}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:8,marginBottom:16}}>
          <button onClick={() => setTab('profile')} style={{flex:1,padding:12,borderRadius:12,fontWeight:600,background:tab==='profile' ? 'var(--accent-primary)' : 'var(--bg-card)',color:tab==='profile'?'#fff':'var(--text-secondary)',border:'1px solid var(--border-color)'}}>Profil</button>
          <button onClick={() => setTab('account')} style={{flex:1,padding:12,borderRadius:12,fontWeight:600,background:tab==='account' ? 'var(--accent-primary)' : 'var(--bg-card)',color:tab==='account'?'#fff':'var(--text-secondary)',border:'1px solid var(--border-color)'}}>Akun</button>
        </div>

        {tab === 'profile' && (
          <div style={{background:'var(--bg-card)',borderRadius:20,padding:20,border:'1px solid var(--border-color)'}}>
            {editing ? (
              <>
                <div style={{marginBottom:16}}>
                  <label style={{display:'block',fontSize:13,fontWeight:600,marginBottom:6}}>Nama Tampilan</label>
                  <input value={displayName} onChange={e=>setDisplayName(e.target.value)} style={{width:'100%',padding:12,borderRadius:10,border:'1px solid var(--border-color)',background:'var(--bg-primary)',color:'var(--text-primary)',fontSize:14}} />
                </div>
                <div style={{marginBottom:16}}>
                  <label style={{display:'block',fontSize:13,fontWeight:600,marginBottom:6}}>Bio</label>
                  <textarea value={bio} onChange={e=>setBio(e.target.value)} rows={3} style={{width:'100%',padding:12,borderRadius:10,border:'1px solid var(--border-color)',background:'var(--bg-primary)',color:'var(--text-primary)',fontSize:14,resize:'none'}} placeholder="Ceritakan tentangmu..." />
                </div>
                <div style={{marginBottom:16}}>
                  <label style={{display:'block',fontSize:13,fontWeight:600,marginBottom:6}}>Minat Burung</label>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    {['kicau','merpati','rooster'].map(bird => (
                      <button key={bird} onClick={() => toggleBirdInterest(bird)} style={{padding:'8px 14px',borderRadius:20,border:'1px solid',background:birdInterests.includes(bird) ? 'var(--accent-primary)' : 'var(--bg-primary)',color:birdInterests.includes(bird)?'#fff':'var(--text-secondary)',cursor:'pointer',fontSize:13}}>
                        {bird === 'kicau' ? 'Kicau' : bird === 'merpati' ? 'Merpati' : 'Rooster'}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{marginBottom:16}}>
                  <label style={{display:'block',fontSize:13,fontWeight:600,marginBottom:6}}>Kota Preferensi</label>
                  <input value={kotaPref} onChange={e=>setKotaPref(e.target.value)} style={{width:'100%',padding:12,borderRadius:10,border:'1px solid var(--border-color)',background:'var(--bg-primary)',color:'var(--text-primary)',fontSize:14}} placeholder="Kota yang ingin diinfokan..." />
                </div>
                <div style={{marginBottom:16}}>
                  <label style={{display:'block',fontSize:13,fontWeight:600,marginBottom:6}}>Instagram</label>
                  <input value={instagram} onChange={e=>setInstagram(e.target.value)} style={{width:'100%',padding:12,borderRadius:10,border:'1px solid var(--border-color)',background:'var(--bg-primary)',color:'var(--text-primary)',fontSize:14}} placeholder="@username" />
                </div>
                <div style={{marginBottom:16}}>
                  <label style={{display:'block',fontSize:13,fontWeight:600,marginBottom:6}}>Facebook</label>
                  <input value={facebook} onChange={e=>setFacebook(e.target.value)} style={{width:'100%',padding:12,borderRadius:10,border:'1px solid var(--border-color)',background:'var(--bg-primary)',color:'var(--text-primary)',fontSize:14}} placeholder="Url Facebook" />
                </div>
                <div style={{marginBottom:16}}>
                  <label style={{display:'block',fontSize:13,fontWeight:600,marginBottom:6}}>YouTube</label>
                  <input value={youtube} onChange={e=>setYoutube(e.target.value)} style={{width:'100%',padding:12,borderRadius:10,border:'1px solid var(--border-color)',background:'var(--bg-primary)',color:'var(--text-primary)',fontSize:14}} placeholder="Url Channel YouTube" />
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>setEditing(false)} style={{flex:1,padding:12,borderRadius:10,fontWeight:600,background:'var(--bg-secondary)',color:'var(--text-secondary)',border:'none',cursor:'pointer'}}>Batal</button>
                  <button onClick={saveProfile} disabled={saving} style={{flex:1,padding:12,borderRadius:10,fontWeight:600,background:saving?'var(--bg-secondary)':'var(--accent-green)',color:'#fff',border:'none',cursor:saving?'not-allowed':'pointer'}}>
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{marginBottom:16}}>
                  <h3 style={{fontSize:13,fontWeight:600,color:'var(--text-secondary)',marginBottom:4}}>Kota</h3>
                  <p style={{fontSize:14,margin:0}}>{user?.kota || profile?.kota_preferensi || '-'}</p>
                </div>
                <div style={{marginBottom:16}}>
                  <h3 style={{fontSize:13,fontWeight:600,color:'var(--text-secondary)',marginBottom:4}}>WhatsApp</h3>
                  <p style={{fontSize:14,margin:0}}>{user?.nomor_wa}</p>
                </div>
                {profile?.bio && (
                  <div style={{marginBottom:16}}>
                    <h3 style={{fontSize:13,fontWeight:600,color:'var(--text-secondary)',marginBottom:4}}>Bio</h3>
                    <p style={{fontSize:14,margin:0}}>{profile.bio}</p>
                  </div>
                )}
                {profile?.instagram && (
                  <div style={{marginBottom:16}}>
                    <h3 style={{fontSize:13,fontWeight:600,color:'var(--text-secondary)',marginBottom:4}}>Instagram</h3>
                    <p style={{fontSize:14,margin:0}}>{profile.instagram}</p>
                  </div>
                )}
                <div style={{marginBottom:16}}>
                  <h3 style={{fontSize:13,fontWeight:600,color:'var(--text-secondary)',marginBottom:4}}>Minat</h3>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    {(profile?.bird_interests || birdInterests).map(bird => (
                      <span key={bird} style={{padding:'6px 12px',background:'var(--bg-secondary)',borderRadius:20,fontSize:12,fontWeight:600}}>
                        {bird === 'kicau' ? 'Kicau' : bird === 'merpati' ? 'Merpati' : 'Rooster'}
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={()=>setEditing(true)} style={{width:'100%',padding:12,borderRadius:10,fontWeight:600,background:'var(--accent-primary)',color:'#fff',border:'none',cursor:'pointer'}}>Edit Profil</button>
              </>
            )}
          </div>
        )}

        {tab === 'account' && (
          <div style={{background:'var(--bg-card)',borderRadius:20,padding:20,border:'1px solid var(--border-color)'}}>
            <div style={{marginBottom:16}}>
              <h3 style={{fontSize:13,fontWeight:600,color:'var(--text-secondary)',marginBottom:4}}>Email</h3>
              <p style={{fontSize:14,margin:0}}>{user?.email}</p>
            </div>
            <div style={{marginBottom:16}}>
              <h3 style={{fontSize:13,fontWeight:600,color:'var(--text-secondary)',marginBottom:4}}>Mulai Gabung</h3>
              <p style={{fontSize:14,margin:0}}>{user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}) : '-'}</p>
            </div>
            <button onClick={logout} style={{width:'100%',padding:12,borderRadius:10,fontWeight:600,background:'#ef4444',color:'#fff',border:'none',cursor:'pointer',marginTop:16}}>Keluar</button>
          </div>
        )}

        {/* Quick Links */}
        <div style={{marginTop:16}}>
          <Link href="/my-registrations" style={{display:'block',padding:16,background:'var(--bg-card)',borderRadius:14,border:'1px solid var(--border-color)',marginBottom:8,textDecoration:'none',color:'var(--text-primary)'}}>
             Registrasi Saya
          </Link>
          {user?.role === 'organizer' && (
            <Link href="/dashboard" style={{display:'block',padding:16,background:'var(--bg-card)',borderRadius:14,border:'1px solid var(--border-color)',marginBottom:8,textDecoration:'none',color:'var(--text-primary)'}}>
              Dashboard Organizer
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}