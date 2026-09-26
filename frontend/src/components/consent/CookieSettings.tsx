'use client';

import { withdrawConsent } from './consent-store';

/** Reopens the cookie choice: whoever accepted analytics can withdraw it as easily (GDPR Art. 7(3)). */
export function CookieSettings({ label, className }: { label: string; className?: string }) {
  return (
    <button type="button" onClick={withdrawConsent} className={className}>
      {label}
    </button>
  );
}
