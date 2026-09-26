import { expect, test } from '@playwright/test';

test('slovenian home is served unprefixed with lang=sl', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'sl');
});

test('an explicit /sl prefix redirects permanently to the unprefixed url', async ({ request }) => {
  const response = await request.get('/sl/izdelki', { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toMatch(/\/izdelki$/);
});

test('german home is served under /de with lang=de', async ({ page }) => {
  await page.goto('/de');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
});

test('an unknown path answers 404 in its locale', async ({ page }) => {
  const response = await page.goto('/de/gibt-es-nicht');
  expect(response?.status()).toBe(404);
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
});
