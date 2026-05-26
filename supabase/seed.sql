-- Seed the default community channels
insert into public.channels (slug, name, description, is_public) values
  ('general',           '#general',            'Open conversation for the whole community',          true),
  ('remote-jobs',       '#remote-jobs',         'Curated remote job listings and leads',              true),
  ('wins',              '#wins',                'Celebrate milestones, big and small',                true),
  ('ask-the-community', '#ask-the-community',   'No question is too small',                          true),
  ('tools-resources',   '#tools-and-resources', 'Apps, setups, templates, and tools we love',        true),
  ('freelance-corner',  '#freelance-corner',    'Clients, rates, contracts, and freelance advice',    true)
on conflict (slug) do nothing;
