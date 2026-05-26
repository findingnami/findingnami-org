-- ============================================================
-- Migration 0004: Feed additions
-- Adds parent_id to posts (for replies) and creates post_likes.
-- ============================================================

-- Add parent_id for inline reply threads (one level deep)
alter table public.posts
  add column if not exists parent_id uuid references public.posts(id) on delete cascade;

-- Post likes (toggle like on any top-level post)
create table if not exists public.post_likes (
  post_id    uuid references public.posts(id) on delete cascade,
  user_id    uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

alter table public.post_likes enable row level security;

create policy "Authenticated users can read likes"
  on public.post_likes for select
  to authenticated using (true);

create policy "Users can manage own likes"
  on public.post_likes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
