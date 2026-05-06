export const dynamic = 'force-dynamic';

import { readFileSync } from 'fs';
import { join } from 'path';
import questData from '@/data/quests.json';
import QuestBoard from '@/components/QuestBoard';
import { Quest, QuestPhotos } from '@/components/questUtils';

interface UserProgress {
  achieved_quest_ids: number[];
  quest_photos?: Record<string, string[]>;
}

function loadProgress(): { achievedIds: number[]; questPhotos: QuestPhotos } {
  try {
    const raw = readFileSync(join(process.cwd(), '..', 'data', 'user_progress.json'), 'utf-8');
    const parsed = JSON.parse(raw) as UserProgress;
    return {
      achievedIds: parsed.achieved_quest_ids ?? [],
      questPhotos: parsed.quest_photos ?? {},
    };
  } catch {
    return { achievedIds: [], questPhotos: {} };
  }
}

export default function Home() {
  const { achievedIds, questPhotos } = loadProgress();
  return (
    <QuestBoard
      quests={questData.quests as Quest[]}
      initialCompletedIds={achievedIds}
      initialQuestPhotos={questPhotos}
    />
  );
}
