import { expect, test } from '@playwright/test';
import { localePath, type RouteKey } from '../src/i18n/routes';

test.use({ javaScriptEnabled: false });

/** Every sheet with a technical drawing must show it to a visitor whose scripts never run. */
const DRAWN: RouteKey[] = ['home', 'park', 'products', 'contact'];

for (const route of DRAWN) {
  test(`${route} shows its drawings without JavaScript`, async ({ page }) => {
    await page.goto(localePath('sl', route));
    const hidden = await page.locator('main svg [data-plot]').evaluateAll((lines) =>
      lines.length === 0
        ? ['no drawing on the page']
        : lines
            .filter((line) => {
              const style = getComputedStyle(line);
              return style.opacity !== '1' || style.visibility !== 'visible' || style.display === 'none';
            })
            .map((line) => line.getAttribute('d')),
    );
    expect(hidden).toEqual([]);
  });
}

test('the hero drawing is complete without JavaScript', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('main > section').first();
  expect(
    await hero
      .locator('[data-plot]')
      .evaluateAll((lines) => lines.every((line) => getComputedStyle(line).opacity === '1')),
  ).toBe(true);
});
