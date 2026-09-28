-- Local dev seed data — a few San Francisco venues so the map isn't empty.
-- Not the admin seeding tool (roadmap Step 3); just enough to develop discovery against.

insert into venues (id, name, slug, address, location, neighborhood, timezone, description)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'The Independent',
    'the-independent',
    '628 Divisadero St, San Francisco, CA',
    st_setsrid(st_makepoint(-122.4376, 37.7756), 4326),
    'NoPa',
    'America/Los_Angeles',
    'Live music venue with weekly shows.'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Zeitgeist',
    'zeitgeist',
    '199 Valencia St, San Francisco, CA',
    st_setsrid(st_makepoint(-122.4218, 37.7699), 4326),
    'Mission',
    'America/Los_Angeles',
    'Dive bar with a big beer garden.'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Verjus Wine Bar',
    'verjus-wine-bar',
    '1275 Minnesota St, San Francisco, CA',
    st_setsrid(st_makepoint(-122.3877, 37.7513), 4326),
    'Dogpatch',
    'America/Los_Angeles',
    'Natural wine bar hosting trivia and karaoke nights.'
  );

insert into event_series (id, venue_id, title, description, category_id, price_text, dtstart_local, duration_minutes, timezone, rrule)
select
  '00000000-0000-0000-0000-000000000010'::uuid,
  '00000000-0000-0000-0000-000000000003'::uuid,
  'Trivia Night',
  'Weekly trivia, teams of up to 6.',
  (select id from categories where slug = 'trivia'),
  'Free',
  '2025-01-07 20:00:00'::timestamp,
  120,
  'America/Los_Angeles',
  'FREQ=WEEKLY;BYDAY=TU'
union all
select
  '00000000-0000-0000-0000-000000000011'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid,
  'Karaoke',
  'Sign-ups start at 9.',
  (select id from categories where slug = 'karaoke'),
  'Cover $5',
  '2025-01-10 21:00:00'::timestamp,
  180,
  'America/Los_Angeles',
  'FREQ=WEEKLY;BYDAY=FR';

-- A couple of one-off series so every time filter ("Now" needs something live
-- or starting within the hour) has something to show in local dev, regardless
-- of what day/time it actually is when you seed.
insert into event_series (id, venue_id, title, description, category_id, price_text, dtstart_local, duration_minutes, timezone, rrule)
select
  '00000000-0000-0000-0000-000000000012'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Live Jazz',
  'Local trio, no cover.',
  (select id from categories where slug = 'live-music'),
  'Free',
  '2025-01-01 19:00:00'::timestamp,
  150,
  'America/Los_Angeles',
  null
union all
select
  '00000000-0000-0000-0000-000000000013'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Stand-Up Open Mic',
  'Sign up at the door, 5 minutes a set.',
  (select id from categories where slug = 'comedy'),
  'Cover $10',
  '2025-01-01 21:00:00'::timestamp,
  120,
  'America/Los_Angeles',
  null;

-- Occurrences are normally generated from event_series by the recurrence Edge
-- Function (roadmap Step 2). Seed these directly, relative to now(), so local
-- discovery queries have something to return before that function has run.
insert into occurrences (series_id, venue_id, starts_at, ends_at)
values
  (
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000003',
    now() + interval '2 hours',
    now() + interval '4 hours'
  ),
  (
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000002',
    now() + interval '1 day',
    now() + interval '1 day 3 hours'
  ),
  (
    -- live right now
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000001',
    now() - interval '20 minutes',
    now() + interval '90 minutes'
  ),
  (
    -- starting soon
    '00000000-0000-0000-0000-000000000013',
    '00000000-0000-0000-0000-000000000001',
    now() + interval '30 minutes',
    now() + interval '150 minutes'
  );
