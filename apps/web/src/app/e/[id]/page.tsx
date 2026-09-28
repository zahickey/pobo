import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getOccurrence, formatStartLabel, isLiveNow, REFERENCE_TIMEZONE } from '../../../lib/occurrence';
import { OpenInAppButton, ShareButton } from './AppLinkButtons';
import styles from './page.module.css';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const occurrence = await getOccurrence(id);
  if (!occurrence) return { title: "PoBo — event not found" };

  const { series, venue } = occurrence;
  const description = `${venue.name}${venue.neighborhood ? ` · ${venue.neighborhood}` : ''} — ${formatStartLabel(occurrence.starts_at, occurrence.ends_at)}`;

  return {
    title: `${series.title} — PoBo`,
    description: series.description ?? description,
    openGraph: {
      title: series.title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: series.title,
      description,
    },
  };
}

export default async function EventPage({ params }: Props) {
  const { id } = await params;
  const occurrence = await getOccurrence(id);
  if (!occurrence) notFound();

  const { series, venue } = occurrence;
  const live = isLiveNow(occurrence.starts_at, occurrence.ends_at);
  const dateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: REFERENCE_TIMEZONE,
  }).format(new Date(occurrence.starts_at));

  const directionsUrl = venue.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`
    : null;

  return (
    <main className={styles.page}>
      <a href="/" className={styles.wordmark}>
        PoBo
      </a>

      <div className={styles.card}>
        <div className={styles.chipRow}>
          {series.category && <span className={styles.categoryChip}>{series.category.name.toUpperCase()}</span>}
          {live && <span className={styles.liveChip}>LIVE NOW</span>}
        </div>

        <h1 className={styles.title}>{series.title}</h1>

        <p className={styles.meta}>
          {venue.name}
          {venue.neighborhood ? ` · ${venue.neighborhood}` : ''}
        </p>
        <p className={styles.meta}>
          {dateLabel} · {formatStartLabel(occurrence.starts_at, occurrence.ends_at)}
        </p>
        {series.price_text && <p className={styles.meta}>{series.price_text}</p>}

        {series.description && <p className={styles.description}>{series.description}</p>}

        {directionsUrl && (
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className={styles.directions}>
            Get directions — {venue.address}
          </a>
        )}

        <div className={styles.actionRow}>
          <OpenInAppButton occurrenceId={occurrence.id} />
          <ShareButton title={series.title} />
        </div>
      </div>

      <p className={styles.footer}>Your city&rsquo;s poster board.</p>
    </main>
  );
}
