import { expect, test } from '@playwright/test';
import { LOCALES } from '../src/i18n/locales';
import { localePath, ROUTE_KEYS } from '../src/i18n/routes';

const PAGES = ROUTE_KEYS.flatMap((route) => LOCALES.map((locale) => localePath(locale, route)));

for (const path of PAGES) {
  test(`${path} fits a phone without sideways scrolling or clipped headings`, async ({ page, isMobile }) => {
    test.skip(!isMobile, 'phone widths');
    await page.goto(path);
    const overflow = await page.evaluate(() => ({
      page: document.documentElement.scrollWidth - window.innerWidth,
      headings: [...document.querySelectorAll('h1, h2, h3')]
        .filter((heading) => heading.scrollWidth > heading.clientWidth)
        .map((heading) => heading.textContent),
    }));
    expect(overflow).toEqual({ page: 0, headings: [] });
  });
}
