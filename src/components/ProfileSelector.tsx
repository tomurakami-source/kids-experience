'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  created_at: string;
}


interface ProfileSelectorProps {
  onSelect: (profile: Profile) => void;
  initialProfiles?: Profile[];
}

interface StarData {
  width: number; height: number; top: string; left: string; duration: number; delay: number;
}

export default function ProfileSelector({ onSelect, initialProfiles }: ProfileSelectorProps) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles ?? []);
  const [loading, setLoading] = useState(!initialProfiles);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [stars, setStars] = useState<StarData[]>([]);

  useEffect(() => {
    setStars([...Array(24)].map(() => ({
      width: Math.random() * 3 + 1,
      height: Math.random() * 3 + 1,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 4,
    })));
  }, []);

  const supabase = createClient();

  const fetchProfiles = useCallback(async () => {
    const res = await fetch('/api/profiles');
    if (res.ok) setProfiles(await res.json() as Profile[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initialProfiles) return; // サーバーから取得済みの場合はスキップ
    fetchProfiles();
  }, [fetchProfiles, initialProfiles]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        const created = await res.json() as Profile;
        setProfiles((p) => [...p, created]);
        setShowCreate(false);
        setNewName('');
        setCreateError(null);
        onSelect(created);
      } else {
        const body = await res.json().catch(() => ({})) as { error?: string };
        setCreateError(body.error ?? `エラー (${res.status})`);
      }
    } catch {
      setCreateError('ネットワークエラーが発生しました');
    }
    setCreating(false);
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('このプロフィールを削除しますか？進捗も全て消えます。')) return;
    await fetch(`/api/profiles?id=${id}`, { method: 'DELETE' });
    setProfiles((p) => p.filter((pr) => pr.id !== id));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    location.href = '/login';
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background: `
          repeating-linear-gradient(45deg, transparent 0, transparent 8px, rgba(160,120,60,0.025) 8px, rgba(160,120,60,0.025) 9px),
          repeating-linear-gradient(-45deg, transparent 0, transparent 8px, rgba(160,120,60,0.025) 8px, rgba(160,120,60,0.025) 9px),
          linear-gradient(160deg, #1a0a2e 0%, #16213e 40%, #0f3460 100%)
        `,
      }}
    >
      {/* Stars */}
      {stars.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{ width: s.width, height: s.height, top: s.top, left: s.left }}
          animate={{ opacity: [0.1, 0.8, 0.1] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative"
      >
        {/* Logout */}
        <button
          onClick={handleLogout}
          className="absolute top-0 right-0 flex items-center gap-1.5 text-amber-400/60 hover:text-amber-300 text-xs font-semibold"
        >
          <LogOut className="w-3.5 h-3.5" />
          ログアウト
        </button>

        <div className="text-center mb-8">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="text-6xl mb-3"
          >
            📖
          </motion.div>
          <h1 className="text-2xl font-black text-amber-200" style={{ fontFamily: 'Georgia, serif' }}>
            冒険者を選んでください
          </h1>
          <p className="text-amber-400/60 text-sm mt-1">誰の冒険を続けますか？</p>
        </div>

        {loading ? (
          <div className="text-center text-amber-400/50 py-12">読み込み中…</div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {profiles.map((profile, i) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.02, x: 6 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(profile)}
                  className="w-full text-left flex items-center gap-4 px-5 py-4 rounded-2xl group cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(254,250,237,0.12) 0%, rgba(254,250,237,0.06) 100%)',
                    border: '1px solid rgba(251,191,36,0.25)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-amber-100 text-lg leading-tight"
                      style={{ fontFamily: 'Georgia, serif' }}>
                      {profile.name}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(profile.id, e)}
                    className="p-2.5 rounded-xl text-rose-400 bg-rose-900/30 border border-rose-500/30 active:scale-95 transition-transform"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Create new profile button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreate(true)}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-amber-300 border-2 border-dashed border-amber-500/30 hover:border-amber-400/50 transition-colors"
            >
              <Plus className="w-5 h-5" />
              新しい冒険者を追加
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowCreate(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-x-4 bottom-4 z-50 max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: 'linear-gradient(160deg, #fefaed 0%, #fdf4d8 60%, #f9ecbc 100%)', border: '2px solid rgba(146,64,14,0.3)' }}
            >
              <div className="px-6 py-6 space-y-5">
                <h2 className="text-xl font-black text-amber-950 text-center" style={{ fontFamily: 'Georgia, serif' }}>
                  新しい冒険者
                </h2>

                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-amber-800 mb-1.5 uppercase tracking-wider">
                      冒険者の名前
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="例：たろう"
                      required
                      maxLength={20}
                      className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 bg-amber-50/50 text-amber-950 placeholder-amber-400 focus:outline-none focus:border-amber-500 text-sm"
                    />
                  </div>

                  {createError && (
                    <p className="text-xs text-rose-600 font-semibold text-center bg-rose-50 rounded-lg py-2 px-3">
                      ⚠️ {createError}
                    </p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setShowCreate(false); setCreateError(null); }}
                      className="flex-1 py-3 rounded-xl border border-amber-300 text-amber-800 text-sm font-semibold"
                    >
                      キャンセル
                    </button>
                    <motion.button
                      type="submit"
                      disabled={creating || !newName.trim()}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 py-3 rounded-xl font-black text-white text-sm disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, #92400e, #d97706)' }}
                    >
                      {creating ? '作成中…' : '冒険を始める！'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
