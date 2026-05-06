'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Globe, Coins, Flame, LayoutGrid } from 'lucide-react';
import { Quest } from './questUtils';
import AdventureHeader from './AdventureHeader';
import QuestCard from './QuestCard';
import QuestSlideOver from './QuestSlideOver';

const FILTER_TABS = [
  { label: 'すべて', value: null, icon: LayoutGrid },
  { label: '自然・生存', value: '自然・生存', icon: Leaf },
  { label: '社会・多様性', value: '社会・多様性', icon: Globe },
  { label: '自立・経済', value: '自立・経済', icon: Coins },
  { label: '精神・レジリエンス', value: '精神・レジリエンス', icon: Flame },
] as const;

const TAB_ACTIVE_COLORS: Record<string, string> = {
  '自然・生存': 'bg-emerald-500',
  '社会・多様性': 'bg-sky-500',
  '自立・経済': 'bg-amber-500',
  '精神・レジリエンス': 'bg-rose-500',
};

interface QuestBoardProps {
  quests: Quest[];
  initialCompletedIds: number[];
}

export default function QuestBoard({ quests, initialCompletedIds }: QuestBoardProps) {
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set(initialCompletedIds));
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleClose = useCallback(() => setSelectedQuest(null), []);

  const handleQuestComplete = useCallback((questId: number) => {
    setCompletedIds((prev) => new Set(prev).add(questId));
  }, []);

  const filtered = activeCategory
    ? quests.filter((q) => q.category === activeCategory)
    : quests;

  const filteredClearedCount = filtered.filter((q) => completedIds.has(q.id)).length;

  return (
    <div className="min-h-screen bg-slate-900">
      <AdventureHeader completedCount={completedIds.size} totalCount={quests.length} />

      {/* Filter tabs */}
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-2.5">
        <div className="max-w-5xl mx-auto overflow-x-auto">
          <div className="flex gap-2 min-w-max sm:justify-center">
            {FILTER_TABS.map(({ label, value, icon: Icon }) => {
              const isActive = activeCategory === value;
              const activeColor = value ? TAB_ACTIVE_COLORS[value] : 'bg-white';
              return (
                <button
                  key={label}
                  onClick={() => setActiveCategory(value)}
                  className={[
                    'relative px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap',
                    isActive ? 'text-white' : 'text-slate-400 hover:text-white',
                  ].join(' ')}
                >
                  {isActive && (
                    <motion.span
                      layoutId="tab-pill"
                      className={`absolute inset-0 rounded-full ${activeColor}`}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={`relative flex items-center gap-1.5 ${isActive && !value ? 'text-slate-900' : ''}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Count label */}
      <div className="max-w-5xl mx-auto px-4 pt-5 pb-2">
        <p className="text-slate-500 text-xs">
          {filtered.length}件のクエスト
          {filteredClearedCount > 0 && (
            <span className="ml-2 text-amber-400 font-semibold">
              ・{filteredClearedCount}件クリア済み
            </span>
          )}
        </p>
      </div>

      {/* Quest grid */}
      <main className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((quest, i) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              isCompleted={completedIds.has(quest.id)}
              onClick={() => setSelectedQuest(quest)}
              index={i}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <p className="text-4xl mb-3">🗺️</p>
            <p className="font-semibold">該当するクエストがありません</p>
          </div>
        )}
      </main>

      <QuestSlideOver
        quest={selectedQuest}
        isCompleted={selectedQuest ? completedIds.has(selectedQuest.id) : false}
        onClose={handleClose}
        onQuestComplete={handleQuestComplete}
      />
    </div>
  );
}
