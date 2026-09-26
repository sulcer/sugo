import { act } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * Replaces IntersectionObserver with one the test drives by hand; returns a function that reports
 * the observed element as `ratio` visible. Undo with `vi.unstubAllGlobals()`.
 */
export function stubIntersectionObserver() {
  let report: (entry: Partial<IntersectionObserverEntry>) => void = () => {};
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        report = (entry) =>
          callback([entry as IntersectionObserverEntry], this as unknown as IntersectionObserver);
      }
      observe() {}
      disconnect() {}
    },
  );
  return (ratio: number) => act(() => report({ isIntersecting: ratio > 0, intersectionRatio: ratio }));
}
