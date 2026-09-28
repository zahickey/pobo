import { ImageResponse } from 'next/og';
import { getOccurrence, isLiveNow } from '../../../lib/occurrence';
import { loadGoogleFont } from '../../../lib/og-font';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// The brand "share card" pattern (POBO_BRAND_GUIDELINES.md "Key patterns"):
// a flyer on `surface` with `shadow-poster`, the event in Gloock, the
// wordmark at the bottom — so every shared link advertises PoBo.
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const occurrence = await getOccurrence(id);

  const title = occurrence?.series.title ?? "Your city's poster board.";
  const venueLine = occurrence
    ? `${occurrence.venue.name}${occurrence.venue.neighborhood ? ' · ' + occurrence.venue.neighborhood : ''}`
    : '';
  const live = occurrence ? isLiveNow(occurrence.starts_at, occurrence.ends_at) : false;

  const gloock = await loadGoogleFont('Gloock', `${title}PoBo${venueLine}`);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F7F2E7',
        }}
      >
        <div
          style={{
            width: 1000,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#FCFAF2',
            borderRadius: 32,
            padding: 64,
            transform: 'rotate(-1deg)',
          }}
        >
          {live && (
            <div
              style={{
                display: 'flex',
                alignSelf: 'flex-start',
                backgroundColor: '#FF48B0',
                color: '#1A1A2E',
                fontSize: 24,
                fontWeight: 700,
                padding: '8px 28px',
                borderRadius: 999,
                marginBottom: 28,
                letterSpacing: 1,
              }}
            >
              LIVE NOW
            </div>
          )}
          <div style={{ display: 'flex', fontFamily: 'Gloock', fontSize: 72, color: '#1A1A2E', lineHeight: 1.15 }}>
            {title}
          </div>
          {venueLine && (
            <div style={{ display: 'flex', fontSize: 32, color: '#5B5B72', marginTop: 28 }}>{venueLine}</div>
          )}
          <div style={{ display: 'flex', fontFamily: 'Gloock', fontSize: 40, color: '#2B50E0', marginTop: 56 }}>
            PoBo
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Gloock', data: gloock, style: 'normal', weight: 400 }],
    },
  );
}
