import { expect, test, type Page } from '@playwright/test';
import { WEBGL } from './webgl';

test.use({ launchOptions: WEBGL });
test.skip(({ browserName }) => browserName !== 'chromium', 'the SwiftShader flags are Chromium-only');

/** Sheets the header and footer link to that this branch has not built yet. */
const NOT_YET_BUILT = [
  '/kontakt', // remove when the contact page lands
  '/varovanje-osebnih-podatkov', // remove when the privacy page lands
];

/** Headless Chromium's software renderer talks about itself; it says nothing about our scenes. */
const DRIVER_NOISE = /GL Driver Message|GPU stall due to ReadPixels/;

const pathOf = (url: string) => {
  try {
    return new URL(url).pathname;
  } catch {
    return '';
  }
};
const notYetBuilt = (url: string) => NOT_YET_BUILT.some((sheet) => pathOf(url).endsWith(sheet));

/** Everything the page complains about, minus the noise we knowingly accept. */
function watchForTrouble(page: Page): string[] {
  const trouble: string[] = [];
  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'error' && !notYetBuilt(message.location().url)) trouble.push(text);
    if (message.type() === 'warning' && /WebGL|context/i.test(text) && !DRIVER_NOISE.test(text)) {
      trouble.push(text);
    }
  });
  page.on('pageerror', (error) => trouble.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400 && !notYetBuilt(response.url()))
      trouble.push(`${response.status()} ${response.url()}`);
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
  await page.getByRole('button', { name: 'Medeninasta matica' }).click();
  await expect(flange).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('canvas')).toHaveCount(1);
});

test('survives tapping every part of the catalogue in a row', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the desktop sweep covers the WebGL lifecycle');
  test.slow();
  const trouble = watchForTrouble(page);
  await page.goto('/izdelki');
  const buttons = cards(page).locator('button');
  await expect(buttons).toHaveCount(20);

  for (let index = 0; index < 20; index++) {
    await buttons.nth(index).click();
    await expect(cards(page).locator('[aria-pressed="true"]')).toHaveCount(1);
    await expect(cards(page).locator('[aria-pressed="true"] canvas')).toHaveCount(1);
    await expect(page.locator('canvas')).toHaveCount(1);
  }
  expect(trouble).toEqual([]);
});
