import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const gtag = vi.fn();

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  window.gtag = gtag;
  gtag.mockClear();
});

afterEach(() => {
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
