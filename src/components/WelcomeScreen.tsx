'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface StarData {
  width: number; height: number; top: string; left: string; duration: number; delay: number;
}

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [stars, setStars] = useState<StarData[]>([]);

  useEffect(() => {
    setStars([...Array(30)].map(() => ({
      width: Math.random() * 3 + 1,
      height: Math.random() * 3 + 1,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 4,
    })));
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center gap-8 max-w-sm w-full text-center relative"
      >
        {/* Book icon */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-8xl"
        >
          📖
        </motion.div>

        {/* Title */}
        <div className="space-y-2">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-amber-400/70 text-sm font-bold tracking-widest uppercase"
          >
            Season 1
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-black text-amber-100 leading-tight"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            冒険の書
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-amber-300/80 text-base font-semibold"
          >
            Global Adventure
          </motion.p>
        </div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-3 px-2"
        >
          <p className="text-amber-100/80 text-sm leading-relaxed">
            世界20のクエストに挑戦して、<br />
            本物の冒険者になろう。
          </p>
          <div className="flex justify-center gap-6 text-xs text-amber-400/60 font-semibold">
            <span>🌿 自然・生存</span>
            <span>🌍 社会・多様性</span>
          </div>
          <div className="flex justify-center gap-6 text-xs text-amber-400/60 font-semibold">
            <span>💰 自立・経済</span>
            <span>🔥 精神・レジリエンス</span>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="w-full py-5 rounded-2xl font-black text-white text-lg shadow-2xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #92400e 0%, #b45309 50%, #d97706 100%)',
            boxShadow: '0 8px 32px rgba(180,83,9,0.5)',
          }}
        >
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}
          />
          <span className="relative z-10">無料で冒険を始める ✨</span>
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-amber-400/40 text-xs"
        >
          対象年齢：5〜12歳（保護者同伴推奨）
        </motion.p>
      </motion.div>
    </div>
  );
}
