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
  await expect(page.getByRole('link', { name: 'Send your drawing', exact: true })).toHaveAttribute(
    'href',
    '/en/kontakt#risba',
  );
});

test('lists the capabilities as a table', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('table', { name: 'Zmogljivosti' }).getByRole('rowheader')).toHaveCount(6);
});

test('labels the capability columns in the mono label style, aligned with their values', async ({ page }) => {
  await page.goto('/');
  const headers = page.getByRole('table', { name: 'Zmogljivosti' }).getByRole('columnheader');
  expect(
    await headers.evaluateAll((cells) =>
      cells.map((cell) => [getComputedStyle(cell).fontWeight, getComputedStyle(cell).textAlign]),
    ),
  ).toEqual([
    ['500', 'left'],
    ['500', 'left'],
  ]);
});

test('draws the history as a scale on wide sheets and lists it on narrow ones', async ({
  page,
  isMobile,
}) => {
  await page.goto('/en');
  const scale = page.locator('[data-tl="label"]', { hasText: 'SUGO d.o.o. founded' });
  const list = page.getByRole('listitem').filter({ hasText: 'SUGO d.o.o. founded' });
  const shown = async (locator: typeof list) =>
    (await locator.isVisible()) &&
    (await locator.evaluate((element) => element.getBoundingClientRect().width > 1));
  expect([await shown(scale), await shown(list)]).toEqual(isMobile ? [false, true] : [true, false]);
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

/** The prerendered still of the finished part is on screen, loaded, and no 3D scene exists. */
async function expectPrerenderedStill(page: Page) {
  await page.goto('/');
  const still = page.locator('main img[srcset*="/hero/flange"]');
  await expect(still).toBeVisible();
  await expect.poll(() => still.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('canvas')).toHaveCount(0);
}

test('shows phones the finished part as a prerendered image, without 3D', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'a hero too narrow to machine');
  await expectPrerenderedStill(page);
});

test.describe('for visitors who prefer reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('shows the finished part as a prerendered image, without 3D', async ({ page }) => {
    await expectPrerenderedStill(page);
  });

  test('shows the hero part finished, every operation ticked', async ({ page }) => {
    await page.goto('/');
    const operations = page.locator('[data-op]');
    await expect(operations).toHaveCount(6);
    await expect(page.locator('[data-op="done"]')).toHaveCount(6);
  });

  test('keeps the final figures on screen when the strip comes back into view', async ({ page }) => {
    await page.goto('/en');
    const strip = page.locator('main > section').last();
    const figures = strip.locator('li > [aria-hidden="true"]');
    await page.waitForTimeout(700); // past the counters' arming delay
    await strip.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, 0));
    await strip.scrollIntoViewIfNeeded();
    const seen = new Set<string>();
    for (let sample = 0; sample < 8; sample++) {
      seen.add((await figures.allTextContents()).join(' '));
      await page.waitForTimeout(150);
    }
    expect([...seen]).toEqual([`${new Date().getFullYear() - 2010} 6 1500+`]);
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
