import { expect, test, type Page } from '@playwright/test';

const HEADINGS = {
  '/': 'Kakovostna mehanska obdelava kovin za vaše inovativne ideje',
  '/de': 'Hochwertige Metallbearbeitung für Ihre innovativen Ideen',
  '/en': 'Quality metal machining for your innovative ideas',
};

for (const [path, heading] of Object.entries(HEADINGS)) {
  test(`${path} states what SUGO does`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
  });
}

test('sends visitors to the drawing upload on the contact page', async ({ page }) => {
  await page.goto('/en');
  await expect(page.getByRole('link', { name: 'Send your drawing →' })).toHaveAttribute(
    'href',
    '/en/kontakt#risba',
  );
});

test('lists the capabilities as a table', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('table', { name: 'Zmogljivosti' }).getByRole('rowheader')).toHaveCount(6);
});

test('shows the company history', async ({ page }) => {
  await page.goto('/en');
  await expect(page.getByText('SUGO d.o.o. founded').filter({ visible: true }).first()).toBeVisible();
});

test.describe('for visitors who prefer reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('shows the hero part finished, every operation ticked', async ({ page }) => {
    await page.goto('/');
    const operations = page.locator('[data-op]');
    await expect(operations).toHaveCount(6);
    await expect(page.locator('[data-op="done"]')).toHaveCount(6);
  });

  test('never starts a 3D scene', async ({ page }) => {
    await page.goto('/');
    await scrollThrough(page);
    await expect(page.locator('canvas')).toHaveCount(0);
  });

  test('shows the final figures', async ({ page }) => {
    await page.goto('/en');
    await scrollThrough(page);
    await expect(page.getByText('1500+', { exact: true }).first()).toBeVisible();
  });
});

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

test.describe('cookie notice', () => {
  test('waits below the hero, then remembers the choice', async ({ page }) => {
    await page.goto('/');
    const notice = page.getByRole('region', { name: 'Piškotki' });
    await expect(notice).toBeHidden();
    await page.evaluate(() => window.scrollBy(0, 800));
    await notice.getByRole('button', { name: 'Se strinjam' }).click();
    await page.reload();
    await page.evaluate(() => window.scrollBy(0, 800));
    await expect(notice).toBeHidden();
  });
});

/** Sheets whose pages are not built yet; links to them prefetch a 404. Remove each as its page lands. */
const PENDING_SHEETS = ['/kontakt', '/izdelki', '/varovanje-osebnih-podatkov'];
const isPendingSheet = (url: string) => PENDING_SHEETS.some((sheet) => new URL(url).pathname.endsWith(sheet));

/** Console errors, uncaught exceptions and failed requests (by URL, instead of the console's bare "Failed to load resource"). */
function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().startsWith('Failed to load resource')) {
      errors.push(message.text());
    }
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400 && !isPendingSheet(response.url())) {
      errors.push(`${response.status()} ${response.url()}`);
    }
  });
  return errors;
}

/** Brings every section into view long enough for its scroll-triggered animation to start. */
async function scrollThrough(page: Page) {
  for (const section of await page.locator('main > section').all()) {
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
  }
}
