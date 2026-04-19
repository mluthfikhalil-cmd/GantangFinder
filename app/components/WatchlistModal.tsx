'use client'

import { useState } from 'react'
import { BIRDS } from './types'

export interface Watchlist { cities: string[]; birds: string[] }

export default function WatchlistModal({ cities, onSave, watchlist }: { cities: string[]; onSave: (w: Watchlist) => void; watchlist: Watchlist }) {
  const [open, setOpen] = useState(false)
  const [selCities, setSelCities] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('gf_watchlist') || '{}')
      return saved.cities || []
    } catch {
      return []
    }
  })
  const [selBirds, setSelBirds] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('gf_watchlist') || '{}')
      return saved.birds || []
    } catch {
      return []
    }
  })

  function toggle<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
  }

  function save() {
    const w: Watchlist = { cities: selCities, birds: selBirds }
    localStorage.setItem('gf_watchlist', JSON.stringify(w))
    onSave(w)
    setOpen(false)
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  // Derive total from props so badge is always in sync
  const total = watchlist.cities.length + watchlist.birds.length

  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        position:'fixed', bottom:24, left:24,
        display:'flex', alignItems:'center', gap:6,
        background: total > 0 ? 'linear-gradient(135deg,#1d4ed8,#2563eb)' : '#fff',
        color: total > 0 ? '#fff' : '#374151',
        border: total > 0 ? 'none' : '1.5px solid #e2e8f0',
        borderRadius:9999, padding:'10px 16px', fontSize:13, fontWeight:700,
        fontFamily:'inherit', cursor:'pointer',
        boxShadow:'0 4px 12px rgba(0,0,0,0.12)', zIndex:40,
        transition:'all 0.2s',
      }}>
        🔔 Watchlist {total > 0 && <span style={{ background:'rgba(255,255,255,0.3)', borderRadius:9999, padding:'1px 7px', fontSize:11 }}>{total}</span>}
      </button>

      {open && <div onClick={() => setOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)', zIndex:50 }} />}

      {open && (
        <div style={{
          position:'fixed', bottom:0, left:0, right:0,
          background:'#fff', borderRadius:'24px 24px 0 0',
          zIndex:51, maxHeight:'85vh', overflowY:'auto',
          animation:'slideUp 0.3s ease forwards',
          boxShadow:'0 -8px 40px rgba(0,0,0,0.15)',
        }}>
          <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 0' }}>
            <div style={{ width:40, height:4, background:'#e2e8f0', borderRadius:2 }} />
          </div>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 24px 0' }}>
            <div>
              <h2 style={{ fontSize:20, fontWeight:800, color:'#0f172a' }}>🔔 Watchlist & Notifikasi</h2>
              <p style={{ fontSize:13, color:'#64748b', marginTop:2 }}>Dapat notifikasi event baru sesuai pilihan lo</p>
            </div>
            <button onClick={() => setOpen(false)} style={{ background:'#f1f5f9', border:'none', borderRadius:'50%', width:36, height:36, cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b' }}>✕</button>
          </div>

          <div style={{ padding:'20px 24px 32px', display:'flex', flexDirection:'column', gap:20 }}>
            {/* Kota */}
            <div>
              <p style={{ fontSize:14, fontWeight:700, color:'#0f172a', marginBottom:10 }}>📍 Kota Pilihan</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {cities.length === 0
                  ? <p style={{ fontSize:13, color:'#94a3b8' }}>Belum ada event. Tambah event dulu.</p>
                  : cities.map(c => (
                    <button key={c} type="button" onClick={() => setSelCities(prev => toggle(prev, c))} style={{
                      padding:'6px 14px', borderRadius:9999, fontSize:13, fontWeight:600, fontFamily:'inherit', cursor:'pointer', transition:'all 0.15s',
                      border: selCities.includes(c) ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
                      background: selCities.includes(c) ? '#eff6ff' : '#f8fafc',
                      color: selCities.includes(c) ? '#1d4ed8' : '#64748b',
                    }}>{c}</button>
                  ))
                }
              </div>
            </div>

            {/* Jenis Burung */}
            <div>
              <p style={{ fontSize:14, fontWeight:700, color:'#0f172a', marginBottom:10 }}>🐦 Jenis Burung</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {BIRDS.map(b => (
                  <button key={b} type="button" onClick={() => setSelBirds(prev => toggle(prev, b))} style={{
                    padding:'6px 14px', borderRadius:9999, fontSize:13, fontWeight:600, fontFamily:'inherit', cursor:'pointer', transition:'all 0.15s',
                    border: selBirds.includes(b) ? '1.5px solid #16a34a' : '1.5px solid #e2e8f0',
                    background: selBirds.includes(b) ? '#dcfce7' : '#f8fafc',
                    color: selBirds.includes(b) ? '#15803d' : '#64748b',
                  }}>{b}</button>
                ))}
              </div>
            </div>

            <div style={{ padding:'12px 14px', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:10, fontSize:13, color:'#1d4ed8' }}>
              💡 Notifikasi browser akan aktif saat ada event baru yang cocok, dan pengingat H-3 & H-1 sebelum lomba.
            </div>

            <button onClick={save} style={{
              width:'100%', padding:14, background:'linear-gradient(135deg,#1d4ed8,#2563eb)',
              color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700,
              fontFamily:'inherit', cursor:'pointer', boxShadow:'0 4px 14px rgba(29,78,216,0.3)',
            }}>
              💾 Simpan Watchlist
            </button>
          </div>
        </div>
      )}
    </>
  )
}
