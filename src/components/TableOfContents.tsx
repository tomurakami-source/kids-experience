'use client';

import { motion } from 'framer-motion';
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

interface TableOfContentsProps {
  quests: Quest[];
  adventurerName: string;
  completedIds: Set<number>;
  onQuestSelect: (questId: number) => void;
}

export default function TableOfContents({
  quests,
  adventurerName,
  completedIds,
  onQuestSelect,
}: TableOfContentsProps) {
  const completedCount = completedIds.size;
  const totalCount = quests.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold text-amber-700 tracking-widest uppercase mb-2">
            目次
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-amber-900 font-serif mb-2">
            {adventurerName}の冒険の書
          </h1>
          <div className="flex items-center justify-center gap-2 text-lg text-amber-800 font-semibold">
            <span>{completedCount}</span>
            <span>/</span>
            <span>{totalCount}</span>
            <span>クエスト完了</span>
          </div>
          <motion.div
            className="mt-4 h-2 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full max-w-xs mx-auto"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: completedCount / totalCount }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </motion.div>

        <div className="space-y-3 mb-8">
          {quests.map((quest, index) => {
            const cfg = getConfig(quest.category);
            const Icon = CATEGORY_ICONS[quest.category] ?? Star;
            const isCompleted = completedIds.has(quest.id);
            const starCount = getDifficultyStars(quest.difficulty);

            return (
              <motion.button
                key={quest.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ x: 8 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onQuestSelect(quest.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                  isCompleted
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 shadow-md'
                    : 'bg-white border-amber-200 hover:border-amber-400 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`p-3 rounded-xl shrink-0 ${cfg.iconBg}`}>
                      <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-xs font-mono ${cfg.iconColor} opacity-70`}>
                          Quest #{String(quest.id).padStart(2, '0')}
                        </p>
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
                      <h3 className="font-bold text-gray-900 text-sm truncate">
                        {quest.title}
                      </h3>
                      <p className={`text-xs ${cfg.badgeText} font-semibold`}>
                        {quest.category}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isCompleted && (
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: -15 }}
                        className="border-2 border-red-500 rounded-lg px-2 py-1 bg-white shadow-md"
                      >
                        <p className="text-red-500 font-black text-xs tracking-widest">
                          CLEAR
                        </p>
                      </motion.div>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-amber-700 font-semibold"
        >
          <p>クエストをタップして、詳細を見よう！</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
