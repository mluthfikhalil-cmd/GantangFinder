'use client';

import { useState } from 'react';
import { createPost } from '@/app/actions/feedActions';

interface UserProps {
  id: string;
  full_name: string;
}

interface GantangPostBoxProps {
  user: UserProps;
  onPostSuccess: () => void;
}

export default function GantangPostBox({ user, onPostSuccess }: GantangPostBoxProps) {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'harian' | 'lomba' | 'jual' | 'curhat'>('harian');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('user_id', user.id);
    formData.append('content', content);
    formData.append('type', postType);

    const res = await createPost(formData);
    
    if (res.success) {
      setContent('');
      onPostSuccess();
    } else {
      alert(res.message);
    }
    setIsSubmitting(false);
  }

  const postTypes = [
    { id: 'harian', label: 'Harian/Latber', icon: '🏠', color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
    { id: 'lomba', label: 'Hasil Lomba', icon: '🏆', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' },
    { id: 'jual', label: 'Jual/Beli', icon: '💰', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    { id: 'curhat', label: 'Tanya/Diskusi', icon: '❓', color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
  ];

  const selectedType = postTypes.find(t => t.id === postType) || postTypes[0];

  return (
    <div className="bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-color)] p-4 mb-6 transition-all hover:shadow-md">
      
      {/* HEADER: Avatar & Input Area */}
      <div className="flex gap-3 mb-4">
        {/* Avatar User */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--accent-green)] to-[#14b8a6] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Input Field */}
        <div className="flex-grow relative">
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Apa yang sedang terjadi dengan burungmu, ${user.full_name.split(' ')[0]}?`}
              className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-2xl px-4 py-3 min-h-[50px] max-h-[150px] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-green)] transition-all placeholder-gray-500"
              rows={1}
            />
            
            {/* Divider & Actions */}
            <div className="mt-2 flex items-center justify-between border-t border-[var(--border-color)] pt-2">
              
              {/* Left: Post Type Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowOptions(!showOptions)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedType.color}`}
                >
                  <span>{selectedType.icon}</span>
                  <span>{selectedType.label}</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>

                {/* Dropdown Options */}
                {showOptions && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-[var(--bg-card)] rounded-lg shadow-xl border border-[var(--border-color)] z-10 overflow-hidden animate-fade-in">
                    {postTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => {
                          setPostType(type.id as any);
                          setShowOptions(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] flex items-center gap-2"
                      >
                        <span>{type.icon}</span> {type.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Submit Button */}
              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="bg-[var(--accent-green)] hover:bg-opacity-90 text-white px-6 py-1.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
              >
                {isSubmitting ? 'Mengirim...' : 'Unggah'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer: Quick Actions */}
      <div className="flex items-center justify-around pt-2 border-t border-[var(--border-color)]">
        <button className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent-green)] hover:bg-[var(--bg-secondary)] px-3 py-2 rounded-lg transition-colors text-sm font-medium">
          📷 Foto/Video
        </button>
        <button className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-yellow-500 hover:bg-[var(--bg-secondary)] px-3 py-2 rounded-lg transition-colors text-sm font-medium">
          🏆 Tag Event
        </button>
        <button className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-red-500 hover:bg-[var(--bg-secondary)] px-3 py-2 rounded-lg transition-colors text-sm font-medium">
          ❤️ Perasaan
        </button>
      </div>

    </div>
  );
}
