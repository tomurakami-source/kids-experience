'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quest } from './questUtils';
import type { Profile } from './ProfileSelector';
import CoverPage from './CoverPage';
import TableOfContents from './TableOfContents';
import QuestSpreadView from './QuestSpreadView';
import GlobalAdventureIntro from './GlobalAdventureIntro';
import { createClient } from '@/lib/supabase/client';

const SUPABASE_CONFIGURED =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const LOCAL_STORAGE_KEY = 'local_completed_quest_ids';

type PageView = 'cover' | 'toc' | 'spread' | 'intro';

interface AdventureBookProps {
  quests: Quest[];
  profile: Profile;
  onBackToProfiles: () => void;
}

export default function AdventureBook({ quests, profile, onBackToProfiles }: AdventureBookProps) {
  const [currentView, setCurrentView] = useState<PageView>('toc');
  const [selectedQuestId, setSelectedQuestId] = useState<number | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const [completedData, setCompletedData] = useState<Map<number, { photoUrl: string | null; aiComment: string | null }>>(new Map());
  const [loadingProgress, setLoadingProgress] = useState(true);

  // Load quest progress
  useEffect(() => {
    if (!SUPABASE_CONFIGURED || profile.id === 'local') {
      // localStorage fallback
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) setCompletedIds(new Set(JSON.parse(saved) as number[]));
      } catch { /* ignore */ }
      setLoadingProgress(false);
      return;
    }

    const supabase = createClient();
    async function loadProgress() {
      setLoadingProgress(true);
      const { data } = await supabase
        .from('quest_logs')
        .select('quest_id, photo_url, ai_comment')
        .eq('profile_id', profile.id)
        .eq('status', 'completed');
      if (data) {
        setCompletedIds(new Set(data.map((r: { quest_id: number }) => r.quest_id)));
        setCompletedData(new Map(data.map((r: { quest_id: number; photo_url: string | null; ai_comment: string | null }) =>
          [r.quest_id, { photoUrl: r.photo_url, aiComment: r.ai_comment }]
        )));
      }
      setLoadingProgress(false);
    }
    loadProgress();
  }, [profile.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTocQuestSelect = useCallback((questId: number) => {
    setSelectedQuestId(questId);
    setCurrentView('spread');
  }, []);

  const handleBackToCover = useCallback(() => {
    setCurrentView('cover');
  }, []);

  const handleIntroOpen = useCallback(() => {
    setCurrentView('intro');
  }, []);

  const handleIntroBack = useCallback(() => {
    setCurrentView('toc');
  }, []);

  const handleIntroNext = useCallback(() => {
    if (quests.length > 0) {
      setSelectedQuestId(quests[0].id);
      setCurrentView('spread');
    }
  }, [quests]);

  const handleSpreadBack = useCallback(() => {
    setSelectedQuestId(null);
    setCurrentView('toc');
  }, []);

  const handleQuestComplete = useCallback((questId: number, photoUrl?: string | null, aiComment?: string | null) => {
    setCompletedIds((prev) => {
      const next = new Set(prev).add(questId);
      // Persist locally when Supabase is not configured
      if (!SUPABASE_CONFIGURED || profile.id === 'local') {
        try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...next])); } catch { /* ignore */ }
      }
      return next;
    });
    if (photoUrl !== undefined || aiComment !== undefined) {
      setCompletedData((prev) => new Map(prev).set(questId, { photoUrl: photoUrl ?? null, aiComment: aiComment ?? null }));
    }
  }, [profile.id]);

  const selectedQuestIndex = selectedQuestId ? quests.findIndex((q) => q.id === selectedQuestId) : -1;
  const selectedQuest = selectedQuestIndex >= 0 ? quests[selectedQuestIndex] : null;
  const isQuestCompleted = selectedQuestId ? completedIds.has(selectedQuestId) : false;
  const selectedQuestData = selectedQuestId ? completedData.get(selectedQuestId) : undefined;

  const handlePrevQuest = useCallback(() => {
    if (selectedQuestIndex > 0) setSelectedQuestId(quests[selectedQuestIndex - 1].id);
  }, [selectedQuestIndex, quests]);

  const handleNextQuest = useCallback(() => {
    if (selectedQuestIndex >= 0 && selectedQuestIndex < quests.length - 1) {
      setSelectedQuestId(quests[selectedQuestIndex + 1].id);
    }
  }, [selectedQuestIndex, quests]);

  if (loadingProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-amber-700 font-bold text-sm"
        >
          冒険の記録を読み込み中…
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 overflow-hidden">
      <AnimatePresence mode="wait">
        {currentView === 'cover' && (
          <motion.div key="cover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CoverPage
              onNameSet={() => setCurrentView('toc')}
              prefillName={profile.name}
            />
          </motion.div>
        )}

        {currentView === 'toc' && (
          <motion.div key="toc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TableOfContents
              quests={quests}
              adventurerName={profile.name}
              completedIds={completedIds}
              onQuestSelect={handleTocQuestSelect}
              onIntroOpen={handleIntroOpen}
              onBackToCover={onBackToProfiles}
            />
          </motion.div>
        )}

        {currentView === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GlobalAdventureIntro onBack={handleIntroBack} onNext={handleIntroNext} />
          </motion.div>
        )}

        {currentView === 'spread' && selectedQuest && (
          <motion.div key="spread" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <QuestSpreadView
              quest={selectedQuest}
              isCompleted={isQuestCompleted}
              completedPhotoUrl={selectedQuestData?.photoUrl ?? null}
              completedAiComment={selectedQuestData?.aiComment ?? null}
              onBack={handleSpreadBack}
              onQuestComplete={handleQuestComplete}
              onPrev={selectedQuestIndex > 0 ? handlePrevQuest : undefined}
              onNext={selectedQuestIndex < quests.length - 1 ? handleNextQuest : undefined}
              profileId={profile.id}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
