import { expect, it } from 'vitest';
import { languageAlternates } from './alternates';

it('links every language version of a page, the slovenian one as the default', () => {
  expect(languageAlternates('products')).toEqual({
    sl: '/izdelki',
    de: '/de/izdelki',
    en: '/en/izdelki',
    'x-default': '/izdelki',
  });
});
