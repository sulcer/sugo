import { expect, test } from '@playwright/test';

test('the sitemap lists every page in every language with its alternates', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  expect([xml.match(/<url>/g)?.length, xml.match(/<xhtml:link /g)?.length]).toEqual([15, 60]);
});

test('robots.txt points crawlers to the sitemap', async ({ request }) => {
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap: https://sugo.si/sitemap.xml');
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
    'https://sugo.si/de/strojni-park',
    [
      'sl https://sugo.si/strojni-park',
      'de https://sugo.si/de/strojni-park',
      'en https://sugo.si/en/strojni-park',
      'x-default https://sugo.si/strojni-park',
    ],
  ]);
});
