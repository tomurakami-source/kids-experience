-- quest-photos バケットへのアップロード権限を付与
create policy "Authenticated users can upload quest photos" on storage.objects for insert to authenticated with check (bucket_id = 'quest-photos');

create policy "Authenticated users can update quest photos" on storage.objects for update to authenticated using (bucket_id = 'quest-photos');

create policy "Authenticated users can delete quest photos" on storage.objects for delete to authenticated using (bucket_id = 'quest-photos');
