import { expect, it } from 'vitest';
import { PARTS } from '@/content/parts';
import { availableMaterials, filterParts, processCounts } from './filter-parts';

it('lists only materials that parts actually have, in catalogue order', () => {
  expect(availableMaterials(PARTS)).toEqual(['brass', 'PVC']);
});

it('counts parts per process', () => {
  expect(processCounts(PARTS)).toEqual({ all: 20, turning: 13, milling: 6, plastic: 1 });
});

it('combines process and material filters', () => {
  expect(filterParts(PARTS, { process: 'turning', material: 'brass' }).map((part) => part.kind)).toEqual([
    'r20',
  ]);
});

it('returns an empty list when nothing matches', () => {
  expect(filterParts(PARTS, { process: 'milling', material: 'PVC' })).toEqual([]);
});

it('keeps the whole catalogue when neither filter is set', () => {
  expect(filterParts(PARTS, { process: 'all', material: 'all' })).toEqual([...PARTS]);
});
