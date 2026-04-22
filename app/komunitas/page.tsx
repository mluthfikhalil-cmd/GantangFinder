'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }

interface User {
  id: string
  nama_lengkap: string
  role: 'organizer' | 'peserta'
}

interface Post {
  id: string
  user_id: string
  content: string
  post_type: string
  image_url: string | null
  likes_count: number
  created_at: string
  users?: { full_name: string } 
}

export default function KomunitasPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form state
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState('harian')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('gf_user')
    let u: User | null = null
    if (stored) {
      u = JSON.parse(stored) as User
      setUser(u)
    }
    loadPosts()
  }, [])

  async function loadPosts() {
    setLoading(true)
    try {
      const res = await fetch(`${SB_URL}/rest/v1/posts?select=*,users(full_name)&order=created_at.desc`, { headers: H })
      const d = await res.json()
      setPosts(Array.isArray(d) ? d : [])
    } catch { /* ignore */ }
    setLoading(false)
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!user) {
      router.push('/login')
      return
    }
    if (!content.trim()) return
    setSubmitting(true)
    try {
      const body = {
        user_id: user.id,
        content,
        post_type: postType
      }
      const res = await fetch(`${SB_URL}/rest/v1/posts`, {
        method: 'POST',
        headers: { ...H, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (res.ok && Array.isArray(data)) {
        // Tambahkan post baru ke atas feed
        const newPost = { ...data[0], users: { full_name: user.nama_lengkap } }
        setPosts([newPost, ...posts])
        setContent('')
      } else {
        alert("Gagal membagikan postingan: " + (data.message || 'Error'))
      }
    } catch (e) {
      alert("Terjadi kesalahan jaringan.")
    }
    setSubmitting(false)
  }

  async function handleLike(post: Post) {
    if (!user) {
      alert("Harap login untuk menyukai postingan")
      return
    }
    // Optimistic update
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes_count: p.likes_count + 1 } : p))
    try {
      // 1. Insert ke post_likes
      const likeRes = await fetch(`${SB_URL}/rest/v1/post_likes`, {
        method: 'POST',
        headers: { ...H, 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: post.id, user_id: user.id })
      })
      if (!likeRes.ok) {
        // Jika gagal/sudah dilike, batalin optimistic update
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes_count: p.likes_count - 1 } : p))
        return
      }
      // 2. Update likes_count di posts tabel (Manual Update karena tanpa trigger DB)
      await fetch(`${SB_URL}/rest/v1/posts?id=eq.${post.id}`, {
        method: 'PATCH',
        headers: { ...H, 'Content-Type': 'application/json' },
        body: JSON.stringify({ likes_count: post.likes_count + 1 })
      })
    } catch { /* ignore */ }
  }

  const getTypeColor = (t: string) => {
    switch (t) {
      case 'lomba': return '#1d4ed8' // blue
      case 'jual': return '#16a34a' // green
      case 'curhat': return '#d97706' // amber
      default: return '#64748b' // gray
    }
  }

  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-secondary)',paddingBottom:100}}>
      {/* Header */}
      <header style={{background: 'var(--header-bg)', padding:'24px 20px 16px', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 40}}>
        <div style={{maxWidth:640,margin:'0 auto'}}>
          <h1 style={{color:'var(--text-primary)',fontSize:24,fontWeight:800,margin:0, letterSpacing: '-0.5px'}}>💬 Komunitas</h1>
          <p style={{color:'var(--text-secondary)',fontSize:13,margin:0}}>Diskusi seputar burung kicau dan merpati</p>
        </div>
      </header>

      <main style={{maxWidth:640,margin:'0 auto',padding:16}}>
        {/* Post Form */}
        <div style={{background:'var(--bg-card)',borderRadius:16,padding:16,border:'1px solid var(--border-color)',marginBottom:24,boxShadow:'var(--shadow-sm)'}}>
          <form onSubmit={handlePost}>
            <div style={{display:'flex',gap:10,marginBottom:12}}>
              <div style={{width:40,height:40,borderRadius:'50%',background:'#e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>👤</div>
              <textarea 
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={user ? "Apa yang ingin Anda bagikan?" : "Silakan login untuk membagikan postingan"}
                disabled={!user}
                style={{width:'100%',border:'none',background:'transparent',fontSize:15,fontFamily:'inherit',color:'var(--text-primary)',resize:'none',minHeight:80,outline:'none'}}
              />
            </div>
            {user && (
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'1px solid var(--border-color)',paddingTop:12}}>
                <select 
                  value={postType}
                  onChange={e => setPostType(e.target.value)}
                  style={{padding:'6px 12px',borderRadius:20,fontSize:13,fontWeight:600,border:'1px solid var(--border-color)',background:'var(--bg-secondary)',color:'var(--text-primary)',outline:'none'}}
                >
                  <option value="harian">Harian</option>
                  <option value="lomba">Info Lomba</option>
                  <option value="jual">Jual/Beli</option>
                  <option value="curhat">Curhat</option>
                </select>
                <button type="submit" disabled={submitting || !content.trim()} style={{background:'linear-gradient(135deg,#16a34a,#15803d)',color:'#fff',border:'none',borderRadius:20,padding:'8px 20px',fontSize:14,fontWeight:700,cursor:(submitting || !content.trim())?'not-allowed':'pointer',opacity:(submitting || !content.trim())?0.5:1}}>
                  {submitting ? 'Mengirim...' : 'Kirim'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Feed List */}
        {loading ? (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{height:150,borderRadius:16}} />)}
          </div>
        ) : posts.length === 0 ? (
          <div style={{textAlign:'center',padding:'40px 20px'}}>
            <p style={{fontSize:40,margin:0}}>🍃</p>
            <p style={{color:'var(--text-secondary)'}}>Belum ada postingan. Jadilah yang pertama!</p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {posts.map(post => (
              <div key={post.id} style={{background:'var(--bg-card)',borderRadius:16,padding:16,border:'1px solid var(--border-color)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                  <div style={{display:'flex',gap:10,alignItems:'center'}}>
                    <div style={{width:36,height:36,borderRadius:'50%',background:'#e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>👤</div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:'var(--text-primary)'}}>{post.users?.full_name || 'User Anonim'}</div>
                      <div style={{fontSize:12,color:'var(--text-secondary)'}}>{fmtDate(post.created_at)}</div>
                    </div>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:20,background:`${getTypeColor(post.post_type)}22`,color:getTypeColor(post.post_type)}}>
                    {post.post_type.toUpperCase()}
                  </span>
                </div>
                <p style={{fontSize:15,color:'var(--text-primary)',lineHeight:1.5,marginBottom:12,whiteSpace:'pre-wrap'}}>{post.content}</p>
                <div style={{display:'flex',gap:16,borderTop:'1px solid var(--border-color)',paddingTop:12}}>
                  <button onClick={() => handleLike(post)} style={{background:'none',border:'none',color:'var(--text-secondary)',fontSize:14,fontWeight:600,display:'flex',alignItems:'center',gap:6,cursor:'pointer',padding:0}}>
                    <span>👍</span> {post.likes_count}
                  </button>
                  <button style={{background:'none',border:'none',color:'var(--text-secondary)',fontSize:14,fontWeight:600,display:'flex',alignItems:'center',gap:6,cursor:'pointer',padding:0}}>
                    <span>💬</span> Komen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav style={{position:'fixed',bottom:0,left:0,right:0,background:'var(--bg-primary)',borderTop:'1px solid var(--border-color)',display:'flex',alignItems:'center',justifyContent:'space-around',padding:'8px 0 max(8px, env(safe-area-inset-bottom))',zIndex:40,boxShadow:'0 -4px 12px rgba(0,0,0,0.06)'}}>
        <a href="/" style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'6px 8px',textDecoration:'none',color:'var(--text-secondary)',fontSize:11,fontWeight:600}}>
          <span style={{fontSize:22}}>🏠</span>Home
        </a>
        <a href="/komunitas" style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'6px 8px',textDecoration:'none',color:'var(--accent-green)',fontSize:11,fontWeight:700}}>
          <span style={{fontSize:22}}>💬</span>Komunitas
        </a>
        <a href="/birds" style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'6px 8px',textDecoration:'none',color:'var(--text-secondary)',fontSize:11,fontWeight:600}}>
          <span style={{fontSize:22}}>🐦</span>Profil
        </a>
        <Link href={user ? '/dashboard' : '/login'} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'6px 8px',border:'none',background:'transparent',cursor:'pointer',color:'var(--text-secondary)',fontSize:11,fontWeight:600,fontFamily:'inherit'}}>
          <span style={{fontSize:22}}>👤</span>Akun
        </Link>
      </nav>
    </div>
  )
}
