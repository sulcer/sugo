import { describe, expect, it } from 'vitest';
import { createInquiryLimiter, createRateLimiter, networkKey } from './rate-limit';

const WINDOW = 10 * 60_000;

function limiterAt(clock: { now: number }) {
  return createRateLimiter({ limit: 5, windowMs: WINDOW, now: () => clock.now });
}

describe('createRateLimiter', () => {
  it('allows five submissions and blocks the sixth', () => {
    const allow = limiterAt({ now: 0 });
    expect([1, 2, 3, 4, 5, 6].map(() => allow('1.2.3.4'))).toEqual([true, true, true, true, true, false]);
  });

  it('allows a blocked address again once the window has passed', () => {
    const clock = { now: 0 };
    const allow = limiterAt(clock);
    for (let i = 0; i < 5; i++) allow('1.2.3.4');
    clock.now = WINDOW;
    expect(allow('1.2.3.4')).toBe(true);
  });

  it('keeps a blocked address blocked just inside the window', () => {
    const clock = { now: 0 };
    const allow = limiterAt(clock);
    for (let i = 0; i < 5; i++) allow('1.2.3.4');
    clock.now = WINDOW - 1;
    expect(allow('1.2.3.4')).toBe(false);
  });

  it('counts each address on its own', () => {
    const allow = limiterAt({ now: 0 });
    for (let i = 0; i < 5; i++) allow('1.2.3.4');
    expect(allow('5.6.7.8')).toBe(true);
  });
});

describe('networkKey', () => {
  it('leaves an IPv4 address alone', () => {
    expect(networkKey('1.2.3.4')).toBe('1.2.3.4');
  });

  it('counts two addresses of one IPv6 network as one visitor', () => {
    expect(networkKey('2001:db8::2')).toBe(networkKey('2001:0DB8:0:0:aaaa:bbbb:cccc:dddd'));
  });

  it('keeps neighbouring IPv6 networks apart', () => {
    expect(networkKey('2001:db8:0:1::1')).not.toBe(networkKey('2001:db8::1'));
  });

  it('expands the compressed groups in the middle of an address', () => {
    expect(networkKey('2001:db8::1:2:3:4:5')).toBe('2001:db8:0:1::/64');
  });

  it('drops the zone index of a link-local address', () => {
    expect(networkKey('fe80::1%eth0')).toBe('fe80:0:0:0::/64');
  });
});

describe('createInquiryLimiter', () => {
  it('allows five inquiries from one network and blocks the sixth', () => {
    const allow = createInquiryLimiter(() => 0);
    for (let i = 0; i < 5; i++) allow('2001:db8::1');
    expect(allow('2001:db8::ff')).toBe(false);
  });

  it('blocks a fresh address once the hour is spent', () => {
    const allow = createInquiryLimiter(() => 0);
    for (let network = 0; network < 10; network++) for (let i = 0; i < 5; i++) allow(`10.0.0.${network}`);
    expect(allow('10.0.1.1')).toBe(false);
  });

  it('serves a fresh address while the overall ceiling is not reached', () => {
    const allow = createInquiryLimiter(() => 0);
    for (let network = 0; network < 9; network++) for (let i = 0; i < 5; i++) allow(`10.0.0.${network}`);
    expect(allow('10.0.1.1')).toBe(true);
  });
});
