'use client';

import { useCurrentYear } from '@/lib/use-current-year';

export function CurrentYear({ buildYear }: { buildYear: number }) {
  return useCurrentYear(buildYear);
}
