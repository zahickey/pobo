import { supabaseAdmin } from '../../../../../lib/supabase-admin';
import { createSeriesAction } from '../../../actions';
import styles from '../../../admin.module.css';

const DAYS: { value: string; label: string }[] = [
  { value: 'MO', label: 'Mon' },
  { value: 'TU', label: 'Tue' },
  { value: 'WE', label: 'Wed' },
  { value: 'TH', label: 'Thu' },
  { value: 'FR', label: 'Fri' },
  { value: 'SA', label: 'Sat' },
  { value: 'SU', label: 'Sun' },
];

export default async function NewSeries({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const [{ data: venues }, { data: categories }] = await Promise.all([
    supabaseAdmin.from('venues').select('id, name').order('name'),
    supabaseAdmin.from('categories').select('id, name').order('name'),
  ]);

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Add an event series</h2>
      {error && <div className={styles.error}>{error}</div>}
      {(!venues || venues.length === 0) && (
        <p className={styles.empty}>Add a venue first — there are none to attach this to yet.</p>
      )}
      <form action={createSeriesAction} className={styles.form}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="venue_id">Venue *</label>
            <select id="venue_id" name="venue_id" required defaultValue="">
              <option value="" disabled>
                Select a venue
              </option>
              {venues?.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="category_id">Category *</label>
            <select id="category_id" name="category_id" required defaultValue="">
              <option value="" disabled>
                Select a category
              </option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="title">Title *</label>
          <input id="title" name="title" required placeholder="Trivia Night" />
        </div>

        <div className={styles.field}>
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={3} />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="price_text">Price</label>
            <input id="price_text" name="price_text" placeholder="Free / $5 cover" />
          </div>
          <div className={styles.field}>
            <label htmlFor="age_limit">Age limit</label>
            <input id="age_limit" name="age_limit" type="number" placeholder="21" />
          </div>
        </div>

        <div className={styles.field}>
          <label>Repeats on</label>
          <div className={styles.checkboxRow}>
            {DAYS.map((d) => (
              <label key={d.value}>
                <input type="checkbox" name="days" value={d.value} /> {d.label}
              </label>
            ))}
          </div>
          <p className={styles.itemMeta}>Leave all unchecked for a one-off event.</p>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="start_date">First date *</label>
            <input id="start_date" name="start_date" type="date" required />
          </div>
          <div className={styles.field}>
            <label htmlFor="start_time">Start time *</label>
            <input id="start_time" name="start_time" type="time" required />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="duration_minutes">Duration (minutes) *</label>
            <input id="duration_minutes" name="duration_minutes" type="number" required defaultValue={120} />
          </div>

          <div className={styles.field}>
            <label htmlFor="timezone">Timezone</label>
            <input id="timezone" name="timezone" defaultValue="America/Los_Angeles" required />
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>
          Add event series
        </button>
      </form>
    </div>
  );
}
