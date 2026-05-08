'use client';

import { useState, useEffect } from 'react';
import AdventureBook from '@/components/AdventureBook';
import ProfileSelector, { type Profile } from '@/components/ProfileSelector';
import { Quest } from '@/components/questUtils';
import { createClient } from '@/lib/supabase/client';

const DIFFICULTY_MAP: Record<number, 'Easy' | 'Normal' | 'Hard'> = { 1: 'Easy', 2: 'Normal', 3: 'Hard' };

const LOCAL_PROFILE: Profile = { id: 'local', name: '', avatar: 'sword', created_at: '' };

const SUPABASE_CONFIGURED =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Home() {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(
    SUPABASE_CONFIGURED ? null : LOCAL_PROFILE,
  );
  const [quests, setQuests] = useState<Quest[]>([]);

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) return;
    const supabase = createClient();
    supabase
      .from('quests')
      .select('id, title, category, difficulty, description, criteria')
      .order('id')
      .then(({ data }) => {
        if (!data) return;
        const mapped = data.map((r) => ({
          id: r.id,
          title: r.title,
          category: r.category,
          difficulty: DIFFICULTY_MAP[r.difficulty as number] ?? 'Normal',
          description: r.description ?? '',
          parent_guide: (r.criteria as Record<string, string>)?.parent_guide ?? '',
          photo_criteria: (r.criteria as Record<string, string>)?.photo_criteria ?? '',
          growth_point: (r.criteria as Record<string, string>)?.growth_point ?? '',
        }));
        // チュートリアル（category='チュートリアル'）を先頭に表示
        const tutorials = mapped.filter((q) => q.category === 'チュートリアル');
        const others = mapped.filter((q) => q.category !== 'チュートリアル');
        setQuests([...tutorials, ...others]);
      });
  }, []);

  if (!selectedProfile) {
    return <ProfileSelector onSelect={setSelectedProfile} />;
  }

  return (
    <AdventureBook
      quests={quests}
      profile={selectedProfile}
      onBackToProfiles={SUPABASE_CONFIGURED ? () => setSelectedProfile(null) : () => {}}
    />
  );
}
