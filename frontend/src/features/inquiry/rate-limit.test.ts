import { describe, expect, it } from 'vitest';
import { createRateLimiter } from './rate-limit';

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
    for (const _ of [1, 2, 3, 4, 5]) allow('1.2.3.4');
    clock.now = WINDOW;
    expect(allow('1.2.3.4')).toBe(true);
  });

  it('keeps a blocked address blocked just inside the window', () => {
    const clock = { now: 0 };
    const allow = limiterAt(clock);
    for (const _ of [1, 2, 3, 4, 5]) allow('1.2.3.4');
    clock.now = WINDOW - 1;
    expect(allow('1.2.3.4')).toBe(false);
  });

  it('counts each address on its own', () => {
    const allow = limiterAt({ now: 0 });
    for (const _ of [1, 2, 3, 4, 5]) allow('1.2.3.4');
    expect(allow('5.6.7.8')).toBe(true);
  });
});
