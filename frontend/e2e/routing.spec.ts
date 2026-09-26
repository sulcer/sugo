import { expect, test } from '@playwright/test';
import { collectErrors } from './helpers';

test('slovenian home is served at / without redirecting', async ({ page }) => {
  const response = await page.goto('/');
  expect(new URL(response!.url()).pathname).toBe('/');
});

test('slovenian home is marked lang=sl in the server html', async ({ request }) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain('<html lang="sl"');
});

test('an explicit /sl prefix redirects permanently to the unprefixed url', async ({ request, baseURL }) => {
  const response = await request.get('/sl/izdelki', { maxRedirects: 0 });
  expect([response.status(), new URL(response.headers().location, baseURL).pathname]).toEqual([
    308,
    '/izdelki',
  ]);
});

test('a mis-cased locale prefix redirects to the lowercase url', async ({ request, baseURL }) => {
  const response = await request.get('/DE', { maxRedirects: 0 });
  expect([response.status(), new URL(response.headers().location, baseURL).pathname]).toEqual([308, '/de']);
});

test('german home is marked lang=de in the server html', async ({ request }) => {
  const html = await (await request.get('/de')).text();
  expect(html).toContain('<html lang="de"');
});

test('an unknown url answers 404 with the localized sheet in the server html', async ({ request }) => {
  const response = await request.get('/de/gibt-es-nicht');
  expect([response.status(), (await response.text()).includes('<html lang="de"')]).toEqual([404, true]);
});

test('an unknown slovenian url answers 404 with the slovenian sheet', async ({ request }) => {
  const response = await request.get('/ne-obstaja');
  expect([response.status(), (await response.text()).includes('<html lang="sl"')]).toEqual([404, true]);
});

test('prefetches the Slovenian sheets without asking for pages that do not exist', async ({ page }) => {
  const errors = collectErrors(page);
  // /de teaches the router the /[locale] pattern; the Slovenian sheets it then links to live at the
  // root through the proxy rewrite, and must not be predicted as locales.
  await page.goto('/de');
  await page.waitForLoadState('networkidle');
  await page.getByRole('link', { name: 'Slovenščina' }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.waitForTimeout(1500);
  expect(errors).toEqual([]);
});
