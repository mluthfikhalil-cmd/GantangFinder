'use client'

import { Event, getDaysUntil, formatTanggal, LEVEL_COLORS } from './types'

export default function EventCard({ event, featured = false }: { event: Event; featured?: boolean }) {
  const days = getDaysUntil(event.tanggal)
  const isUpcoming = days !== null && days >= 0
  const lvl = event.level_event
  const lvlStyle = lvl && LEVEL_COLORS[lvl] ? LEVEL_COLORS[lvl] : null

  return (
    <div
      className="glass glass-hover"
      style={{
        padding: 18,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* Gradient accent line for featured */}
      {featured && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'var(--accent-gradient)',
          }}
        />
      )}

      {/* Glow effect for featured */}
      {featured && (
        <div
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 100,
            height: 100,
            background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
            opacity: 0.5,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Top row: badges + date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          {/* Featured badge */}
          {featured && (
            <span 
              style={{
                background: 'var(--accent-gradient)',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              ★ Featured
            </span>
          )}
          
          {/* Hasil badge */}
          {event.foto_hasil && (
            <span 
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                fontSize: 10,
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              📸 Result
            </span>
          )}
          
          {/* Level badge */}
          {lvlStyle && (
            <span 
              style={{
                background: lvlStyle.bg,
                color: lvlStyle.color,
                border: `1px solid ${lvlStyle.border}`,
                fontSize: 10,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {lvl}
            </span>
          )}
          
          {/* Countdown badge */}
          {isUpcoming && days! <= 7 && (
            <span 
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontSize: 10,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              🔥 {days === 0 ? 'TODAY' : `${days} DAYS`}
            </span>
          )}
          
          {/* Status badge */}
          {days !== null && days < 0 && (
            <span 
              style={{
                background: 'rgba(161, 161, 170, 0.15)',
                color: '#a1a1aa',
                fontSize: 10,
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              Completed
            </span>
          )}
        </div>

        {/* Date pill */}
        {event.tanggal && (
          <div 
            style={{ 
              textAlign: 'center', 
              flexShrink: 0, 
              background: isUpcoming ? 'rgba(16, 185, 129, 0.15)' : 'rgba(161, 161, 170, 0.1)',
              borderRadius: 'var(--radius-sm)', 
              padding: '6px 12px',
              marginLeft: 10,
              border: isUpcoming ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(161, 161, 170, 0.2)',
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 800, color: isUpcoming ? '#34d399' : '#71717a', lineHeight: 1.1 }}>
              {new Date(event.tanggal).getDate()}
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: isUpcoming ? '#10b981' : '#71717a', textTransform: 'uppercase' }}>
              {new Date(event.tanggal).toLocaleDateString('id-ID', { month: 'short' })}
            </div>
          </div>
        )}
      </div>

      {/* Event name */}
      <h3 
        style={{ 
          fontSize: 17, 
          fontWeight: 700, 
          color: 'var(--text-primary)', 
          marginBottom: 6, 
          lineHeight: 1.3,
        }}
      >
        {event.nama_event}
      </h3>
      
      {/* Organizer */}
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
        by <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{event.penyelenggara}</strong>
      </p>

      {/* Location */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--text-muted)' }}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {event.lokasi ? `${event.lokasi}, ` : ''}{event.kota}
        </span>
      </div>

      {/* Date & Time */}
      {event.tanggal && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--text-muted)' }}>
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{formatTanggal(event.tanggal)}</span>
        </div>
      )}

      {/* Sangkar type */}
      {event.aturan_sangkar && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <span style={{ fontSize: 12 }}>🏮</span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Sangkar: <strong style={{ color: 'var(--text-primary)' }}>{event.aturan_sangkar}</strong>
          </span>
        </div>
      )}

      {/* Bird types */}
      {event.jenis_burung?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {event.jenis_burung.map(b => (
            <span 
              key={b} 
              style={{
                background: 'rgba(139, 92, 246, 0.1)',
                color: '#a78bfa',
                fontSize: 11,
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(139, 92, 246, 0.25)',
              }}
            >
              {b}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}