# PoBo — product brief and roadmap

> **PoBo is your city's poster board.** Restaurants, bars and studios post their events (trivia, dance, karaoke, comedy…). People open a map, see what's happening **right now** or at a time they choose, and send it to friends.

This is the source of truth for what we're building and in what order. Brand and visual rules live in `docs/BRAND.md` and `brand/tokens/`.

---

## 1. The problem and the goal

"What's on near me tonight?" is surprisingly hard to answer. Venue events like weekly trivia or a salsa night live on scattered Instagram posts, websites and chalkboards. Ticketing apps (Eventbrite etc.) cover big ticketed events, not a bar's Tuesday quiz.

**Goal:** make recurring, local, mostly free venue events easy to post and easy to find, on a map, by time, by category, and easy to share with friends.

**Who it's for**

- **Goers:** people deciding what to do tonight or planning later in the week, usually with friends.
- **Venues:** bars, restaurants, cafés, dance and yoga studios, comedy rooms that run regular events and want more people at them.

**Market:** United States first. Launch in one dense city (San Francisco is the current candidate) rather than everywhere, so the map never feels empty.

**Success for the MVP:** in the launch area, a person can open the app on any evening and find several real events near them that are on now or starting soon, and a venue can post a weekly event in under two minutes.

## 2. Core loop

1. A **venue posts** an event (often recurring: "Trivia, every Tuesday 8–10 PM").
2. A **goer finds** it on the map or list, filtered to *now*, a chosen day and time, or a category.
3. The goer **shares** it (a link that works without the app, or in-app to friends) and marks **Going / Interested**.
4. Shared links bring new people in; seeing friends "going" brings them back.

Everything in Phase 1 serves this loop. Anything that doesn't waits.

## 3. Features

### Phase 1 — MVP: post, find, share

**Accounts and auth**
- Sign in with Apple and Sign in with Google; email one-time code as fallback. (Apple requires Sign in with Apple when Google sign-in is offered on iOS.)
- Two roles: **goer** (default) and **venue manager** (can manage one or more venues).
- Profile: display name, username (unique, used for friends later), optional avatar.
- Phone numbers are NOT required in v1.

**Venues**
- Venue profile: name, address, geocoded location (lat/lng), neighborhood, timezone, photo, short description, links (website / Instagram).
- A venue manager can create and edit their venue(s).
- Admin can create venues and events on a venue's behalf (needed for seeding; see §6).

**Events**
- Fields: title, category, description, venue, start time, **end time (required: "happening now" depends on it)**, price (free / amount / "cover"), optional image, optional age limit (21+).
- **Recurring events:** stored as a series with an iCalendar RRULE ("every Tuesday", "first Friday of the month"). Individual occurrences are generated for a rolling window (e.g. the next 8 weeks). A venue can cancel or edit a single occurrence without touching the series.
- Categories (starting set): Trivia, Dance, Karaoke, Live music, Comedy, Open mic, Games & bingo, Classes & workshops, Other.
- Store all times in UTC plus the venue's IANA timezone; display in the venue's local time.

**Discovery**
- **Map view** (default) with event pins; a list drawer under the map showing the same results.
- **Time filter:** "Now" (default at night), "Tonight", "Tomorrow", or a custom day + time range.
  - "Now" = occurrences where `start ≤ now < end`. Also surface "Starting soon" (within the next 60 min).
- **Category filter:** multi-select chips.
- **Distance:** results within the visible map area; list sorted by distance, then start time.
- Search by venue or event name.
- Location permission: ask with a clear reason; if denied, let the user pick a neighborhood / pan the map.

**Event page**
- Everything about the occurrence: title, venue, time, price, description, category, map snippet, directions (hand off to Apple / Google Maps), "Going" / "Interested", share.
- "Live now" state when it's happening; "Starts in N min" when close.

**Sharing**
- Every event occurrence has a public **web URL** (e.g. `pobo.<domain>/e/<id>`) that renders a real event page in any browser, with Open Graph tags and a generated share image (the brand "share card"). This page is the growth channel: every share is an ad.
- The same URL opens the app directly if installed (iOS Universal Links / Android App Links), otherwise shows the web page with an install prompt.
- Native share sheet from the event page.

**Going / Interested**
- A goer can mark an occurrence Going or Interested; it appears in a "My plans" list.
- Counts are shown on the event page (friends-specific display comes in Phase 2).

### Phase 2 — social

- **Friends:** add by username, invite link, or QR code. Friend requests (send / accept / decline), remove, block.
- **See friends' plans:** "3 friends going" on cards and event pages; a friends activity list.
- **In-app share:** send an event to one or more friends; a simple inbox of shared events (not a full chat).
- **Notifications:** friend request, a friend shared an event with you, an event you're going to starts in 1 hour.
- Privacy controls: who can see my plans (friends / nobody).

### Phase 3 — venues and growth

- **Venue claim and verification:** a venue manager claims a seeded venue page; verification by email domain, phone call, or manual review.
- **Venue analytics:** views, saves, going/interested and shares per event; simple weekly summary.
- **Follow a venue** and get its new events.
- Saved searches / "tell me when there's salsa near me on Fridays".
- Web dashboard for venues to manage events from a laptop.

### Later / ideas (not committed)

- Optional phone number to find friends from contacts (hashed matching only).
- Personalised recommendations.
- More cities.
- Paid promotion for venues.

## 4. Suggested stack

These were the working assumptions; change them if there's a good reason.

- **App:** React Native with **Expo** (iOS + Android from one codebase), TypeScript, Expo Router.
- **Backend:** **Supabase**: Postgres with **PostGIS** for geo queries, Supabase Auth (Apple, Google, email OTP), Storage for images, Row Level Security for permissions, Edge Functions for jobs (occurrence generation, share images, notifications).
- **Maps:** Mapbox (or Google Maps) via a React Native maps library; geocoding for venue addresses.
- **Web event pages:** a small web app (e.g. Next.js) on the same backend, rendering public event URLs, OG images and the Universal Links / App Links association files.
- **Recurrence:** an RRULE library (e.g. `rrule`) to expand series into occurrences.

## 5. Data model (starting sketch)

```
profiles        id (= auth user), username (unique), display_name, avatar_url, created_at
venues          id, name, slug, address, location geography(Point), neighborhood, timezone,
                description, photo_url, website, instagram, verified bool, created_by
venue_members   venue_id, profile_id, role ('owner' | 'manager')
categories      id, slug, name
event_series    id, venue_id, title, description, category_id, price_text, image_url, age_limit,
                rrule text (nullable for one-offs), dtstart_local, duration_minutes, timezone,
                status ('active' | 'paused' | 'ended')
occurrences     id, series_id, venue_id, starts_at timestamptz, ends_at timestamptz,
                status ('scheduled' | 'cancelled'), override fields (nullable)
rsvps           occurrence_id, profile_id, kind ('going' | 'interested'), created_at
friendships     requester_id, addressee_id, status ('pending' | 'accepted' | 'blocked'), created_at   -- Phase 2
shares          id, occurrence_id, from_id, to_id, created_at                                      -- Phase 2
```

Key query: occurrences within the map's bounding box (PostGIS), overlapping a time window (`starts_at < window_end AND ends_at > window_start`), filtered by category, ordered by distance. Index `occurrences(starts_at, ends_at)` and a GiST index on `venues.location`.

## 6. The hard part: supply

The app is only as good as how full the map is. Plan for it from day one:

- **Seed the launch area ourselves:** an admin tool (can be simple) to add venues and recurring events quickly, from venues' own posts and websites. Recurring events make this efficient: one series covers months.
- **Make posting effortless for venues:** recurring by default, sensible defaults, edit a single week without re-entering everything.
- **Give venues a reason to stay:** analytics (Phase 3) and the traffic from shared links.
- **Keep data fresh:** "last confirmed" date on series; flag stale ones for review; easy "cancel this week".

## 7. Brand and UI rules (summary)

Full rules in `docs/BRAND.md`; tokens in `brand/tokens/` (`theme.ts` for the app, `tokens.css` for the web).

- Direction "Riso": two fluoro inks, **riso blue `#2B50E0`** and **fluoro pink `#FF48B0`**, on warm paper `#F7F2E7`, with deep ink `#1A1A2E` text. Light and dark themes.
- **Blue carries the interface** (primary buttons, links, category chips, selected pins). **Pink means "now"** (the Live chip, live map pins with a pulse). Text on pink is dark ink, never white; pink is never text on light backgrounds.
- **Gloock** for event titles and headlines; **Instrument Sans** for everything else.
- Use tokens, never hard-coded colours. Touch targets ≥ 44px. States never rely on colour alone ("Live now" always has its label).

## 8. Non-goals for now

- Selling tickets or taking payments.
- Full chat / messaging.
- Big ticketed concerts and festivals (Eventbrite / Ticketmaster already cover them).
- User-generated events by non-venues (see open questions).

## 9. Open questions

- **Who can post?** Only verified venues (quality, slower growth) or anyone (faster, more spam)? Starting point: venues + admin seeding only.
- Launch city and neighborhoods to seed first.
- Domain for share links.
- Mapbox vs Google Maps (cost, look, React Native support).
- Whether to show events with no end time at all (currently: end time required).
