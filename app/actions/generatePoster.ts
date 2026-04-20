'use server'

export async function generatePoster(event: {
  nama_event: string
  tanggal: string
  kota: string
  lokasi: string
  jenis_burung: string[]
  penyelenggara: string
  biaya_daftar: number | null
  kontak: string | null
  jenis_lomba: string
  kategori_kelas?: string | null
  jarak_meter?: number | null
}) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('API Key tidak ditemukan')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Kamu adalah desainer grafis profesional spesialis poster lomba burung Indonesia.

Buat poster HTML untuk event berikut:
- Nama Event: ${event.nama_event}
- Tanggal: ${new Date(event.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
- Lokasi: ${event.lokasi}, ${event.kota}
- Jenis Burung: ${event.jenis_burung?.join(', ')}
- Penyelenggara: ${event.penyelenggara}
- Biaya Daftar: ${event.biaya_daftar ? 'Rp ' + event.biaya_daftar.toLocaleString('id-ID') : 'GRATIS'}
- Kontak: ${event.kontak || '-'}
- Jenis Lomba: ${event.jenis_lomba === 'merpati' ? 'Merpati/Dara Balap' : 'Kicau Mania'}
${event.kategori_kelas ? '- Kelas: ' + event.kategori_kelas : ''}
${event.jarak_meter ? '- Jarak: ' + event.jarak_meter + ' meter' : ''}

REQUIREMENTS POSTER:
1. Format: HTML dengan inline CSS, lebar 600px, tinggi 900px
2. Style: Modern, bold, eye-catching — cocok untuk di-share di WhatsApp & Instagram
3. Warna tema:
   - Kalau lomba KICAU: gunakan tema hijau tua + emas (#1a4a2e, #d4af37)
   - Kalau lomba MERPATI: gunakan tema biru tua + perak (#1a2a4a, #c0c0c0)
4. Elemen wajib:
   - Badge "GantangFinder" di pojok atas sebagai watermark kecil
   - Nama event dengan typography besar dan bold
   - Tanggal dan lokasi dengan icon sederhana (pakai unicode: 📅 📍)
   - Jenis burung yang dilombakan dalam bentuk pills/chips
   - Info biaya daftar dan kontak
   - Dekorasi burung/bulu menggunakan CSS shapes (BUKAN emoji besar)
   - Footer dengan "gantangfinder.vercel.app"
5. Jangan gunakan gambar eksternal apapun
6. Jangan gunakan font eksternal — pakai system fonts
7. Return HANYA kode HTML, tidak ada penjelasan, tidak ada markdown code block

Buat poster yang terlihat premium dan profesional.`
      }]
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    console.error('Claude API Error:', errorData)
    throw new Error('Gagal membuat poster via AI')
  }

  const data = await response.json()
  return data.content[0].text
}
