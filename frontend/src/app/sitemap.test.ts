import { expect, it } from 'vitest';
import sitemap from './sitemap';

it('lists every page in every language', () => {
  expect(sitemap()).toHaveLength(15);
});

it('gives each entry its absolute url and its language alternates', () => {
  expect(sitemap().find((entry) => entry.url === 'https://www.sugo.si/de/izdelki')).toEqual({
    url: 'https://www.sugo.si/de/izdelki',
    alternates: {
      languages: {
        sl: 'https://www.sugo.si/izdelki',
        de: 'https://www.sugo.si/de/izdelki',
        en: 'https://www.sugo.si/en/izdelki',
        'x-default': 'https://www.sugo.si/izdelki',
      },
    },
  });
});
