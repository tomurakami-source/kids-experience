'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Star, Leaf, Globe, Coins, Flame, ChevronRight } from 'lucide-react';
import { Quest, getConfig, getDifficultyStars } from './questUtils';
import type { LucideProps } from 'lucide-react';

type IconComponent = React.ComponentType<LucideProps>;

const CATEGORY_ICONS: Record<string, IconComponent> = {
  '自然・生存': Leaf,
  '社会・多様性': Globe,
  '自立・経済': Coins,
  '精神・レジリエンス': Flame,
};

interface QuestCardProps {
  quest: Quest;
  isCompleted: boolean;
  onClick: () => void;
  index: number;
}

export default function QuestCard({ quest, isCompleted, onClick, index }: QuestCardProps) {
  const cfg = getConfig(quest.category);
  const starCount = getDifficultyStars(quest.difficulty);
  const Icon = CATEGORY_ICONS[quest.category] ?? Star;
  const isHard = quest.difficulty === 'Hard';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: 'easeOut' }}
    >
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.025, y: -5 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
        className={[
          'relative text-left w-full rounded-2xl border overflow-hidden',
          `bg-gradient-to-b ${cfg.cardFrom} to-white`,
          cfg.borderColor,
          isHard
            ? `shadow-xl ${cfg.glowShadow} ring-1 ${cfg.ringColor}`
            : 'shadow-sm hover:shadow-md',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
          'transition-shadow duration-200',
        ].join(' ')}
      >
        {/* Hard quest — pulsing glow overlay */}
        {isHard && (
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${cfg.stripe} rounded-2xl pointer-events-none`}
            animate={{ opacity: [0.06, 0.14, 0.06] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Category stripe */}
        <div className={`h-1.5 bg-gradient-to-r ${cfg.stripe}`} />

        <div className="p-4 pb-5">
          {/* Row 1: icon + stars */}
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-xl ${cfg.iconBg}`}>
              <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
            </div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < starCount ? cfg.iconColor : 'text-gray-200'}`}
                  fill={i < starCount ? 'currentColor' : 'none'}
                  strokeWidth={1.5}
                />
              ))}
            </div>
          </div>

          {/* Quest number */}
          <p className={`text-[10px] font-mono ${cfg.iconColor} mb-1 opacity-70`}>
            Quest #{String(quest.id).padStart(2, '0')}
          </p>

          {/* Title */}
          <h2 className="font-bold text-gray-900 leading-snug text-sm mb-3 line-clamp-2">
            {quest.title}
          </h2>

          {/* Bottom row: category badge + difficulty + arrow */}
          <div className="flex items-center justify-between gap-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge} ${cfg.badgeText} truncate max-w-[120px]`}>
              {quest.category}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <span className={`text-[10px] font-semibold ${cfg.iconColor}`}>{quest.difficulty}</span>
              <ChevronRight className="w-3 h-3 text-gray-400" />
            </div>
          </div>

          {/* Growth point */}
          <p className="mt-2 text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
            {quest.growth_point}
          </p>
        </div>

        {/* Status: 未挑戦 ribbon (top-right corner) */}
        {!isCompleted && (
          <div className="absolute top-3 right-3 pointer-events-none">
            <span className="text-[9px] text-gray-400 border border-dashed border-gray-300 rounded-full px-1.5 py-0.5 leading-none bg-white/60">
              未挑戦
            </span>
          </div>
        )}

        {/* QUEST CLEAR stamp overlay */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              key="stamp"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px] rounded-2xl pointer-events-none"
            >
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: -12 }}
                exit={{ scale: 0, rotate: -30 }}
                transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                className="border-[3px] border-red-500 rounded-xl px-5 py-3 bg-white/90 shadow-lg"
                style={{ rotate: -12 }}
              >
                <p className="text-red-500 font-black text-xl tracking-[0.15em] uppercase leading-tight text-center">
                  QUEST
                </p>
                <p className="text-red-500 font-black text-xl tracking-[0.15em] uppercase leading-tight text-center">
                  CLEAR!
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
