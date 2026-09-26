import type { Page } from '@playwright/test';

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
    if (response.status() >= 400) {
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
