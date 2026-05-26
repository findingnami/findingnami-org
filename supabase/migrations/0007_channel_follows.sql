create table channel_follows (
  channel_id  uuid references channels(id) on delete cascade,
  user_id     uuid references profiles(id) on delete cascade,
  created_at  timestamptz default now(),
  primary key (channel_id, user_id)
);

alter table channel_follows enable row level security;

create policy "Users can manage own channel follows"
  on channel_follows for all using (auth.uid() = user_id);

-- Auto-follow the 3 default channels when a profile row is created
create or replace function auto_follow_default_channels()
returns trigger as $$
declare
  v_channel_id uuid;
begin
  for v_channel_id in
    select id from channels where slug in ('remote-jobs', 'wfh-wins', 'ask-the-community')
  loop
    insert into channel_follows (channel_id, user_id)
    values (v_channel_id, new.id)
    on conflict (channel_id, user_id) do nothing;
  end loop;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created
  after insert on profiles
  for each row execute function auto_follow_default_channels();
