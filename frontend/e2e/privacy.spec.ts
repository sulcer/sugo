import { expect, test } from '@playwright/test';

const STATEMENTS = {
  '/varovanje-osebnih-podatkov': 'Izjava o varovanju osebnih podatkov',
  '/de/varovanje-osebnih-podatkov': 'Erklärung zum Schutz personenbezogener Daten',
  '/en/varovanje-osebnih-podatkov': 'Statement on the protection of personal data',
};

for (const [path, title] of Object.entries(STATEMENTS)) {
  test(`${path} sets out the statement in seven numbered sections`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await expect(page.getByRole('heading', { level: 2 })).toHaveText([
      /^01 · /,
      /^02 · /,
      /^03 · /,
      /^04 · /,
      /^05 · /,
      /^06 · /,
      /^07 · /,
    ]);
  });
}

test('is linked from the footer', async ({ page }) => {
  // A visitor who has answered the cookie notice (on phones it covers the footer's last row).
  await page.addInitScript(() => localStorage.setItem('sugo-cookie', 'no'));
  await page.goto('/de');
  await page.getByRole('contentinfo').getByRole('link', { name: 'Datenschutzerklärung' }).click();
  await expect(page).toHaveURL(/\/de\/varovanje-osebnih-podatkov$/);
});
