import { expect, test, type Page } from '@playwright/test';

/** Google's tag script, answered locally; returns the requests the page made for it. */
async function stubAnalytics(page: Page) {
  const requests: string[] = [];
  await page.route('https://www.googletagmanager.com/**', (route) => {
    requests.push(route.request().url());
    return route.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
  });
  return requests;
}

const notice = (page: Page) => page.getByRole('region', { name: 'Piškotki' });
const storedChoice = (page: Page) => page.evaluate(() => localStorage.getItem('sugo-cookie'));
const scrollPastHero = (page: Page) => page.evaluate(() => window.scrollBy(0, 800));

test('asks below the hero and loads no analytics before the visitor chooses', async ({ page }) => {
  const requests = await stubAnalytics(page);
  await page.goto('/');
  await expect(notice(page)).toBeHidden();
  await scrollPastHero(page);
  await expect(notice(page)).toBeVisible();
  await page.waitForTimeout(500);
  expect(requests).toEqual([]);
});

test('loads analytics once the visitor accepts, and remembers the choice', async ({ page }) => {
  const requests = await stubAnalytics(page);
  await page.goto('/');
  await scrollPastHero(page);
  await notice(page).getByRole('button', { name: 'Se strinjam' }).click();
  await expect.poll(() => requests.length).toBeGreaterThan(0);
  await page.reload();
  await scrollPastHero(page);
  expect([await storedChoice(page), await notice(page).isVisible()]).toEqual(['yes', false]);
});

test('never loads analytics after the visitor declines', async ({ page }) => {
  const requests = await stubAnalytics(page);
  await page.goto('/');
  await scrollPastHero(page);
  await notice(page).getByRole('button', { name: 'Zavrni' }).click();
  await page.reload();
  await scrollPastHero(page);
  await page.waitForTimeout(500);
  expect([await storedChoice(page), requests]).toEqual(['no', []]);
});

test('lets a visitor who accepted take it back from the footer', async ({ page }) => {
  await stubAnalytics(page);
  await page.goto('/');
  await scrollPastHero(page);
  await notice(page).getByRole('button', { name: 'Se strinjam' }).click();
  await page.getByRole('contentinfo').getByRole('button', { name: 'Nastavitve piškotkov' }).click();
  await expect(notice(page)).toBeVisible();
  const deniedUpdates = await page.evaluate(
    () =>
      (window.dataLayer ?? []).filter((entry) => {
        const [command, action, settings] = Array.from(entry as ArrayLike<unknown>);
        return (
          command === 'consent' &&
          action === 'update' &&
          (settings as Record<string, string>).analytics_storage === 'denied'
        );
      }).length,
  );
  expect([await storedChoice(page), deniedUpdates]).toEqual([null, 1]);
});
