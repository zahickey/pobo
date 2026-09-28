import { createVenueAction } from '../../../actions';
import styles from '../../../admin.module.css';

export default async function NewVenue({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Add a venue</h2>
      {error && <div className={styles.error}>{error}</div>}
      <form action={createVenueAction} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="name">Name *</label>
          <input id="name" name="name" required />
        </div>
        <div className={styles.field}>
          <label htmlFor="address">Address</label>
          <input id="address" name="address" placeholder="628 Divisadero St, San Francisco, CA" />
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="neighborhood">Neighborhood</label>
            <input id="neighborhood" name="neighborhood" placeholder="NoPa" />
          </div>
          <div className={styles.field}>
            <label htmlFor="timezone">Timezone</label>
            <input id="timezone" name="timezone" defaultValue="America/Los_Angeles" required />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="lat">Latitude *</label>
            <input id="lat" name="lat" type="number" step="any" required placeholder="37.7756" />
          </div>
          <div className={styles.field}>
            <label htmlFor="lng">Longitude *</label>
            <input id="lng" name="lng" type="number" step="any" required placeholder="-122.4376" />
          </div>
        </div>
        <p className={styles.itemMeta} style={{ marginTop: -8 }}>
          No geocoding hooked up yet — right-click the spot on Google Maps and copy the coordinates.
        </p>
        <div className={styles.field}>
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={3} />
        </div>
        <button type="submit" className={styles.submitButton}>
          Add venue
        </button>
      </form>
    </div>
  );
}
