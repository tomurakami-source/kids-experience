-- authenticated ロールにテーブルアクセス権を付与
grant select, insert, update, delete on public.profiles  to authenticated;
grant select, insert, update, delete on public.quest_logs to authenticated;
grant select                         on public.quests     to authenticated;

-- シーケンス（quests.id は serial）の使用権も付与
grant usage, select on sequence public.quests_id_seq to authenticated;
