// Expands every active event_series into `occurrences` for a rolling window
// (see roadmap Step 2 / POBO_PRODUCT_BRIEF.md §3 "Recurring events"). Safe to
// call repeatedly — upserts on the (series_id, starts_at) unique constraint,
// so re-running just fills in newly-in-range weeks as time advances.
//
// Trigger manually for now (`supabase functions invoke generate-occurrences`).
// Wiring this to a daily schedule (pg_cron, or Supabase's dashboard Cron) is a
// deploy-time concern, not a local-dev one — left for when we stand up the
// hosted project.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { DateTime } from 'npm:luxon@3.5.0';
import { computeOccurrences, type EventSeriesInput } from './occurrences.ts';

Deno.serve(async (_req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: seriesList, error: seriesError } = await supabase
    .from('event_series')
    .select('id, venue_id, rrule, dtstart_local, duration_minutes, timezone')
    .eq('status', 'active');

  if (seriesError) {
    return new Response(JSON.stringify({ error: seriesError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const now = DateTime.utc();
  const results: { seriesId: string; upserted: number; error?: string }[] = [];

  for (const series of (seriesList ?? []) as EventSeriesInput[]) {
    const occurrences = computeOccurrences(series, now);
    if (occurrences.length === 0) {
      results.push({ seriesId: series.id, upserted: 0 });
      continue;
    }

    const { error } = await supabase
      .from('occurrences')
      .upsert(occurrences, { onConflict: 'series_id,starts_at', ignoreDuplicates: true });

    if (error) {
      results.push({ seriesId: series.id, upserted: 0, error: error.message });
    } else {
      results.push({ seriesId: series.id, upserted: occurrences.length });
    }
  }

  return new Response(JSON.stringify({ seriesProcessed: results.length, results }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
