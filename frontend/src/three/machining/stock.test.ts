import { expect, it } from 'vitest';
import type { TurnedPart } from '@/drawing/geometry/parts-table';
import { PART_GEOMETRY } from '@/drawing/geometry/parts-table';
import { buildProgram } from './program';
import { createStock, cutStock, dropOffcut, profileRadius, STOCK_RADIUS, type Stock } from './stock';

const flange = PART_GEOMETRY.flange as TurnedPart;

/** Runs the tool tip along every move in steps finer than the stock sampling, like the animation. */
function machine(stock: Stock) {
  let [x, r] = [-18, STOCK_RADIUS + 26];
  for (const move of buildProgram(stock.part)) {
    const steps = Math.max(1, Math.ceil(Math.hypot(move.x - x, move.r - r) / (stock.step * 0.5)));
    for (let s = 1; s <= steps; s++)
      cutStock(stock, x + ((move.x - x) * s) / steps, Math.abs(r + ((move.r - r) * s) / steps), move);
    [x, r] = [move.x, move.r];
  }
  dropOffcut(stock);
  return stock;
}

const radiusAt = (stock: Stock, radii: Float32Array, x: number) => {
  const i = stock.xs.findIndex((sample) => sample >= x);
  return Math.round(radii[i] * 100) / 100;
};

it('starts as round bar stock', () => {
  expect(createStock(flange).outer.every((r) => r === STOCK_RADIUS)).toBe(true);
});

it('reads the finished radius off a profile, taking the outer corner at a shoulder', () => {
  expect([profileRadius(flange.outer, 2), profileRadius(flange.outer, 4)]).toEqual([32, 32]);
});

it('turns the hub down to its finished diameter', () => {
  const stock = machine(createStock(flange));
  expect(radiusAt(stock, stock.outer, 8)).toBe(20);
});

it('never cuts into the finished flange', () => {
  const stock = machine(createStock(flange));
  expect(radiusAt(stock, stock.outer, 2)).toBeCloseTo(32, 0);
});

it('drills the bore through', () => {
  const stock = machine(createStock(flange));
  expect(radiusAt(stock, stock.inner, 20)).toBe(12);
});

it('bores the counterbore at the flange face', () => {
  const stock = machine(createStock(flange));
  expect(radiusAt(stock, stock.inner, 1)).toBe(15);
});

it('cuts the thread down to its core diameter at the tooth roots', () => {
  const stock = machine(createStock(flange));
  const thread = stock.xs.map((x, i) => (x > 16 && x < 34 ? stock.outer[i] : Infinity));
  expect(Math.round(Math.min(...thread) * 10) / 10).toBe(16.9);
});

it('leaves nothing beyond the parting line', () => {
  const stock = machine(createStock(flange));
  expect(radiusAt(stock, stock.outer, flange.L + 2)).toBe(0);
});

it('stops a turning cut at the finished profile even if the tool goes deeper', () => {
  const stock = createStock(flange);
  cutStock(stock, 8, 5, { mode: 'turn' });
  expect(radiusAt(stock, stock.outer, 8)).toBe(20);
});
