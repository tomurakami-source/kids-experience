-- チュートリアルクエストを追加（id=0 で一番最初に表示）
insert into public.quests (id, category, title, description, difficulty, criteria) values (0, 'チュートリアル', 'はじめの一歩', 'ピースして笑顔で写真を撮ろう！', 1, '{"photo_criteria":"ピースサインと笑顔が写っている写真。ピースのポーズと笑顔が確認できればOK。多少ぶれていても合格！","parent_guide":"操作方法を一緒に確認しながら、子どもに自由に撮らせてあげてください。","growth_point":"アプリの使い方を覚える・達成感の第一歩"}') on conflict (id) do nothing;
