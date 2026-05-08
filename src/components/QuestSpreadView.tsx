'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Camera, Users, Star,
  Sparkles, RefreshCw, CheckCircle, XCircle, Loader2,
} from 'lucide-react';
import { Quest, getConfig, getDifficultyStars } from './questUtils';
import CelebrationEffects from './CelebrationEffects';

const CATEGORY_PLACEHOLDERS: Record<string, string> = {
  '自然・生存': '🌿',
  '社会・多様性': '🌍',
  '自立・経済': '💰',
  '精神・レジリエンス': '🔥',
  'チュートリアル': '✌️',
};

type Phase = 'idle' | 'preview' | 'judging' | 'success' | 'failure';

interface JudgeResult {
  success: boolean;
  feedback: string;
  photoUrl?: string | null;
}

interface QuestSpreadViewProps {
  quest: Quest;
  isCompleted: boolean;
  completedPhotoUrl?: string | null;
  completedAiComment?: string | null;
  onBack: () => void;
  onQuestComplete: (questId: number, photoUrl?: string | null, aiComment?: string | null) => void;
  onPrev?: () => void;
  onNext?: () => void;
  profileId: string;
}

// Ink-drawn decorative corner ornament
function CornerOrnament({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const rotations = { tl: 0, tr: 90, br: 180, bl: 270 };
  const placements = {
    tl: { top: 0, left: 0 },
    tr: { top: 0, right: 0 },
    br: { bottom: 0, right: 0 },
    bl: { bottom: 0, left: 0 },
  };
  return (
    <div
      className="absolute w-10 h-10 pointer-events-none"
      style={{ ...placements[pos], zIndex: 2 }}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: `rotate(${rotations[pos]}deg)` }}
      >
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

function playSound(src: string) {
  const audio = new Audio(src);
  audio.play().catch(() => {});
}

function triggerVibration() {
  if (navigator.vibrate) {
    navigator.vibrate([50, 30, 50]);
  }
}

async function compressImage(file: File): Promise<{ data: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1024;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('canvas error')); return; }
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve({ data: dataUrl.split(',')[1], mediaType: 'image/jpeg' });
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function QuestSpreadView({
  quest,
  isCompleted,
  completedPhotoUrl,
  completedAiComment,
  onBack,
  onQuestComplete,
  onPrev,
  onNext,
  profileId,
}: QuestSpreadViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    setPhase('idle');
    setPreviewUrl(null);
    setPreviewFile(null);
    setJudgeResult(null);
    setShowCelebration(false);
  }, [quest?.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onBack(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onBack]);

  const handleCameraClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPreviewFile(file);
    setPhase('preview');
    e.target.value = '';
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!previewFile) return;
    setPhase('judging');

    try {
      const { data, mediaType } = await compressImage(previewFile);
      const res = await fetch('/api/quests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId: quest.id, imageData: data, mediaType, profileId }),
      });
      const json = await res.json() as JudgeResult & { alreadyCompleted?: boolean; photoUrl?: string | null };
      console.log('[QuestSpread] API response:', JSON.stringify({ success: json.success, photoUrl: json.photoUrl, feedback: json.feedback }));

      setJudgeResult({ success: json.success, feedback: json.feedback, photoUrl: json.photoUrl });
      if (json.success) {
        setPhase('success');
        setShowCelebration(true);
        playSound('/sounds/success.wav');
        triggerVibration();
        console.log('[QuestSpread] calling onQuestComplete with photoUrl:', json.photoUrl);
        onQuestComplete(quest.id, json.photoUrl ?? null, json.feedback ?? null);
      } else {
        setPhase('failure');
        playSound('/sounds/failure.wav');
      }
    } catch {
      setJudgeResult({ success: false, feedback: 'ネットワークエラーが起きたよ！もう一度試してみて！' });
      setPhase('failure');
    }
  }, [previewFile, quest.id, onQuestComplete]);

  const handleRetry = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewFile(null);
    setJudgeResult(null);
    setPhase('idle');
  }, [previewUrl]);

  const handleDebugComplete = useCallback(async () => {
    setPhase('judging');
    const DUMMY_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    try {
      const res = await fetch('/api/quests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId: quest.id, imageData: DUMMY_PNG, mediaType: 'image/png', profileId, debugForceSuccess: true }),
      });
      const json = await res.json() as JudgeResult & { photoUrl?: string | null };
      const feedback = '[DEV] デバッグ達成。本番では写真審査が必要です。';
      setJudgeResult({ success: true, feedback, photoUrl: json.photoUrl });
      setPhase('success');
      setShowCelebration(true);
      playSound('/sounds/success.wav');
      triggerVibration();
      onQuestComplete(quest.id, json.photoUrl ?? null, feedback);
    } catch {
      setJudgeResult({ success: true, feedback: '[DEV] デバッグ達成。本番では写真審査が必要です。' });
      setPhase('success');
      setShowCelebration(true);
      playSound('/sounds/success.wav');
      triggerVibration();
      onQuestComplete(quest.id, null, null);
    }
  }, [quest.id, profileId, onQuestComplete]);

  const cfg = getConfig(quest.category);
  const starCount = getDifficultyStars(quest.difficulty);
  const placeholderEmoji = CATEGORY_PLACEHOLDERS[quest.category] ?? '✨';

  return (
    <>
      <CelebrationEffects isActive={showCelebration} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Parchment background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen flex flex-col p-4 sm:p-6 md:p-8 relative"
        style={{
          background: `
            repeating-linear-gradient(45deg, transparent 0, transparent 8px, rgba(160,120,60,0.025) 8px, rgba(160,120,60,0.025) 9px),
            repeating-linear-gradient(-45deg, transparent 0, transparent 8px, rgba(160,120,60,0.025) 8px, rgba(160,120,60,0.025) 9px),
            linear-gradient(160deg, #fdf3dc 0%, #f8e8c0 35%, #f0dca8 65%, #e8d49a 100%)
          `,
        }}
      >
        {/* Decorative back button */}
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
            exit={{ opacity: 0, rotateY: -15 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
            className="w-full max-w-5xl"
          >
            {/* Book spread */}
            <div className="grid grid-cols-1 md:grid-cols-2 relative shadow-2xl"
              style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.25))' }}
            >
              {/* Book spine (md+) */}
              <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-3 z-10"
                style={{
                  background: 'linear-gradient(90deg, #7c3002, #b45309, #92400e, #7c3002)',
                  boxShadow: '0 0 12px rgba(0,0,0,0.4)',
                }}
              />

              {/* ====== LEFT PAGE — all quest text ====== */}
              <div
                className="relative md:rounded-l-2xl overflow-hidden border-2 border-amber-900/30 md:border-r-0 min-h-[500px] md:min-h-[600px] p-6 md:p-8 flex flex-col"
                style={{
                  background: `
                    repeating-linear-gradient(0deg, transparent 0, transparent 23px, rgba(160,120,60,0.07) 23px, rgba(160,120,60,0.07) 24px),
                    linear-gradient(160deg, #fefaed 0%, #fdf4d8 60%, #f9ecbc 100%)
                  `,
                  boxShadow: 'inset -6px 0 18px rgba(0,0,0,0.06)',
                }}
              >
                <CornerOrnament pos="tl" />
                <CornerOrnament pos="tr" />
                <CornerOrnament pos="bl" />
                <CornerOrnament pos="br" />

                <div className="relative z-10 flex flex-col h-full">
                  {/* Category + Quest # */}
                  <div className="text-center mb-3">
                    <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${cfg.iconColor}`}
                      style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.2em' }}>
                      {quest.category}
                    </p>
                    <p className="text-xs text-amber-700/60 font-mono">Quest #{String(quest.id).padStart(2, '0')}</p>
                  </div>

                  {/* Ornamental divider */}
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(146,64,14,0.35))' }} />
                    <span className="text-amber-800/50 text-sm">⚜</span>
                    <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(146,64,14,0.35))' }} />
                  </div>

                  {/* Animated icon + title */}
                  <div className="text-center mb-5">
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.06, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="text-5xl mb-3"
                      >
                        {placeholderEmoji}
                      </motion.div>
                    </motion.div>
                    <div className="h-14 md:h-[4.25rem] flex items-center justify-center overflow-hidden">
                      <h2 className="text-xl md:text-2xl font-black text-amber-950 leading-snug px-2 line-clamp-2 text-center"
                        style={{ fontFamily: 'Georgia, serif' }}>
                        {quest.title}
                      </h2>
                    </div>
                  </div>

                  {/* Thin divider */}
                  <div className="flex items-center gap-2 mb-4 px-4">
                    <div className="flex-1 h-px bg-amber-800/15" />
                    <span className="text-amber-700/30 text-xs">✦</span>
                    <div className="flex-1 h-px bg-amber-800/15" />
                  </div>

                  {/* All text sections */}
                  <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                    <section>
                      <h4 className="text-xs font-bold text-amber-900/55 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                        <span>📜</span> クエスト説明
                      </h4>
                      <p className="text-sm text-amber-950/75 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                        {quest.description}
                      </p>
                    </section>

                    <section className={`rounded-xl p-3 border ${cfg.sectionBg} ${cfg.sectionBorder}`}>
                      <h4 className={`text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1 ${cfg.sectionText}`}>
                        <Users className="w-3 h-3" />
                        親のガイド
                      </h4>
                      <p className={`text-xs leading-relaxed ${cfg.sectionText}`}>
                        {quest.parent_guide}
                      </p>
                    </section>

                    <section className="rounded-xl p-3 border bg-slate-50/80 border-slate-200">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        写真の条件
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {quest.photo_criteria}
                      </p>
                    </section>

                    <section className="rounded-xl p-3 border bg-indigo-50/80 border-indigo-100">
                      <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        成長ポイント
                      </h4>
                      <p className="text-xs font-semibold text-indigo-800">
                        {quest.growth_point}
                      </p>
                    </section>
                  </div>

                  {/* Difficulty stars */}
                  <div className="pt-3 mt-3 flex items-center justify-center gap-1"
                    style={{ borderTop: '1px solid rgba(146,64,14,0.2)' }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < starCount ? cfg.iconColor : 'text-gray-300'}`}
                        fill={i < starCount ? 'currentColor' : 'none'}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* ====== RIGHT PAGE — photo only ====== */}
              <div
                className="relative md:rounded-r-2xl overflow-hidden border-2 border-amber-900/30 md:border-l-0 min-h-[500px] md:min-h-[600px] p-6 md:p-8 flex flex-col items-center"
                style={{
                  background: `
                    repeating-linear-gradient(0deg, transparent 0, transparent 23px, rgba(160,120,60,0.07) 23px, rgba(160,120,60,0.07) 24px),
                    linear-gradient(160deg, #fefaed 0%, #fdf4d8 60%, #f9ecbc 100%)
                  `,
                  boxShadow: 'inset 6px 0 18px rgba(0,0,0,0.04)',
                }}
              >
                <CornerOrnament pos="tl" />
                <CornerOrnament pos="tr" />
                <CornerOrnament pos="bl" />
                <CornerOrnament pos="br" />

                <div className="relative z-10 flex flex-col items-center w-full h-full">
                  {/* Page header */}
                  <p className="text-xs font-bold text-amber-800/55 uppercase tracking-widest mb-4"
                    style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.2em' }}>
                    冒険の証
                  </p>

                  {/* ── Photo area: album view (completed) or polaroid (in-progress) ── */}
                  <div className="flex-1 flex flex-col items-center justify-center w-full mb-5">

                    {/* COMPLETED ALBUM VIEW */}
                    {isCompleted && completedPhotoUrl && phase === 'idle' ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full flex flex-col items-center gap-3"
                      >
                        {/* Large album photo */}
                        <motion.div
                          animate={{ rotate: [-1, 0.5, -1] }}
                          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                          className="relative w-full max-w-xs"
                          style={{
                            background: '#fffef5',
                            padding: '8px 8px 44px 8px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(0,0,0,0.05)',
                          }}
                        >
                          {/* Tape corners */}
                          <div className="absolute -top-3 left-6 w-12 h-5 opacity-50 rotate-[-8deg]"
                            style={{ background: 'rgba(255,240,120,0.9)' }} />
                          <div className="absolute -top-3 right-6 w-12 h-5 opacity-50 rotate-[6deg]"
                            style={{ background: 'rgba(255,240,120,0.9)' }} />

                          <img
                            src={completedPhotoUrl}
                            alt="冒険の証"
                            className="w-full object-cover"
                            style={{ aspectRatio: '1' }}
                          />

                          {/* Stamp overlay */}
                          <div className="absolute bottom-10 right-2 rotate-[-12deg]">
                            <div className="border-4 border-emerald-500 rounded px-2 py-0.5 opacity-80">
                              <span className="text-emerald-600 font-black text-xs tracking-widest">CLEAR!</span>
                            </div>
                          </div>

                          {/* Caption */}
                          <div className="text-center pt-2 pb-0.5">
                            <p className="text-xs font-bold text-gray-400 tracking-widest truncate"
                              style={{ fontFamily: 'monospace' }}>
                              ★ COMPLETED ★
                            </p>
                          </div>
                        </motion.div>

                        {/* AI comment card */}
                        {completedAiComment && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="w-full max-w-xs rounded-2xl px-4 py-3 border border-emerald-200"
                            style={{ background: 'rgba(236,253,245,0.9)' }}
                          >
                            <p className="text-xs text-emerald-800 text-center leading-relaxed"
                              style={{ fontFamily: 'Georgia, serif' }}>
                              ✨ {completedAiComment}
                            </p>
                          </motion.div>
                        )}
                      </motion.div>

                    ) : (
                      /* POLAROID (in-progress / no photo) */
                      <motion.div
                        animate={{ rotate: [-1.5, -0.5, -1.5] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                        className="relative w-full max-w-xs"
                        style={{
                          background: '#fffef5',
                          padding: '10px 10px 52px 10px',
                          boxShadow: '0 6px 20px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.10), inset 0 0 0 1px rgba(0,0,0,0.06)',
                        }}
                      >
                        {/* Photo area */}
                        <div className="w-full relative overflow-hidden bg-gray-200" style={{ aspectRatio: '1', minHeight: 200 }}>
                          <AnimatePresence mode="wait">
                            {/* IDLE: empty placeholder */}
                            {phase === 'idle' && (
                              <motion.div
                                key="idle-placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                                style={{ background: 'linear-gradient(135deg, #ececec 0%, #dcdcdc 100%)' }}
                              >
                                <motion.div
                                  animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.75, 0.45] }}
                                  transition={{ duration: 2.5, repeat: Infinity }}
                                  className="text-5xl"
                                >
                                  📸
                                </motion.div>
                                <p className="text-xs text-gray-400 font-bold text-center px-6 leading-relaxed">
                                  ここに冒険の<br />写真が入るよ！
                                </p>
                              </motion.div>
                            )}

                            {/* PREVIEW: photo */}
                            {(phase === 'preview' || phase === 'judging') && previewUrl && (
                              <motion.img
                                key="preview-photo"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                src={previewUrl}
                                alt="プレビュー"
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            )}

                            {/* JUDGING overlay */}
                            {phase === 'judging' && (
                              <motion.div
                                key="judging-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40"
                              >
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                                >
                                  <Loader2 className="w-12 h-12 text-white" />
                                </motion.div>
                                <p className="text-sm font-black text-white drop-shadow">AIが判定中…</p>
                              </motion.div>
                            )}

                            {/* SUCCESS */}
                            {phase === 'success' && (
                              <motion.div
                                key="success-frame"
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-emerald-100"
                              >
                                {previewUrl && (
                                  <img src={previewUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
                                )}
                                <div className="relative z-10 flex flex-col items-center gap-2 px-4 text-center">
                                  <CheckCircle className="w-14 h-14 text-emerald-500" strokeWidth={1.5} />
                                  <p className="text-xl font-black text-emerald-700">クリア！</p>
                                  {judgeResult && (
                                    <p className="text-xs text-emerald-800 leading-relaxed">{judgeResult.feedback}</p>
                                  )}
                                </div>
                              </motion.div>
                            )}

                            {/* FAILURE */}
                            {phase === 'failure' && (
                              <motion.div
                                key="failure-frame"
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-rose-100"
                              >
                                {previewUrl && (
                                  <img src={previewUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                                )}
                                <div className="relative z-10 flex flex-col items-center gap-2 px-4 text-center">
                                  <XCircle className="w-14 h-14 text-rose-400" strokeWidth={1.5} />
                                  <p className="text-lg font-black text-rose-600">もう少し！</p>
                                  {judgeResult && (
                                    <p className="text-xs text-rose-800 leading-relaxed">{judgeResult.feedback}</p>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Polaroid caption strip */}
                        <div className="text-center pt-1 pb-1">
                          <p className="text-xs text-gray-400 font-bold tracking-widest truncate"
                            style={{ fontFamily: 'monospace' }}>
                            {isCompleted ? '★ COMPLETED ★' : quest.title.substring(0, 14) + '…'}
                          </p>
                        </div>

                        {/* Tape strip decoration */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-5 opacity-40"
                          style={{ background: 'rgba(255,240,150,0.9)', transform: 'translateX(-50%) rotate(-2deg)' }}
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* ── Action buttons ── */}
                  <div className="w-full max-w-xs">
                    <AnimatePresence mode="wait">

                      {isCompleted && phase === 'idle' && (
                        <motion.div key="completed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="text-center text-emerald-600 font-bold text-sm py-3">
                          ✨ このクエストはクリア済みです！
                        </motion.div>
                      )}

                      {/* MAGIC CRYSTAL CAMERA BUTTON */}
                      {!isCompleted && phase === 'idle' && (
                        <motion.div key="magic-camera" className="space-y-2">
                          <motion.button
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={handleCameraClick}
                            className="relative w-full py-5 rounded-2xl font-black text-white overflow-hidden"
                            style={{
                              background: 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 45%, #0ea5e9 100%)',
                              boxShadow: '0 0 24px rgba(109,40,217,0.5), 0 0 48px rgba(79,70,229,0.25), 0 8px 24px rgba(0,0,0,0.3)',
                            }}
                          >
                            {/* Shimmer sweep */}
                            <motion.div
                              animate={{ x: ['-120%', '220%'] }}
                              transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 0.5 }}
                              className="absolute inset-0 skew-x-12"
                              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
                            />
                            {/* Pulsing glow ring */}
                            <motion.div
                              animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.04, 1] }}
                              transition={{ duration: 1.8, repeat: Infinity }}
                              className="absolute inset-0 rounded-2xl"
                              style={{ boxShadow: 'inset 0 0 20px rgba(167,139,250,0.4)' }}
                            />
                            <span className="relative z-10 flex items-center justify-center gap-2 text-base">
                              <span className="text-2xl">💎</span>
                              <span>魔法のカメラで記録する！</span>
                              <span className="text-xl">✨</span>
                            </span>
                          </motion.button>
                          {process.env.NODE_ENV === 'development' && (
                            <button
                              onClick={handleDebugComplete}
                              className="w-full py-1.5 rounded-xl border border-dashed border-gray-400 text-gray-500 text-xs font-mono hover:bg-gray-100"
                            >
                              [DEV] 写真なしで達成
                            </button>
                          )}
                        </motion.div>
                      )}

                      {phase === 'preview' && (
                        <motion.div key="preview-btns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSubmit}
                            className={`w-full py-3.5 rounded-xl bg-gradient-to-r ${cfg.stripe} text-white font-black text-sm shadow-lg`}
                          >
                            <Sparkles className="w-4 h-4 inline mr-2" />
                            クリア判定する！
                          </motion.button>
                          <button onClick={handleRetry}
                            className="w-full py-2 rounded-xl border border-amber-300 text-amber-800 text-xs font-semibold hover:bg-amber-50">
                            <RefreshCw className="w-3 h-3 inline mr-1" />
                            撮り直す
                          </button>
                        </motion.div>
                      )}

                      {phase === 'success' && (
                        <motion.button key="success-btn" whileTap={{ scale: 0.95 }} onClick={onBack}
                          className="w-full py-3 rounded-xl bg-emerald-500 text-white font-black text-sm shadow-lg">
                          <CheckCircle className="w-4 h-4 inline mr-2" />
                          目次に戻る
                        </motion.button>
                      )}

                      {phase === 'failure' && (
                        <motion.div key="failure-btns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                          <motion.button whileTap={{ scale: 0.95 }} onClick={handleCameraClick}
                            className={`w-full py-3 rounded-xl bg-gradient-to-r ${cfg.stripe} text-white font-black text-sm shadow-lg`}>
                            <Camera className="w-4 h-4 inline mr-2" />
                            もう一回！
                          </motion.button>
                          <button onClick={onBack}
                            className="w-full py-2 rounded-xl border border-amber-300 text-amber-800 text-xs font-semibold hover:bg-amber-50">
                            あとでチャレンジ
                          </button>
                          {process.env.NODE_ENV === 'development' && (
                            <button
                              onClick={handleDebugComplete}
                              className="w-full py-1.5 rounded-xl border border-dashed border-gray-400 text-gray-500 text-xs font-mono hover:bg-gray-100"
                            >
                              [DEV] 写真なしで達成
                            </button>
                          )}
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>

        {/* Prev / Next navigation */}
        {(onPrev || onNext) && (
          <div className="flex items-center justify-center gap-4 pt-4 pb-2">
            <motion.button
              onClick={onPrev}
              disabled={!onPrev}
              whileHover={onPrev ? { scale: 1.05, x: -2 } : undefined}
              whileTap={onPrev ? { scale: 0.95 } : undefined}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors
                ${onPrev
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                  : 'bg-transparent text-transparent border border-transparent cursor-default'
                }`}
              style={{ fontFamily: 'Georgia, serif' }}
            >
              <ChevronLeft className="w-4 h-4" />
              前へ
            </motion.button>

            <motion.button
              onClick={onNext}
              disabled={!onNext}
              whileHover={onNext ? { scale: 1.05, x: 2 } : undefined}
              whileTap={onNext ? { scale: 0.95 } : undefined}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors
                ${onNext
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                  : 'bg-transparent text-transparent border border-transparent cursor-default'
                }`}
              style={{ fontFamily: 'Georgia, serif' }}
            >
              次へ
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </motion.div>
    </>
  );
}
