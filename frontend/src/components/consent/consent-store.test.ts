import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const gtag = vi.fn();
const disconnects: (() => void)[] = [];

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  window.gtag = gtag;
  gtag.mockClear();
});

afterEach(() => {
  disconnects.splice(0).forEach((disconnect) => disconnect());
  delete window.gtag;
  for (const name of ['_ga', '_ga_ABC123'])
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
});

/** A fresh module per test: the store keeps page-view state in module scope. */
const store = () => import('./consent-store');

it('asks the visitor again once they withdraw their consent', async () => {
  const { readConsent, withdrawConsent, writeConsent } = await store();
  writeConsent('yes');
  withdrawConsent();
  expect(readConsent()).toBeNull();
});

it('switches analytics off the moment consent is withdrawn', async () => {
  const { withdrawConsent, writeConsent } = await store();
  writeConsent('yes');
  gtag.mockClear();
  withdrawConsent();
  expect(gtag.mock.calls).toEqual([['consent', 'update', { analytics_storage: 'denied' }]]);
});

it('removes the analytics cookies when consent is withdrawn', async () => {
  const { withdrawConsent, writeConsent } = await store();
  writeConsent('yes');
  document.cookie = '_ga=GA1.1.123.456; path=/';
  document.cookie = '_ga_ABC123=GS1.1.789; path=/';
  withdrawConsent();
  expect(document.cookie).not.toMatch(/_ga/);
});

it('tells the page that the choice is open again', async () => {
  const { subscribeConsent, withdrawConsent, writeConsent } = await store();
  writeConsent('yes');
  const listener = vi.fn();
  subscribeConsent(listener);
  withdrawConsent();
  expect(listener).toHaveBeenCalledOnce();
});

const tagDisabled = (id: string) => (window as unknown as Record<string, unknown>)[`ga-disable-${id}`];

it('stops the analytics tag altogether once consent is withdrawn, cookieless pings included', async () => {
  const { connectAnalytics, withdrawConsent, writeConsent } = await store();
  disconnects.push(connectAnalytics('G-STORE1'));
  writeConsent('yes');
  withdrawConsent();
  expect(tagDisabled('G-STORE1')).toBe(true);
});

it('lets the analytics tag collect again after a new acceptance', async () => {
  const { connectAnalytics, withdrawConsent, writeConsent } = await store();
  disconnects.push(connectAnalytics('G-STORE2'));
  withdrawConsent();
  writeConsent('yes');
  expect(tagDisabled('G-STORE2')).toBe(false);
});

it('applies a choice withdrawn in another tab to the tag in this one', async () => {
  const { CONSENT_KEY, connectAnalytics, writeConsent } = await store();
  disconnects.push(connectAnalytics('G-STORE3'));
  writeConsent('yes');
  gtag.mockClear();
  localStorage.removeItem(CONSENT_KEY);
  window.dispatchEvent(new StorageEvent('storage', { key: CONSENT_KEY }));
  expect([tagDisabled('G-STORE3'), gtag.mock.calls]).toEqual([
    true,
    [['consent', 'update', { analytics_storage: 'denied' }]],
  ]);
});
