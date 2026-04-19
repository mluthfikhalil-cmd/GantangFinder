'use server'

import { revalidatePath } from 'next/cache'

export async function addEvent(formData: FormData) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return { error: 'Konfigurasi database tidak ditemukan.' }

  const nama_event = formData.get('nama_event') as string
  const penyelenggara = formData.get('penyelenggara') as string
  const lokasi = formData.get('lokasi') as string
  const kota = formData.get('kota') as string
  const tanggal = formData.get('tanggal') as string
  const jenis_burung_raw = formData.get('jenis_burung') as string
  const is_featured = formData.get('is_featured') === 'true'
  const level_event = formData.get('level_event') as string
  const aturan_sangkar = formData.get('aturan_sangkar') as string

  if (!nama_event || !penyelenggara || !kota) {
    return { error: 'Nama event, penyelenggara, dan kota wajib diisi.' }
  }

  const jenis_burung = jenis_burung_raw
    ? jenis_burung_raw.split(',').map(s => s.trim()).filter(Boolean)
    : []

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(url, key)

    const { error } = await supabase.from('events').insert({
      nama_event,
      penyelenggara,
      lokasi,
      kota,
      tanggal: tanggal || null,
      jenis_burung,
      is_featured,
      level_event: level_event || null,
      aturan_sangkar: aturan_sangkar || null,
    })

    if (error) return { error: error.message }

    revalidatePath('/')
    return { success: true }
  } catch (e: any) {
    return { error: e?.message ?? 'Terjadi kesalahan.' }
  }
}
