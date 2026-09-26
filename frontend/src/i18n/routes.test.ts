import { localePath, parsePathname } from './routes';

describe('localePath', () => {
  it.each([
    ['sl', 'home', undefined, '/'],
    ['sl', 'park', undefined, '/strojni-park'],
    ['de', 'home', undefined, '/de'],
    ['en', 'privacy', undefined, '/en/varovanje-osebnih-podatkov'],
    ['de', 'contact', 'risba', '/de/kontakt#risba'],
  ] as const)('%s %s %s → %s', (locale, route, hash, expected) => {
    expect(localePath(locale, route, hash)).toBe(expected);
  });
});

describe('parsePathname', () => {
  it.each([
    ['/', { locale: 'sl', route: 'home' }],
    ['/izdelki', { locale: 'sl', route: 'products' }],
    ['/de', { locale: 'de', route: 'home' }],
    ['/en/kontakt', { locale: 'en', route: 'contact' }],
    ['/de/nope', { locale: 'de', route: null }],
    ['/izdelki/', { locale: 'sl', route: 'products' }],
  ] as const)('%s', (pathname, expected) => {
    expect(parsePathname(pathname)).toEqual(expected);
  });
});
