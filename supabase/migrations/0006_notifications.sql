create table notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade,
  type        text not null,
  -- types: 'new_post_in_channel' | 'reply_to_post' | 'event_reminder' | 'new_member'
  title       text not null,
  body        text,
  link        text,
  is_read     boolean default false,
  created_at  timestamptz default now()
);

alter table notifications enable row level security;

create policy "Users can only see own notifications"
  on notifications for select using (auth.uid() = user_id);

create policy "Users can mark own notifications as read"
  on notifications for update using (auth.uid() = user_id);
