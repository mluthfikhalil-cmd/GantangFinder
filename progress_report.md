# Laporan Progress Pengembangan GantangFinder (Handoff Document)

**Status Project:** LIVE & STABLE (Production Ready)  
**Terakhir Diperbarui:** 21 April 2026  
**Repository / Deployment:** Vercel (https://gantangfinder.vercel.app)

---

## 🚀 Fitur Utama yang Sudah Diselesaikan

### 1. Sistem Manajemen Foto Hasil Lomba (Terbaru)
- **Multi-Upload System:** Mengubah skema database Supabase (`foto_hasil`) dari tipe `TEXT` tunggal menjadi array `TEXT[]`. Sistem kini mendukung upload **banyak foto sekaligus** (multi-select) untuk satu event.
- **Fitur Kelola & Hapus Foto:** Admin dapat melihat daftar foto yang telah diupload melalui sistem modal (pop-up) di dashboard, beserta fitur untuk menghapus foto tertentu. Penghapusan akan sinkron secara langsung baik di database tabel `events` maupun di *storage bucket* Supabase.
- **Galeri Otomatis:** Halaman detail event (`/events/[id]`) akan secara otomatis merender seluruh foto yang diupload secara vertikal (berurutan) tanpa adanya duplikasi blok UI.
- **Bug Fixes (Database & RLS):** Telah mengonfigurasi Row Level Security (RLS) di tabel `events` agar *public update* diizinkan, serta memastikan bucket `results` berada pada mode *Public* dengan *policy full access*.

### 2. Sistem Monetisasi (Featured Event)
- Fitur "Featured" yang ditandai dengan gradien kuning khusus.
- Mendukung logika *auto-expire* menggunakan kolom `featured_until`.
- Admin dapat memberikan status *featured* melalui dashboard dengan durasi kustom (7, 14, 30 hari).

### 3. Lead Generation (WhatsApp Subscriber)
- Sistem popup banner dan modal "Dapatkan Notifikasi Lomba" untuk menangkap leads pengunjung.
- Data tersimpan otomatis di tabel `subscribers` di Supabase.
- Admin dashboard mendukung rekap data *subscriber* dan ekspor ke CSV untuk keperluan *WhatsApp Blast* atau pengiriman notifikasi masal.
- Tombol aksi otomatis "Daftar via WhatsApp" di setiap halaman event.

---

## 🛠 Konfigurasi Teknis & Infrastruktur

1. **Tech Stack Utama:** Next.js 16 (App Router), CSS Inline, Supabase (Database & Storage REST API).
2. **Arsitektur:** Menggunakan *single-file architecture* pada halaman utama (`app/page.tsx`) dan `app/events/[id]/page.tsx` demi meminimalisir masalah *hydration error* yang kerap muncul pada SDK pihak ketiga di Vercel.
3. **Komunikasi Database:** Seluruh request menggunakan fetch API murni (`/rest/v1/...`) dengan `apikey` *anon key*.
4. **Environment Variables:** 
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## ⚠️ Catatan Penting untuk AI / Developer Selanjutnya

1. **Hindari Instalasi SDK Supabase `@supabase/supabase-js` untuk Client-Side rendering:** Kode lama sempat mengalami crash (*hydration/webpack error*) karena pemakaian SDK ini di frontend. Semua *data fetching* telah dirancang stabil dengan Vanilla `fetch`. Pengecualian hanya ada di *Server Actions* (`app/actions.ts`) di mana eksekusi berjalan 100% di server Next.js.
2. **Push ke GitHub:** Ingat bahwa web ini otomatis ter-deploy (*CI/CD*) lewat Vercel. Setiap kali ada perubahan di file lokal komputer, **wajib** dilakukan `git add`, `git commit`, dan `git push origin main` agar perubahannya naik ke website live.
3. **RLS & Storage:** Semua tabel yang butuh *write-access* dari luar (`events`, `subscribers`, dan *bucket* `results`) telah dibuka *policy*-nya untuk *anon*. Berhati-hati saat mengubah arsitektur RLS agar tidak memutus fitur upload atau subscriber.

---

## 🎯 Backlog & Langkah Selanjutnya (Opsional)
- **Otomatisasi WhatsApp Blast:** Integrasi ke sistem vendor (seperti Fonnte) untuk otomatis men-trigger pesan WhatsApp saat event baru di-*publish*.
- **Otomatisasi Brosur/Poster AI:** Menyediakan fitur internal yang mengonversi detil lomba di database menjadi desain poster *ready-to-share* secara otomatis (Prompt brosur sudah disiapkan sebelumnya).
- **SEO & Sitemap Dinamis:** Implementasi struktur JSON-LD atau Dynamic Metadata (`generateMetadata` di Next.js) per halaman lomba untuk *boosting* index di Google Search.
