'use client';

/** The visitor's current year: pages are prerendered, so the build year would go stale. */
export function CurrentYear() {
  return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}
