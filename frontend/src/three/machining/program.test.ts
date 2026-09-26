/**
 * `__fixtures__/design-machining.json` holds the toolpaths the design's own engine (sugo-drawings.js,
 * SugoModel._machine) generates; the port must produce the same program.
 */
import { expect, it } from 'vitest';
import fixtures from '../__fixtures__/design-machining.json';
import type { TurnedPart } from '@/drawing/geometry/parts-table';
import { PART_GEOMETRY } from '@/drawing/geometry/parts-table';
import { buildProgram, type Move } from './program';

type DesignMove = {
  x: number;
  r: number | null;
  rapid?: number;
  op: number;
  tool?: string;
  v?: number;
  mode?: string;
  f?: number;
  R?: number;
  xe?: number;
};
const programs = fixtures as Record<string, DesignMove[]>;

const toDesign = (move: Move): DesignMove => {
  const { rapid, ...rest } = move;
  return rapid ? { ...rest, rapid: 1 } : rest;
};

// Parts with a bore: the design's program for solid parts parts off at an infinite radius (a quirk
// the port does not copy), and the hero only machines the flange.
const bored = Object.keys(programs).filter(
  (kind) => (PART_GEOMETRY[kind as keyof typeof PART_GEOMETRY] as TurnedPart).inner,
);

it.each(bored)('programs %s exactly like the design engine', (kind) => {
  const part = PART_GEOMETRY[kind as keyof typeof PART_GEOMETRY] as TurnedPart;
  expect(buildProgram(part).map(toDesign)).toEqual(programs[kind]);
});

it('parts solid bars off at the axis', () => {
  const lastCut = buildProgram(PART_GEOMETRY.r05 as TurnedPart).findLast((move) => move.mode === 'part');
  expect(lastCut?.r).toBe(0);
});
