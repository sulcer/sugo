import { expect, test } from '@playwright/test';

test.describe('desktop header', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop layout only');

  test('shows the three numbered sheets and no menu button', async ({ page }) => {
    await page.goto('/');
    const sheets = page.getByRole('navigation', { name: 'Meni' }).getByRole('link');
    await expect(sheets).toHaveText(['02Strojni park', '03Izdelki', '04Kontakt']);
    await expect(page.getByRole('button', { name: 'Meni' })).toBeHidden();
  });

  test('switches to the same page in german', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Deutsch' }).click();
    await expect(page).toHaveURL(/\/de$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  });
});

test.describe('phone header', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone layout only');

  test('opens the sheet menu and closes it after choosing a sheet', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Meni' }).click();
    await page.getByRole('link', { name: /Kontakt/ }).click();
    await expect(page).toHaveURL(/\/kontakt$/);
    await expect(page.locator('#site-menu')).toBeHidden();
  });

  test('hides the open menu when the window grows past the phone layout', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Meni' }).click();
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('#site-menu')).toBeHidden();
  });
});

test('offers a skip link to the page content', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard navigation');
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Na vsebino' })).toBeFocused();
});

test('shows the not-found sheet for an unknown slovenian url', async ({ page }) => {
  const response = await page.goto('/izdelki/ne-obstaja');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('List ne obstaja');
});

test('leads from the not-found sheet back to the home page of its language', async ({ page }) => {
  await page.goto('/en/nope');
  await expect(page.getByRole('link', { name: 'Back to the home page' })).toHaveAttribute('href', '/en');
});

test('shows the title-block footer with a live copyright year', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('contentinfo')).toContainText(`© ${new Date().getFullYear()} SUGO d.o.o.`);
});

test('switches the sheet to another language on every device', async ({ page }) => {
  await page.goto('/kontakt');
  await page.getByRole('group', { name: 'Jezik' }).getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL(/\/en\/kontakt$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});
