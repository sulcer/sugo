import { expect, test } from '@playwright/test';
import { collectErrors, scrollThrough } from './helpers';
import { WEBGL } from './webgl';

test.use({ launchOptions: WEBGL });

test('runs through the whole page without console errors', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await scrollThrough(page);
  expect(errors).toEqual([]);
});

test('restarts the hero machining cleanly after a resize', async ({ page, isMobile }) => {
  test.skip(isMobile, 'resizes a desktop window');
  const errors = collectErrors(page);
  await page.goto('/');
  const hero = page.locator('main > section').first();
  const done = hero.locator('[data-op="done"]');
  await expect(done.first()).toBeVisible({ timeout: 10_000 });
  // A 24 % narrower hero: past the drawing's 12 % remeasure tolerance, still wide enough to machine.
  await page.setViewportSize({ width: 520, height: 900 });
  await expect(done).toHaveCount(0);
  await expect(done.first()).toBeVisible({ timeout: 10_000 });
  expect([errors, await hero.locator('canvas').count()]).toEqual([[], 1]);
});

test.describe('for visitors who prefer reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('never starts a 3D scene', async ({ page }) => {
    await page.goto('/');
    await scrollThrough(page);
    await expect(page.locator('canvas')).toHaveCount(0);
  });
});
