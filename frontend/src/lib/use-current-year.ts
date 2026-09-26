import { useSyncExternalStore } from 'react';

const subscribeNever = () => () => {};
const visitorYear = () => new Date().getFullYear();

/**
 * The visitor's current year. Pages are prerendered, so the server's build year is only the
 * no-JS fallback; hydration swaps in the live year even when a deploy outlives New Year.
 */
export function useCurrentYear(buildYear: number): number {
  return useSyncExternalStore(subscribeNever, visitorYear, () => buildYear);
}
