-- venues' insert policy lets any authenticated user create a venue
-- (created_by = auth.uid()), but nothing made them a venue_members row
-- afterward — so a venue manager creating their own venue would immediately
-- be locked out of editing it or posting events, since is_venue_manager()
-- checks venue_members. Auto-enroll the creator as owner.
--
-- Skips when created_by is null (the admin tool inserts via the service
-- role, which bypasses RLS entirely and doesn't need a membership row).

create function handle_new_venue()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.created_by is not null then
    insert into public.venue_members (venue_id, profile_id, role)
    values (new.id, new.created_by, 'owner');
  end if;
  return new;
end;
$$;

create trigger on_venue_created
  after insert on venues
  for each row execute function handle_new_venue();
