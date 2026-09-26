import { describe, expect, it } from 'vitest';
import { decideProxy } from './proxy-decision';

describe('decideProxy', () => {
  it.each([
    ['/', { action: 'rewrite', pathname: '/sl' }],
    ['/izdelki', { action: 'rewrite', pathname: '/sl/izdelki' }],
    ['/varovanje-osebnih-podatkov', { action: 'rewrite', pathname: '/sl/varovanje-osebnih-podatkov' }],
  ] as const)('serves slovenian page %s from the /sl tree', (pathname, expected) => {
    expect(decideProxy(pathname)).toEqual(expected);
  });

  it.each(['/de', '/en/kontakt', '/de/strojni-park'])('passes the prefixed page %s through', (pathname) => {
    expect(decideProxy(pathname)).toEqual({ action: 'next' });
  });

  it.each([
    ['/sl', '/'],
    ['/sl/izdelki', '/izdelki'],
    ['/SL/izdelki', '/izdelki'],
    ['/DE/kontakt', '/de/kontakt'],
    ['/En', '/en'],
  ])('redirects %s to its canonical url %s', (pathname, target) => {
    expect(decideProxy(pathname)).toEqual({ action: 'redirect', pathname: target });
  });

  it.each([
    ['/slovenija', '/sl/404'],
    ['/fr/izdelki', '/sl/404'],
    ['/izdelki/vijak', '/sl/404'],
    ['/de/gibt-es-nicht', '/de/404'],
    ['/en/404', '/en/404'],
  ])('answers unknown %s with the static not-found sheet %s', (pathname, target) => {
    expect(decideProxy(pathname)).toEqual({ action: 'rewrite', pathname: target, status: 404 });
  });
});
