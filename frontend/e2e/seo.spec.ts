import { expect, test } from '@playwright/test';
import { localBusiness } from '../src/features/home/structured-data';
import { LOCALES } from '../src/i18n/locales';

test('the sitemap lists every page in every language with its alternates', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  expect([xml.match(/<url>/g)?.length, xml.match(/<xhtml:link /g)?.length]).toEqual([15, 60]);
});

test('robots.txt points crawlers to the sitemap', async ({ request }) => {
  expect(await (await request.get('/robots.txt')).text()).toContain(
    'Sitemap: https://www.sugo.si/sitemap.xml',
  );
});

test('a page names its canonical url and its versions in the other languages', async ({ page }) => {
  await page.goto('/de/strojni-park');
  const head = page.locator('head');
  expect([
    await head.locator('link[rel="canonical"]').getAttribute('href'),
    await head
      .locator('link[rel="alternate"][hreflang]')
      .evaluateAll((links) =>
        links.map((link) => `${link.getAttribute('hreflang')} ${link.getAttribute('href')}`),
      ),
  ]).toEqual([
    'https://www.sugo.si/de/strojni-park',
    [
      'sl https://www.sugo.si/strojni-park',
      'de https://www.sugo.si/de/strojni-park',
      'en https://www.sugo.si/en/strojni-park',
      'x-default https://www.sugo.si/strojni-park',
    ],
  ]);
});

test('the home page tells search engines who SUGO is', async ({ page }) => {
  await page.goto('/de');
  const data = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
  expect(data).toEqual(localBusiness('de'));
});

test('every page shares a link preview card', async ({ page }) => {
  await page.goto('/en/strojni-park');
  const meta = (property: string) => page.locator(`meta[property="${property}"]`).getAttribute('content');
  expect([await meta('og:image'), await meta('og:image:width'), await meta('og:image:height')]).toEqual([
    'https://www.sugo.si/og-en.png',
    '1200',
    '630',
  ]);
});

for (const locale of LOCALES) {
  test(`serves the ${locale} link preview image`, async ({ request }) => {
    const response = await request.get(`/og-${locale}.png`);
    expect([response.status(), response.headers()['content-type']]).toEqual([200, 'image/png']);
  });
}
