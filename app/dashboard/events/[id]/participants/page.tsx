'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' };

export default function EventParticipants() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('gf_user');
    const token = localStorage.getItem('gf_token');
    
    if (!storedUser || !token) {
      setLoading(false);
      router.push('/login');
      return;
    }

    const userData = JSON.parse(storedUser);

    // Fetch event details
    fetch(`${SB_URL}/rest/v1/events?id=eq.${eventId}&select=*,organizers:organizer_id(name)`, { headers: H })
      .then(r => r.json())
      .then(data => {
        if (data && data.length > 0) {
          setEvent(data[0]);
        }
      });

    // Fetch participants
    fetch(
      `${SB_URL}/rest/v1/event_participants?event_id=eq.${eventId}&select=*,birds:bird_id(id,name,species),users:user_id(id,nama_lengkap,nomor_wa)`,
      { headers: H }
    ).then(r => r.json()).then(data => {
      setParticipants(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [eventId, router]);

  const updateStatus = async (participantId: string, newStatus: string) => {
    const res = await fetch(
      `${SB_URL}/rest/v1/event_participants?id=eq.${participantId}`,
      { 
        method: 'PATCH',
        headers: { ...H, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ status: newStatus, updated_at: new Date().toISOString() })
      }
    );
    if (res.ok) {
      setParticipants(prev => prev.map(p => 
        p.id === participantId ? { ...p, status: newStatus } : p
      ));
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
        Memuat...
      </div>
    );
  }

  return (
    <div style={{ padding: 16, paddingBottom: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <a href="/dashboard" style={{ fontSize: 24, textDecoration: 'none', color: '#0f172a' }}>←</a>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Peserta Event
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            {event?.name || 'Event'} • {participants.length} peserta
          </p>
        </div>
      </div>

      {participants.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <p>Belum ada peserta</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {participants.map((p: any) => (
            <div key={p.id} style={{ 
              background: 'white', 
              borderRadius: 12, 
              padding: 16,
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#0f172a' }}>
                {p.users?.nama_lengkap || 'Peserta'}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                📱 {p.users?.nomor_wa || '-'}
              </div>
              <div style={{ marginTop: 8, fontSize: 13, color: '#64748b' }}>
                🐦 {p.birds?.name || 'Bird'} ({p.birds?.species || '-'})
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button 
                  onClick={() => updateStatus(p.id, 'approved')}
                  style={{ 
                    flex: 1, 
                    padding: '8px 12px', 
                    background: '#dcfce7', 
                    color: '#166534',
                    border: 'none', 
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  ✓ Terima
                </button>
                <button 
                  onClick={() => updateStatus(p.id, 'rejected')}
                  style={{ 
                    flex: 1, 
                    padding: '8px 12px', 
                    background: '#fee2e2', 
                    color: '#991b1b',
                    border: 'none', 
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  ✕ Tolak
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}