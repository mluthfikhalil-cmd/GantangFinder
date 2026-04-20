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
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Terjadi kesalahan.' }
  }
}

export async function uploadResultImage(eventId: string, file: File) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return { error: 'Konfigurasi database tidak ditemukan.' }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(url, key)

    // 1. Upload file ke storage bucket 'results'
    const fileExt = file.name.split('.').pop()
    const fileName = `${eventId}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `images/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('results')
      .upload(filePath, file)

    if (uploadError) return { error: uploadError.message }

    // 2. Dapatkan public URL
    const { data: { publicUrl } } = supabase.storage
      .from('results')
      .getPublicUrl(filePath)

    // 3. Update kolom 'foto_hasil' di tabel 'events'
    // Kita asumsikan kolom ini bertipe TEXT atau JSON (array of strings)
    // Untuk MVP, kita simpan satu foto dulu.
    const { error: updateError } = await supabase
      .from('events')
      .update({ foto_hasil: publicUrl })
      .eq('id', eventId)

    if (updateError) return { error: updateError.message }

    revalidatePath('/')
    revalidatePath(`/events/${eventId}`)
    return { success: true, url: publicUrl }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Terjadi kesalahan.' }
  }
}
