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
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'harian' | 'lomba' | 'jual' | 'curhat'>('harian');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load User from Local Storage
  useEffect(() => {
    const stored = localStorage.getItem('gf_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, []);

  async function loadFeed() {
    setLoading(true);
    const res = await getFeed(1, 50); // Load lebih banyak untuk feel infinite scroll
    if (res.success) setPosts(res.data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      alert("Silakan login untuk membagikan postingan");
      return;
    }
    if (!content.trim()) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('user_id', user.id);
    formData.append('content', content);
    formData.append('type', postType);

    const res = await createPost(formData);
    
    if (res.success) {
      setContent('');
      loadFeed();
    } else {
      alert(res.message);
    }
    setIsSubmitting(false);
  }

  async function handleLike(postId: string) {
    if (!user) {
      alert("Silakan login untuk menyukai postingan");
      return;
    }
    const res = await toggleLike(postId, user.id);
    if (res.success) {
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, likes_count: res.liked ? p.likes_count + 1 : p.likes_count - 1 };
        }
        return p;
      }));
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex justify-center pb-20">
      
      {/* MAIN COLUMN (X-Style) */}
      <div className="w-full max-w-[600px] border-x border-[var(--border-color)] min-h-screen relative">
        
        {/* STICKY HEADER */}
        <div className="sticky top-0 z-10 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-color)] px-4 py-3 flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors text-[var(--text-primary)]">
            ←
          </Link>
          <h1 className="text-xl font-bold">GantangFeed</h1>
        </div>

        {/* INPUT BOX AREA */}
        <div className="border-b border-[var(--border-color)] px-4 py-4">
          {user ? (
            <form onSubmit={handleSubmit}>
              <div className="flex gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--accent-green)] to-[#14b8a6] flex items-center justify-center text-white font-bold shadow-sm">
                    {user.nama_lengkap.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Input Area */}
                <div className="flex-grow">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Apa yang sedang terjadi di dunia kicau mania?"
                    className="w-full bg-transparent text-lg placeholder-gray-500 focus:outline-none resize-none min-h-[80px]"
                  />
                  
                  {/* Post Type Selector (Simple Chips) */}
                  <div className="flex gap-2 mb-3 overflow-x-auto pb-2 no-scrollbar">
                    {[
                      { id: 'harian', label: '🏠 Harian' },
                      { id: 'lomba', label: '🏆 Lomba' },
                      { id: 'jual', label: '💰 Jual' },
                      { id: 'curhat', label: '❓ Diskusi' }
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setPostType(type.id as any)}
                        className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                          ${postType === type.id 
                            ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)] border border-[var(--accent-green)]' 
                            : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-transparent hover:border-[var(--border-color)]'}`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>

                  {/* Divider & Submit */}
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
                    <div className="flex gap-2 text-[var(--accent-green)]">
                      <button type="button" className="p-2 hover:bg-[var(--accent-green)]/10 rounded-full transition-colors">📷</button>
                      <button type="button" className="p-2 hover:bg-[var(--accent-green)]/10 rounded-full transition-colors">📊</button>
                      <button type="button" className="p-2 hover:bg-[var(--accent-green)]/10 rounded-full transition-colors">😊</button>
                    </div>
                    <button
                      type="submit"
                      disabled={!content.trim() || isSubmitting}
                      className="bg-[var(--accent-green)] text-white px-5 py-1.5 rounded-full font-bold text-sm hover:bg-opacity-90 disabled:opacity-50 transition-all shadow-sm"
                    >
                      Unggah
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 text-[var(--text-secondary)] bg-[var(--bg-secondary)] rounded-xl">
              Silakan <Link href="/login" className="text-[var(--accent-green)] font-semibold">Login</Link> untuk berdiskusi.
            </div>
          )}
        </div>

        {/* FEED LIST */}
        <div>
          {loading && <div className="p-8 text-center text-[var(--text-secondary)]">Memuat...</div>}
          
          {!loading && posts.length === 0 && (
            <div className="p-8 text-center text-[var(--text-secondary)]">
              Belum ada post. Jadilah yang pertama!
            </div>
          )}

          {posts.map((post) => (
            <div key={post.id} className="border-b border-[var(--border-color)] px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer">
              <div className="flex gap-3">
                {/* Avatar User Post */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-lg shadow-sm">
                    🐦
                  </div>
                </div>

                {/* Content Post */}
                <div className="flex-grow min-w-0">
                  {/* Header Post */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[var(--text-primary)] truncate">
                      {post.users?.full_name || 'Anonim'}
                    </span>
                    <span className="text-[var(--text-secondary)] text-sm truncate">
                      @{post.users?.whatsapp_number?.slice(-4) || 'user'} · {new Date(post.created_at).toLocaleDateString('id-ID')}
                    </span>
                    <span className={`ml-auto px-2 py-0.5 rounded text-xs font-medium border
                      ${post.post_type === 'lomba' ? 'bg-[#fef3c7] text-[#b45309] border-[#fcd34d]' : 
                        post.post_type === 'jual' ? 'bg-[#f0fdf4] text-[#15803d] border-[#86efac]' : 
                        'bg-[#eff6ff] text-[#1d4ed8] border-[#93c5fd]'}`}>
                      #{post.post_type}
                    </span>
                  </div>

                  {/* Text Content */}
                  <p className="text-[var(--text-primary)] whitespace-pre-wrap mb-3 leading-normal">
                    {post.content}
                  </p>

                  {/* Image (Jika ada) */}
                  {post.image_url && (
                    <div className="mb-3 rounded-2xl overflow-hidden border border-[var(--border-color)]">
                       <img src={post.image_url} alt="Post image" className="w-full h-auto object-cover" />
                    </div>
                  )}

                  {/* Action Bar (X-Style Icons) */}
                  <div className="flex items-center justify-between max-w-md mt-2 text-[var(--text-secondary)]">
                    <button className="group flex items-center gap-2 hover:text-blue-500 transition-colors">
                      <div className="p-2 group-hover:bg-blue-500/10 rounded-full transition-colors">💬</div>
                      <span className="text-sm">0</span>
                    </button>
                    
                    <button className="group flex items-center gap-2 hover:text-green-500 transition-colors">
                      <div className="p-2 group-hover:bg-green-500/10 rounded-full transition-colors">🔄</div>
                      <span className="text-sm">0</span>
                    </button>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleLike(post.id); }}
                      className="group flex items-center gap-2 hover:text-red-500 transition-colors"
                    >
                      <div className="p-2 group-hover:bg-red-500/10 rounded-full transition-colors">❤️</div>
                      <span className="text-sm">{post.likes_count}</span>
                    </button>
                    
                    <button className="group flex items-center gap-2 hover:text-[var(--accent-green)] transition-colors">
                      <div className="p-2 group-hover:bg-[var(--accent-green)]/10 rounded-full transition-colors">📤</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

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
