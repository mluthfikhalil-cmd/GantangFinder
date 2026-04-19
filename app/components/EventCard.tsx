'use client'

import { Event, getDaysUntil, formatTanggal, LEVEL_COLORS } from './types'

export default function EventCard({ event, featured = false }: { event: Event; featured?: boolean }) {
  const days = getDaysUntil(event.tanggal)
  const isUp = days !== null && days >= 0
  const lvl = event.level_event
  const lvlStyle = lvl && LEVEL_COLORS[lvl] ? LEVEL_COLORS[lvl] : null

  return (
    <div
      style={{
        background: featured ? 'linear-gradient(135deg,#fffbeb,#fef9c3)' : '#fff',
        borderRadius: 16, padding: 16,
        border: featured ? '1.5px solid #fde68a' : '1.5px solid #f1f5f9',
        boxShadow: featured ? '0 4px 16px rgba(245,158,11,.12)' : '0 2px 8px rgba(0,0,0,.05)',
        transition: 'all .2s ease', position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,.1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = featured ? '0 4px 16px rgba(245,158,11,.12)' : '0 2px 8px rgba(0,0,0,.05)' }}
    >
      {featured && <div style={{ position:'absolute', top:0, left:0, width:'100%', height:3, background:'linear-gradient(90deg,#f59e0b,#fbbf24)' }} />}

      {/* Badges row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', flex:1 }}>
          {featured && <span style={{ background:'linear-gradient(135deg,#f59e0b,#fbbf24)', color:'#fff', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:9999 }}>⭐ FEATURED</span>}
          {lvlStyle && <span style={{ background:lvlStyle.bg, color:lvlStyle.color, border:`1px solid ${lvlStyle.border}`, fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:9999 }}>{lvl}</span>}
          {isUp && days! <= 7 && <span style={{ background:'#fef2f2', color:'#dc2626', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:9999 }}>🔥 {days === 0 ? 'HARI INI' : `${days} HARI LAGI`}</span>}
          {days !== null && days < 0 && <span style={{ background:'#f1f5f9', color:'#94a3b8', fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:9999 }}>Selesai</span>}
        </div>
        {event.tanggal && (
          <div style={{ textAlign:'center', flexShrink:0, background: isUp ? '#dcfce7' : '#f1f5f9', borderRadius:10, padding:'4px 10px', marginLeft:8 }}>
            <div style={{ fontSize:18, fontWeight:800, color: isUp ? '#15803d' : '#94a3b8', lineHeight:1 }}>{new Date(event.tanggal).getDate()}</div>
            <div style={{ fontSize:10, fontWeight:600, color: isUp ? '#16a34a' : '#94a3b8' }}>{new Date(event.tanggal).toLocaleDateString('id-ID',{month:'short'}).toUpperCase()}</div>
          </div>
        )}
      </div>

      <h3 style={{ fontSize:16, fontWeight:700, color:'#0f172a', marginBottom:4, lineHeight:1.3 }}>{event.nama_event}</h3>
      <p style={{ fontSize:13, color:'#64748b', marginBottom:8 }}>oleh <strong style={{ color:'#374151' }}>{event.penyelenggara}</strong></p>

      <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom: event.tanggal ? 4 : 8 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span style={{ fontSize:13, color:'#64748b' }}>{event.lokasi ? `${event.lokasi}, ` : ''}{event.kota}</span>
      </div>

      {event.tanggal && (
        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span style={{ fontSize:13, color:'#64748b' }}>{formatTanggal(event.tanggal)}</span>
        </div>
      )}

      {event.aturan_sangkar && (
        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
          <span style={{ fontSize:12 }}>🏮</span>
          <span style={{ fontSize:12, color:'#64748b' }}>Sangkar: <strong>{event.aturan_sangkar}</strong></span>
        </div>
      )}

      {event.jenis_burung?.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {event.jenis_burung.map(b => (
            <span key={b} style={{ background:'#f0fdf4', color:'#15803d', fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:9999, border:'1px solid #bbf7d0' }}>{b}</span>
          ))}
        </div>
      )}
    </div>
  )
}
