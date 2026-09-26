import { expect, test, type Page } from '@playwright/test';

/** The rate limiter counts per address; each test arrives from its own so none blocks another. */
let visitor = 0;
test.beforeEach(async ({ page }, testInfo) => {
  visitor += 1;
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': `10.0.${testInfo.workerIndex}.${visitor}` });
});

const attach = (page: Page, name: string, contents: string | Buffer) =>
  page
    .locator('input[type="file"]')
    .setInputFiles({ name, mimeType: 'application/pdf', buffer: Buffer.from(contents) });

test('opens the second question and keeps the first one open by default', async ({ page }) => {
  await page.goto('/kontakt');
  const answers = page.locator('details');
  await expect(answers.nth(0)).toHaveAttribute('open', '');
  await expect(answers.nth(1)).not.toHaveAttribute('open', '');
  await answers.nth(1).locator('summary').click();
  await expect(answers.nth(1)).toHaveAttribute('open', '');
});

test('marks the missing address and consent when the form is submitted empty', async ({ page }) => {
  await page.goto('/kontakt');
  await page.getByRole('button', { name: 'Pošlji' }).click();
  await expect(page.getByText('! Vpišite e-poštni naslov.')).toBeVisible();
  await expect(page.getByText('! Potrdite izjavo o varovanju podatkov.')).toBeVisible();
});

test('refuses a drawing over the four megabyte limit', async ({ page }) => {
  await page.goto('/kontakt');
  await attach(page, 'velika.pdf', Buffer.alloc(5 * 1024 * 1024, 0x20));
  await expect(page.getByText(/presegajo 4 MB/)).toBeVisible();
});

test('thanks the visitor for an inquiry with a drawing', async ({ page }) => {
  await page.goto('/kontakt');
  await attach(page, 'risba.pdf', '%PDF-1.7\nrisba');
  await expect(page.getByText('risba.pdf')).toBeVisible();
  await page.getByLabel(/E-pošta \*/).fill('ana@primer.si');
  // The visitor ticks the drawn box; the input itself is hidden from sight but not from the keyboard.
  await page
    .locator('label')
    .filter({ has: page.getByRole('checkbox') })
    .click();
  await expect(page.getByRole('checkbox')).toBeChecked();
  // Sent at once: the form holds it until the spam guard's three seconds have passed.
  await page.getByRole('button', { name: 'Pošlji' }).click();
  await expect(page.getByText('Hvala. Povpraševanje je poslano.')).toBeVisible({ timeout: 10_000 });
});

test('refuses an executable that calls itself a drawing', async ({ page }) => {
  await page.goto('/kontakt');
  // The name alone gets it past the browser; only the server reads the bytes.
  await attach(page, 'risba.pdf', 'MZ\u0000\u0000');
  await page.getByLabel(/E-pošta \*/).fill('ana@primer.si');
  await page
    .locator('label')
    .filter({ has: page.getByRole('checkbox') })
    .click();
  await page.getByRole('button', { name: 'Pošlji' }).click();
  await expect(page.getByText('! Podprte so datoteke PDF, STEP in DXF.')).toBeVisible({ timeout: 10_000 });
});

test('lands the drawing zone below the sticky header', async ({ page }) => {
  await page.goto('/kontakt#risba');
  const header = await page.getByRole('banner').boundingBox();
  const section = await page.locator('#risba').boundingBox();
  expect(section!.y - (header!.y + header!.height)).toBeGreaterThanOrEqual(0);
  expect(section!.y - (header!.y + header!.height)).toBeLessThanOrEqual(4);
});
