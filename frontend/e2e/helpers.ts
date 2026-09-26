import type { Page } from '@playwright/test';

/** Sheets whose pages are not built yet; links to them prefetch a 404. Remove each as its page lands. */
const PENDING_SHEETS: string[] = [];
const isPendingSheet = (url: string) => PENDING_SHEETS.some((sheet) => new URL(url).pathname.endsWith(sheet));

/** Console errors, uncaught exceptions and failed requests (by URL, instead of the console's bare "Failed to load resource"). */
export function collectErrors(page: Page) {
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
export async function scrollThrough(page: Page) {
  for (const section of await page.locator('main > section').all()) {
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
  }
}
