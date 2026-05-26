-- ============================================================
-- Migration 0002: Onboarding field additions
-- Adds current_work_setup column; updates career_stage to use
-- 'early' (matches onboarding UX); adds 'negotiating-wfh' to
-- remote_goal options.
-- ============================================================

-- Drop existing inline check constraints so we can redefine them
alter table public.profiles drop constraint if exists profiles_career_stage_check;
alter table public.profiles drop constraint if exists profiles_remote_goal_check;

-- career_stage: use 'early' instead of 'entry' to match onboarding copy
-- 'exec' kept for future use (not shown in onboarding UI)
alter table public.profiles
  add constraint profiles_career_stage_check
  check (career_stage in ('early', 'mid', 'senior', 'exec'));

-- remote_goal: add 'negotiating-wfh'; keep 'exploring' for backward compat
alter table public.profiles
  add constraint profiles_remote_goal_check
  check (remote_goal in ('negotiating-wfh', 'exploring', 'job-hunting', 'freelancing', 'already-remote'));

-- Add current_work_setup column (new field collected during onboarding)
alter table public.profiles
  add column if not exists current_work_setup text
  check (current_work_setup in ('on-site', 'hybrid', 'remote', 'freelance'));
