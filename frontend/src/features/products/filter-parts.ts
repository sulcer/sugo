import type { Material, Process } from '@/content/parts';

/** Catalogue order of the material filter. Materials no part carries are never offered. */
const MATERIAL_ORDER: readonly Material[] = ['steel', 'stainless', 'alu', 'brass', 'PVC'];

export type PartFilter = { process: Process | 'all'; material: Material | 'all' };

/** The catalogue and its resolved, client-side form both filter the same way. */
type Filterable = { process: Process; material: Material | null };

export const filterParts = <T extends Filterable>(
  parts: readonly T[],
  { process, material }: PartFilter,
): T[] =>
  parts.filter(
    (part) =>
      (process === 'all' || part.process === process) && (material === 'all' || part.material === material),
  );

export const availableMaterials = (parts: readonly Pick<Filterable, 'material'>[]): Material[] =>
  MATERIAL_ORDER.filter((material) => parts.some((part) => part.material === material));

export function processCounts(
  parts: readonly Pick<Filterable, 'process'>[],
): Record<Process | 'all', number> {
  const counts = { all: parts.length, turning: 0, milling: 0, plastic: 0 };
  for (const part of parts) counts[part.process] += 1;
  return counts;
}
