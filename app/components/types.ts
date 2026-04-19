'use client'

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
  return Math.ceil((new Date(tanggal).getTime() - new Date().setHours(0,0,0,0)) / 86400000)
}

export function formatTanggal(tanggal: string | null) {
  if (!tanggal) return null
  return new Date(tanggal).toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
}
