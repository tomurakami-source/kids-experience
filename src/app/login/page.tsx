'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

interface StarData {
  width: number; height: number; top: string; left: string; duration: number; delay: number;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [stars, setStars] = useState<StarData[]>([]);
  const supabase = createClient();

  useEffect(() => {
    setStars([...Array(20)].map(() => ({
      width: Math.random() * 3 + 1,
      height: Math.random() * 3 + 1,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 3,
    })));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('sending');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        console.error('OTP error:', error);
        setErrorMessage(error.message);
        setStatus('error');
      } else {
        setStatus('sent');
      }
    } catch (err) {
      console.error('OTP exception:', err);
      setErrorMessage(err instanceof Error ? err.message : 'ネットワークエラー');
      setStatus('error');
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: `
          repeating-linear-gradient(45deg, transparent 0, transparent 8px, rgba(160,120,60,0.025) 8px, rgba(160,120,60,0.025) 9px),
          repeating-linear-gradient(-45deg, transparent 0, transparent 8px, rgba(160,120,60,0.025) 8px, rgba(160,120,60,0.025) 9px),
          linear-gradient(160deg, #1a0a2e 0%, #16213e 40%, #0f3460 100%)
        `,
      }}
    >
      {/* Stars background */}
      {stars.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{ width: s.width, height: s.height, top: s.top, left: s.left }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Door frame */}
        <div
          className="rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(160deg, #fefaed 0%, #fdf4d8 60%, #f9ecbc 100%)',
            border: '3px solid rgba(146,64,14,0.4)',
            boxShadow: '0 0 60px rgba(251,191,36,0.15), 0 24px 48px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div
            className="px-8 py-8 text-center"
            style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0f3460 100%)' }}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="text-6xl mb-3"
            >
              🗝️
            </motion.div>
            <h1 className="text-2xl font-black text-amber-200" style={{ fontFamily: 'Georgia, serif' }}>
              秘密の扉
            </h1>
            <p className="text-amber-400/70 text-sm mt-1">
              冒険の書へようこそ
            </p>
          </div>

          <div className="px-8 py-8 space-y-6">
            <p className="text-center text-sm text-amber-900/70 leading-relaxed">
              メールアドレスを入力すると、<br />
              魔法のリンクをお送りします。
            </p>

            <AnimatePresence mode="wait">
              {status === 'sent' ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6 space-y-3"
                >
                  <div className="text-5xl">📬</div>
                  <p className="font-black text-amber-900" style={{ fontFamily: 'Georgia, serif' }}>
                    魔法のリンクを送りました！
                  </p>
                  <p className="text-xs text-amber-700/70 leading-relaxed">
                    {email} に届いたメールのリンクをクリックしてください。
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-amber-800 mb-1.5 uppercase tracking-wider">
                      メールアドレス
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="adventure@example.com"
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 bg-amber-50/50 text-amber-950 placeholder-amber-400 focus:outline-none focus:border-amber-500 text-sm"
                    />
                  </div>

                  {status === 'error' && (
                    <div className="text-xs text-rose-600 font-semibold text-center space-y-1">
                      <p>送信に失敗しました。もう一度お試しください。</p>
                      {errorMessage && (
                        <p className="text-rose-500 font-normal">{errorMessage}</p>
                      )}
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={status === 'sending'}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-2xl font-black text-white text-base shadow-lg disabled:opacity-60"
                    style={{
                      background: 'linear-gradient(135deg, #92400e 0%, #b45309 50%, #d97706 100%)',
                      boxShadow: '0 4px 20px rgba(180,83,9,0.4)',
                    }}
                  >
                    {status === 'sending' ? '送信中…' : '🗝️ 扉を開く'}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-amber-400/40 text-xs mt-6">
          Season 1: Global Adventure
        </p>
      </motion.div>
    </div>
  );
}
