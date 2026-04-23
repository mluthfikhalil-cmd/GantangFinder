'use client'

import { useState, useRef, useEffect } from 'react'

interface Sound {
  id: string
  title: string
  description?: string | null
  bird_type: string
  audio_url: string
  duration_seconds?: number | null
  play_count: number
  download_count: number
  source: string
}

interface MasteranPlayerProps {
  sound: Sound
  onPlay?: () => void
  onDownload?: () => void
}

export default function MasteranPlayer({ sound, onPlay, onDownload }: MasteranPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(sound.duration_seconds ?? 0)
  const [currentTime, setCurrentTime] = useState(0)

  const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  function fmtTime(sec: number) {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  function fmtCount(n: number) {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}rb`
    return String(n)
  }

  function togglePlay() {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(() => {})
      // Track play count
      if (SB_URL && SB_KEY) {
        fetch('/api/masteran', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: sound.id, action: 'play' }),
        }).catch(() => {})
      }
      onPlay?.()
    }
    setIsPlaying(!isPlaying)
  }

  function handleProgress(e: React.ChangeEvent<HTMLInputElement>) {
    if (!audioRef.current) return
    const val = parseFloat(e.target.value)
    const seekTime = (val / 100) * audioRef.current.duration
    audioRef.current.currentTime = seekTime
    setProgress(val)
    setCurrentTime(seekTime)
  }

  function handleTimeUpdate() {
    if (!audioRef.current) return
    const ct = audioRef.current.currentTime
    const dur = audioRef.current.duration
    setCurrentTime(ct)
    if (dur > 0) setProgress((ct / dur) * 100)
  }

  function handleDownload() {
    const a = document.createElement('a')
    a.href = sound.audio_url
    a.download = `${sound.title.replace(/\s+/g, '_')}.mp3`
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // Track download count
    if (SB_URL && SB_KEY) {
      fetch('/api/masteran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sound.id, action: 'download' }),
      }).catch(() => {})
    }
    onDownload?.()
  }

  // Bird type emoji
  const birdEmoji: Record<string, string> = {
    'Murai Batu': '🪶',
    'Cucak Rowo': '🐦',
    'Lovebird': '🦜',
    'Kenari': '🐤',
    'Anis Merah': '🕊️',
    'Cendet': '🦅',
    'Pleci': '🐦',
    'Kolibri': '🐦',
    'Trucukan': '🪶',
    'Cucak Hijau': '🐦',
    'Kacer': '🦅',
    'Jalak Suren': '🐦',
  }

  const emoji = birdEmoji[sound.bird_type] || '🎵'

  return (
    <div className="glass" style={{ padding: 18 }}>
      <audio
        ref={audioRef}
        src={sound.audio_url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration)
        }}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Top row: emoji + info + stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Bird type pill */}
          <span style={{ fontSize: 28 }}>{emoji}</span>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {sound.title}
            </h3>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(139, 92, 246, 0.15)',
                color: '#a78bfa',
                border: '1px solid rgba(139, 92, 246, 0.25)',
              }}>
                {sound.bird_type}
              </span>
              {sound.source === 'admin' && (
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}>
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                {fmtCount(sound.play_count)}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>▶️ plays</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                {fmtCount(sound.download_count)}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>⬇️ downloads</div>
            </div>
          </div>
        </div>
      </div>

      {/* Player Controls */}
      <div style={{ marginBottom: 10 }}>
        {/* Progress bar */}
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleProgress}
          style={{
            width: '100%',
            height: 4,
            appearance: 'none',
            background: `linear-gradient(to right, var(--accent-primary) ${progress}%, var(--border-color) ${progress}%)`,
            borderRadius: 2,
            cursor: 'pointer',
            accentColor: 'var(--accent-primary)',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {fmtTime(currentTime)}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {fmtTime(duration)}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={togglePlay}
          className="btn-gradient"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '10px 16px',
            fontSize: 14,
          }}
        >
          {isPlaying ? (
            <>
              <span>⏸️</span>
              <span>Pause</span>
            </>
          ) : (
            <>
              <span>▶️</span>
              <span>Putar</span>
            </>
          )}
        </button>

        <button
          onClick={handleDownload}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '10px 16px',
            fontSize: 14,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontWeight: 600,
            transition: 'all 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-primary)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)'
          }}
        >
          <span>⬇️</span>
          <span>Download</span>
        </button>

        <button
          style={{
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
            transition: 'all 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(244,114,182,0.15)'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-secondary)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)'
          }}
        >
          ❤️
        </button>
      </div>
    </div>
  )
}