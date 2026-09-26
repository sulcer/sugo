import { expect, it } from 'vitest';
import sitemap from './sitemap';

it('lists every page in every language', () => {
  expect(sitemap()).toHaveLength(15);
});

it('gives each entry its absolute url and its language alternates', () => {
  expect(sitemap().find((entry) => entry.url === 'https://sugo.si/de/izdelki')).toEqual({
    url: 'https://sugo.si/de/izdelki',
    alternates: {
      languages: {
        sl: 'https://sugo.si/izdelki',
        de: 'https://sugo.si/de/izdelki',
        en: 'https://sugo.si/en/izdelki',
        'x-default': 'https://sugo.si/izdelki',
      },
    },
  });
});
