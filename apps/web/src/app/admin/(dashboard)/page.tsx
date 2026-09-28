import { supabaseAdmin } from '../../../lib/supabase-admin';
import { cancelOccurrenceAction, pauseSeriesAction } from '../actions';
import styles from '../admin.module.css';

interface SeriesRow {
  id: string;
  title: string;
  status: string;
  rrule: string | null;
  venue: { name: string } | null;
  category: { name: string } | null;
}

interface OccurrenceRow {
  id: string;
  series_id: string;
  starts_at: string;
  status: string;
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ warning?: string }>;
}) {
  const { warning } = await searchParams;

  const [{ data: venues }, { data: series }, { data: occurrences }] = await Promise.all([
    supabaseAdmin.from('venues').select('id, name, neighborhood, address').order('name'),
    supabaseAdmin
      .from('event_series')
      .select('id, title, status, rrule, venue:venues(name), category:categories(name)')
      .order('title'),
    supabaseAdmin
      .from('occurrences')
      .select('id, series_id, starts_at, status')
      .eq('status', 'scheduled')
      .gte('starts_at', new Date().toISOString())
      .order('starts_at')
      .limit(300),
  ]);

  const occurrencesBySeries = new Map<string, OccurrenceRow[]>();
  for (const o of (occurrences ?? []) as OccurrenceRow[]) {
    const list = occurrencesBySeries.get(o.series_id) ?? [];
    list.push(o);
    occurrencesBySeries.set(o.series_id, list);
  }

  return (
    <>
      {warning && <div className={styles.warning}>{warning}</div>}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Venues ({venues?.length ?? 0})</h2>
        {venues && venues.length > 0 ? (
          <ul className={styles.list}>
            {venues.map((v) => (
              <li key={v.id} className={styles.listItem}>
                <div className={styles.itemTitle}>{v.name}</div>
                <div className={styles.itemMeta}>
                  {v.neighborhood ?? ''}
                  {v.address ? ` · ${v.address}` : ''}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>No venues yet.</p>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Event series ({series?.length ?? 0})</h2>
        {series && series.length > 0 ? (
          <ul className={styles.list}>
            {(series as unknown as SeriesRow[]).map((s) => {
              const upcoming = (occurrencesBySeries.get(s.id) ?? []).slice(0, 3);
              return (
                <li key={s.id} className={styles.listItem}>
                  <div className={styles.itemTitle}>
                    {s.title} {s.status !== 'active' && `(${s.status})`}
                  </div>
                  <div className={styles.itemMeta}>
                    {s.venue?.name} · {s.category?.name} · {s.rrule ?? 'one-off'}
                  </div>
                  {upcoming.length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {upcoming.map((o) => (
                        <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className={styles.itemMeta}>
                            {new Intl.DateTimeFormat('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              timeZone: 'America/Los_Angeles',
                            }).format(new Date(o.starts_at))}
                          </span>
                          <form action={cancelOccurrenceAction.bind(null, o.id)}>
                            <button type="submit" className={styles.smallButton}>
                              Cancel this one
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                  )}
                  {s.status === 'active' && (
                    <form action={pauseSeriesAction.bind(null, s.id)} style={{ marginTop: 8 }}>
                      <button type="submit" className={styles.smallButton}>
                        Pause series
                      </button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={styles.empty}>No event series yet.</p>
        )}
      </div>
    </>
  );
}
