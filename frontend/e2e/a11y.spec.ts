import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = [
  '/',
  '/de',
  '/en',
  '/strojni-park',
  '/de/strojni-park',
  '/en/strojni-park',
  '/izdelki',
  '/de/izdelki',
  '/en/izdelki',
  '/ne-obstaja',
];

for (const path of PAGES) {
  test(`${path} has no accessibility violations`, async ({ page }) => {
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(
      violations.map(
        (violation) => `${violation.id}: ${violation.nodes.map((node) => node.target).join(', ')}`,
      ),
    ).toEqual([]);
  });
}

test('the open phone menu has no accessibility violations', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone menu');
  await page.goto('/');
  await page.getByRole('button', { name: 'Meni' }).click();
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.map((violation) => violation.id)).toEqual([]);
});
