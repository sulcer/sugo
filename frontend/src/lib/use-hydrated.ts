import { useSyncExternalStore } from 'react';

const subscribeNever = () => () => {};

/** False in the server render and while hydrating; true once the page's scripts run. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}
