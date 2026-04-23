'use client'

import { useState, useEffect } from 'react'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }

interface Rating {
  id: string
  event_id: string
  user_id: string
  rating: number
  review_text: string
  created_at: string
}

interface Props {
  eventId: string
  userId?: string
}

export default function EventRatings({ eventId, userId }: Props) {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [myRating, setMyRating] = useState<Rating | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    loadRatings()
  }, [eventId])

  async function loadRatings() {
    try {
      const res = await fetch(`${SB_URL}/rest/v1/event_ratings?event_id=eq.${eventId}&order=created_at.desc`, { headers: H })
      const data = await res.json()
      setRatings(Array.isArray(data) ? data : [])
      
      // Check if user has already rated
      if (userId) {
        const my = (Array.isArray(data) ? data : []).find((r: Rating) => r.user_id === userId)
        if (my) {
          setMyRating(my)
          setRating(my.rating)
          setReview(my.review_text || '')
        }
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  async function saveRating() {
    if (!userId) {
      setToast('Silakan login untuk memberi rating')
      return
    }
    setSaving(true)
    try {
      const payload = {
        event_id: eventId,
        user_id: userId,
        rating,
        review_text: review || null
      }
      
      let res
      if (myRating?.id) {
        // Update existing rating
        res = await fetch(`${SB_URL}/rest/v1/event_ratings?id=eq.${myRating.id}`, {
          method: 'PATCH',
          headers: { ...H, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify(payload)
        })
      } else {
        // Create new rating
        res = await fetch(`${SB_URL}/rest/v1/event_ratings`, {
          method: 'POST',
          headers: { ...H, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify(payload)
        })
      }
      
      if (res.ok) {
        setToast('Rating berhasil disimpan!')
        setShowForm(false)
        loadRatings()
      } else {
        setToast('Gagal menyimpan rating')
      }
    } catch (e) {
      setToast('Terjadi kesalahan')
    }
    setSaving(false)
    setTimeout(() => setToast(''), 3000)
  }

  const avgRating = ratings.length > 0 
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : '0'

  return (
    <div style={{ marginTop: 24 }}>
      {toast && (
        <div style={{ position: 'fixed', top: 16, left: 16, right: 16, background: toast.includes('berhasil') ? 'var(--accent-green)' : '#ef4444', color: '#fff', padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 600, zIndex: 50, textAlign: 'center' }}>
          {toast}
        </div>
      )}
      
      {/* Rating Summary */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 16, border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>⭐ Rating & Ulasan</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 800 }}>{avgRating}</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>({ratings.length} ulasan)</span>
          </div>
        </div>
        
        {/* User Rating Form */}
        {userId && !myRating && !showForm && (
          <button onClick={() => setShowForm(true)} style={{ width: '100%', padding: 12, borderRadius: 10, fontWeight: 600, background: 'var(--accent-primary)', color: '#fff', border: 'none', cursor: 'pointer', marginBottom: 16 }}>
            ⭐ Beri Rating
          </button>
        )}
        
        {showForm && (
          <div style={{ marginBottom: 16, padding: 16, background: 'var(--bg-secondary)', borderRadius: 12 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Rating</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1,2,3,4,5].map(star => (
                  <button key={star} onClick={() => setRating(star)} style={{ fontSize: 24, background: 'none', border: 'none', cursor: 'pointer', color: star <= rating ? '#fbbf24' : 'var(--border-color)' }}>
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Ulasan (opsional)</label>
              <textarea value={review} onChange={e => setReview(e.target.value)} rows={3} placeholder="Bagikan pengalamanmu..." style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14, resize: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 10, borderRadius: 8, fontWeight: 600, background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}>Batal</button>
              <button onClick={saveRating} disabled={saving} style={{ flex: 1, padding: 10, borderRadius: 8, fontWeight: 600, background: saving ? 'var(--bg-secondary)' : 'var(--accent-green)', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        )}
        
        {myRating && (
          <div style={{ marginBottom: 16, padding: 12, background: 'var(--bg-secondary)', borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              {[1,2,3,4,5].map(star => (
                <span key={star} style={{ fontSize: 16, color: star <= myRating.rating ? '#fbbf24' : 'var(--border-color)' }}>★</span>
              ))}
              {myRating.review_text && <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}> - "{myRating.review_text}"</span>}
            </div>
            <button onClick={() => { setShowForm(true); setRating(myRating.rating); setReview(myRating.review_text || '') }} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: 12, cursor: 'pointer', padding: 0 }}>Edit rating</button>
          </div>
        )}
        
        {/* Display Ratings */}
        {loading ? (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>Loading...</p>
        ) : ratings.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>Belum ada rating. Jadi yang pertama!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ratings.slice(0, 5).map(r => (
              <div key={r.id} style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  {[1,2,3,4,5].map(star => (
                    <span key={star} style={{ fontSize: 14, color: star <= r.rating ? '#fbbf24' : 'var(--border-color)' }}>★</span>
                  ))}
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 8 }}>
                    {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                {r.review_text && (
                  <p style={{ fontSize: 13, margin: 0, color: 'var(--text-primary)' }}>"{r.review_text}"</p>
                )}
              </div>
            ))}
            {ratings.length > 5 && (
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 8 }}>+{ratings.length - 5} ulasan lainnya</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}