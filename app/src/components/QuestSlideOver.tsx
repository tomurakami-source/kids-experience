'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Camera, Users, MapPin, Star, Leaf, Globe, Coins, Flame,
  Sparkles, RefreshCw, CheckCircle, XCircle, Loader2,
} from 'lucide-react';
import { Quest, getConfig, getDifficultyStars } from './questUtils';
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

interface QuestSlideOverProps {
  quest: Quest | null;
  isCompleted: boolean;
  onClose: () => void;
  onQuestComplete: (questId: number, photo?: string) => void;
  photos?: string[];
}

/** Compress image to max 1024px, quality 0.82, returns base64 without prefix */
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

export default function QuestSlideOver({
  quest, isCompleted, onClose, onQuestComplete, photos = [],
}: QuestSlideOverProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
  const [showGallery, setShowGallery] = useState(false);

  // Reset state when quest changes
  useEffect(() => {
    setPhase('idle');
    setPreviewUrl(null);
    setPreviewFile(null);
    setJudgeResult(null);
  }, [quest?.id]);

  // Body scroll lock + Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (quest) {
      document.addEventListener('keydown', handler);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [quest, onClose]);

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
    // Reset input so same file can be reselected
    e.target.value = '';
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!previewFile || !quest) return;
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
        const photoDataUrl = `data:${mediaType};base64,${data}`;
        onQuestComplete(quest.id, photoDataUrl);
      } else {
        setPhase('failure');
      }
    } catch {
      setJudgeResult({ success: false, feedback: 'ネットワークエラーが起きたよ！もう一度試してみて！' });
      setPhase('failure');
    }
  }, [previewFile, quest, onQuestComplete]);

  const handleRetry = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewFile(null);
    setJudgeResult(null);
    setPhase('idle');
  }, [previewUrl]);

  const cfg = quest ? getConfig(quest.category) : null;
  const starCount = quest ? getDifficultyStars(quest.difficulty) : 0;
  const Icon = quest ? (CATEGORY_ICONS[quest.category] ?? Star) : Star;

  return (
    <>
      {/* Hidden camera/file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <AnimatePresence>
        {quest && cfg && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />

            {/* Slide-over panel */}
            <motion.div
              key="panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 32 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl flex flex-col"
            >
              {/* ── Gradient header ── */}
              <div className={`bg-gradient-to-br ${cfg.stripe} px-6 pt-12 pb-6 relative shrink-0`}>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                  aria-label="閉じる"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-xs font-semibold">{quest.category}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 text-white"
                          fill={i < starCount ? 'currentColor' : 'none'}
                          strokeWidth={1.5}
                        />
                      ))}
                      <span className="text-white/70 text-xs ml-1">{quest.difficulty}</span>
                    </div>
                  </div>
                </div>

                <p className="text-white/60 text-xs font-mono mb-1">
                  Quest #{String(quest.id).padStart(2, '0')}
                </p>
                <h2 className="text-xl font-black text-white leading-snug">{quest.title}</h2>

                {/* CLEAR stamp in header */}
                <AnimatePresence>
                  {(isCompleted || phase === 'success') && (
                    <motion.div
                      initial={{ scale: 0, rotate: -20, opacity: 0 }}
                      animate={{ scale: 1, rotate: -8, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="absolute top-4 left-4 border-[3px] border-white rounded-lg px-3 py-1.5 bg-white/10"
                      style={{ rotate: -8 }}
                    >
                      <p className="text-white font-black text-sm tracking-widest">QUEST CLEAR!</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Scrollable body ── */}
              <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">

                  {/* IDLE: quest details */}
                  {phase === 'idle' && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="px-6 py-5 space-y-5"
                    >
                      <section>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                          クエスト内容
                        </h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{quest.description}</p>
                      </section>

                      <section className={`rounded-2xl p-4 border ${cfg.sectionBg} ${cfg.sectionBorder}`}>
                        <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${cfg.sectionText}`}>
                          <Users className="w-3.5 h-3.5" />
                          親のガイド
                        </h3>
                        <p className={`text-sm leading-relaxed ${cfg.sectionText}`}>{quest.parent_guide}</p>
                      </section>

                      <section className="rounded-2xl p-4 border bg-slate-50 border-slate-200">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5" />
                          クリア証明の条件
                        </h3>
                        <p className="text-sm text-slate-700 leading-relaxed">{quest.photo_criteria}</p>
                      </section>

                      <section className="rounded-2xl p-4 border bg-indigo-50 border-indigo-100">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          この冒険で伸びる力
                        </h3>
                        <p className="text-sm font-semibold text-indigo-800">{quest.growth_point}</p>
                      </section>

                      <div className="flex items-start gap-2 text-xs text-gray-400 pb-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>都会でも工夫次第で実行可能なクエストです</span>
                      </div>

                      {isCompleted && photos.length > 0 && (
                        <section>
                          <button
                            onClick={() => setShowGallery(!showGallery)}
                            className="w-full rounded-2xl p-4 border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 flex items-center gap-1.5">
                              🖼️ 冒険の記録（{photos.length}枚）
                            </h3>
                            <p className="text-xs text-gray-500">写真を見返してみよう</p>
                          </button>

                          {showGallery && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 space-y-3"
                            >
                              {photos.map((photo, idx) => (
                                <div key={idx} className="rounded-2xl overflow-hidden border border-gray-200 shadow-md">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={photo}
                                    alt={`冒険の写真 ${idx + 1}`}
                                    className="w-full object-cover max-h-64"
                                  />
                                  <div className="px-3 py-2 bg-gray-50 text-xs text-gray-500">
                                    記録日時: {new Date(photo.startsWith('data:') ? Date.now() : parseInt(photo.split(',')[0]) || Date.now()).toLocaleDateString('ja-JP')}
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </section>
                      )}
                    </motion.div>
                  )}

                  {/* PREVIEW: show selected image */}
                  {phase === 'preview' && previewUrl && (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="px-6 py-5 space-y-4"
                    >
                      <p className="text-sm font-bold text-gray-700">この写真でいい？</p>
                      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewUrl}
                          alt="選択した写真"
                          className="w-full object-cover max-h-72"
                        />
                      </div>
                      <section className="rounded-2xl p-3 border bg-slate-50 border-slate-200">
                        <p className="text-xs font-semibold text-slate-500 mb-1">確認：クリア条件</p>
                        <p className="text-xs text-slate-600 leading-relaxed">{quest.photo_criteria}</p>
                      </section>
                    </motion.div>
                  )}

                  {/* JUDGING: AI loading */}
                  {phase === 'judging' && (
                    <motion.div
                      key="judging"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center gap-6 px-6 py-16 text-center"
                    >
                      <div className="relative">
                        <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${cfg.stripe} flex items-center justify-center shadow-xl`}>
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
                      <div>
                        <p className="text-lg font-black text-gray-900 mb-1">AIが判定中…</p>
                        <p className="text-sm text-gray-500">少し待っていてね！</p>
                      </div>
                      <div className="flex gap-1.5">
                        {[0, 0.2, 0.4].map((delay, i) => (
                          <motion.div
                            key={i}
                            className={`w-2 h-2 rounded-full bg-gradient-to-br ${cfg.stripe}`}
                            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1, repeat: Infinity, delay }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* SUCCESS */}
                  {phase === 'success' && judgeResult && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-5 px-6 py-10 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 16, delay: 0.1 }}
                      >
                        <CheckCircle className="w-20 h-20 text-emerald-500" strokeWidth={1.5} />
                      </motion.div>

                      <div>
                        <motion.p
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 }}
                          className="text-2xl font-black text-gray-900 mb-1"
                        >
                          クエストクリア！
                        </motion.p>
                        <motion.p
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 }}
                          className="text-xs text-gray-400"
                        >
                          QUEST CLEAR
                        </motion.p>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 max-w-xs"
                      >
                        <p className="text-sm font-semibold text-emerald-800 leading-relaxed">
                          {judgeResult.feedback}
                        </p>
                      </motion.div>

                      {/* Confetti dots */}
                      <div className="flex gap-2 mt-2">
                        {['bg-emerald-400', 'bg-amber-400', 'bg-sky-400', 'bg-rose-400', 'bg-purple-400'].map((color, i) => (
                          <motion.div
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full ${color}`}
                            animate={{ y: [0, -10, 0], scale: [1, 1.3, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* FAILURE */}
                  {phase === 'failure' && judgeResult && (
                    <motion.div
                      key="failure"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-5 px-6 py-10 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 16, delay: 0.1 }}
                      >
                        <XCircle className="w-20 h-20 text-rose-400" strokeWidth={1.5} />
                      </motion.div>

                      <div>
                        <p className="text-xl font-black text-gray-900 mb-1">もう少しだ！</p>
                        <p className="text-xs text-gray-400">もう一回チャレンジしよう</p>
                      </div>

                      <div className="bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4 max-w-xs">
                        <p className="text-sm font-semibold text-rose-800 leading-relaxed">
                          {judgeResult.feedback}
                        </p>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left w-full">
                        <p className="text-xs font-bold text-slate-500 mb-1.5">クリア条件を確認しよう</p>
                        <p className="text-xs text-slate-700 leading-relaxed">{quest.photo_criteria}</p>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* ── Fixed footer CTA ── */}
              <div className="shrink-0 px-6 py-5 border-t border-gray-100 bg-white">
                <AnimatePresence mode="wait">

                  {/* Already completed */}
                  {(isCompleted && phase === 'idle') && (
                    <motion.div
                      key="completed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-2 py-4 text-emerald-600 font-bold"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>このクエストはクリア済みです！</span>
                    </motion.div>
                  )}

                  {/* Not completed: camera trigger */}
                  {(!isCompleted && phase === 'idle') && (
                    <motion.div key="camera-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleCameraClick}
                        className={`w-full py-4 rounded-2xl bg-gradient-to-r ${cfg.stripe} text-white font-black text-base shadow-lg flex items-center justify-center gap-2`}
                      >
                        <Camera className="w-5 h-5" />
                        冒険を記録する（カメラ）
                      </motion.button>
                      <p className="text-center text-xs text-gray-400 mt-2">
                        写真を撮ってクエストをクリアしよう
                      </p>
                    </motion.div>
                  )}

                  {/* Preview: confirm or retake */}
                  {phase === 'preview' && (
                    <motion.div key="preview-btns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSubmit}
                        className={`w-full py-4 rounded-2xl bg-gradient-to-r ${cfg.stripe} text-white font-black text-base shadow-lg flex items-center justify-center gap-2`}
                      >
                        <Sparkles className="w-5 h-5" />
                        この写真でクリア判定する！
                      </motion.button>
                      <button
                        onClick={handleRetry}
                        className="w-full py-3 rounded-2xl border border-gray-200 text-gray-500 text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        写真を撮り直す
                      </button>
                    </motion.div>
                  )}

                  {/* Judging: disabled */}
                  {phase === 'judging' && (
                    <motion.div
                      key="judging-btn"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full py-4 rounded-2xl bg-gray-100 text-gray-400 font-bold text-base flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <Loader2 className="w-5 h-5 animate-spin" />
                      判定中…
                    </motion.div>
                  )}

                  {/* Success: close */}
                  {phase === 'success' && (
                    <motion.div key="success-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <button
                        onClick={onClose}
                        className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-black text-base shadow-lg flex items-center justify-center gap-2 active:opacity-90"
                      >
                        <CheckCircle className="w-5 h-5" />
                        冒険手帳に戻る
                      </button>
                    </motion.div>
                  )}

                  {/* Failure: retry */}
                  {phase === 'failure' && (
                    <motion.div key="failure-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleCameraClick}
                        className={`w-full py-4 rounded-2xl bg-gradient-to-r ${cfg.stripe} text-white font-black text-base shadow-lg flex items-center justify-center gap-2`}
                      >
                        <Camera className="w-5 h-5" />
                        もう一回やってみよう！
                      </motion.button>
                      <button
                        onClick={onClose}
                        className="w-full py-3 rounded-2xl border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-colors"
                      >
                        あとでチャレンジする
                      </button>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
