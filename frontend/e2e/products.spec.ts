import { expect, test, type Page } from '@playwright/test';

const cards = (page: Page) => page.locator('main li');

test('lists the whole catalogue before anything is filtered', async ({ page }) => {
  await page.goto('/izdelki');
  await expect(cards(page)).toHaveCount(20);
});

test('shows only the milled parts when the german milling chip is chosen', async ({ page }) => {
  await page.goto('/de/izdelki');
  await page.getByRole('button', { name: /Fräsen/ }).click();
  await expect(cards(page)).toHaveCount(6);
});

test('offers only the materials the parts are known to be made of', async ({ page }) => {
  await page.goto('/de/izdelki');
  await expect(page.getByLabel('Werkstoff').locator('option')).toHaveText([
    'Alle Werkstoffe',
    'Messing',
    'PVC',
  ]);
});

test('counts the shown parts against the whole catalogue', async ({ page }) => {
  await page.goto('/de/izdelki');
  await page.getByLabel('Werkstoff').selectOption('brass');
  await expect(page.getByText('1 / 20 Teile angezeigt')).toBeVisible();
});

test('leads out of an empty result with a reset that restores the catalogue', async ({ page }) => {
  await page.goto('/de/izdelki');
  await page.getByRole('button', { name: /Fräsen/ }).click();
  await page.getByLabel('Werkstoff').selectOption('brass');
  await expect(page.getByText('Für diesen Filter gibt es keine Teile.')).toBeVisible();
  await page.getByRole('button', { name: 'Filter zurücksetzen' }).click();
  await expect(cards(page)).toHaveCount(20);
});
