'use client';

import { useState, useEffect } from 'react';
import { getFeed, createPost, toggleLike } from '@/app/actions/feedActions';
import Link from 'next/link';

interface User {
  id: string
  nama_lengkap: string
  role: string
}

export default function FeedPage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState('harian');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load User from Local Storage
  useEffect(() => {
    const stored = localStorage.getItem('gf_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  // Load Feed Awal
  useEffect(() => {
    loadFeed();
  }, []);

  async function loadFeed() {
    setLoading(true);
    const res = await getFeed(1, 20);
    if (res.success) setPosts(res.data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      alert("Silakan login untuk memposting!");
      return;
    }
    if (!newPost.trim()) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('user_id', user.id);
    formData.append('content', newPost);
    formData.append('type', postType);

    const res = await createPost(formData);
    
    if (res.success) {
      setNewPost('');
      loadFeed(); // Refresh feed
    } else {
      alert(res.message);
    }
    setIsSubmitting(false);
  }

  async function handleLike(postId: string) {
    if (!user) {
      alert("Silakan login untuk menyukai postingan!");
      return;
    }
    const res = await toggleLike(postId, user.id);
    if (res.success) {
      // Update UI lokal secara optimistik
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, likes_count: res.liked ? p.likes_count + 1 : p.likes_count - 1 };
        }
        return p;
      }));
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 min-h-screen bg-[var(--bg-secondary)] pb-24">
      
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">GantangFeed 🕊️</h1>
        <span className="text-sm text-[var(--text-secondary)]">Komunitas Kicau Mania</span>
      </div>

      {/* INPUT POST */}
      <div className="bg-[var(--bg-card)] p-4 rounded-xl shadow-sm mb-8 border border-[var(--border-color)]">
        <form onSubmit={handleSubmit}>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder={user ? "Bagikan progres latihan, hasil lomba, atau jual burung..." : "Silakan login untuk membagikan postingan..."}
            disabled={!user}
            className="w-full p-3 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border-none focus:ring-2 focus:ring-[var(--accent-green)] resize-none mb-3 outline-none"
            rows={3}
          />
          {user && (
            <div className="flex justify-between items-center">
              <select 
                value={postType} 
                onChange={(e) => setPostType(e.target.value)}
                className="text-sm bg-transparent border border-[var(--border-color)] rounded px-2 py-1 text-[var(--text-primary)] outline-none"
              >
                <option value="harian">🏠 Harian/Latber</option>
                <option value="lomba">🏆 Hasil Lomba</option>
                <option value="jual">💰 Jual/Beli</option>
                <option value="curhat">❓ Tanya/Diskusikan</option>
              </select>
              <button 
                type="submit" 
                disabled={isSubmitting || !newPost.trim()}
                className="bg-[var(--accent-green)] text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? 'Posting...' : 'Kirim'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* LIST POSTS */}
      <div className="space-y-6">
        {loading && <div className="text-center py-10 text-[var(--text-secondary)]">Memuat feed...</div>}
        
        {!loading && posts.length === 0 && (
          <div className="text-center py-10 text-[var(--text-secondary)]">Belum ada post. Jadilah yang pertama!</div>
        )}

        {posts.map((post) => (
          <div key={post.id} className="bg-[var(--bg-card)] p-4 rounded-xl shadow-sm border border-[var(--border-color)] animate-fade-in">
            
            {/* Header Post */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-lg">
                🐦
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">
                  {post.users?.full_name || 'Anonim'}
                </h3>
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <span className={`px-2 py-0.5 rounded-full capitalize
                    ${post.post_type === 'lomba' ? 'bg-[#fef3c7] text-[#b45309] border border-[#fcd34d]' : 
                      post.post_type === 'jual' ? 'bg-[#f0fdf4] text-[#15803d] border border-[#86efac]' : 
                      'bg-[#eff6ff] text-[#1d4ed8] border border-[#93c5fd]'}`}>
                    #{post.post_type}
                  </span>
                  <span>{new Date(post.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <p className="text-[var(--text-primary)] whitespace-pre-wrap mb-3 text-[15px] leading-relaxed">
              {post.content}
            </p>

            {/* Image (Jika ada) */}
            {post.image_url && (
              <div className="mb-3 rounded-lg overflow-hidden">
                 <img src={post.image_url} alt="Post image" className="w-full h-auto object-cover max-h-96" />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-3 border-t border-[var(--border-color)]">
              <button 
                onClick={() => handleLike(post.id)}
                className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-red-500 transition-colors font-medium text-sm"
              >
                <span>❤️</span> <span>{post.likes_count}</span>
              </button>
              <button className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-blue-500 transition-colors font-medium text-sm">
                <span>💬</span> Komentar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <nav style={{position:'fixed',bottom:0,left:0,right:0,background:'var(--bg-primary)',borderTop:'1px solid var(--border-color)',display:'flex',alignItems:'center',justifyContent:'space-around',padding:'8px 0 max(8px, env(safe-area-inset-bottom))',zIndex:40,boxShadow:'0 -4px 12px rgba(0,0,0,0.06)'}}>
        <a href="/" style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'6px 8px',textDecoration:'none',color:'var(--text-secondary)',fontSize:11,fontWeight:600}}>
          <span style={{fontSize:22}}>🏠</span>Home
        </a>
        <a href="/feed" style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'6px 8px',textDecoration:'none',color:'var(--accent-green)',fontSize:11,fontWeight:700}}>
          <span style={{fontSize:22}}>💬</span>Komunitas
        </a>
        <a href="/birds" style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'6px 8px',textDecoration:'none',color:'var(--text-secondary)',fontSize:11,fontWeight:600}}>
          <span style={{fontSize:22}}>🐦</span>Profil
        </a>
        <Link href={user ? '/dashboard' : '/login'} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'6px 8px',border:'none',background:'transparent',cursor:'pointer',color:'var(--text-secondary)',fontSize:11,fontWeight:600,fontFamily:'inherit'}}>
          <span style={{fontSize:22}}>👤</span>Akun
        </Link>
      </nav>
    </div>
  );
}
