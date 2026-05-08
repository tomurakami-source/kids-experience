-- 1. 拡張機能の有効化
create extension if not exists "moddatetime" schema "extensions";

-- 2. クエスト・マスターテーブル（運営側で管理）
create table if not exists public.quests (
  id          serial primary key,
  category    text not null, -- 'nature', 'society', 'independence', 'spirit'
  title       text not null,
  description text,
  difficulty  integer check (difficulty between 1 and 3),
  target_url  text, -- 異世界の挿絵のパス
  criteria    jsonb, -- AI判定の基準などを保持
  created_at  timestamptz default now()
);

-- 3. 子どもプロファイル（兄弟対応）
create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  avatar_key  text default 'sword', -- アバターの種類
  birth_date  date, -- 年齢に応じた難易度調整用
  total_xp    integer default 0, -- ゲーミフィケーション要素
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 4. クエスト進捗・記録（ここがアルバムの心臓部）
create table if not exists public.quest_logs (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid references public.profiles(id) on delete cascade not null,
  quest_id      integer references public.quests(id) not null,
  status        text default 'in_progress', -- 'in_progress', 'completed'
  photo_url     text, -- 写真のストレージパス
  ai_comment    text, -- AIからの褒め言葉
  ai_metadata   jsonb, -- AIの解析結果（信頼度など）
  completed_at  timestamptz,
  created_at    timestamptz default now(),
  unique(profile_id, quest_id)
);

-- 5. 自動更新トリガー (updated_at用)
create trigger handle_updated_at before update on public.profiles
  for each row execute procedure moddatetime (updated_at);

-- 6. RLS (Row Level Security) の設定
alter table public.profiles enable row level security;
alter table public.quest_logs enable row level security;
alter table public.quests enable row level security; -- クエスト内容は全員閲覧可能

-- 閲覧ポリシー
create policy "Users can view their own children profiles" 
  on public.profiles for select using (auth.uid() = user_id);

create policy "Users can insert their own children profiles" 
  on public.profiles for insert with check (auth.uid() = user_id);

-- Quest Logs のポリシー（JOINを避けるために profile_id 経由でチェック）
create policy "Users can view logs of their own children" 
  on public.quest_logs for all 
  using (exists (
    select 1 from public.profiles 
    where profiles.id = quest_logs.profile_id 
    and profiles.user_id = auth.uid()
  ));

create policy "Anyone can view quests" 
  on public.quests for select using (true);