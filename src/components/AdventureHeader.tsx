'use client';

import { motion } from 'framer-motion';
import { Shield, Trophy, Scroll, Sparkles } from 'lucide-react';
import { calcLevel, calcXp } from './questUtils';

interface AdventureHeaderProps {
  completedCount: number;
  totalCount: number;
}

const LEVEL_TITLES = ['', '見習い冒険者', '冒険者', '熟練冒険者', '勇者', '伝説の冒険者'];

export default function AdventureHeader({ completedCount, totalCount }: AdventureHeaderProps) {
  const level = Math.min(calcLevel(completedCount), 5);
  const xp = calcXp(completedCount);
  const nextLevelXp = (completedCount % 4);
  const clearRate = Math.round((completedCount / totalCount) * 100);

  return (
    <header className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 pt-10 pb-8 border-b border-slate-800">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Top label + title */}
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400 mb-2"
          >
            Adventure Log · Season 1
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-5xl font-black text-white tracking-tight"
          >
            20 Global Quests
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-sm mt-1.5"
          >
            子どもの視野を広げる20の冒険
          </motion.p>
        </div>

        {/* Bento stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {/* Adventurer profile card — spans 2 cols */}
          <div className="col-span-2 bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-sm">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
                <Shield className="w-8 h-8 text-white" />
              </div>
              {/* Level badge */}
              <div className="absolute -bottom-1.5 -right-1.5 bg-amber-400 text-amber-950 text-xs font-black rounded-full w-7 h-7 flex items-center justify-center shadow-lg border-2 border-slate-900">
                {level}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-slate-400 text-xs leading-none mb-0.5">冒険者</p>
              <p className="text-white font-bold text-lg leading-tight truncate">冒険者の君</p>
              <p className="text-indigo-300 text-xs mb-2">{LEVEL_TITLES[level]}</p>

              {/* XP bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Lv.{level}</span>
                  <span>{nextLevelXp}/4 XP</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${xp}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cleared count */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 backdrop-blur-sm">
            <Trophy className="w-6 h-6 text-amber-400" />
            <motion.p
              key={completedCount}
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-black text-white leading-none"
            >
              {completedCount}
            </motion.p>
            <p className="text-slate-400 text-[10px] text-center leading-tight">クリア済み</p>
          </div>

          {/* Remaining count */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 backdrop-blur-sm">
            <Scroll className="w-6 h-6 text-indigo-400" />
            <motion.p
              key={totalCount - completedCount}
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-black text-white leading-none"
            >
              {totalCount - completedCount}
            </motion.p>
            <p className="text-slate-400 text-[10px] text-center leading-tight">残りクエスト</p>
          </div>
        </motion.div>

        {/* Progress bar (overall clear rate) */}
        {completedCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3 flex items-center gap-3 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>冒険進捗</span>
                <span className="text-amber-400 font-bold">{clearRate}%</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${clearRate}%` }}
                  transition={{ duration: 1.4, ease: 'easeOut', delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
}
