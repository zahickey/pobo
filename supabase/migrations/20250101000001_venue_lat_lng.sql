-- The REST API returns `geography` columns as WKB hex, which isn't directly
-- usable client-side for map pins. Expose plain lat/lng alongside `location`
-- so the mobile app doesn't need a WKB parser.

alter table venues
  add column lat double precision generated always as (st_y(location::geometry)) stored,
  add column lng double precision generated always as (st_x(location::geometry)) stored;
