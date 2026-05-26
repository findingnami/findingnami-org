# Finding Nami — Claude Code Build Guide

> A social enterprise web platform for Filipina professionals. Community, learning, and career opportunities — built for those who want to grow their careers and transition into remote work.

---

## Platform Overview

**Finding Nami** (findingnami.com) is a career growth platform and community designed specifically for Filipina professionals who want to work remotely — to grow their skills, find opportunities, and build a career that gives them the freedom and flexibility to live on their own terms.

The name carries dual meaning: *nami* in Filipino means "enjoyable" or "pleasant" — finding your joy, your fulfillment, your best self. And *nami* in Japanese means "wave" — riding the wave of the remote work movement. It is a social enterprise, meaning revenue is reinvested to subsidize access for women who cannot yet afford the transition.

**Mission:** To help Filipina professionals grow their careers and transition into remote work — through community, learning, and opportunities.

**Target audience:** Filipina professionals aged 25–40 who are actively working toward remote work — whether they're building skills for it, job hunting for remote roles, going freelance, or just starting to explore the possibility.

**Three core pillars:**

1. **Community** — a safe, culturally grounded space to connect, share wins, ask questions, and find mentors; built around the "ate mentoring bunso" culture natural to Filipino women
2. **Learning** — curated trainings, workshops, and resources aligned to remote-ready and in-demand digital skills
3. **Opportunities** — curated remote job leads, freelance gigs, and partner companies that actively want to hire Filipina talent

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router (TypeScript) |
| Database & Auth | Supabase (Postgres, Auth, Realtime, Storage, Edge Functions) |
| Hosting | Vercel |
| Styling | Tailwind CSS only |
| Email | Resend (transactional + weekly digest) |
| Language | TypeScript throughout |

---

## Folder Structure

```
/
├── app/
│   ├── (auth)/               # Auth-gated routes
│   │   ├── onboarding/       # 3-step new member onboarding
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/               # Authenticated app shell
│   │   ├── feed/             # Community feed
│   │   ├── circles/          # Private member circles
│   │   ├── events/           # Events and RSVPs
│   │   ├── members/          # Member directory
│   │   ├── profile/[id]/     # Public member profiles
│   │   └── settings/         # Account settings
│   ├── (marketing)/          # Public-facing pages
│   │   ├── page.tsx          # Landing / waitlist page
│   │   └── about/
│   └── api/                  # Route handlers (use sparingly)
├── components/               # All shared React components
│   ├── ui/                   # Base UI elements
│   ├── feed/                 # Feed-specific components
│   ├── events/               # Event-specific components
│   └── circles/              # Circle-specific components
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser Supabase client
│   │   └── server.ts         # Server Supabase client
│   ├── actions/              # All server actions live here
│   └── utils.ts
├── supabase/
│   ├── migrations/           # All DB migrations (numbered)
│   └── seed.sql
└── types/
    └── supabase.ts           # Generated types — do not edit manually
```

---

## Database Schema (Core Tables)

### `profiles`
Extends Supabase auth.users. One row per member.

```sql
id                  uuid references auth.users primary key
username            text unique not null
full_name           text not null
avatar_url          text
bio                 text
industry            text
career_stage        text  -- 'entry' | 'mid' | 'senior' | 'exec'
remote_goal         text  -- 'exploring' | 'job-hunting' | 'freelancing' | 'already-remote'
location            text
linkedin_url        text
is_mentor           boolean default false
email_notifications boolean default true
membership_tier     text default 'free'  -- 'free' | 'pro' | 'subsidized'
created_at          timestamptz default now()
```

### `posts`
Community posts in channels or circles.

```sql
id          uuid primary key default gen_random_uuid()
author_id   uuid references profiles(id)
channel_id  uuid references channels(id)
circle_id   uuid references circles(id)  -- null if in public channel
content     text not null
is_pinned   boolean default false
created_at  timestamptz default now()
```

### `channels`
Public community channels.

```sql
id          uuid primary key default gen_random_uuid()
slug        text unique not null
name        text not null
description text
is_public   boolean default true
created_at  timestamptz default now()
```

**Seed channels to create at launch:**
- `#general` — open conversation
- `#remote-jobs` — curated remote job listings and leads
- `#wins` — celebrate milestones, big and small
- `#ask-the-community` — no question is too small
- `#tools-and-resources` — apps, setups, templates
- `#freelance-corner` — clients, rates, contracts, advice

### `circles`
Private member groups (e.g. industry cohorts, mentorship groups, remote job hunters).

```sql
id          uuid primary key default gen_random_uuid()
name        text not null
description text
created_by  uuid references profiles(id)
is_private  boolean default true
max_members int default 20
created_at  timestamptz default now()
```

### `circle_members`

```sql
circle_id   uuid references circles(id)
user_id     uuid references profiles(id)
role        text default 'member'  -- 'member' | 'admin'
joined_at   timestamptz default now()
primary key (circle_id, user_id)
```

### `events`

```sql
id            uuid primary key default gen_random_uuid()
title         text not null
description   text
host_id       uuid references profiles(id)
starts_at     timestamptz not null
ends_at       timestamptz
is_online     boolean default true
meeting_url   text
max_seats     int
cover_url     text
created_at    timestamptz default now()
```

### `event_rsvps`

```sql
event_id    uuid references events(id)
user_id     uuid references profiles(id)
status      text default 'going'  -- 'going' | 'waitlist'
rsvped_at   timestamptz default now()
primary key (event_id, user_id)
```

### `follows`

```sql
follower_id  uuid references profiles(id)
following_id uuid references profiles(id)
created_at   timestamptz default now()
primary key (follower_id, following_id)
```

---

## MVP Feature Phases

### Phase 1 — Ship First (Community Core)

These are the only features that need to exist before launching to early members. Community drives retention — build this before anything else.

| Feature | Priority | Notes |
|---|---|---|
| Auth (email + Google magic link) | Must | Supabase Auth handles this |
| Member profiles | Must | Photo, name, bio, industry, career stage, remote goal |
| 3-step onboarding flow | Must | Collect profile data on first login |
| Public community feed | Must | Posts across public channels, realtime updates |
| Events (create + RSVP) | Must | Online-only at launch: workshops, webinars, Q&As |
| Member directory | Should | Searchable by industry, career stage, remote goal |
| Basic notifications | Should | New post in a followed channel |

### Phase 2 — After First 50 Members

| Feature | Notes |
|---|---|
| Circles (private groups) | Remote job hunters, freelance cohorts, industry groups, mentorship |
| Mentor matching | Form-based match pairing members with those already working remotely |
| Weekly digest email | Top posts + upcoming events via Resend + Edge Function |
| Member follows | Follow individuals, personalized feed |
| Resource library | Uploaded PDFs, templates, remote job board links, rate guides |

### Phase 3 — After Revenue Validation

| Feature | Notes |
|---|---|
| Membership tiers (free/pro/subsidized) | Gate premium features behind Pro |
| Learning hub | Short courses and recorded workshops: remote-ready skills, async communication, freelance contracts, client management |
| Remote job board | Curated listings — verified remote roles, Philippine-friendly companies |
| Admin dashboard | Analytics, moderation, member management |
| Corporate partner portal | Intake form, sponsored events, talent access |
| OFW returnee track | Specialized path for balikbayans restarting careers remotely |

---

## Coding Rules — Always Follow

1. **All DB access via server components or server actions** — never expose keys or run queries client-side.
2. **Always use the typed Supabase client** — regenerate types after every migration: `supabase gen types typescript --local > types/supabase.ts`
3. **RLS must be enabled on every table** — write policies alongside every migration. Never skip.
4. **Use server actions for mutations**, not API route handlers, unless a route handler is specifically required (e.g. webhooks).
5. **Components go in `/components`** — never define components inline inside page files.
6. **Tailwind only** — no inline styles, no CSS modules, no styled-components.
7. **Commit after every feature** — small, stable commits. Do not accumulate large diffs.
8. **Do not add new dependencies** without flagging it first. Prefer what's already in the stack.

---

## Row-Level Security Policies (Required on Every Table)

Write these as migration files, not ad-hoc SQL.

```sql
-- profiles: anyone can read, only owner can update
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- posts: public channel posts visible to all authenticated users
alter table posts enable row level security;
create policy "Authenticated users can read public posts" on posts for select
  using (circle_id is null and auth.role() = 'authenticated');
create policy "Authenticated users can insert posts" on posts for insert
  with check (auth.uid() = author_id);

-- circles: members only can read their circles
alter table circles enable row level security;
create policy "Circle members can read their circles" on circles for select
  using (id in (select circle_id from circle_members where user_id = auth.uid()));

-- circle_members: only admins can add members
alter table circle_members enable row level security;
create policy "Circle admins can insert members" on circle_members for insert
  with check (
    (select role from circle_members where circle_id = circle_members.circle_id and user_id = auth.uid()) = 'admin'
  );
```

---

## Key Prompts for Claude Code

Use these as starting points. Copy them directly into Claude Code.

**Initial schema migration:**
```
Create the full initial Supabase migration for the following tables: profiles, posts,
channels, circles, circle_members, events, event_rsvps, follows. Include RLS policies
for each table. Place the file in /supabase/migrations/ with a timestamp prefix.
Follow all conventions in CLAUDE.md.
```

**Onboarding flow:**
```
Build /app/(auth)/onboarding/page.tsx — a 3-step onboarding form.
Step 1: full_name + avatar upload to Supabase Storage.
Step 2: industry + career_stage (dropdown).
Step 3: remote_goal (exploring | job-hunting | freelancing | already-remote) + optional bio.
On final step, upsert to the profiles table via a server action.
Redirect to /feed on completion.
```

**Community feed:**
```
Build /app/(main)/feed/page.tsx — a server component that fetches the 20 most recent
posts across all public channels (where circle_id is null), ordered by created_at desc.
Join with the author's profile for avatar and name. Include a client component wrapper
that subscribes to Supabase Realtime and prepends new posts without a full page refresh.
```

**Weekly digest Edge Function:**
```
Write a Supabase Edge Function called weekly-digest. It should run every Sunday at 8am
Philippine Time (UTC+8). Fetch the top 5 most-liked posts from the past 7 days and the
3 next upcoming events. Send a formatted HTML email via Resend to all members where
email_notifications = true. Store the Resend API key in Supabase secrets.
```

**Circles RLS:**
```
Write RLS policies for the circles and circle_members tables. Requirements:
- Only circle members can read a circle's posts
- Only circle admins can add new members
- Only the platform admin (hardcoded UUID or role) can create new circles
Write as a migration file in /supabase/migrations/.
```

---

## How to Prompt Claude Code Effectively

**One feature per session.** Give Claude Code one well-scoped task with clear boundaries.
- ✓ "Build the member profile page"
- ✗ "Build the whole platform"

**Specify inputs and outputs.** Tell Claude what data comes in, what the UI shows, and what happens on submit.
- ✓ "Takes profile row, shows avatar, name, bio, industry. Edit button opens an inline form that saves via server action."

**Always mention RLS.** Remind Claude to write RLS policies alongside every new table.
- ✓ "Also write the RLS policy so only the owner can update their own row."

**Ask for migration files, not raw SQL.** Claude Code should write proper Supabase migration files, not raw SQL run in the dashboard.
- ✓ "Write this as a migration file in /supabase/migrations/"

**Reference files with `#`.** In Claude Code, type `#app/components/Feed.tsx` to have it read the actual file before making edits.

**Regenerate types after every migration.** Run this, then tell Claude Code to always import from the types file:
```bash
supabase gen types typescript --local > types/supabase.ts
```

---

## Do Not

- Use the Supabase **service role key** anywhere client-side — it bypasses RLS entirely.
- Create API route handlers when a server action will accomplish the same thing.
- Skip writing RLS policies. Every table must have them before going to production.
- Write components inline in page files — always extract to `/components`.
- Use `any` types in TypeScript. Use generated Supabase types.
- Add new npm dependencies without checking first.
- Run raw SQL in the Supabase dashboard — always write a migration file.

---

## Environment Variables

Keep these in `.env.local` for local dev and in Vercel environment settings for production.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # Server-side only — never expose client-side
RESEND_API_KEY=                 # For transactional email
NEXT_PUBLIC_SITE_URL=https://findingnami.com
```

---

## Revenue Model (Context for Feature Decisions)

| Stream | Details |
|---|---|
| Membership (Free) | Community access, public feed, events — strong free tier to build from |
| Membership (Pro, ₱499/mo) | Circles, mentor matching, resource library, cohort programs |
| Membership (Subsidized) | Funded by Pro + corporate revenue; for members who can't yet afford Pro |
| Corporate partnerships (₱25K/mo) | Remote-friendly companies pay for job listing placement, sponsored events, and access to the talent pool |
| Sponsored workshops (₱10K–₱30K/event) | A brand sponsors a workshop — they get visibility, members get free training |
| Cohort programs (₱2K–₱8K/member) | Structured 6–8 week programs with mentorship, curriculum, and a certificate |

**Key insight:** Membership fees alone are slow to scale. The fastest path to hiring income is landing 2–3 corporate partners early — even before membership revenue is significant. One ₱25–30K/month partnership changes everything.

**Design rule:** Never build a feature that only makes sense at scale. Every feature must serve the first 50 members as well as it would serve 5,000.

---

## Platform Identity

| Attribute | Detail |
|---|---|
| Domain | findingnami.com |
| Backup domains | findingnami.org (redirect), findingnami.ph (redirect) |
| Primary language | English with Filipino/Taglish where culturally appropriate |
| Tone | Warm, encouraging — "ate who went remote and is pulling you up" energy |
| Business email | Use @findingnami.com for all outreach |
| Founder title | Founder & Executive Director |
| Cultural context | OFW situations, balikbayan career restarts, and safe spaces for workplace dynamics unique to Filipino women are all first-class concerns |

---

*This file is the source of truth for Claude Code on this project. Update it as the platform evolves.*
