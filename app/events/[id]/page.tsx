'use client'
import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { generatePoster } from '@/app/actions/generatePoster'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }

interface Ev {
  id: string; nama_event: string; penyelenggara: string; lokasi?: string; kota: string
  tanggal?: string|null; jenis_burung?: string[]; is_featured?: boolean
  level_event?: string|null; aturan_sangkar?: string|null; jenis_lomba?: string
  kategori_merpati?: string|null; jarak_meter?: number|null; kategori_kelas?: string|null
  kontak?: string|null; biaya_daftar?: number|null; foto_hasil?: string[]|string|null
  daftar_juara?: unknown[]|null
}
interface Juara {
  posisi: number; nama_burung: string; pemilik: string
}
interface KelasJuara {
  kelas: string; juara: Juara[]
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
function waLink(kontak:string|null|undefined,nama:string){
  const n=fmtWA(kontak)
  const msg=encodeURIComponent(`Halo, saya mau daftar lomba ${nama} yang saya lihat di GantangFinder. Apakah pendaftaran masih dibuka?`)
  return n?`https://wa.me/${n}?text=${msg}`:`https://wa.me/?text=${encodeURIComponent(`Saya tertarik dengan lomba ${nama}`)}`
}
function fmtBiaya(b?:number|null){if(b===null||b===undefined)return null;if(b===0)return 'Gratis';return `Rp ${b.toLocaleString('id-ID')}`}

const downloadPoster = (htmlContent: string, eventName: string) => {
  const blob = new Blob([`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Poster - ${eventName}</title>
      <style>
        body { margin: 0; padding: 20px; 
               background: #f0f0f0; 
               display: flex; justify-content: center; }
      </style>
    </head>
    <body>${htmlContent}</body>
    </html>
  `], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `poster-${eventName.replace(/\s+/g, '-').toLowerCase()}.html`
  a.click()
  URL.revokeObjectURL(url)
}

export default function DetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const isAdmin = searchParams?.get('admin') === 'true'
  const id = params?.id as string
  const [ev, setEv] = useState<Ev|null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [posterLoading, setPosterLoading] = useState(false)
  const [posterHtml, setPosterHtml] = useState<string|null>(null)

  useEffect(() => {
    if (!id) return
    // Tambahin timestamp biar gak kena cache browser
    fetch(`${SB_URL}/rest/v1/events?id=eq.${id}&select=*`, { 
      headers: { ...H, 'Cache-Control': 'no-cache' } 
    })
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d) && d.length > 0) setEv(d[0])
        else setNotFound(true)
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [id])

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}><div style={{fontSize:48}}>🐦</div><p style={{color:'#64748b',marginTop:8}}>Memuat...</p></div>
    </div>
  )

  if (notFound || !ev) return (
    <div style={{minHeight:'100vh',background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}><div style={{fontSize:48}}>😕</div><h2 style={{color:'#0f172a',marginTop:12}}>Event tidak ditemukan</h2><Link href="/" style={{display:'inline-block',marginTop:16,color:'#16a34a',textDecoration:'none',fontWeight:600}}>← Kembali ke beranda</Link></div>
    </div>
  )

  const d = days(ev.tanggal)
  const lc = ev.level_event && LC[ev.level_event]
  const mc = ev.kategori_merpati && MC[ev.kategori_merpati]
  const isMerpati = ev.jenis_lomba === 'merpati'
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent((ev.lokasi||'')+' '+ev.kota)}`
  const shareMsg = encodeURIComponent(`Cek lomba ${ev.nama_event} di ${ev.kota}${ev.tanggal?' tanggal '+fmt(ev.tanggal):''} - gantangfinder.vercel.app/events/${ev.id}`)

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-secondary)',paddingBottom:100, transition: 'background-color 0.3s'}}>
      {/* Header */}
      <div style={{background:'var(--header-bg)',padding:'16px 20px 20px', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 40}}>
        <div style={{maxWidth:640,margin:'0 auto'}}>
          <Link href="/" style={{display:'inline-flex',alignItems:'center',gap:6,color:'var(--text-secondary)',textDecoration:'none',fontSize:14,fontWeight:600,marginBottom:16}}>
            ← Kembali
          </Link>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {ev.is_featured && <span style={{background:'linear-gradient(135deg,#f59e0b,#fbbf24)',color:'#fff',fontSize:12,fontWeight:700,padding:'4px 12px',borderRadius:9999}}>⭐ FEATURED</span>}
            <span style={{background:'var(--bg-primary)',color:'var(--text-primary)', border: '1px solid var(--border-color)', fontSize:12,fontWeight:600,padding:'4px 12px',borderRadius:9999}}>{isMerpati?'🕊️ Merpati/Dara':'🐦 Lomba Kicau'}</span>
            {lc && <span style={{background:lc.bg,color:lc.color,fontSize:12,fontWeight:700,padding:'4px 12px',borderRadius:9999}}>{ev.level_event}</span>}
            {mc && <span style={{background:mc.bg,color:mc.color,fontSize:12,fontWeight:700,padding:'4px 12px',borderRadius:9999}}>{(ev.kategori_merpati??'').charAt(0).toUpperCase()+(ev.kategori_merpati??'').slice(1)}</span>}
          </div>
        </div>
      </div>

      <div style={{maxWidth:640,margin:'0 auto',padding:'20px 16px'}} className="animate-fade-in-up">
        {/* Nama Event */}
        <div style={{background:'var(--bg-card)',borderRadius:16,padding:20,border:'1px solid var(--border-color)',boxShadow:'var(--shadow)',marginBottom:16}}>
          <h1 style={{fontSize:22,fontWeight:800,color:'var(--text-primary)',marginBottom:6,lineHeight:1.3}}>{ev.nama_event}</h1>
          <p style={{fontSize:14,color:'var(--text-secondary)'}}>Diselenggarakan oleh <strong style={{color:'var(--text-primary)'}}>{ev.penyelenggara}</strong></p>
        </div>

        {/* Countdown */}
        {d !== null && (
          <div style={{background:d>0?'var(--featured-bg)':d===0?'rgba(22, 163, 74, 0.1)':'var(--bg-secondary)',borderRadius:16,padding:'16px 20px',border:`1px solid ${d>0?'var(--featured-border)':d===0?'rgba(22, 163, 74, 0.2)':'var(--border-color)'}`,marginBottom:16,textAlign:'center'}}>
            <p style={{fontSize:28,fontWeight:800,color:d>0?'var(--accent-amber)':d===0?'var(--accent-green)':'var(--text-muted)',margin:0}}>
              {d>0?`H-${d}`:d===0?'Hari ini! 🎉':'Sudah selesai'}
            </p>
            <p style={{fontSize:13,color:d>0?'var(--accent-amber)':d===0?'var(--accent-green)':'var(--text-secondary)',marginTop:4,marginBottom:0}}>
              {d>0?`${d} hari lagi menuju event`:d===0?'Event berlangsung hari ini':'Event ini sudah berakhir'}
            </p>
          </div>
        )}

        {/* Foto Hasil Lomba */}
        {ev.foto_hasil && (Array.isArray(ev.foto_hasil) ? ev.foto_hasil.length > 0 : !!ev.foto_hasil) && (
          <div style={{background:'#fff',borderRadius:16,padding:20,border:'1.5px solid #f1f5f9',boxShadow:'0 2px 8px rgba(0,0,0,.06)',marginBottom:16}}>
            <h2 style={{fontSize:16,fontWeight:800,color:'#0f172a',marginBottom:12,display:'flex',alignItems:'center',gap:8}}>
              📸 Hasil Perlombaan
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(Array.isArray(ev.foto_hasil) ? ev.foto_hasil : [ev.foto_hasil]).map((url, i) => (
                <div key={i} style={{ borderRadius:12, overflow:'hidden', border:'1px solid #e2e8f0', background:'#f8fafc' }}>
                  <img 
                    src={url} 
                    alt={`Hasil ${ev.nama_event} - ${i+1}`} 
                    style={{ width:'100%', height:'auto', display:'block' }}
                    onError={(e) => {
                      console.error('Gagal muat gambar:', url);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
            <p style={{fontSize:12,color:'var(--text-secondary)',marginTop:10,textAlign:'center',fontStyle:'italic'}}>
              Klik gambar untuk memperbesar (jika didukung browser)
            </p>
          </div>
        )}

        {/* Daftar Juara */}
        {ev.daftar_juara && ev.daftar_juara.length > 0 && (
          <div style={{background:'var(--bg-primary)',borderRadius:16,padding:20,border:'1px solid var(--border-color)',boxShadow:'var(--shadow)',marginBottom:16}}>
            <h2 style={{fontSize:18,fontWeight:800,color:'var(--text-primary)',marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
              🏆 Daftar Juara
            </h2>
            <div style={{display:'flex',flexDirection:'column',gap:20}}>
              {(ev.daftar_juara as Array<KelasJuara>).map((kelasData, i: number) => (
                <div key={i}>
                  <h3 style={{fontSize:15,fontWeight:700,color:'var(--accent-green)',marginBottom:10,borderBottom:'2px solid var(--border-color)',paddingBottom:6}}>
                    {kelasData.kelas}
                  </h3>
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    {(kelasData.juara as Array<Juara>).map((j, ji: number) => (
                      <div key={ji} style={{display:'flex',alignItems:'center',gap:12,background:'var(--bg-secondary)',padding:'10px 14px',borderRadius:12,border:'1px solid var(--border-color)'}}>
                        <div style={{
                          width:28,height:28,borderRadius:'50%',background:j.posisi===1?'linear-gradient(135deg,#f59e0b,#fbbf24)':j.posisi===2?'linear-gradient(135deg,#94a3b8,#cbd5e1)':j.posisi===3?'linear-gradient(135deg,#b45309,#d97706)':'var(--bg-primary)',
                          color:j.posisi<=3?'#fff':'var(--text-primary)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:14,border:j.posisi>3?'1px solid var(--border-color)':'none'
                        }}>
                          {j.posisi}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:14,fontWeight:700,color:'var(--text-primary)'}}>{j.nama_burung || 'Tanpa Nama'}</div>
                          <div style={{fontSize:12,color:'var(--text-secondary)'}}>Pemilik: {j.pemilik || '-'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
          {[
            {icon:'📅',label:'Tanggal',val:fmt(ev.tanggal)||'Jadwal rutin'},
            {icon:'📍',label:'Lokasi',val:[ev.lokasi,ev.kota].filter(Boolean).join(', ')},
            {icon:'💰',label:'Biaya Daftar',val:fmtBiaya(ev.biaya_daftar)||'Hubungi panitia'},
            {icon:'🐦',label:'Jenis Lomba',val:isMerpati?'Merpati/Dara':'Burung Kicau'},
          ].map(({icon,label,val})=>(
            <div key={label} style={{background:'#fff',borderRadius:14,padding:'14px 16px',border:'1.5px solid #f1f5f9',boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
              <div style={{fontSize:20,marginBottom:4}}>{icon}</div>
              <div style={{fontSize:11,color:'#94a3b8',fontWeight:600,marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>{label}</div>
              <div style={{fontSize:13,color:'#0f172a',fontWeight:600}}>{val}</div>
            </div>
          ))}
        </div>

        {/* Generate Poster Button (Admin Only) */}
        {isAdmin && (
          <div style={{marginBottom: 16}}>
            <button 
              onClick={async () => {
                try {
                  setPosterLoading(true)
                  const html = await generatePoster({
                    nama_event: ev.nama_event,
                    tanggal: ev.tanggal || '',
                    kota: ev.kota,
                    lokasi: ev.lokasi || '',
                    jenis_burung: ev.jenis_burung || [],
                    penyelenggara: ev.penyelenggara,
                    biaya_daftar: ev.biaya_daftar ?? null,
                    kontak: ev.kontak || '',
                    jenis_lomba: ev.jenis_lomba || 'kicau',
                    kategori_kelas: ev.kategori_kelas,
                    jarak_meter: ev.jarak_meter
                  })
                  setPosterHtml(html)
                } catch (error) {
                  alert(error instanceof Error ? error.message : 'Gagal membuat poster')
                } finally {
                  setPosterLoading(false)
                }
              }}
              disabled={posterLoading}
              style={{width:'100%',padding:'14px',background:'linear-gradient(135deg, #1e293b, #0f172a)',color:'#fff',border:'none',borderRadius:16,fontSize:14,fontWeight:700,cursor:posterLoading?'not-allowed':'pointer',display:'flex',justifyContent:'center',alignItems:'center',gap:8,boxShadow:'0 4px 12px rgba(15,23,42,0.2)'}}
            >
              {posterLoading ? '⏳ Sedang membuat poster...' : '🎨 Buat Poster Promosi AI'}
            </button>
          </div>
        )}

        {/* Kelas Burung */}
        {ev.jenis_burung && ev.jenis_burung.length > 0 && (
          <div style={{background:'#fff',borderRadius:16,padding:'16px 20px',border:'1.5px solid #f1f5f9',boxShadow:'0 2px 8px rgba(0,0,0,.06)',marginBottom:16}}>
            <p style={{fontSize:13,fontWeight:700,color:'#374151',marginBottom:10}}>🏆 Kelas Burung</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {ev.jenis_burung.map(b=><span key={b} style={{background:'#f0fdf4',color:'#15803d',fontSize:12,fontWeight:600,padding:'5px 12px',borderRadius:9999,border:'1px solid #bbf7d0'}}>{b}</span>)}
            </div>
          </div>
        )}

        {/* Info Merpati */}
        {isMerpati && (ev.jarak_meter || ev.kategori_kelas) && (
          <div style={{background:'#eff6ff',borderRadius:16,padding:'16px 20px',border:'1.5px solid #93c5fd',boxShadow:'0 2px 8px rgba(0,0,0,.06)',marginBottom:16}}>
            <p style={{fontSize:13,fontWeight:700,color:'#1d4ed8',marginBottom:10}}>🕊️ Info Merpati</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
              {ev.kategori_merpati && <div style={{textAlign:'center'}}><div style={{fontSize:11,color:'#3b82f6',marginBottom:4}}>Kategori</div><div style={{fontWeight:700,color:'#1e40af'}}>{ev.kategori_merpati.charAt(0).toUpperCase()+ev.kategori_merpati.slice(1)}</div></div>}
              {ev.jarak_meter && <div style={{textAlign:'center'}}><div style={{fontSize:11,color:'#3b82f6',marginBottom:4}}>Jarak</div><div style={{fontWeight:700,color:'#1e40af'}}>{fmtJarak(ev.jarak_meter)}</div></div>}
              {ev.kategori_kelas && <div style={{textAlign:'center'}}><div style={{fontSize:11,color:'#3b82f6',marginBottom:4}}>Kelas</div><div style={{fontWeight:700,color:'#1e40af'}}>{ev.kategori_kelas}</div></div>}
            </div>
          </div>
        )}

        {/* Aturan Sangkar */}
        {!isMerpati && ev.aturan_sangkar && (
          <div style={{background:'#fff',borderRadius:16,padding:'16px 20px',border:'1.5px solid #f1f5f9',marginBottom:16}}>
            <p style={{fontSize:13,fontWeight:700,color:'#374151',marginBottom:4}}>🏮 Aturan Sangkar</p>
            <p style={{fontSize:14,color:'#0f172a',fontWeight:600,margin:0}}>{ev.aturan_sangkar}</p>
          </div>
        )}

        {/* Google Maps */}
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
          style={{display:'flex',alignItems:'center',gap:10,background:'#fff',borderRadius:16,padding:'16px 20px',border:'1.5px solid #f1f5f9',textDecoration:'none',marginBottom:16,boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}>
          <span style={{fontSize:24}}>🗺️</span>
          <div>
            <p style={{fontSize:14,fontWeight:700,color:'#0f172a',margin:0}}>Lihat di Google Maps</p>
            <p style={{fontSize:12,color:'#64748b',margin:0}}>{[ev.lokasi,ev.kota].filter(Boolean).join(', ')}</p>
          </div>
          <span style={{marginLeft:'auto',color:'#64748b'}}>→</span>
        </a>

        {/* Share */}
        <a href={`https://wa.me/?text=${shareMsg}`} target="_blank" rel="noopener noreferrer"
          style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,background:'#f0fdf4',color:'#15803d',borderRadius:12,padding:'12px 0',fontSize:13,fontWeight:600,textDecoration:'none',border:'1.5px solid #bbf7d0',marginBottom:16}}>
          📤 Bagikan Event Ini
        </a>
      </div>

      {/* Sticky WA Button */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,padding:'12px 16px 20px',background:'linear-gradient(to top,var(--bg-primary) 80%,transparent)',zIndex:40}}>
        <div style={{maxWidth:640,margin:'0 auto'}}>
          <a href={waLink(ev.kontak,ev.nama_event)} target="_blank" rel="noopener noreferrer"
            style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,width:'100%',padding:'16px 0',background:'#25D366',color:'#fff',borderRadius:14,fontSize:16,fontWeight:700,textDecoration:'none',boxShadow:'0 4px 20px rgba(37,211,102,.4)',boxSizing:'border-box'}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            {ev.kontak ? 'Daftar via WhatsApp' : 'Hubungi Panitia'}
          </a>
        </div>
      </div>

      {/* Poster Modal */}
      {posterHtml && (
        <div className="modal-overlay animate-fade-in" style={{position:'fixed',inset:0,background:'rgba(0,0,0,.8)',zIndex:100,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20}}>
          <div className="modal-content animate-slide-up" style={{background:'var(--bg-primary)',borderRadius:16,width:'100%',maxWidth:640,maxHeight:'80vh',overflow:'hidden',display:'flex',flexDirection:'column'}}>
            <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border-color)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h3 style={{margin:0,fontSize:16,fontWeight:700,color:'var(--text-primary)'}}>🎨 Hasil Poster AI</h3>
              <button onClick={()=>setPosterHtml(null)} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'var(--text-secondary)'}}>×</button>
            </div>
            <div style={{flex:1,overflow:'auto',padding:20,background:'var(--bg-secondary)',display:'flex',justifyContent:'center'}}>
              <div style={{transformOrigin:'top center',transform:'scale(0.8)'}} dangerouslySetInnerHTML={{__html: posterHtml}} />
            </div>
            <div style={{padding:'16px 20px',borderTop:'1px solid var(--border-color)',display:'flex',gap:12}}>
              <button onClick={()=>downloadPoster(posterHtml, ev.nama_event)} style={{flex:1,padding:'12px',background:'#1d4ed8',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer'}}>
                💾 Download HTML (Buka di Chrome → Save PDF)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
