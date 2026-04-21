'use server'

import { revalidatePath } from 'next/cache'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

const headers = () => ({
  'apikey': SB_KEY,
  'Authorization': `Bearer ${SB_KEY}`,
  'Content-Type': 'application/json',
})

export async function addEvent(formData: FormData, userId?: string) {
  if (!SB_URL || !SB_KEY) return { error: 'Konfigurasi database tidak ditemukan.' }

  const nama_event = formData.get('nama_event') as string
  const penyelenggara = formData.get('penyelenggara') as string
  const lokasi = formData.get('lokasi') as string
  const kota = formData.get('kota') as string
  const tanggal = formData.get('tanggal') as string
  const jenis_burung_raw = formData.get('jenis_burung') as string
  const is_featured = formData.get('is_featured') === 'true'
  const level_event = formData.get('level_event') as string
  const aturan_sangkar = formData.get('aturan_sangkar') as string
  const jenis_lomba = formData.get('jenis_lomba') as string
  const kontak = formData.get('kontak') as string
  const kategori_merpati = formData.get('kategori_merpati') as string
  const jarak_meter_raw = formData.get('jarak_meter') as string
  const kategori_kelas = formData.get('kategori_kelas') as string

  if (!nama_event || !penyelenggara || !kota) {
    return { error: 'Nama event, penyelenggara, dan kota wajib diisi.' }
  }

  // Authorization check: verify user is logged in and approved organizer
  if (!userId) {
    return { error: 'Anda belum login. Silakan login terlebih dahulu.' }
  }

  // Fetch user from DB to verify status and role
  const userRes = await fetch(
    `${SB_URL}/rest/v1/users?id=eq.${userId}&select=id,role,status`,
    { headers: headers() }
  )
  const users = await userRes.json()
  if (!Array.isArray(users) || users.length === 0) {
    return { error: 'User tidak ditemukan. Silakan login kembali.' }
  }
  const user = users[0]
  if (user.role !== 'organizer') {
    return { error: 'Hanya organizer yang dapat membuat event.' }
  }
  if (user.status !== 'active') {
    return { error: 'Akun organizer Anda belum disetujui admin. Mohon tunggu persetujuan.' }
  }

  const jenis_burung = jenis_burung_raw
    ? jenis_burung_raw.split(',').map(s => s.trim()).filter(Boolean)
    : []

  const jarak_meter = jarak_meter_raw ? parseInt(jarak_meter_raw) : null

  try {
    const body: Record<string, unknown> = {
      nama_event,
      penyelenggara,
      lokasi,
      kota,
      tanggal: tanggal || null,
      jenis_burung,
      is_featured,
      level_event: level_event || null,
      aturan_sangkar: aturan_sangkar || null,
      organizer_id: userId,
      jenis_lomba: jenis_lomba || null,
      kontak: kontak || null,
      kategori_merpati: kategori_merpati || null,
      jarak_meter,
      kategori_kelas: kategori_kelas || null,
    }

    const res = await fetch(`${SB_URL}/rest/v1/events`, {
      method: 'POST',
      headers: { ...headers(), 'Prefer': 'return=representation' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { error: err.message || `Gagal menyimpan (HTTP ${res.status})` }
    }

    revalidatePath('/')
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Terjadi kesalahan.' }
  }
}

export async function uploadResultImage(eventId: string, file: File) {
  if (!SB_URL || !SB_KEY) return { error: 'Konfigurasi database tidak ditemukan.' }

  try {
    // 1. Upload file ke storage bucket 'results' via REST API
    const fileExt = file.name.split('.').pop()
    const fileName = `${eventId}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `images/${fileName}`

    // Upload to Supabase Storage via REST API
    const uploadRes = await fetch(
      `${SB_URL}/storage/v1/object/results/${filePath}`,
      {
        method: 'POST',
        headers: {
          'apikey': SB_KEY,
          'Authorization': `Bearer ${SB_KEY}`,
          'Content-Type': file.type,
          'x-upsert': 'true',
        },
        body: file,
      }
    )

    if (!uploadRes.ok) {
      const errText = await uploadRes.text().catch(() => '')
      return { error: `Gagal upload file: ${uploadRes.status} ${errText}` }
    }

    // 2. Dapatkan public URL
    const publicUrl = `${SB_URL}/storage/v1/object/public/results/${filePath}`

    // 3. Ambil data lama dulu untuk di-append
    const getRes = await fetch(
      `${SB_URL}/rest/v1/events?id=eq.${eventId}&select=foto_hasil`,
      { headers: headers() }
    )

    if (!getRes.ok) return { error: 'Gagal mengambil data event.' }
    const getData = await getRes.json()
    const currentEv = Array.isArray(getData) ? getData[0] : getData

    let oldPhotos: string[] = []
    if (Array.isArray(currentEv?.foto_hasil)) {
      oldPhotos = currentEv.foto_hasil
    } else if (currentEv?.foto_hasil && typeof currentEv.foto_hasil === 'string') {
      oldPhotos = [currentEv.foto_hasil]
    }

    const newPhotos = [...oldPhotos, publicUrl]

    // 4. Update kolom 'foto_hasil' di tabel 'events'
    const updateRes = await fetch(
      `${SB_URL}/rest/v1/events?id=eq.${eventId}`,
      {
        method: 'PATCH',
        headers: { ...headers(), 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify({ foto_hasil: newPhotos }),
      }
    )

    if (!updateRes.ok) {
      const err = await updateRes.json().catch(() => ({}))
      return { error: err.message || `Gagal update foto (HTTP ${updateRes.status})` }
    }

    revalidatePath('/')
    revalidatePath(`/events/${eventId}`)
    return { success: true, url: publicUrl }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Terjadi kesalahan.' }
  }
}

export async function deleteResultImage(eventId: string, imageUrl: string) {
  if (!SB_URL || !SB_KEY) return { error: 'Konfigurasi database tidak ditemukan.' }

  try {
    // 1. Ambil data foto saat ini
    const getRes = await fetch(
      `${SB_URL}/rest/v1/events?id=eq.${eventId}&select=foto_hasil`,
      { headers: headers() }
    )

    if (!getRes.ok) return { error: 'Gagal mengambil data event.' }
    const getData = await getRes.json()
    const currentEv = Array.isArray(getData) ? getData[0] : getData

    const oldPhotos = Array.isArray(currentEv?.foto_hasil) ? currentEv.foto_hasil : []
    const newPhotos = oldPhotos.filter(p => p !== imageUrl)

    // 2. Update database
    const updateRes = await fetch(
      `${SB_URL}/rest/v1/events?id=eq.${eventId}`,
      {
        method: 'PATCH',
        headers: { ...headers(), 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify({ foto_hasil: newPhotos }),
      }
    )

    if (!updateRes.ok) {
      const err = await updateRes.json().catch(() => ({}))
      return { error: err.message || `Gagal update (HTTP ${updateRes.status})` }
    }

    // 3. Hapus dari storage (opsional tapi bagus untuk bersih-bersih)
    // URL format: https://<project>.supabase.co/storage/v1/object/public/results/images/filename.jpg
    const pathParts = imageUrl.split('/results/')
    if (pathParts.length > 1) {
      const filePath = pathParts[1]
      await fetch(
        `${SB_URL}/storage/v1/object/results/${filePath}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': SB_KEY,
            'Authorization': `Bearer ${SB_KEY}`,
          },
        }
      )
    }

    revalidatePath('/')
    revalidatePath(`/events/${eventId}`)
    return { success: true }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Terjadi kesalahan.' }
  }
}
