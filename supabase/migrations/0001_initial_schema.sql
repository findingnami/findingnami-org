-- ============================================================
-- Finding Nami — Initial Schema
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

-- channels: public community channels (#general, #wins, etc.)
create table if not exists public.channels (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  is_public   boolean default true,
  created_at  timestamptz default now()
);

-- profiles: one row per member, extends auth.users
create table if not exists public.profiles (
  id                  uuid references auth.users(id) on delete cascade primary key,
  username            text unique not null,
  full_name           text not null,
  avatar_url          text,
  bio                 text,
  industry            text,
  career_stage        text check (career_stage in ('entry', 'mid', 'senior', 'exec')),
  remote_goal         text check (remote_goal in ('exploring', 'job-hunting', 'freelancing', 'already-remote')),
  location            text,
  linkedin_url        text,
  is_mentor           boolean default false,
  email_notifications boolean default true,
  membership_tier     text default 'free' check (membership_tier in ('free', 'pro', 'subsidized')),
  created_at          timestamptz default now()
);

-- circles: private member groups
create table if not exists public.circles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  created_by  uuid references public.profiles(id) on delete set null,
  is_private  boolean default true,
  max_members int default 20,
  created_at  timestamptz default now()
);

-- posts: community posts in channels or circles
create table if not exists public.posts (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid references public.profiles(id) on delete cascade not null,
  channel_id uuid references public.channels(id) on delete cascade,
  circle_id  uuid references public.circles(id) on delete cascade,
  content    text not null,
  is_pinned  boolean default false,
  created_at timestamptz default now(),
  constraint post_must_have_channel_or_circle check (
    (channel_id is not null and circle_id is null) or
    (circle_id is not null and channel_id is null)
  )
);

-- events: online workshops, webinars, Q&As
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  host_id     uuid references public.profiles(id) on delete set null,
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  is_online   boolean default true,
  meeting_url text,
  max_seats   int,
  cover_url   text,
  created_at  timestamptz default now()
);

-- event_rsvps: attendance tracking
create table if not exists public.event_rsvps (
  event_id  uuid references public.events(id) on delete cascade,
  user_id   uuid references public.profiles(id) on delete cascade,
  status    text default 'going' check (status in ('going', 'waitlist')),
  rsvped_at timestamptz default now(),
  primary key (event_id, user_id)
);

-- circle_members: membership in private circles
create table if not exists public.circle_members (
  circle_id uuid references public.circles(id) on delete cascade,
  user_id   uuid references public.profiles(id) on delete cascade,
  role      text default 'member' check (role in ('member', 'admin')),
  joined_at timestamptz default now(),
  primary key (circle_id, user_id)
);

-- follows: member-to-member following
create table if not exists public.follows (
  follower_id  uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at   timestamptz default now(),
  primary key (follower_id, following_id),
  constraint cannot_follow_self check (follower_id != following_id)
);

-- mentor_applications: members apply to mentor or be mentored
create table if not exists public.mentor_applications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) on delete cascade not null,
  type         text not null check (type in ('mentor', 'mentee')),
  industries   text[],
  skills       text[],
  goals        text,
  availability text,
  status       text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at   timestamptz default now()
);

-- mentor_matches: approved pairings
create table if not exists public.mentor_matches (
  id         uuid primary key default gen_random_uuid(),
  mentor_id  uuid references public.profiles(id) on delete cascade not null,
  mentee_id  uuid references public.profiles(id) on delete cascade not null,
  status     text default 'active' check (status in ('active', 'completed', 'paused')),
  notes      text,
  started_at timestamptz default now(),
  ended_at   timestamptz,
  created_at timestamptz default now(),
  constraint mentor_mentee_unique unique (mentor_id, mentee_id),
  constraint cannot_mentor_self check (mentor_id != mentee_id)
);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username  text;
  final_username text;
  counter        int := 0;
begin
  -- Derive a clean username from the email prefix
  base_username := lower(
    regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_]', '', 'g')
  );
  if base_username = '' then
    base_username := 'nami';
  end if;

  final_username := base_username;

  -- Ensure uniqueness by appending an incrementing suffix
  while exists (select 1 from public.profiles where username = final_username) loop
    counter       := counter + 1;
    final_username := base_username || counter::text;
  end loop;

  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data ->> 'full_name', final_username)
  );

  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================

-- channels
alter table public.channels enable row level security;

create policy "Anyone can view public channels"
  on public.channels for select
  using (is_public = true);

-- profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- posts
alter table public.posts enable row level security;

create policy "Authenticated users can read public posts"
  on public.posts for select
  using (circle_id is null and auth.role() = 'authenticated');

create policy "Circle members can read circle posts"
  on public.posts for select
  using (
    circle_id is not null
    and circle_id in (
      select circle_id from public.circle_members where user_id = auth.uid()
    )
  );

create policy "Authenticated users can insert posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Authors can update own posts"
  on public.posts for update
  using (auth.uid() = author_id);

create policy "Authors can delete own posts"
  on public.posts for delete
  using (auth.uid() = author_id);

-- events
alter table public.events enable row level security;

create policy "Authenticated users can view events"
  on public.events for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can create events"
  on public.events for insert
  with check (auth.uid() = host_id);

create policy "Hosts can update own events"
  on public.events for update
  using (auth.uid() = host_id);

create policy "Hosts can delete own events"
  on public.events for delete
  using (auth.uid() = host_id);

-- event_rsvps
alter table public.event_rsvps enable row level security;

create policy "Authenticated users can view rsvps"
  on public.event_rsvps for select
  using (auth.role() = 'authenticated');

create policy "Users can rsvp to events"
  on public.event_rsvps for insert
  with check (auth.uid() = user_id);

create policy "Users can update own rsvp"
  on public.event_rsvps for update
  using (auth.uid() = user_id);

create policy "Users can cancel own rsvp"
  on public.event_rsvps for delete
  using (auth.uid() = user_id);

-- circles
alter table public.circles enable row level security;

create policy "Circle members can read their circles"
  on public.circles for select
  using (
    id in (
      select circle_id from public.circle_members where user_id = auth.uid()
    )
  );

create policy "Circle members can update their circles"
  on public.circles for update
  using (
    id in (
      select circle_id from public.circle_members
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- circle_members
alter table public.circle_members enable row level security;

create policy "Circle members can view memberships in their circles"
  on public.circle_members for select
  using (
    circle_id in (
      select circle_id from public.circle_members where user_id = auth.uid()
    )
  );

create policy "Circle admins can insert members"
  on public.circle_members for insert
  with check (
    (
      select role from public.circle_members
      where circle_id = public.circle_members.circle_id
        and user_id = auth.uid()
    ) = 'admin'
  );

create policy "Members can leave circles, admins can remove members"
  on public.circle_members for delete
  using (
    user_id = auth.uid()
    or (
      select role from public.circle_members
      where circle_id = public.circle_members.circle_id
        and user_id = auth.uid()
    ) = 'admin'
  );

-- follows
alter table public.follows enable row level security;

create policy "Authenticated users can view follows"
  on public.follows for select
  using (auth.role() = 'authenticated');

create policy "Users can follow others"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- mentor_applications
alter table public.mentor_applications enable row level security;

create policy "Users can view own mentor applications"
  on public.mentor_applications for select
  using (auth.uid() = user_id);

create policy "Users can create own mentor applications"
  on public.mentor_applications for insert
  with check (auth.uid() = user_id);

create policy "Users can update own mentor applications"
  on public.mentor_applications for update
  using (auth.uid() = user_id);

-- mentor_matches
alter table public.mentor_matches enable row level security;

create policy "Matched users can view their mentor relationships"
  on public.mentor_matches for select
  using (auth.uid() = mentor_id or auth.uid() = mentee_id);
