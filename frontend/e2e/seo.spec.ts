import { expect, test } from '@playwright/test';

test('the sitemap lists every page in every language with its alternates', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  expect([xml.match(/<url>/g)?.length, xml.match(/<xhtml:link /g)?.length]).toEqual([15, 60]);
});

test('robots.txt points crawlers to the sitemap', async ({ request }) => {
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap: https://sugo.si/sitemap.xml');
});
