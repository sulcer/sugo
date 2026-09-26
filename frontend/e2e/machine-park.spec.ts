import { expect, test } from '@playwright/test';

test('groups the park into lathes and machining centres', async ({ page }) => {
  await page.goto('/strojni-park');
  await expect(page.locator('#main').getByRole('heading', { level: 2 })).toHaveText([
    'Stružnice',
    'Obdelovalni centri',
  ]);
});

test('counts the machines of each group', async ({ page }) => {
  await page.goto('/strojni-park');
  await expect(page.locator('#main h2 + span')).toHaveText(['(4)', '(2)']);
});

test('lists all six machines of the park', async ({ page }) => {
  await page.goto('/strojni-park');
  await expect(page.locator('#main').getByRole('listitem')).toHaveCount(6);
});

test('dimensions the fifth machine over its three travels', async ({ page }) => {
  await page.goto('/strojni-park');
  const machine = page.locator('#main').getByRole('listitem').nth(4);
  await expect(machine.locator('dl > div')).toHaveText(['X500mm', 'Y350mm', 'Z250mm']);
});

test('is headed in german on the german sheet', async ({ page }) => {
  await page.goto('/de/strojni-park');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Maschinenpark');
});

test('is titled in german on the german sheet', async ({ page }) => {
  await page.goto('/de/strojni-park');
  await expect(page).toHaveTitle('Maschinenpark · SUGO d.o.o.');
});

test('plots the work envelope of a hovered machine', async ({ page, isMobile }) => {
  test.skip(!!isMobile, 'hover is a pointer gesture');
  await page.goto('/strojni-park');
  const drawing = page.locator('#main svg').first();
  await expect
    .poll(async () => {
      await page.mouse.move(0, 0);
      await drawing.hover();
      return page.evaluate(() => document.querySelector('[data-envelope-plot]')!.getAnimations().length);
    })
    .toBeGreaterThan(0);
});
