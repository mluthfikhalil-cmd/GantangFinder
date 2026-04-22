'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  getMedicalHistory, addMedicalRecord, 
  findSparringPartners, sendSparringRequest, 
  addTrainingLog, getPerformanceStats 
} from '@/app/actions/roosterManagerActions';

// Import fungsi profil ayam
import { getRoosterProfile } from '@/app/actions/roosterActions'; 

export default function RoosterDashboardPage() {
  const params = useParams();
  const roosterId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<'profile' | 'medical' | 'sparring' | 'journal'>('profile');
  const [rooster, setRooster] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State Forms
  const [medForm, setMedForm] = useState({ type: 'vitamin', product: '', date: '', next: '' });
  const [trainForm, setTrainForm] = useState({ activity: 'lari', duration: '', condition: 'fit', notes: '' });
  const [partners, setPartners] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [roosterId]);

  async function loadData() {
    setLoading(true);
    const profileRes = await getRoosterProfile(roosterId);
    if (profileRes.success && profileRes.profile) {
      setRooster(profileRes.profile);
      // Load partners if weight exists
      if (profileRes.profile.weight_kg) {
        const partnerRes = await findSparringPartners(roosterId, profileRes.profile.weight_kg, 'Palembang'); // Hardcode city for demo
        if (partnerRes.success) setPartners(partnerRes.data);
      }
    }
    setLoading(false);
  }

  // --- HANDLERS ---
  async function handleAddMedical(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('rooster_id', roosterId);
    formData.append('type', medForm.type);
    formData.append('product_name', medForm.product);
    formData.append('date', medForm.date);
    formData.append('next_schedule', medForm.next);
    
    const res = await addMedicalRecord(formData);
    if (res.success) alert('Rekam medis disimpan!');
  }

  async function handleAddTraining(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('rooster_id', roosterId);
    formData.append('date', new Date().toISOString().split('T')[0]);
    formData.append('activity', trainForm.activity);
    formData.append('duration', trainForm.duration);
    formData.append('condition', trainForm.condition);
    formData.append('notes', trainForm.notes);

    const res = await addTrainingLog(formData);
    if (res.success) {
      alert('Latihan dicatat!');
      setTrainForm({ ...trainForm, duration: '', notes: '' });
      loadData();
    }
  }

  async function handleInviteSparring(targetId: string) {
    const date = prompt("Kapan mau latih tanding? (YYYY-MM-DD)");
    if (!date) return;
    const res = await sendSparringRequest(roosterId, targetId, date, "Ajak latih tanding yuk!");
    if (res.success) alert("Undangan terkirim!");
  }

  if (loading) return <div className="p-8 text-center text-[var(--text-secondary)]">Memuat dashboard ayam...</div>;
  if (!rooster) return <div className="p-8 text-center text-[var(--text-secondary)]">Ayam tidak ditemukan.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 bg-[var(--bg-primary)] min-h-screen pb-20">
      
      {/* HEADER PROFIL SINGKAT */}
      <div className="bg-[var(--bg-secondary)] rounded-xl p-4 shadow-sm border border-[var(--border-color)] mb-4 flex items-center gap-4">
        <div className="w-16 h-16 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-full flex items-center justify-center text-2xl">🐔</div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">{rooster.name}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{rooster.breed} • {rooster.weight_kg} kg • {rooster.height_cm} cm</p>
        </div>
        <button 
          onClick={() => setActiveTab('journal')}
          className="ml-auto bg-[var(--accent-green)] text-white px-3 py-1 rounded-lg text-sm font-bold shadow-sm"
        >
          + Catat Latihan
        </button>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex overflow-x-auto gap-2 mb-4 no-scrollbar">
        {[
          { id: 'profile', label: 'Profil & Medis' },
          { id: 'sparring', label: 'Cari Lawan' },
          { id: 'journal', label: 'Jurnal Harian' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors border
              ${activeTab === tab.id 
                ? 'bg-[var(--accent-green)] text-white border-[var(--accent-green)]' 
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)]'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="space-y-4">
        
        {/* TAB 1: PROFILE & MEDICAL */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            {/* Form Medis */}
            <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)] shadow-sm">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-[var(--text-primary)]">💉 Tambah Rekam Medis</h3>
              <form onSubmit={handleAddMedical} className="space-y-2">
                <select value={medForm.type} onChange={e => setMedForm({...medForm, type: e.target.value})} className="w-full p-2 border border-[var(--border-color)] rounded bg-[var(--bg-primary)] text-[var(--text-primary)] outline-none">
                  <option value="vitamin">Vitamin</option>
                  <option value="vaksin">Vaksinasi</option>
                  <option value="obat_cacing">Obat Cacing</option>
                  <option value="cek_dokter">Pemeriksaan Dokter</option>
                </select>
                <input placeholder="Nama Produk/Obat" value={medForm.product} onChange={e => setMedForm({...medForm, product: e.target.value})} className="w-full p-2 border border-[var(--border-color)] rounded bg-[var(--bg-primary)] text-[var(--text-primary)] outline-none" />
                <div className="flex gap-2">
                  <input type="date" value={medForm.date} onChange={e => setMedForm({...medForm, date: e.target.value})} className="w-1/2 p-2 border border-[var(--border-color)] rounded bg-[var(--bg-primary)] text-[var(--text-primary)] outline-none" />
                  <input type="date" value={medForm.next} onChange={e => setMedForm({...medForm, next: e.target.value})} className="w-1/2 p-2 border border-[var(--border-color)] rounded bg-[var(--bg-primary)] text-[var(--text-primary)] outline-none" title="Jadwal Berikutnya" />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition-colors shadow-sm mt-2">Simpan Medis</button>
              </form>
            </div>

            {/* Riwayat Medis Terakhir */}
            <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)] shadow-sm">
              <h3 className="font-bold mb-3 text-[var(--text-primary)]">📜 Riwayat Terakhir</h3>
              <div className="text-sm text-[var(--text-secondary)] italic p-4 text-center">
                Data rekam medis akan tampil di sini...
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SPARRING PARTNER */}
        {activeTab === 'sparring' && (
          <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)] shadow-sm animate-fade-in">
            <h3 className="font-bold mb-4 text-[var(--text-primary)]">🥊 Cari Lawan Latih Tanding (Bobot ±0.5kg)</h3>
            {partners.length === 0 ? (
              <div className="text-[var(--text-secondary)] text-center py-8">
                <div className="text-3xl mb-2">😴</div>
                <p>Tidak ada lawan seberat ini di sekitar saat ini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {partners.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] hover:shadow-md transition-shadow">
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">{p.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{p.breed} • {p.weight_kg} kg</p>
                      <p className="text-xs text-[var(--accent-green)] font-medium">Pemilik: {p.users?.nama_lengkap || 'Anonim'}</p>
                    </div>
                    <button 
                      onClick={() => handleInviteSparring(p.id)}
                      className="bg-[var(--accent-green)] text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-opacity-90 transition-opacity shadow-sm"
                    >
                      Ajak Latih
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: JURNAL HARIAN */}
        {activeTab === 'journal' && (
          <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)] shadow-sm animate-fade-in">
            <h3 className="font-bold mb-3 text-[var(--text-primary)]">📝 Input Jurnal Hari Ini</h3>
            <form onSubmit={handleAddTraining} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <select value={trainForm.activity} onChange={e => setTrainForm({...trainForm, activity: e.target.value})} className="p-2 border border-[var(--border-color)] rounded bg-[var(--bg-primary)] text-[var(--text-primary)] outline-none">
                  <option value="lari">🏃 Lari Pagi</option>
                  <option value="renang">🏊 Renang</option>
                  <option value="latih_tanding">🥊 Latih Tanding</option>
                  <option value="jemur">☀️ Jemur</option>
                </select>
                <input type="number" placeholder="Durasi (menit)" value={trainForm.duration} onChange={e => setTrainForm({...trainForm, duration: e.target.value})} className="p-2 border border-[var(--border-color)] rounded bg-[var(--bg-primary)] text-[var(--text-primary)] outline-none" />
              </div>
              <select value={trainForm.condition} onChange={e => setTrainForm({...trainForm, condition: e.target.value})} className="w-full p-2 border border-[var(--border-color)] rounded bg-[var(--bg-primary)] text-[var(--text-primary)] outline-none">
                <option value="fit">✅ Kondisi Fit</option>
                <option value="lelah">😫 Agak Lelah</option>
                <option value="cedera_ringan">⚠️ Luka Ringan</option>
              </select>
              <textarea placeholder="Catatan tambahan (nafsu makan, kualitas kotoran...)" value={trainForm.notes} onChange={e => setTrainForm({...trainForm, notes: e.target.value})} className="w-full p-2 border border-[var(--border-color)] rounded bg-[var(--bg-primary)] text-[var(--text-primary)] outline-none resize-none h-24" />
              <button type="submit" className="w-full bg-[var(--accent-green)] text-white py-2 rounded font-bold hover:bg-opacity-90 transition-opacity shadow-sm">Simpan Jurnal</button>
            </form>
          </div>
        )}

      </div>

      {/* Bottom Navigation */}
      <nav style={{position:'fixed',bottom:0,left:0,right:0,background:'var(--bg-primary)',borderTop:'1px solid var(--border-color)',display:'flex',alignItems:'center',justifyContent:'space-around',padding:'8px 0 max(8px, env(safe-area-inset-bottom))',zIndex:40,boxShadow:'0 -4px 12px rgba(0,0,0,0.06)'}}>
        <a href="/" style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'6px 8px',textDecoration:'none',color:'var(--text-secondary)',fontSize:11,fontWeight:600}}>
          <span style={{fontSize:22}}>🏠</span>Home
        </a>
        <a href="/feed" style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'6px 8px',textDecoration:'none',color:'var(--text-secondary)',fontSize:11,fontWeight:600}}>
          <span style={{fontSize:22}}>💬</span>Komunitas
        </a>
        <a href="/birds" style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'6px 8px',textDecoration:'none',color:'var(--accent-green)',fontSize:11,fontWeight:700}}>
          <span style={{fontSize:22}}>🐦</span>Profil
        </a>
        <a href="/dashboard" style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'6px 8px',textDecoration:'none',color:'var(--text-secondary)',fontSize:11,fontWeight:600}}>
          <span style={{fontSize:22}}>👤</span>Akun
        </a>
      </nav>
    </div>
  );
}
