'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';

interface CoverPageProps {
  onNameSet: (name: string) => void;
}

export default function CoverPage({ onNameSet }: CoverPageProps) {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim().length === 0) return;
    setIsSubmitted(true);
    setTimeout(() => {
      onNameSet(inputValue.trim());
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-gradient-to-b from-yellow-100 via-amber-50 to-orange-100 rounded-3xl shadow-2xl overflow-hidden border-8 border-amber-200">
          <div className="p-12 sm:p-16 min-h-[500px] flex flex-col items-center justify-center text-center relative">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-8"
            >
              <BookOpen className="w-20 h-20 sm:w-28 sm:h-28 text-amber-700 mx-auto" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-5xl font-black text-amber-900 mb-6 font-serif"
            >
              冒険の書
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg sm:text-xl text-amber-800 mb-12 font-serif italic"
            >
              あなたの冒険が始まる
            </motion.p>

            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-sm space-y-6"
            >
              <div>
                <label className="block text-sm font-bold text-amber-800 mb-3 uppercase tracking-widest">
                  冒険者の名前を教えてください
                </label>
                <motion.div
                  className="relative"
                  animate={isSubmitted ? { scale: 1.02 } : {}}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="あなたの名前"
                    className="w-full px-6 py-4 text-center text-lg font-serif text-amber-900 placeholder-amber-400 bg-white/80 border-4 border-amber-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500 focus:border-transparent transition-all"
                    disabled={isSubmitted}
                  />
                  <motion.div
                    animate={{ rotate: isSubmitted ? 0 : [0, 5, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl pointer-events-none"
                  >
                    ✒️
                  </motion.div>
                </motion.div>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(217, 119, 6, 0.3)' }}
                whileTap={{ scale: 0.97 }}
                disabled={isSubmitted || inputValue.trim().length === 0}
                className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                <motion.span
                  className="inline-flex items-center gap-2"
                  animate={isSubmitted ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
                >
                  <Sparkles className="w-5 h-5" />
                  冒険を始める
                </motion.span>
              </motion.button>
            </motion.form>

            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
                  className="text-6xl"
                >
                  ✨
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
