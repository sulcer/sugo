import { expect, test } from '@playwright/test';
import { scrollThrough } from './helpers';

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

test.describe('laid out without scripts', () => {
  test.use({ javaScriptEnabled: false });

  for (const path of Object.keys(HEADINGS)) {
    test(`${path} never scrolls sideways at desktop and tablet widths`, async ({ page, isMobile }) => {
      test.skip(isMobile, 'sweeps desktop and tablet widths');
      const overflowing: string[] = [];
      await page.goto(path);
      for (const width of [1440, 1280, 1100, 1024, 900, 760, 700]) {
        await page.setViewportSize({ width, height: 900 });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        if (overflow > 0) overflowing.push(`${width}px: ${overflow}px`);
      }
      expect(overflowing).toEqual([]);
    });
  }
});

test.describe('for visitors who prefer reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('shows the hero part finished, every operation ticked', async ({ page }) => {
    await page.goto('/');
    const operations = page.locator('[data-op]');
    await expect(operations).toHaveCount(6);
    await expect(page.locator('[data-op="done"]')).toHaveCount(6);
  });

  test('shows the final figures', async ({ page }) => {
    await page.goto('/en');
    await scrollThrough(page);
    await expect(page.getByText('1500+', { exact: true }).first()).toBeVisible();
  });
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
