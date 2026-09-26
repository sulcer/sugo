import { expect, test, type Page } from '@playwright/test';
import { collectErrors } from './helpers';
import { WEBGL } from './webgl';

test.use({ launchOptions: WEBGL });
test.skip(({ browserName }) => browserName !== 'chromium', 'the SwiftShader flags are Chromium-only');

/** Headless Chromium's software renderer talks about itself; it says nothing about our scenes. */
const DRIVER_NOISE = /GL Driver Message|GPU stall due to ReadPixels/;

/** Errors of any kind, plus the browser's warnings about WebGL contexts. */
function watchForTrouble(page: Page): string[] {
  const trouble = collectErrors(page);
  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'warning' && /WebGL|context/i.test(text) && !DRIVER_NOISE.test(text))
      trouble.push(text);
  });
  return trouble;
}

const cards = (page: Page) => page.locator('main li');

test('turns a tapped part into its 3D model', async ({ page }) => {
  await page.goto('/izdelki');
  const flange = page.getByRole('button', { name: 'Prirobnica' });
  await flange.click();
  await expect(flange).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('canvas')).toHaveCount(1);
});

test('keeps at most one part live at a time', async ({ page }) => {
  await page.goto('/izdelki');
  const flange = page.getByRole('button', { name: 'Prirobnica' });
  await flange.click();
  await expect(page.locator('canvas')).toHaveCount(1);
  const nut = page.getByRole('button', { name: 'Medeninasta matica' });
  await nut.click();
  await expect(flange).toHaveAttribute('aria-pressed', 'false');
  await expect(nut).toHaveAttribute('aria-pressed', 'true');
  await expect(nut.locator('canvas')).toHaveCount(1);
  await expect(page.locator('canvas')).toHaveCount(1);
});

/** One part of each kind the viewer builds: milled, dark milled, plastic, turned with a thread, brass. */
const SAMPLE = ['Nosilna plošča z žepi', 'Pokrov', 'PVC blok', 'Šestrobi vijak', 'Medeninasta matica'];

// Releasing each WebGL context (so 20 taps never reach Chrome's limit of 16) is pinned in stage.test.ts;
// software WebGL on CI is too slow to build all 20 scenes here.
test('hands the live model from part to part without errors', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the desktop run covers the WebGL lifecycle');
  test.slow();
  const patience = { timeout: 30_000 };
  const trouble = watchForTrouble(page);
  await page.goto('/izdelki');
  for (const name of SAMPLE) {
    const part = page.getByRole('button', { name });
    await part.click(patience);
    await expect(part).toHaveAttribute('aria-pressed', 'true', patience);
    await expect(cards(page).locator('[aria-pressed="true"]')).toHaveCount(1, patience);
    await expect(part.locator('canvas')).toHaveCount(1, patience);
    await expect(page.locator('canvas')).toHaveCount(1, patience);
  }
  expect(trouble).toEqual([]);
});
