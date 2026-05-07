export const dynamic = 'force-dynamic';

import { readFileSync } from 'fs';
import { join } from 'path';
import questData from '@/data/quests.json';
import AdventureBook from '@/components/AdventureBook';
import { Quest } from '@/components/questUtils';

function loadAchievedIds(): number[] {
  try {
    const raw = readFileSync(join(process.cwd(), '..', 'data', 'user_progress.json'), 'utf-8');
    const parsed = JSON.parse(raw) as { achieved_quest_ids: number[] };
    return parsed.achieved_quest_ids ?? [];
  } catch {
    return [];
  }
}

export default function Home() {
  const achievedIds = loadAchievedIds();
  return (
    <AdventureBook
      quests={questData.quests as Quest[]}
      initialCompletedIds={achievedIds}
    />
  );
}
