-- profiles テーブルに不足していた DELETE / UPDATE の RLS ポリシーを追加

create policy "Users can update their own children profiles"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own children profiles"
  on public.profiles for delete
  using (auth.uid() = user_id);
