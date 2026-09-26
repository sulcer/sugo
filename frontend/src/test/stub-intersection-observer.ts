import { act } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * Replaces IntersectionObserver with one the test drives by hand. Like the real one, it only reports
 * elements passed to `observe()` and stays silent after `disconnect()`. Undo with `vi.unstubAllGlobals()`.
 */
export function stubIntersectionObserver() {
  const observers: FakeIntersectionObserver[] = [];

  class FakeIntersectionObserver {
    readonly targets = new Set<Element>();

    constructor(readonly callback: IntersectionObserverCallback) {
      observers.push(this);
    }

    observe(target: Element) {
      this.targets.add(target);
    }

    unobserve(target: Element) {
      this.targets.delete(target);
    }

    disconnect() {
      this.targets.clear();
    }
  }

  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);

  return {
    /** Reports each observed element as `ratio` visible; several ratios arrive in one callback, as queued entries do. */
    scrollIntoView: (...ratios: number[]) =>
      act(() => {
        for (const observer of observers) {
          for (const target of observer.targets) {
            const entries = ratios.map((ratio) => ({
              target,
              isIntersecting: ratio > 0,
              intersectionRatio: ratio,
            }));
            observer.callback(
              entries as IntersectionObserverEntry[],
              observer as unknown as IntersectionObserver,
            );
          }
        }
      }),
    isObserving: () => observers.some((observer) => observer.targets.size > 0),
  };
}
