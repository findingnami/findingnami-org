-- Storage bucket for event cover images
insert into storage.buckets (id, name, public)
values ('event-covers', 'event-covers', true)
on conflict (id) do nothing;

-- Any authenticated user can upload to their own folder
create policy "Auth users can upload event covers"
  on storage.objects for insert
  with check (
    bucket_id = 'event-covers'
    and auth.role() = 'authenticated'
  );

-- Public read access (bucket is public)
create policy "Event covers are publicly readable"
  on storage.objects for select
  using (bucket_id = 'event-covers');

-- Owners can delete their own covers
create policy "Users can delete own event covers"
  on storage.objects for delete
  using (
    bucket_id = 'event-covers'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
