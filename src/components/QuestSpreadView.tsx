'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Camera, Users, MapPin, Star, Leaf, Globe, Coins, Flame,
  Sparkles, RefreshCw, CheckCircle, XCircle, Loader2,
} from 'lucide-react';
import { Quest, getConfig, getDifficultyStars } from './questUtils';
import CelebrationEffects from './CelebrationEffects';
import type { LucideProps } from 'lucide-react';

type IconComponent = React.ComponentType<LucideProps>;

const CATEGORY_ICONS: Record<string, IconComponent> = {
  '自然・生存': Leaf,
  '社会・多様性': Globe,
  '自立・経済': Coins,
  '精神・レジリエンス': Flame,
};

type Phase = 'idle' | 'preview' | 'judging' | 'success' | 'failure';

interface JudgeResult {
  success: boolean;
  feedback: string;
}

interface QuestSpreadViewProps {
  quest: Quest;
  isCompleted: boolean;
  onBack: () => void;
  onQuestComplete: (questId: number) => void;
}

function playSuccessSound() {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const now = audioContext.currentTime;
  
  const notes = [
    { freq: 523.25, time: 0.1 },
    { freq: 659.25, time: 0.15 },
    { freq: 783.99, time: 0.15 },
  ];

  notes.forEach(({ freq, time }) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.frequency.value = freq;
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + time);

    osc.start(now);
    osc.stop(now + time);
  });
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
  onBack,
  onQuestComplete,
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
        body: JSON.stringify({ questId: quest.id, imageData: data, mediaType }),
      });
      const json = await res.json() as JudgeResult & { alreadyCompleted?: boolean };

      setJudgeResult({ success: json.success, feedback: json.feedback });
      if (json.success) {
        setPhase('success');
        setShowCelebration(true);
        playSuccessSound();
        triggerVibration();
        onQuestComplete(quest.id);
      } else {
        setPhase('failure');
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

  const cfg = getConfig(quest.category);
  const starCount = getDifficultyStars(quest.difficulty);
  const Icon = CATEGORY_ICONS[quest.category] ?? Star;

  const pageVariants = {
    initial: { rotateY: 90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0 },
  };

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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 sm:p-8 flex flex-col"
      >
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.1, x: -4 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-6 self-start"
        >
          <ChevronLeft className="w-5 h-5" />
          目次に戻る
        </motion.button>

        <motion.div
          layout
          className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto w-full"
        >
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl bg-gradient-to-b from-amber-100 via-orange-50 to-yellow-50 border-4 border-amber-300 shadow-2xl p-8 flex flex-col items-center justify-center min-h-[400px]"
          >
            <div className="text-center">
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-6xl sm:text-8xl mb-6"
              >
                🌍
              </motion.div>
              <h3 className="text-lg sm:text-xl font-black text-amber-900 mb-3">
                異世界の景景
              </h3>
              <p className="text-sm text-amber-700 font-serif italic">
                この冒険の舞台を思い浮かべよう...
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-3xl bg-gradient-to-b from-white via-amber-50 to-orange-50 border-4 border-amber-300 shadow-2xl p-8 flex flex-col"
          >
            <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-amber-200">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${cfg.iconBg}`}>
                  <Icon className={`w-6 h-6 ${cfg.iconColor}`} />
                </div>
                <div>
                  <p className={`text-xs font-semibold ${cfg.iconColor} uppercase tracking-widest`}>
                    {quest.category}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">Quest #{String(quest.id).padStart(2, '0')}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < starCount ? cfg.iconColor : 'text-gray-200'}`}
                    fill={i < starCount ? 'currentColor' : 'none'}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {phase === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 overflow-y-auto space-y-4 mb-6"
                >
                  <div>
                    <h2 className="text-xl font-black text-gray-900 mb-2 font-serif">
                      {quest.title}
                    </h2>
                  </div>

                  <section>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      クエスト内容
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {quest.description}
                    </p>
                  </section>

                  <section className={`rounded-2xl p-3 border ${cfg.sectionBg} ${cfg.sectionBorder}`}>
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1 ${cfg.sectionText}`}>
                      <Users className="w-3.5 h-3.5" />
                      親のガイド
                    </h4>
                    <p className={`text-xs leading-relaxed ${cfg.sectionText}`}>
                      {quest.parent_guide}
                    </p>
                  </section>

                  <section className="rounded-2xl p-3 border bg-slate-50 border-slate-200">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5" />
                      クリア証明の条件
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {quest.photo_criteria}
                    </p>
                  </section>

                  <section className="rounded-2xl p-3 border bg-indigo-50 border-indigo-100">
                    <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      成長ポイント
                    </h4>
                    <p className="text-xs font-semibold text-indigo-800">
                      {quest.growth_point}
                    </p>
                  </section>
                </motion.div>
              )}

              {phase === 'preview' && previewUrl && (
                <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col mb-6">
                  <p className="text-sm font-bold text-gray-700 mb-3">この写真でいい？</p>
                  <div className="rounded-2xl overflow-hidden border-2 border-gray-200 shadow-md flex-1 flex items-center justify-center">
                    <img src={previewUrl} alt="プレビュー" className="w-full h-full object-cover" />
                  </div>
                </motion.div>
              )}

              {phase === 'judging' && (
                <motion.div
                  key="judging"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center gap-4 mb-6"
                >
                  <div className="relative w-20 h-20">
                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${cfg.stripe} flex items-center justify-center shadow-lg`}>
                      <Camera className="w-10 h-10 text-white" />
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      className="absolute -inset-2"
                    >
                      <Loader2 className="w-full h-full text-indigo-400 opacity-60" />
                    </motion.div>
                  </div>
                  <p className="text-sm font-black text-gray-900">AIが判定中…</p>
                </motion.div>
              )}

              {phase === 'success' && judgeResult && (
                <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center gap-4 mb-6">
                  <CheckCircle className="w-20 h-20 text-emerald-500" strokeWidth={1.5} />
                  <p className="text-2xl font-black text-gray-900">クエストクリア！</p>
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl px-4 py-3 text-center">
                    <p className="text-xs font-semibold text-emerald-800">
                      {judgeResult.feedback}
                    </p>
                  </div>
                </motion.div>
              )}

              {phase === 'failure' && judgeResult && (
                <motion.div key="failure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center gap-4 mb-6">
                  <XCircle className="w-20 h-20 text-rose-400" strokeWidth={1.5} />
                  <p className="text-lg font-black text-gray-900">もう少しだ！</p>
                  <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-center">
                    <p className="text-xs font-semibold text-rose-800">
                      {judgeResult.feedback}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="border-t-2 border-amber-200 pt-4">
              <AnimatePresence mode="wait">
                {isCompleted && phase === 'idle' && (
                  <motion.div
                    key="completed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-emerald-600 font-bold text-sm mb-3"
                  >
                    ✨ このクエストはクリア済みです！
                  </motion.div>
                )}

                {!isCompleted && phase === 'idle' && (
                  <motion.button
                    key="camera-btn"
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCameraClick}
                    className={`w-full py-3 rounded-xl bg-gradient-to-r ${cfg.stripe} text-white font-black text-sm shadow-lg flex items-center justify-center gap-2`}
                  >
                    <Camera className="w-4 h-4" />
                    冒険を記録する
                  </motion.button>
                )}

                {phase === 'preview' && (
                  <motion.div key="preview-btns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSubmit}
                      className={`w-full py-3 rounded-xl bg-gradient-to-r ${cfg.stripe} text-white font-black text-sm shadow-lg`}
                    >
                      <Sparkles className="w-4 h-4 inline mr-2" />
                      クリア判定する！
                    </motion.button>
                    <button
                      onClick={handleRetry}
                      className="w-full py-2 rounded-xl border border-gray-200 text-gray-500 text-xs font-semibold hover:bg-gray-50"
                    >
                      <RefreshCw className="w-3 h-3 inline mr-1" />
                      撮り直す
                    </button>
                  </motion.div>
                )}

                {phase === 'success' && (
                  <motion.button
                    key="success-btn"
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    className="w-full py-3 rounded-xl bg-emerald-500 text-white font-black text-sm shadow-lg"
                  >
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    目次に戻る
                  </motion.button>
                )}

                {phase === 'failure' && (
                  <motion.div key="failure-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCameraClick}
                      className={`w-full py-3 rounded-xl bg-gradient-to-r ${cfg.stripe} text-white font-black text-sm shadow-lg`}
                    >
                      <Camera className="w-4 h-4 inline mr-2" />
                      もう一回！
                    </motion.button>
                    <button
                      onClick={onBack}
                      className="w-full py-2 rounded-xl border border-gray-200 text-gray-500 text-xs font-semibold hover:bg-gray-50"
                    >
                      あとでチャレンジ
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}
