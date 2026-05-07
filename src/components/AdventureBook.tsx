'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quest } from './questUtils';
import CoverPage from './CoverPage';
import TableOfContents from './TableOfContents';
import QuestSpreadView from './QuestSpreadView';

type PageView = 'cover' | 'toc' | 'quest' | 'spread';

interface AdventureBookProps {
  quests: Quest[];
  initialCompletedIds: number[];
}

export default function AdventureBook({ quests, initialCompletedIds }: AdventureBookProps) {
  const [currentView, setCurrentView] = useState<PageView>('cover');
  const [adventurerName, setAdventurerName] = useState<string>('');
  const [selectedQuestId, setSelectedQuestId] = useState<number | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set(initialCompletedIds));

  useEffect(() => {
    const savedName = typeof window !== 'undefined' ? localStorage.getItem('adventurerName') : null;
    if (savedName) {
      setAdventurerName(savedName);
      setCurrentView('toc');
    }
  }, []);

  const handleNameSet = useCallback((name: string) => {
    setAdventurerName(name);
    localStorage.setItem('adventurerName', name);
    setCurrentView('toc');
  }, []);

  const handleTocQuestSelect = useCallback((questId: number) => {
    setSelectedQuestId(questId);
    setCurrentView('spread');
  }, []);

  const handleSpreadBack = useCallback(() => {
    setSelectedQuestId(null);
    setCurrentView('toc');
  }, []);

  const handleQuestComplete = useCallback((questId: number) => {
    setCompletedIds((prev) => new Set(prev).add(questId));
  }, []);

  const selectedQuest = selectedQuestId ? quests.find((q) => q.id === selectedQuestId) : null;
  const isQuestCompleted = selectedQuestId ? completedIds.has(selectedQuestId) : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 overflow-hidden">
      <AnimatePresence mode="wait">
        {currentView === 'cover' && (
          <motion.div key="cover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CoverPage onNameSet={handleNameSet} />
          </motion.div>
        )}

        {currentView === 'toc' && (
          <motion.div key="toc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TableOfContents
              quests={quests}
              adventurerName={adventurerName}
              completedIds={completedIds}
              onQuestSelect={handleTocQuestSelect}
            />
          </motion.div>
        )}

        {currentView === 'spread' && selectedQuest && (
          <motion.div key="spread" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <QuestSpreadView
              quest={selectedQuest}
              isCompleted={isQuestCompleted}
              onBack={handleSpreadBack}
              onQuestComplete={handleQuestComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
