'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdventureBook from '@/components/AdventureBook';
import ProfileSelector, { type Profile } from '@/components/ProfileSelector';
import WelcomeScreen from '@/components/WelcomeScreen';
import { Quest } from '@/components/questUtils';
import { createClient } from '@/lib/supabase/client';

const DIFFICULTY_MAP: Record<number, 'Easy' | 'Normal' | 'Hard'> = { 1: 'Easy', 2: 'Normal', 3: 'Hard' };

const LOCAL_PROFILE: Profile = { id: 'local', name: '', avatar: 'sword', created_at: '' };

const SUPABASE_CONFIGURED =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null = 確認中
  const [view, setView] = useState<'profiles' | 'book'>('profiles');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(
    SUPABASE_CONFIGURED ? null : LOCAL_PROFILE,
  );
  const [quests, setQuests] = useState<Quest[]>([]);

  // ログイン状態を確認
  useEffect(() => {
    if (!SUPABASE_CONFIGURED) { setIsLoggedIn(false); return; }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) return;
    const supabase = createClient();
    supabase
      .from('quests')
      .select('id, title, category, difficulty, description, criteria')
      .order('id')
      .then(({ data }) => {
        if (!data) return;
        setQuests(data.map((r) => ({
          id: r.id,
          title: r.title,
          category: r.category,
          difficulty: DIFFICULTY_MAP[r.difficulty as number] ?? 'Normal',
          description: r.description ?? '',
          parent_guide: (r.criteria as Record<string, string>)?.parent_guide ?? '',
          photo_criteria: (r.criteria as Record<string, string>)?.photo_criteria ?? '',
          growth_point: (r.criteria as Record<string, string>)?.growth_point ?? '',
          estimated_time: (r.criteria as Record<string, string>)?.estimated_time,
        })));
      });
  }, []);

  // ログイン確認中はなにも表示しない
  if (isLoggedIn === null) return null;

  // 未ログイン → ウェルカム画面
  if (!isLoggedIn) {
    return <WelcomeScreen onStart={() => router.push('/login')} />;
  }

  // ログイン済み → プロフィール選択
  if (view === 'profiles' || !selectedProfile) {
    return (
      <ProfileSelector
        onSelect={(profile) => {
          setSelectedProfile(profile);
          setView('book');
        }}
      />
    );
  }

  return (
    <AdventureBook
      quests={quests}
      profile={selectedProfile}
      onBackToProfiles={SUPABASE_CONFIGURED ? () => { setSelectedProfile(null); setView('profiles'); } : () => {}}
    />
  );
}
