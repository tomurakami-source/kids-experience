'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Leaf, Globe, Coins, Flame } from 'lucide-react';

function CornerOrnament({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const rotations = { tl: 0, tr: 90, br: 180, bl: 270 };
  const placements = {
    tl: { top: 0, left: 0 },
    tr: { top: 0, right: 0 },
    br: { bottom: 0, right: 0 },
    bl: { bottom: 0, left: 0 },
  };
  return (
    <div className="absolute w-10 h-10 pointer-events-none" style={{ ...placements[pos], zIndex: 2 }}>
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ transform: `rotate(${rotations[pos]}deg)` }}>
        <path d="M4 4 L4 18" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4 4 L18 4" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4 4 Q14 4 14 14" stroke="#b45309" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
        <circle cx="4" cy="4" r="2.5" fill="#92400e" />
        <circle cx="22" cy="4" r="1" fill="#b45309" opacity="0.5" />
        <circle cx="4" cy="22" r="1" fill="#b45309" opacity="0.5" />
        <path d="M8 4 Q11 7 8 10" stroke="#b45309" strokeWidth="0.8" fill="none" opacity="0.5" />
      </svg>
    </div>
  );
}

interface GlobalAdventureIntroProps {
  onBack: () => void;
  onNext?: () => void;
}

const PAGE_STYLE = {
  background: `
    repeating-linear-gradient(0deg, transparent 0, transparent 23px, rgba(160,120,60,0.07) 23px, rgba(160,120,60,0.07) 24px),
    linear-gradient(160deg, #fefaed 0%, #fdf4d8 60%, #f9ecbc 100%)
  `,
};

const DIVIDER = (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(146,64,14,0.35))' }} />
    <span className="text-amber-800/50 text-sm">⚜</span>
    <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(146,64,14,0.35))' }} />
  </div>
);

export default function GlobalAdventureIntro({ onBack, onNext }: GlobalAdventureIntroProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onBack(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onBack]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col p-4 sm:p-6 md:p-8"
      style={{
        background: `
          repeating-linear-gradient(45deg, transparent 0, transparent 8px, rgba(160,120,60,0.025) 8px, rgba(160,120,60,0.025) 9px),
          repeating-linear-gradient(-45deg, transparent 0, transparent 8px, rgba(160,120,60,0.025) 8px, rgba(160,120,60,0.025) 9px),
          linear-gradient(160deg, #fdf3dc 0%, #f8e8c0 35%, #f0dca8 65%, #e8d49a 100%)
        `,
      }}
    >
      {/* Back button */}
      <motion.button
        onClick={onBack}
        whileHover={{ scale: 1.05, x: -3 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-5 self-start"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        <ChevronLeft className="w-5 h-5" />
        <span style={{ borderBottom: '1px solid rgba(146,64,14,0.4)' }}>目次に戻る</span>
      </motion.button>

      <div className="flex-1 flex items-center justify-center px-2 sm:px-4">
        <motion.div
          initial={{ opacity: 0, rotateY: 15 }}
          animate={{ opacity: 1, rotateY: 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
          className="w-full max-w-5xl"
        >
          {/* Book spread */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 relative shadow-2xl"
            style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.25))' }}
          >
            {/* Spine */}
            <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-3 z-10"
              style={{ background: 'linear-gradient(90deg, #7c3002, #b45309, #92400e, #7c3002)', boxShadow: '0 0 12px rgba(0,0,0,0.4)' }} />

            {/* ====== LEFT PAGE — なぜ20クエストか ====== */}
            <div
              className="relative md:rounded-l-2xl overflow-hidden border-2 border-amber-900/30 md:border-r-0 p-6 md:p-8 flex flex-col"
              style={{ ...PAGE_STYLE, boxShadow: 'inset -6px 0 18px rgba(0,0,0,0.06)', minHeight: 580 }}
            >
              <CornerOrnament pos="tl" /><CornerOrnament pos="tr" />
              <CornerOrnament pos="bl" /><CornerOrnament pos="br" />

              <div className="relative z-10 flex flex-col h-full gap-4">
                {/* Title */}
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-700/60 mb-2"
                    style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.2em' }}>Season 1</p>
                  {DIVIDER}
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-4xl my-2">🌍</motion.div>
                  <h2 className="text-xl md:text-2xl font-black text-amber-950 leading-snug"
                    style={{ fontFamily: 'Georgia, serif' }}>
                    なぜ、この20クエストなのか？
                  </h2>
                </div>

                <div className="flex items-center gap-2 px-4">
                  <div className="flex-1 h-px bg-amber-800/15" /><span className="text-amber-700/30 text-xs">✦</span>
                  <div className="flex-1 h-px bg-amber-800/15" />
                </div>

                {/* 3 references */}
                <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                  <p className="text-xs text-amber-950/75 leading-relaxed">
                    「学校の成績だけでは測れない力」が時代を生き抜くカギ——世界の教育研究はそう示しています。この20クエストは3つの国際指針をもとに設計されました。
                  </p>
                  {[
                    {
                      icon: '📘',
                      title: 'OECD Education 2030',
                      subtitle: '非認知能力の育成',
                      body: '自己調整力・協働・責任ある行動を核とするコンピテンシー指針。「精神・レジリエンス」「自立・経済」カテゴリーが直接対応します。',
                    },
                    {
                      icon: '🌐',
                      title: 'SDGs × グローバル・シチズンシップ教育',
                      subtitle: 'ユネスコ GCED',
                      body: '多様性の尊重・共感・社会参加を学びの中心に。「社会・多様性」クエストは異文化・異世代との実際の接触で市民力を育みます。',
                    },
                    {
                      icon: '🌿',
                      title: 'National Trust — 50 Things',
                      subtitle: '自然体験指針',
                      body: '直接的な自然との関わりが自己効力感・問題解決力に直結。「自然・生存」クエストは都市でも実践できる形に落とし込んでいます。',
                    },
                  ].map(({ icon, title, subtitle, body }) => (
                    <div key={title} className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 space-y-1">
                      <div className="flex items-start gap-2">
                        <span className="text-base shrink-0">{icon}</span>
                        <div>
                          <p className="text-xs font-black text-amber-900">{title}</p>
                          <p className="text-xs text-amber-700/70 font-semibold">{subtitle}</p>
                        </div>
                      </div>
                      <p className="text-xs text-amber-950/70 leading-relaxed">{body}</p>
                    </div>
                  ))}
                  <div className="pt-1 space-y-0.5">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">参考文献</p>
                    {[
                      'OECD (2019). OECD Learning Compass 2030.',
                      'UNESCO (2014). Global Citizenship Education.',
                      'National Trust (2012). Natural Childhood Report.',
                    ].map((ref) => (
                      <p key={ref} className="text-xs text-amber-800/50">・{ref}</p>
                    ))}
                  </div>
                </div>

                {/* Category pills */}
                <div className="grid grid-cols-2 gap-1.5 pt-3" style={{ borderTop: '1px solid rgba(146,64,14,0.2)' }}>
                  {[
                    { Icon: Leaf, label: '自然・生存', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
                    { Icon: Globe, label: '社会・多様性', color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200' },
                    { Icon: Coins, label: '自立・経済', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
                    { Icon: Flame, label: '精神・レジリエンス', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
                  ].map(({ Icon, label, color, bg }) => (
                    <div key={label} className={`rounded-lg border px-2 py-1.5 flex items-center gap-1.5 ${bg}`}>
                      <Icon className={`w-3 h-3 shrink-0 ${color}`} />
                      <span className={`text-xs font-bold ${color}`}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ====== RIGHT PAGE — 設計思想 ====== */}
            <div
              className="relative md:rounded-r-2xl overflow-hidden border-2 border-amber-900/30 md:border-l-0 p-6 md:p-8 flex flex-col"
              style={{ ...PAGE_STYLE, boxShadow: 'inset 6px 0 18px rgba(0,0,0,0.04)', minHeight: 580 }}
            >
              <CornerOrnament pos="tl" /><CornerOrnament pos="tr" />
              <CornerOrnament pos="bl" /><CornerOrnament pos="br" />

              <div className="relative z-10 flex flex-col h-full gap-4">
                {/* Title */}
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-700/60 mb-2"
                    style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.2em' }}>設計思想</p>
                  {DIVIDER}
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="text-4xl my-2">🚀</motion.div>
                  <h2 className="text-xl md:text-2xl font-black text-amber-950 leading-snug"
                    style={{ fontFamily: 'Georgia, serif' }}>
                    コンフォートゾーンを<br />飛び出すスイッチ
                  </h2>
                </div>

                <div className="flex items-center gap-2 px-4">
                  <div className="flex-1 h-px bg-amber-800/15" /><span className="text-amber-700/30 text-xs">✦</span>
                  <div className="flex-1 h-px bg-amber-800/15" />
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                  <p className="text-xs text-amber-950/75 leading-relaxed">
                    これらは日常のルーチンではなく、<span className="font-bold text-amber-900">安全地帯を飛び出すスイッチ</span>です。一度の体験が子どもの世界の見え方を永続的に変えます。
                  </p>
                  {[
                    {
                      emoji: '🏆',
                      title: '成功体験の刻印',
                      body: '「一人で電車に乗れた」「火を起こせた」という強烈な成功体験は、「自分ならできる」という自己効力感として生涯残ります。',
                      bg: 'bg-amber-50/80 border-amber-200',
                    },
                    {
                      emoji: '👁️',
                      title: '視点の変化',
                      body: '「異文化の聖地」を訪れた子は、次から外国人を「知らない怖い人」ではなく「物語を持った隣人」として見るようになります。一度でOSがアップデートされるのです。',
                      bg: 'bg-sky-50/80 border-sky-200',
                    },
                    {
                      emoji: '🔄',
                      title: '継続すべきは「マインドセット」',
                      body: 'クエストは一度クリアすれば終了。しかし「未知に挑戦するワクワク感」は、日常のあらゆる場面で継続的に発揮されるようになります。',
                      bg: 'bg-emerald-50/80 border-emerald-200',
                    },
                  ].map(({ emoji, title, body, bg }) => (
                    <div key={title} className={`rounded-xl border p-3 space-y-1 ${bg}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{emoji}</span>
                        <p className="font-black text-sm text-amber-950" style={{ fontFamily: 'Georgia, serif' }}>{title}</p>
                      </div>
                      <p className="text-xs text-amber-950/75 leading-relaxed">{body}</p>
                    </div>
                  ))}

                  <div className="rounded-xl p-3 text-center"
                    style={{ background: 'linear-gradient(135deg, rgba(146,64,14,0.08) 0%, rgba(180,83,9,0.06) 100%)', border: '1px solid rgba(146,64,14,0.2)' }}>
                    <p className="text-xs font-bold text-amber-900" style={{ fontFamily: 'Georgia, serif' }}>
                      「クエストは終わる。でも、冒険者は終わらない。」
                    </p>
                  </div>

                  <a
                    href="https://note.com/mstar_page/n/na112eb485eb4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 text-xs text-amber-700/70 hover:text-amber-900 transition-colors underline underline-offset-2"
                  >
                    📝 開発者のnoteを読む
                  </a>
                </div>

                {/* Next button */}
                {onNext && (
                  <motion.button
                    onClick={onNext}
                    whileHover={{ scale: 1.03, x: 2 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-amber-900 border border-amber-300 bg-amber-100 hover:bg-amber-200 transition-colors mt-2"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    さあ、冒険を始めよう
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
