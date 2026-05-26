-- ============================================================
-- Migration 0003: Seed public channels
-- ============================================================

insert into public.channels (slug, name, description, is_public) values
  ('remote-jobs',       'Remote Jobs',       'Curated remote job leads and hiring news',                true),
  ('wfh-wins',          'WFH Wins',          'Share your remote work wins — big and small',             true),
  ('ask-the-community', 'Ask the Community', 'No question is too small. Ask away.',                     true),
  ('introductions',     'Introductions',     'New here? Tell us who you are and what you''re after.',   true),
  ('tools-and-tips',    'Tools & Tips',      'Apps, setups, and workflows that make remote work work',  true)
on conflict (slug) do nothing;
