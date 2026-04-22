'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };

export default function MyRegistrations() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('gf_user');
    const token = localStorage.getItem('gf_token');
    
    if (!storedUser || !token) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(storedUser);

    // Fetch user's registrations
    fetch(
      `${SB_URL}/rest/v1/event_participants?user_id=eq.${userData.id}&select=*,events:event_id(id,name,location,event_date,status_event),birds:bird_id(id,name,species)`,
      { headers: H }
    ).then(r => r.json()).then(data => {
      setRegistrations(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [router]);

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
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>Registrasi Saya</h1>
      </div>

      {registrations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <p>Belum ada registrasi event</p>
          <a href="/" style={{ color: '#2563eb', textDecoration: 'underline' }}>Cari event</a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {registrations.map((reg: any) => (
            <div key={reg.id} style={{ 
              background: 'white', 
              borderRadius: 12, 
              padding: 16,
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#0f172a' }}>
                {reg.events?.name || 'Event'}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                📍 {reg.events?.location || '-'} • {reg.events?.event_date ? new Date(reg.events.event_date).toLocaleDateString('id-ID') : '-'}
              </div>
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>
                  🐦 {reg.birds?.name || 'Bird'} ({reg.birds?.species || '-'})
                </span>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: 4, 
                  fontSize: 11, 
                  fontWeight: 600,
                  background: reg.status === 'approved' ? '#dcfce7' : reg.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                  color: reg.status === 'approved' ? '#166534' : reg.status === 'rejected' ? '#991b1b' : '#92400e'
                }}>
                  {reg.status?.toUpperCase() || 'PENDING'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}