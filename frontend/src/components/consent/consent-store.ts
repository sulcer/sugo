export type Consent = 'yes' | 'no';

export const CONSENT_KEY = 'sugo-cookie';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const listeners = new Set<() => void>();
/** Holds the choice for this page view when storage is blocked (private mode, strict settings). */
let unstoredConsent: Consent | null = null;

export function readConsent(): Consent | null {
  if (unstoredConsent) return unstoredConsent;
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    return stored === 'yes' || stored === 'no' ? stored : null;
  } catch {
    return null;
  }
}

export function writeConsent(value: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    unstoredConsent = value;
  }
  window.gtag?.('consent', 'update', { analytics_storage: value === 'yes' ? 'granted' : 'denied' });
  listeners.forEach((listener) => listener());
}

export function subscribeConsent(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}
