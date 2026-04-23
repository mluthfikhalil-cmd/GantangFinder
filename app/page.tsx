'use client'
import { useState, useEffect } from 'react'
import './globals.css'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }

interface Ev {
  id: string; nama_event: string; penyelenggara: string; lokasi?: string; kota: string
  tanggal?: string|null; jenis_burung?: string[]; is_featured?: boolean
  level_event?: string|null; aturan_sangkar?: string|null; jenis_lomba?: string
  kategori_merpati?: string|null; jarak_meter?: number|null; kategori_kelas?: string|null
  kontak?: string|null; biaya_daftar?: number|null
  featured_until?: string|null; featured_package?: string|null
  foto_hasil?: string|null
}

const LC: Record<string,{bg:string;color:string;border:string}> = {
  Latber:{bg:'#f0fdf4',color:'#15803d',border:'#86efac'},
  Latpres:{bg:'#eff6ff',color:'#1d4ed8',border:'#93c5fd'},
  Regional:{bg:'#fef3c7',color:'#b45309',border:'#fcd34d'},
  Nasional:{bg:'#fdf4ff',color:'#a21caf',border:'#e879f9'},
}
const MC: Record<string,{bg:string;color:string}> = {
  sprint:{bg:'#eff6ff',color:'#1d4ed8'}, kolong:{bg:'#f0fdf4',color:'#15803d'},
  pos:{bg:'#fef3c7',color:'#b45309'}, 'tinggi bebas':{bg:'#fdf4ff',color:'#7c3aed'},
}

function days(t?:string|null){if(!t)return null;return Math.ceil((new Date(t+'T00:00:00').getTime()-new Date().setHours(0,0,0,0))/86400000)}
function fmt(t?:string|null){if(!t)return null;return new Date(t+'T00:00:00').toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
function fmtJarak(m?:number|null){if(!m)return null;return m>=5000?`${(m/1000).toFixed(0)} km`:`${m} m`}
function fmtWA(k?:string|null){if(!k)return '';const n=k.replace(/\D/g,'');return n.startsWith('0')?'62'+n.slice(1):n}
function waLink(kontak:string|null|undefined,nama:string){const n=fmtWA(kontak);const msg=encodeURIComponent(`Halo, saya mau daftar lomba ${nama} yang saya lihat di GantangFinder. Apakah pendaftaran masih dibuka?`);return n?`https://wa.me/${n}?text=${msg}`:`https://wa.me/?text=${encodeURIComponent(`Saya tertarik dengan lomba ${nama}`)}`}

export default function Home() {
  const [evs, setEvs] = useState<Ev[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [tab, setTab] = useState<'kicau'|'merpati'|'rooster'>('kicau')
  const [search, setSearch] = useState('')
  const [kota, setKota] = useState('')
  const [level, setLevel] = useState('')
  const [katMer, setKatMer] = useState('')
  const [kelas, setKelas] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [modal, setModal] = useState(false)
  const [subModal, setSubModal] = useState(false)
  const [toast, setToast] = useState('')
  const [theme, setTheme] = useState<'light'|'dark'>('dark')
  const [scrolled, setScrolled] = useState(false)
  const [currentUser, setCurrentUser] = useState<{id: string; username: string; nama_lengkap?: string; wa_number?: string} | null>(null)

  // Handle add event button - check login first
  const handleAddClick = () => {
    if (!currentUser) {
      window.location.href = '/login?redirect=/'
      return
    }
    setModal(true)
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    if (newTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark')
    else document.documentElement.removeAttribute('data-theme')
    localStorage.setItem('gantang-theme', newTheme)
  }

  useEffect(() => {
    async function fetchEvents() {
      if (!SB_URL || !SB_KEY) { setErr('Env vars tidak ditemukan'); setLoading(false); return }
      try {
        const r = await fetch(`${SB_URL}/rest/v1/events?select=*&order=is_featured.desc,tanggal.asc`, { headers: H })
        const d = await r.json()
        setEvs(Array.isArray(d) ? d : [])
      } catch(e: unknown) {
        setErr(String(e))
      }
      setLoading(false)
    }

    // Check login status on mount
    const savedUser = localStorage.getItem('gantang_user')
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser))
      } catch (e) {
        localStorage.removeItem('gantang_user')
      }
    }
  }, [])

  const list = evs.filter(e => {
    const jl = e.jenis_lomba ?? 'kicau'
    if (jl !== tab) return false
    if (search && !e.nama_event?.toLowerCase().includes(search.toLowerCase())) return false
    if (kota && !e.kota?.toLowerCase().includes(kota.toLowerCase())) return false
    if (tab==='kicau' && level && e.level_event !== level) return false
    if (tab==='merpati' && katMer && e.kategori_merpati !== katMer) return false
    if (tab==='merpati' && kelas && e.kategori_kelas !== kelas) return false
    if (tab==='rooster') return e.jenis_lomba === 'rooster' || e.jenis_lomba === undefined
    // Date range filter
    if (dateStart || dateEnd) {
      const evtDate = e.tanggal ? new Date(e.tanggal + 'T00:00:00').getTime() : 0
      const startTs = dateStart ? new Date(dateStart + 'T00:00:00').getTime() : 0
      const endTs = dateEnd ? new Date(dateEnd + 'T23:59:59').getTime() : Infinity
      if (evtDate && startTs && evtDate < startTs) return false
      if (evtDate && endTs && evtDate > endTs) return false
    }
    return true
  })
  const now = new Date()
  const isActiveFeatured = (e: Ev) => e.is_featured && (!e.featured_until || new Date(e.featured_until) > now)
  const featured = list.filter(e => isActiveFeatured(e))
  const regular = list.filter(e => !isActiveFeatured(e))

  const btn = (active:boolean, label:string, onClick:()=>void, color='var(--accent-green)') => (
    <button onClick={onClick} style={{padding:'5px 14px',borderRadius:9999,fontSize:12,fontWeight:700,fontFamily:'inherit',cursor:'pointer',flexShrink:0,border:`1.5px solid ${active?color:'var(--border-color)'}`,background:active?color:'var(--bg-card)',color:active?'#fff':'var(--text-secondary)'}}>{label}</button>
  )

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-secondary)',paddingBottom:100, transition:'background-color 0.3s'}}>
      {/* Hero */}
      <header style={{background: 'var(--header-bg)', padding:'28px 20px 20px', transition: 'box-shadow 0.3s', borderBottom: '1px solid var(--border-color)', boxShadow: scrolled ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none', position: 'sticky', top: 0, zIndex: 40}}>
        <div style={{maxWidth:640,margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:44,height:44,borderRadius:12,background:'var(--accent-green)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{tab==='kicau'?'🐦':tab==='merpati'?'🕊️':'🐓'}</div>
              <div>
                <h1 style={{color:'var(--text-primary)',fontSize:24,fontWeight:800,margin:0, letterSpacing: '-0.5px'}}>GantangFinder</h1>
                <p style={{color:'var(--text-secondary)',fontSize:13,margin:0}}>{tab==='kicau'?'Lomba Burung Kicau':tab==='merpati'?'Lomba Merpati / Dara':'Manajemen Ayam Jago'} se-Indonesia</p>
              </div>
            </div>
            <button onClick={toggleTheme} style={{width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18}}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
          <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:16}}>
            {[{v:list.length,l:'Total Event',c:'var(--text-primary)'},{v:list.filter(e=>e.is_featured).length,l:'Featured',c:'var(--accent-amber)'},{v:list.filter(e=>{const d=days(e.tanggal);return d!==null&&d>=0&&d<=30}).length,l:'Bulan Ini',c:'var(--accent-green)'}].map(s=>(
              <div key={s.l} style={{background:'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius:10,padding:'8px 14px', flex: '1 1 auto', minWidth: 90}}>
                <div style={{color:s.c,fontSize:20,fontWeight:800}}>{loading?'—':s.v}</div>
                <div style={{color:'var(--text-secondary)',fontSize:11}}>{s.l}</div>
              </div>
            ))}
          </div>
          {/* Tab Toggle */}
          <div style={{display:'flex',gap:8, background: 'var(--bg-secondary)', padding: 4, borderRadius: 12}}>
            {(['kicau','merpati','rooster'] as const).map(t=>(
              <button key={t} onClick={()=>{setTab(t);setLevel('');setKatMer('');setKelas('')}} style={{padding:'8px 16px',borderRadius:8,fontSize:14,fontWeight:700,fontFamily:'inherit',cursor:'pointer',border:'none',background:tab===t?'var(--tab-active-bg)':'transparent',color:tab===t?'var(--tab-active-text)':'var(--text-secondary)',flex:1}}>
                {t==='kicau'?'🐦 Kicau':t==='merpati'?'🕊️ Merpati':'🐓 Ayam Jago'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div style={{background:'rgba(var(--header-bg), 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom:'1px solid var(--border-color)',padding:'12px 16px'}}>
        <div style={{maxWidth:640,margin:'0 auto',display:'flex',flexDirection:'column',gap:8}}>
          <div style={{display:'flex',gap:8}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Cari nama event..." style={{flex:1,padding:'9px 12px',background:'var(--bg-secondary)', color:'var(--text-primary)', border:'1px solid var(--border-color)',borderRadius:10,fontSize:13,fontFamily:'inherit',outline:'none'}}/>
            <input value={kota} onChange={e=>setKota(e.target.value)} placeholder="📍 Kota..." style={{flex:1,padding:'9px 12px',background:'var(--bg-secondary)', color:'var(--text-primary)', border:'1px solid var(--border-color)',borderRadius:10,fontSize:13,fontFamily:'inherit',outline:'none'}}/>
          </div>
          <div style={{display:'flex',gap:8}}>
            <input type="date" value={dateStart} onChange={e=>setDateStart(e.target.value)} style={{flex:1,padding:'9px 12px',background:'var(--bg-secondary)', color:'var(--text-primary)', border:'1px solid var(--border-color)',borderRadius:10,fontSize:13,fontFamily:'inherit',outline:'none'}}/>
            <span style={{color:'var(--text-secondary)',alignSelf:'center'}}>→</span>
            <input type="date" value={dateEnd} onChange={e=>setDateEnd(e.target.value)} style={{flex:1,padding:'9px 12px',background:'var(--bg-secondary)', color:'var(--text-primary)', border:'1px solid var(--border-color)',borderRadius:10,fontSize:13,fontFamily:'inherit',outline:'none'}}/>
          </div>
          <div className="tab-content" style={{display:'flex',gap:6,overflowX:'auto', paddingBottom: 4}}>
            {tab==='kicau' ? ['','Latber','Latpres','Regional','Nasional'].map(l=>btn(level===l,l||'Semua',()=>setLevel(l))) : tab==='merpati' ? (
              <>
                {['','sprint','kolong','pos','tinggi bebas'].map(k=>btn(katMer===k,k?k.charAt(0).toUpperCase()+k.slice(1):'Semua',()=>setKatMer(k),'var(--banner-text)'))}
                <div style={{width: 1, background: 'var(--border-color)'}}></div>
                {['','Junior','Utama','Galatama'].map(k=>btn(kelas===k,k||'Semua Kelas',()=>setKelas(k),'#7c3aed'))}
              </>
            ) : (
              <>
                <button onClick={()=>window.location.href='/birds?tab=rooster'} style={{padding:'8px 16px',borderRadius:8,fontSize:13,fontWeight:600,background:'var(--accent-green)',color:'#fff',border:'none',cursor:'pointer',flex:1}}>🐓 Buka Manager</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Navigation Bar */}
      <div style={{background:'var(--bg-secondary)',borderBottom:'1px solid var(--border-color)',padding:'10px 0'}}>
        <div style={{maxWidth:640,margin:'0 auto',padding:'0 16px',display:'flex',gap:8,overflowX:'auto'}}>
          <a href="/" style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:'var(--accent-green)',color:'#fff',borderRadius:10,fontSize:12,fontWeight:700,textDecoration:'none',whiteSpace:'nowrap'}}>🏠 Home</a>
          <a href="/feed" style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:'var(--bg-primary)',color:'var(--text-secondary)',border:'1px solid var(--border-color)',borderRadius:10,fontSize:12,fontWeight:600,textDecoration:'none',whiteSpace:'nowrap'}}>💬 Komunitas</a>
          <a href="/leaderboard" style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:'var(--bg-primary)',color:'var(--text-secondary)',border:'1px solid var(--border-color)',borderRadius:10,fontSize:12,fontWeight:600,textDecoration:'none',whiteSpace:'nowrap'}}>🏆 Leaderboard</a>
          <a href="/birds" style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:'var(--bg-primary)',color:'var(--text-secondary)',border:'1px solid var(--border-color)',borderRadius:10,fontSize:12,fontWeight:600,textDecoration:'none',whiteSpace:'nowrap'}}>🐦 Profil Burung</a>
          <a href="/masteran" style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:'var(--bg-primary)',color:'var(--text-secondary)',border:'1px solid var(--border-color)',borderRadius:10,fontSize:12,fontWeight:600,textDecoration:'none',whiteSpace:'nowrap'}}>🎵 Masteran</a>
          <button onClick={handleAddClick} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:'var(--accent-violet)',color:'#fff',border:'none',borderRadius:10,fontSize:12,fontWeight:700,textDecoration:'none',whiteSpace:'nowrap',cursor:'pointer'}}>➕ Buat Event</button>
        </div>
      </div>

      {/* Content */}
      <main style={{maxWidth:640,margin:'0 auto',padding:16}}>
        {err && <div style={{padding:12,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,color:'#b91c1c',fontSize:13,marginBottom:16}}>⚠️ {err}</div>}
        {/* Subscriber Banner */}
        <div style={{background:'var(--banner-bg)',borderRadius:16,padding:'16px 18px',border:'1.5px solid var(--border-color)',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
          <div style={{flex:1}}>
            <p style={{fontSize:14,fontWeight:700,color:'var(--banner-text)',margin:0}}>🔔 Jangan lewatkan lomba di kotamu!</p>
            <p style={{fontSize:12,color:'var(--text-secondary)',marginTop:2,marginBottom:0}}>Daftar gratis, dapat notif WhatsApp tiap ada event baru.</p>
          </div>
          <button onClick={()=>setSubModal(true)} style={{background:'var(--banner-text)',color:'#fff',border:'none',borderRadius:10,padding:'9px 16px',fontSize:13,fontWeight:700,fontFamily:'inherit',cursor:'pointer',flexShrink:0}}>Daftar</button>
        </div>
        {loading ? (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {[1,2,3].map(i => (
              <div key={i} className="skeleton" style={{borderRadius: 16, padding: 20, height: 160}}></div>
            ))}
          </div>
        ) : list.length===0 ? (
          <div style={{textAlign:'center',padding:'60px 20px'}} className="animate-fade-in-up">
            <div style={{fontSize:48}}>🔍</div>
            <h2 style={{color:'var(--text-primary)',marginTop:12}}>Belum ada event</h2>
            <p style={{color:'var(--text-secondary)'}}>Jadilah yang pertama menambahkan event!</p>
          </div>
        ) : (
          <>
            {featured.length>0 && <section style={{marginBottom:24}}>
              <h2 style={{fontSize:15,fontWeight:700,color:'var(--accent-amber)',marginBottom:10}}>⭐ Featured Event</h2>
              {featured.map(e=><Card key={e.id} ev={e} tab={tab}/>)}
            </section>}
            {regular.length>0 && <section>
              <h2 style={{fontSize:15,fontWeight:700,color:'var(--text-primary)',marginBottom:10}}>📅 Semua Event ({regular.length})</h2>
              {regular.map(e=><Card key={e.id} ev={e} tab={tab}/>)}
            </section>}
          </>
        )}
      </main>

      {modal && <AddModal tab={tab} onClose={()=>setModal(false)} onSaved={ev=>{setEvs(p=>[ev,...p]);setModal(false)}}/>}
      {subModal && <SubscribeModal onClose={()=>setSubModal(false)} onSaved={()=>{setSubModal(false);setToast('✅ Berhasil! Kamu akan dapat info lomba terbaru.');setTimeout(()=>setToast(''),4000)}}/>}
      {toast && <div style={{position:'fixed',bottom:20,left:'50%',transform:'translateX(-50%)',background:'#0f172a',color:'#fff',padding:'12px 20px',borderRadius:12,fontSize:14,fontWeight:600,zIndex:60,whiteSpace:'nowrap',boxShadow:'0 4px 20px rgba(0,0,0,.3)'}}>{toast}</div>}

      

      {/* Footer & Admin Link */}
      <footer style={{textAlign:'center',padding:'40px 20px',background:'#f0fdf4',borderTop:'1px solid #dcfce7'}}>
        <p style={{fontSize:13,color:'#64748b',margin:0}}>© 2026 GantangFinder — Komunitas Burung Indonesia</p>
        <div style={{marginTop:12,display:'flex',justifyContent:'center',gap:16}}>
          <a href="/admin" style={{fontSize:11,color:'#94a3b8',textDecoration:'none',opacity:.5}}>⚙️ Admin Area</a>
        </div>
      </footer>
    </div>
  )
}

function Card({ev,tab}:{ev:Ev,tab:string}) {
  const d = days(ev.tanggal)
  const lc = ev.level_event && LC[ev.level_event]
  const mc = ev.kategori_merpati && MC[ev.kategori_merpati]
  const cardBody = (
    <div className="event-card" style={{background:ev.is_featured?'var(--featured-bg)':'var(--bg-card)',borderRadius:16,padding:20,border:ev.is_featured?'1.5px solid var(--featured-border)':'1px solid var(--border-color)'}}>
      <div style={{display:'flex',gap:6,marginBottom:8,flexWrap:'wrap'}}>
        {ev.is_featured && <span className="featured-badge" style={{background:'linear-gradient(135deg,#f59e0b,#fbbf24)',color:'#fff',fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:9999}}>⭐ FEATURED</span>}
        {ev.foto_hasil && <span style={{background:'var(--banner-bg)',color:'var(--banner-text)',border:'1px solid var(--border-color)',fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:9999}}>📸 HASIL TERSEDIA</span>}
        {lc && <span style={{background:lc.bg,color:lc.color,border:`1px solid ${lc.border}`,fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:9999}}>{ev.level_event}</span>}
        {mc && <span style={{background:mc.bg,color:mc.color,fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:9999,border:`1px solid ${mc.color}22`}}>{(ev.kategori_merpati??'').charAt(0).toUpperCase()+(ev.kategori_merpati??'').slice(1)}</span>}
        {d!==null && d>=0 && d<=7 && <span style={{background:'#fef2f2',color:'#dc2626',fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:9999}}>🔥 {d===0?'HARI INI':`${d} HARI LAGI`}</span>}
        {d!==null && d<0 && <span style={{background:'var(--bg-secondary)',color:'var(--text-secondary)',fontSize:11,padding:'3px 10px',borderRadius:9999}}>Selesai</span>}
      </div>
      <h3 style={{fontSize:16,fontWeight:700,color:'var(--text-primary)',marginBottom:4}}>{ev.nama_event}</h3>
      <p style={{fontSize:13,color:'var(--text-secondary)',marginBottom:4}}>oleh <strong style={{color:'var(--text-primary)'}}>{ev.penyelenggara}</strong></p>
      <p style={{fontSize:13,color:'var(--text-secondary)',marginBottom:ev.tanggal?4:8}}>📍 {ev.lokasi?`${ev.lokasi}, `:''}{ ev.kota}</p>
      {ev.tanggal && <p style={{fontSize:13,color:'var(--text-secondary)',marginBottom:8}}>📅 {fmt(ev.tanggal)}</p>}
      {tab==='merpati' && (ev.jarak_meter||ev.kategori_kelas) && (
        <p style={{fontSize:13,color:'var(--banner-text)',fontWeight:600,marginBottom:8}}>
          🏁 {[ev.kategori_merpati?ev.kategori_merpati.charAt(0).toUpperCase()+ev.kategori_merpati.slice(1):null, fmtJarak(ev.jarak_meter), ev.kategori_kelas?`Kelas ${ev.kategori_kelas}`:null].filter(Boolean).join(' · ')}
        </p>
      )}
      {tab==='kicau' && ev.aturan_sangkar && <p style={{fontSize:12,color:'var(--text-secondary)',marginBottom:8}}>🏮 Sangkar: <strong style={{color:'var(--text-primary)'}}>{ev.aturan_sangkar}</strong></p>}
      {ev.jenis_burung && ev.jenis_burung.length>0 && (
        <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:10}}>
          {ev.jenis_burung.map(b=><span key={b} style={{background:'rgba(22, 163, 74, 0.1)',color:'var(--accent-green)',fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:9999,border:'1px solid rgba(22, 163, 74, 0.2)'}}>{b}</span>)}
        </div>
      )}
    </div>
  )
  return (
    <div style={{marginBottom:12}}>
      <a href={`/events/${ev.id}`} style={{display:'block',textDecoration:'none',marginBottom:8}}>{cardBody}</a>
      <a href={waLink(ev.kontak,ev.nama_event)} target="_blank" rel="noopener noreferrer"
        style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,width:'100%',padding:'10px 0',background:'#25D366',color:'#fff',borderRadius:10,fontSize:13,fontWeight:600,textDecoration:'none',boxSizing:'border-box'}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
        {ev.kontak ? 'Daftar via WhatsApp' : 'Hubungi Panitia'}
      </a>
    </div>
  )
}

const BIRDS=['Murai Batu','Kacer','Cucak Rowo','Cendet','Kenari','Lovebird','Cucak Hijau','Anis Merah','Pleci','Kolibri','Trucukan','Prenjak','Tledekan','Jalak Suren','Jalak Bali']
const BIRDS_MER=['Merpati Balap','Merpati Kolong','Merpati Pos','Merpati Tinggian']
const SANGKAR=['Bebas','Standar Panitia','Wajib Merek Tertentu']

function AddModal({tab,onClose,onSaved}:{tab:string,onClose:()=>void,onSaved:(e:Ev)=>void}) {
  const [loading,setLoading]=useState(false)
  const [err,setErr]=useState('')
  const [birds,setBirds]=useState<string[]>([])
  const [featured,setFeatured]=useState(false)

  async function submit(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setErr('')
    const f=e.currentTarget
    const g=(n:string)=>(f.elements.namedItem(n) as HTMLInputElement)?.value?.trim()||''
    const body:Record<string,unknown>={
      nama_event:g('nama'),penyelenggara:currentUser?.nama_lengkap||g('penyelenggara'),lokasi:g('lokasi'),kota:g('kota'),
      tanggal:g('tanggal')||null,jenis_burung:birds,is_featured:featured,jenis_lomba:tab,
      kontak:g('kontak')||null, organizer_id: currentUser?.id||null,
    }
    if(tab==='kicau'){body.level_event=g('level')||null;body.aturan_sangkar=g('sangkar')||null}
    if(tab==='merpati'){body.kategori_merpati=g('kat_mer')||null;body.jarak_meter=g('jarak')?parseInt(g('jarak')):null;body.kategori_kelas=g('kelas')||null}
    if(!body.nama_event||!body.kota){setErr('Nama event dan kota wajib.');setLoading(false);return}
    try {
      const res=await fetch(`${SB_URL}/rest/v1/events`,{method:'POST',headers:{...H,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(body)})
      const data=await res.json()
      if(!res.ok) throw new Error(data?.message||`HTTP ${res.status}`)
      onSaved(Array.isArray(data)?data[0]:data)
    } catch(ex:unknown){setErr(ex instanceof Error?ex.message:'Gagal menyimpan.')}
    setLoading(false)
  }

  const inp=(name:string,label:string,placeholder:string,type='text')=>(
    <div><label style={{display:'block',fontSize:13,fontWeight:600,color:'var(--text-primary)',marginBottom:6}}>{label}</label>
    <input name={name} type={type} placeholder={placeholder} style={{width:'100%',padding:'11px 14px',background:'var(--bg-primary)',border:'1px solid var(--border-color)',color:'var(--text-primary)',borderRadius:10,fontSize:14,fontFamily:'inherit',outline:'none'}}/></div>
  )

  const birdList = tab==='merpati' ? BIRDS_MER : tab==='rooster' ? [] : BIRDS

  return (
    <>
      <div className="modal-overlay animate-fade-in" onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',backdropFilter:'blur(4px)',zIndex:50}}/>
      <div className="modal-content animate-slide-up" style={{position:'fixed',bottom:0,left:0,right:0,background:'var(--bg-primary)',borderRadius:'24px 24px 0 0',zIndex:51,maxHeight:'90vh',overflowY:'auto',boxShadow:'var(--shadow)'}}>
        <div style={{display:'flex',justifyContent:'center',padding:'12px 0 0'}}><div style={{width:40,height:4,background:'var(--border-color)',borderRadius:2}}/></div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 24px 0'}}>
          <h2 style={{fontSize:18,fontWeight:800,color:'var(--text-primary)'}}>{tab==='kicau'?'🐦':tab==='merpati'?'🕊️':'🐓'} Tambah {tab==='kicau'?'Event Kicau':tab==='merpati'?'Event Merpati':'Ayam Jago'}</h2>
          <button onClick={onClose} style={{background:'var(--bg-secondary)',border:'none',borderRadius:'50%',width:36,height:36,cursor:'pointer',fontSize:18,color:'var(--text-secondary)'}}>✕</button>
        </div>
        <form onSubmit={submit} style={{padding:'20px 24px 40px',display:'flex',flexDirection:'column',gap:14}}>
          {inp('nama','Nama Event *','cth: Kejuaraan Merpati Sprint 2026')}
          {inp('penyelenggara','Penyelenggara *','cth: PPMBSI Madiun')}
          {inp('lokasi','Lokasi / Venue','cth: Lapangan Peceland')}
          {inp('kota','Kota *','cth: Madiun')}
          {inp('tanggal','Tanggal','','date')}

          {tab==='kicau' && <>
            <div><label style={{display:'block',fontSize:13,fontWeight:600,color:'var(--text-primary)',marginBottom:6}}>Level Event</label>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {['Latber','Latpres','Regional','Nasional'].map(l=>{const lc=LC[l];return(
                  <label key={l} style={{cursor:'pointer'}}><input type="radio" name="level" value={l} style={{display:'none'}}/>
                  <span style={{padding:'6px 14px',borderRadius:9999,fontSize:13,fontWeight:600,border:`1.5px solid ${lc.border}`,background:lc.bg,color:lc.color,display:'inline-block'}}>{l}</span></label>
                )})}
              </div>
            </div>
            <div><label style={{display:'block',fontSize:13,fontWeight:600,color:'var(--text-primary)',marginBottom:6}}>Aturan Sangkar</label>
              <select name="sangkar" style={{width:'100%',padding:'11px 14px',border:'1px solid var(--border-color)',background:'var(--bg-primary)',color:'var(--text-primary)',borderRadius:10,fontSize:14,fontFamily:'inherit',outline:'none'}}>
                <option value="">-- Pilih --</option>
                {SANGKAR.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </>}

          {tab==='merpati' && <>
            <div><label style={{display:'block',fontSize:13,fontWeight:600,color:'var(--text-primary)',marginBottom:6}}>Kategori Lomba</label>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {['sprint','kolong','pos','tinggi bebas'].map(k=>{const mc=MC[k];return(
                  <label key={k} style={{cursor:'pointer'}}><input type="radio" name="kat_mer" value={k} style={{display:'none'}}/>
                  <span style={{padding:'6px 14px',borderRadius:9999,fontSize:13,fontWeight:600,border:`1.5px solid ${mc.color}44`,background:mc.bg,color:mc.color,display:'inline-block'}}>{k.charAt(0).toUpperCase()+k.slice(1)}</span></label>
                )})}
              </div>
            </div>
            {inp('jarak','Jarak (meter)','cth: 500','number')}
            <div><label style={{display:'block',fontSize:13,fontWeight:600,color:'var(--text-primary)',marginBottom:6}}>Kelas</label>
              <div style={{display:'flex',gap:8}}>
                {['Junior','Utama','Galatama'].map(k=>(
                  <label key={k} style={{cursor:'pointer'}}><input type="radio" name="kelas" value={k} style={{display:'none'}}/>
                  <span style={{padding:'6px 14px',borderRadius:9999,fontSize:13,fontWeight:600,border:'1px solid var(--border-color)',background:'var(--bg-secondary)',color:'var(--text-primary)',display:'inline-block'}}>{k}</span></label>
                ))}
              </div>
            </div>
          </>}

          <div><label style={{display:'block',fontSize:13,fontWeight:600,color:'var(--text-primary)',marginBottom:6}}>Kelas Burung</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:8,padding:12,background:'var(--bg-secondary)',borderRadius:10,border:'1px solid var(--border-color)'}}>
              {birdList.map(b=><button key={b} type="button" onClick={()=>setBirds(p=>p.includes(b)?p.filter(x=>x!==b):[...p,b])} style={{padding:'5px 12px',borderRadius:9999,fontSize:12,fontWeight:600,fontFamily:'inherit',cursor:'pointer',border:birds.includes(b)?'1.5px solid var(--accent-green)':'1px solid var(--border-color)',background:birds.includes(b)?'rgba(22, 163, 74, 0.1)':'var(--bg-primary)',color:birds.includes(b)?'var(--accent-green)':'var(--text-secondary)'}}>{b}</button>)}
            </div>
            {birds.length>0 && <p style={{fontSize:12,color:'var(--accent-green)',marginTop:6}}>✓ {birds.length} kelas dipilih</p>}
          </div>

          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',background:'#fef3c7',borderRadius:10,border:'1.5px solid #fde68a'}}>
            <div><p style={{fontSize:14,fontWeight:700,color:'#92400e'}}>⭐ Featured</p><p style={{fontSize:12,color:'#b45309'}}>Tampil di bagian teratas</p></div>
            <button type="button" onClick={()=>setFeatured(f=>!f)} style={{width:48,height:26,borderRadius:13,border:'none',cursor:'pointer',background:featured?'#16a34a':'#d1d5db',position:'relative',flexShrink:0}}>
              <span style={{position:'absolute',top:3,left:featured?24:3,width:20,height:20,background:'#fff',borderRadius:'50%',transition:'left .3s',boxShadow:'0 1px 4px rgba(0,0,0,.2)'}}/>
            </button>
          </div>

          {err && <div style={{padding:12,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,color:'#b91c1c',fontSize:13}}>⚠️ {err}</div>}
          <button type="submit" disabled={loading} style={{width:'100%',padding:15,background:loading?'#86efac':'linear-gradient(135deg,#16a34a,#15803d)',color:'#fff',border:'none',borderRadius:12,fontSize:15,fontWeight:700,fontFamily:'inherit',cursor:loading?'not-allowed':'pointer'}}>
            {loading?'⏳ Menyimpan...':'🏆 Tambah Event'}
          </button>
        </form>
      </div>
    </>
  )
}

function SubscribeModal({onClose,onSaved}:{onClose:()=>void,onSaved:()=>void}) {
  const [loading,setLoading]=useState(false)
  const [err,setErr]=useState('')
  const [minat,setMinat]=useState<string[]>(['kicau'])

  async function submit(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault();setLoading(true);setErr('')
    const f=e.currentTarget
    const g=(n:string)=>(f.elements.namedItem(n) as HTMLInputElement)?.value?.trim()||''
    const raw=g('wa').replace(/\D/g,'')
    const wa=raw.startsWith('0')?'62'+raw.slice(1):raw
    if(!wa||wa.length<10){setErr('Nomor WhatsApp tidak valid (min 10 digit).');setLoading(false);return}
    if(minat.length===0){setErr('Pilih minimal satu minat.');setLoading(false);return}
    try {
      const res=await fetch(`${SB_URL}/rest/v1/subscribers`,{method:'POST',headers:{...H,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({nama:g('nama')||null,nomor_wa:wa,kota:g('kota')||null,minat})})
      if(res.status===409)throw new Error('Nomor ini sudah terdaftar sebelumnya.')
      if(!res.ok){const d=await res.json().catch(()=>({}));throw new Error(d?.message||`HTTP ${res.status}`)}
      onSaved()
    } catch(ex:unknown){setErr(ex instanceof Error?ex.message:'Gagal mendaftar. Coba lagi.')}
    setLoading(false)
  }

  return (
    <>
      <div className="modal-overlay animate-fade-in" onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',backdropFilter:'blur(4px)',zIndex:50}}/>
      <div className="modal-content animate-slide-up" style={{position:'fixed',bottom:0,left:0,right:0,background:'var(--bg-primary)',borderRadius:'24px 24px 0 0',zIndex:51,maxHeight:'85vh',overflowY:'auto',boxShadow:'var(--shadow)'}}>
        <div style={{display:'flex',justifyContent:'center',padding:'12px 0 0'}}><div style={{width:40,height:4,background:'var(--border-color)',borderRadius:2}}/></div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 24px 0'}}>
          <h2 style={{fontSize:18,fontWeight:800,color:'var(--text-primary)'}}>🔔 Info Lomba via WhatsApp</h2>
          <button onClick={onClose} style={{background:'var(--bg-secondary)',border:'none',borderRadius:'50%',width:36,height:36,cursor:'pointer',fontSize:18,color:'var(--text-secondary)'}}>✕</button>
        </div>
        <p style={{fontSize:13,color:'var(--text-secondary)',padding:'8px 24px 0'}}>Daftarkan nomor WA-mu dan kami akan info kalau ada lomba baru di kotamu. Gratis!</p>
        <form onSubmit={submit} style={{padding:'16px 24px 40px',display:'flex',flexDirection:'column',gap:14}}>
          {[['nama','Nama (opsional)','cth: Ahmad'],['wa','Nomor WhatsApp *','cth: 08123456789']].map(([n,l,p])=>(
            <div key={n}><label style={{display:'block',fontSize:13,fontWeight:600,color:'var(--text-primary)',marginBottom:6}}>{l}</label>
            <input name={n} placeholder={p} style={{width:'100%',padding:'11px 14px',background:'var(--bg-primary)',border:'1px solid var(--border-color)',color:'var(--text-primary)',borderRadius:10,fontSize:14,fontFamily:'inherit',outline:'none'}}/></div>
          ))}
          <div>
            <label style={{display:'block',fontSize:13,fontWeight:600,color:'var(--text-primary)',marginBottom:6}}>Kota (opsional)</label>
            <input name="kota" placeholder="cth: Surabaya" style={{width:'100%',padding:'11px 14px',background:'var(--bg-primary)',border:'1px solid var(--border-color)',color:'var(--text-primary)',borderRadius:10,fontSize:14,fontFamily:'inherit',outline:'none'}}/>
          </div>
          <div>
            <label style={{display:'block',fontSize:13,fontWeight:600,color:'var(--text-primary)',marginBottom:8}}>Minat Lomba *</label>
            <div style={{display:'flex',gap:10}}>
              {[['kicau','🐦 Lomba Kicau'],['merpati','🕊️ Merpati/Dara']].map(([v,l])=>(
                <button key={v} type="button" onClick={()=>setMinat(p=>p.includes(v)?p.filter(x=>x!==v):[...p,v])}
                  style={{flex:1,padding:'12px 8px',borderRadius:10,fontSize:13,fontWeight:600,fontFamily:'inherit',cursor:'pointer',border:minat.includes(v)?'1px solid var(--accent-green)':'1px solid var(--border-color)',background:minat.includes(v)?'rgba(22, 163, 74, 0.1)':'var(--bg-secondary)',color:minat.includes(v)?'var(--accent-green)':'var(--text-secondary)'}}>
                  {l}{minat.includes(v)?' ✓':''}
                </button>
              ))}
            </div>
          </div>
          {err && <div style={{padding:12,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,color:'#b91c1c',fontSize:13}}>⚠️ {err}</div>}
          <button type="submit" disabled={loading} style={{width:'100%',padding:15,background:loading?'#86efac':'linear-gradient(135deg,#1d4ed8,#2563eb)',color:'#fff',border:'none',borderRadius:12,fontSize:15,fontWeight:700,fontFamily:'inherit',cursor:loading?'not-allowed':'pointer'}}>
            {loading?'⏳ Mendaftarkan...':'📲 Daftarkan Saya'}
          </button>
        </form>
      </div>
    </>
  )
}