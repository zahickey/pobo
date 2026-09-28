'use client';

import { useState } from 'react';

// Real Universal Links (tapping the https:// link opens the app directly,
// no button needed) require a domain + Apple Team ID we don't have yet (see
// POBO_PRODUCT_BRIEF.md §9). Until then, this button drives the custom URL
// scheme instead — works if the app is installed, silently no-ops otherwise.
export function OpenInAppButton({ occurrenceId }: { occurrenceId: string }) {
  const scheme = process.env.NEXT_PUBLIC_APP_SCHEME ?? 'pobo';

  return (
    <a href={`${scheme}://event/${occurrenceId}`} className="openInAppButton">
      Open in the PoBo app
    </a>
  );
}

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled the share sheet — not an error
      }
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button onClick={share} className="shareButton" type="button">
      {copied ? 'Link copied' : 'Share'}
    </button>
  );
}
