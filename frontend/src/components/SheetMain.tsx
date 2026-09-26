import type { ReactNode } from 'react';

/** The sheet's content column: 1280 px wide, ruled off at both sides. */
export function SheetMain({ children }: { children: ReactNode }) {
  return (
    <main id="main" className="mx-auto max-w-sheet border-x border-rule">
      {children}
    </main>
  );
}
