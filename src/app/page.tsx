import { createClient } from '@/lib/supabase/server';
import WelcomeScreen from '@/components/WelcomeScreen';
import HomeClient from './HomeClient';
import type { Profile } from '@/components/ProfileSelector';
import type { Quest } from '@/components/questUtils';

const DIFFICULTY_MAP: Record<number, 'Easy' | 'Normal' | 'Hard'> = { 1: 'Easy', 2: 'Normal', 3: 'Hard' };

const SUPABASE_CONFIGURED =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function Home() {
  if (!SUPABASE_CONFIGURED) {
    return <HomeClient initialQuests={[]} initialProfiles={[]} localMode />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <WelcomeScreen />;
  }

  // クエストとプロフィールをサーバー側で並列取得
  const [questsResult, profilesResult] = await Promise.all([
    supabase
      .from('quests')
      .select('id, title, category, difficulty, description, criteria')
      .order('id'),
    supabase
      .from('profiles')
      .select('id, name, avatar_key, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true }),
  ]);

  const quests: Quest[] = (questsResult.data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    difficulty: DIFFICULTY_MAP[r.difficulty as number] ?? 'Normal',
    description: r.description ?? '',
    parent_guide: (r.criteria as Record<string, string>)?.parent_guide ?? '',
    photo_criteria: (r.criteria as Record<string, string>)?.photo_criteria ?? '',
    growth_point: (r.criteria as Record<string, string>)?.growth_point ?? '',
    estimated_time: (r.criteria as Record<string, string>)?.estimated_time,
  }));

  const profiles: Profile[] = (profilesResult.data ?? []).map(
    ({ avatar_key, ...rest }) => ({ ...rest, avatar: avatar_key }),
  );

  return <HomeClient initialQuests={quests} initialProfiles={profiles} />;
}
