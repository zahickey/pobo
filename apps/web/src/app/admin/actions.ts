'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '../../lib/supabase-admin';
import { checkPasswordAndSetCookie, clearAdminCookie } from '../../lib/admin-auth';

export async function loginAction(formData: FormData): Promise<void> {
  const password = String(formData.get('password') ?? '');
  const ok = await checkPasswordAndSetCookie(password);
  if (!ok) {
    redirect('/admin/login?error=1');
  }
  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  await clearAdminCookie();
  redirect('/admin/login');
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function createVenueAction(formData: FormData): Promise<void> {
  const name = String(formData.get('name') ?? '').trim();
  const address = String(formData.get('address') ?? '').trim();
  const neighborhood = String(formData.get('neighborhood') ?? '').trim();
  const timezone = String(formData.get('timezone') ?? 'America/Los_Angeles').trim();
  const lat = Number(formData.get('lat'));
  const lng = Number(formData.get('lng'));
  const description = String(formData.get('description') ?? '').trim();

  if (!name || Number.isNaN(lat) || Number.isNaN(lng)) {
    redirect('/admin/venues/new?error=' + encodeURIComponent('Name, latitude and longitude are required.'));
  }

  const { error } = await supabaseAdmin.from('venues').insert({
    name,
    slug: slugify(name),
    address: address || null,
    neighborhood: neighborhood || null,
    timezone,
    description: description || null,
    location: `SRID=4326;POINT(${lng} ${lat})`,
  });

  if (error) {
    redirect('/admin/venues/new?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/admin');
  redirect('/admin');
}

// Best-effort: calls the recurrence Edge Function so new/edited series show
// up as occurrences immediately. Non-fatal if it's not reachable — in local
// dev it needs `supabase functions serve` running separately; on a deployed
// project it's always up. Either way the series itself is saved regardless.
async function regenerateOccurrences(): Promise<string | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return 'Missing Supabase config';

  try {
    const res = await fetch(`${url}/functions/v1/generate-occurrences`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return `Edge function returned ${res.status}`;
    return null;
  } catch {
    return "Couldn't reach the recurrence function — run `supabase functions serve` locally, or trigger it manually.";
  }
}

export async function createSeriesAction(formData: FormData): Promise<void> {
  const venueId = String(formData.get('venue_id') ?? '');
  const categoryId = String(formData.get('category_id') ?? '');
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const priceText = String(formData.get('price_text') ?? '').trim();
  const timezone = String(formData.get('timezone') ?? 'America/Los_Angeles').trim();
  const startDate = String(formData.get('start_date') ?? ''); // yyyy-mm-dd
  const startTime = String(formData.get('start_time') ?? ''); // HH:mm
  const durationMinutes = Number(formData.get('duration_minutes'));
  const days = formData.getAll('days') as string[]; // e.g. ['MO','TU']
  const ageLimit = formData.get('age_limit') ? Number(formData.get('age_limit')) : null;

  if (!venueId || !categoryId || !title || !startDate || !startTime || !durationMinutes) {
    redirect('/admin/series/new?error=' + encodeURIComponent('Fill in all required fields.'));
  }

  const rrule = days.length > 0 ? `FREQ=WEEKLY;BYDAY=${days.join(',')}` : null;

  const { error } = await supabaseAdmin.from('event_series').insert({
    venue_id: venueId,
    category_id: categoryId,
    title,
    description: description || null,
    price_text: priceText || null,
    age_limit: ageLimit,
    dtstart_local: `${startDate} ${startTime}:00`,
    duration_minutes: durationMinutes,
    timezone,
    rrule,
    status: 'active',
  });

  if (error) {
    redirect('/admin/series/new?error=' + encodeURIComponent(error.message));
  }

  const regenError = await regenerateOccurrences();
  revalidatePath('/admin');
  redirect('/admin' + (regenError ? '?warning=' + encodeURIComponent(regenError) : ''));
}

export async function cancelOccurrenceAction(occurrenceId: string): Promise<void> {
  await supabaseAdmin.from('occurrences').update({ status: 'cancelled' }).eq('id', occurrenceId);
  revalidatePath('/admin');
}

export async function pauseSeriesAction(seriesId: string): Promise<void> {
  await supabaseAdmin.from('event_series').update({ status: 'paused' }).eq('id', seriesId);
  revalidatePath('/admin');
}
