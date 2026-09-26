import { expect, it } from 'vitest';
import robots from './robots';

it('lets every crawler in and points it to the sitemap', () => {
  expect(robots()).toEqual({
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://sugo.si/sitemap.xml',
  });
});
