import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = getSupabase()
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('tanggal', { ascending: true })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">GantangFinder</h1>
          <p className="text-sm text-gray-500 mt-1">
            Temukan jadwal lomba burung kicau se-Indonesia
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col gap-3">
        {events?.map((event) => (
          <div key={event.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-2">
              {event.is_featured ? (
                <span className="text-xs bg-green-100 text-green-800 font-medium px-2 py-1 rounded-full">
                  Featured
                </span>
              ) : (
                <span className="text-xs text-gray-400">{event.penyelenggara}</span>
              )}
              <span className="text-xs text-gray-400">
                {event.tanggal ? new Date(event.tanggal).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric'
                }) : 'Jadwal rutin'}
              </span>
            </div>
            <h2 className="font-semibold text-gray-900 text-base mb-1">
              {event.nama_event}
            </h2>
            <p className="text-sm text-gray-500 mb-3">
              {event.lokasi}, {event.kota}
            </p>
            <div className="flex gap-2 flex-wrap">
              {event.jenis_burung?.map((burung: string) => (
                <span key={burung} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {burung}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-8">
        <button className="w-full bg-gray-900 text-white rounded-xl py-3 text-sm font-medium">
          + Tambah Event Lomba
        </button>
      </div>
    </main>
  )
}