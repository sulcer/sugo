import { decideProxy } from './proxy-decision';

describe('decideProxy', () => {
  it.each([
    ['/', { action: 'rewrite', pathname: '/sl' }],
    ['/izdelki', { action: 'rewrite', pathname: '/sl/izdelki' }],
    ['/fr/izdelki', { action: 'rewrite', pathname: '/sl/fr/izdelki' }],
    ['/slovenija', { action: 'rewrite', pathname: '/sl/slovenija' }],
    ['/de', { action: 'next' }],
    ['/en/kontakt', { action: 'next' }],
    ['/sl', { action: 'redirect', pathname: '/' }],
    ['/sl/izdelki', { action: 'redirect', pathname: '/izdelki' }],
    ['/SL/izdelki', { action: 'redirect', pathname: '/izdelki' }],
  ] as const)('%s', (pathname, expected) => {
    expect(decideProxy(pathname)).toEqual(expected);
  });
});
