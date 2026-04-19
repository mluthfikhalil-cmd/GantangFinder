'use client'

// ─── Shared Constants ───────────────────────────────────────────────────────
export const LEVELS = ['Latber', 'Latpres', 'Regional', 'Nasional'] as const
export const BIRDS = [
  'Murai Batu','Kacer','Cucak Rowo','Cendet','Kenari',
  'Lovebird','Cucak Hijau','Anis Merah','Pleci','Kolibri',
  'Trucukan','Prenjak','Tledekan','Jalak Suren','Jalak Bali',
] as const

export type Level = typeof LEVELS[number]

export interface Event {
  id: string
  nama_event: string
  penyelenggara: string
  lokasi: string
  kota: string
  tanggal: string | null
  jenis_burung: string[]
  is_featured: boolean
  level_event?: string | null
  aturan_sangkar?: string | null
}

export const LEVEL_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  'Latber':   { bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
  'Latpres':  { bg: '#eff6ff', color: '#1d4ed8', border: '#93c5fd' },
  'Regional': { bg: '#fef3c7', color: '#b45309', border: '#fcd34d' },
  'Nasional': { bg: '#fdf4ff', color: '#a21caf', border: '#e879f9' },
}

export function getDaysUntil(tanggal: string | null): number | null {
  if (!tanggal) return null
  // Append T00:00:00 to avoid locale-dependent date string parsing issues
  const eventDay = new Date(tanggal + 'T00:00:00')
  const today = new Date()
  return Math.ceil((eventDay.getTime() - today.getTime()) / 86400000)
}

export function formatTanggal(tanggal: string | null) {
  if (!tanggal) return null
  return new Date(tanggal + 'T00:00:00').toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
}
