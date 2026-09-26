import type { Material, Part, Process } from '@/content/parts';

/** Catalogue order of the material filter. Materials no part carries are never offered. */
const MATERIAL_ORDER: readonly Material[] = ['steel', 'stainless', 'alu', 'brass', 'PVC'];

export type PartFilter = { process: Process | 'all'; material: Material | 'all' };

export const filterParts = (parts: readonly Part[], { process, material }: PartFilter): Part[] =>
  parts.filter(
    (part) =>
      (process === 'all' || part.process === process) && (material === 'all' || part.material === material),
  );

export const availableMaterials = (parts: readonly Part[]): Material[] =>
  MATERIAL_ORDER.filter((material) => parts.some((part) => part.material === material));

export function processCounts(parts: readonly Part[]): Record<Process | 'all', number> {
  const counts = { all: parts.length, turning: 0, milling: 0, plastic: 0 };
  for (const part of parts) counts[part.process] += 1;
  return counts;
}
