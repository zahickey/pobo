-- PoBo — Phase 1 schema (accounts, venues, events, discovery, RSVPs).
-- Data model per POBO_PRODUCT_BRIEF.md §5. Phase 2 tables (friendships, shares)
-- are added in a later migration when that phase starts.

create extension if not exists postgis with schema public;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Auto-create a profile row when a new auth user signs up, with a placeholder
-- username derived from the user id (client should prompt to claim a real one).
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, 'user_' || substr(new.id::text, 1, 8));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- venues
-- ---------------------------------------------------------------------------

create table venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  address text,
  location geography(point, 4326),
  neighborhood text,
  timezone text not null,
  description text,
  photo_url text,
  website text,
  instagram text,
  verified boolean not null default false,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create index venues_location_idx on venues using gist (location);

alter table venues enable row level security;

create table venue_members (
  venue_id uuid not null references venues (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  role text not null check (role in ('owner', 'manager')),
  created_at timestamptz not null default now(),
  primary key (venue_id, profile_id)
);

alter table venue_members enable row level security;

-- true if the current user owns/manages the venue, or is an admin.
create function is_venue_manager(target_venue_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from venue_members
    where venue_id = target_venue_id and profile_id = auth.uid()
  ) or exists (
    select 1 from profiles where id = auth.uid() and is_admin
  );
$$;

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------

create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

alter table categories enable row level security;

insert into categories (slug, name) values
  ('trivia', 'Trivia'),
  ('dance', 'Dance'),
  ('karaoke', 'Karaoke'),
  ('live-music', 'Live music'),
  ('comedy', 'Comedy'),
  ('open-mic', 'Open mic'),
  ('games-bingo', 'Games & bingo'),
  ('classes-workshops', 'Classes & workshops'),
  ('other', 'Other');

-- ---------------------------------------------------------------------------
-- event_series / occurrences
-- ---------------------------------------------------------------------------

create table event_series (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues (id) on delete cascade,
  title text not null,
  description text,
  category_id uuid not null references categories (id),
  price_text text,
  image_url text,
  age_limit smallint,
  rrule text, -- null for a one-off event
  dtstart_local timestamp not null, -- local wall-clock start, interpreted in `timezone`
  duration_minutes integer not null check (duration_minutes > 0),
  timezone text not null, -- IANA tz name, e.g. 'America/Los_Angeles'
  status text not null default 'active' check (status in ('active', 'paused', 'ended')),
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create index event_series_venue_idx on event_series (venue_id);

alter table event_series enable row level security;

create table occurrences (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references event_series (id) on delete cascade,
  venue_id uuid not null references venues (id) on delete cascade, -- denormalized for the map query
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  status text not null default 'scheduled' check (status in ('scheduled', 'cancelled')),
  title_override text,
  description_override text,
  price_text_override text,
  image_url_override text,
  created_at timestamptz not null default now(),
  unique (series_id, starts_at)
);

-- Key query: occurrences in the map's bounding box, overlapping a time window,
-- ordered by distance then start time (see POBO_PRODUCT_BRIEF.md §5).
create index occurrences_time_idx on occurrences (starts_at, ends_at);
create index occurrences_venue_idx on occurrences (venue_id);

alter table occurrences enable row level security;

-- ---------------------------------------------------------------------------
-- rsvps
-- ---------------------------------------------------------------------------

create table rsvps (
  occurrence_id uuid not null references occurrences (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  kind text not null check (kind in ('going', 'interested')),
  created_at timestamptz not null default now(),
  primary key (occurrence_id, profile_id)
);

alter table rsvps enable row level security;

-- Public aggregate so event pages can show a count without exposing who RSVP'd
-- (per-friend display is Phase 2). Runs as the view owner, bypassing rsvps' RLS.
create view occurrence_rsvp_counts
with (security_invoker = false) as
  select
    occurrence_id,
    count(*) filter (where kind = 'going') as going_count,
    count(*) filter (where kind = 'interested') as interested_count
  from rsvps
  group by occurrence_id;

grant select on occurrence_rsvp_counts to anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS policies
-- ---------------------------------------------------------------------------

-- profiles: readable by any signed-in user (needed for usernames on RSVPs/friends);
-- writable only by the owning user.
create policy "profiles are readable by authenticated users"
  on profiles for select
  to authenticated
  using (true);

create policy "users manage their own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- venues / categories / event_series / occurrences: public read (anon included) —
-- share links and the map must work for signed-out visitors.
create policy "venues are publicly readable" on venues for select to anon, authenticated using (true);
create policy "categories are publicly readable" on categories for select to anon, authenticated using (true);
create policy "event_series are publicly readable" on event_series for select to anon, authenticated using (true);
create policy "occurrences are publicly readable" on occurrences for select to anon, authenticated using (true);

create policy "venue managers and admins update their venue"
  on venues for update
  to authenticated
  using (is_venue_manager(id))
  with check (is_venue_manager(id));

create policy "authenticated users create venues"
  on venues for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "venue owners manage membership"
  on venue_members for all
  to authenticated
  using (is_venue_manager(venue_id))
  with check (is_venue_manager(venue_id));

create policy "members read their own venue memberships"
  on venue_members for select
  to authenticated
  using (profile_id = auth.uid() or is_venue_manager(venue_id));

create policy "venue managers create event series"
  on event_series for insert
  to authenticated
  with check (is_venue_manager(venue_id));

create policy "venue managers update event series"
  on event_series for update
  to authenticated
  using (is_venue_manager(venue_id))
  with check (is_venue_manager(venue_id));

create policy "venue managers delete event series"
  on event_series for delete
  to authenticated
  using (is_venue_manager(venue_id));

create policy "venue managers manage occurrences"
  on occurrences for all
  to authenticated
  using (is_venue_manager(venue_id))
  with check (is_venue_manager(venue_id));

-- rsvps: a user only ever sees/writes their own RSVP row; counts come from the view above.
create policy "users read their own rsvps"
  on rsvps for select
  to authenticated
  using (profile_id = auth.uid());

create policy "users manage their own rsvps"
  on rsvps for all
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());
