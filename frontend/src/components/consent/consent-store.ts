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

/** Takes a choice back: analytics stops at once, its cookies go, and the visitor is asked again. */
export function withdrawConsent() {
  unstoredConsent = null;
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    // Storage blocked: the choice only ever lived in `unstoredConsent`.
  }
  window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
  expireAnalyticsCookies();
  listeners.forEach((listener) => listener());
}

/** Google Analytics sets `_ga` and `_ga_<id>` on this host or a parent domain; expire every variant. */
function expireAnalyticsCookies() {
  const names = document.cookie
    .split(';')
    .map((cookie) => cookie.split('=')[0].trim())
    .filter((name) => name === '_ga' || name.startsWith('_ga_'));
  const labels = location.hostname.split('.');
  const domains = labels.slice(0, -1).map((_, index) => labels.slice(index).join('.'));
  for (const name of names) {
    const expired = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = expired;
    for (const domain of domains) document.cookie = `${expired}; domain=.${domain}`;
  }
}
