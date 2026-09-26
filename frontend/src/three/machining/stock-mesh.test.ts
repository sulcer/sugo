import { expect, it } from 'vitest';
import type { TurnedPart } from '@/drawing/geometry/parts-table';
import { PART_GEOMETRY } from '@/drawing/geometry/parts-table';
import { createStock, STOCK_RADIUS } from './stock';
import { createStockMesh } from './stock-mesh';

const flange = PART_GEOMETRY.flange as TurnedPart;

it('revolves the outer and inner profile into one closed surface', () => {
  const { mesh } = createStockMesh(createStock(flange));
  expect(mesh.geometry.getAttribute('position').count).toBe(2 * 320 * 81);
});

it('shows the bar at full stock radius before cutting', () => {
  const stock = createStock(flange);
  const { mesh } = createStockMesh(stock);
  expect(mesh.geometry.getAttribute('position').getY(0)).toBeCloseTo(STOCK_RADIUS);
});

it('follows the stock as it is cut', () => {
  const stock = createStock(flange);
  const surface = createStockMesh(stock);
  stock.outer[0] = 20;
  surface.update();
  expect(surface.mesh.geometry.getAttribute('position').getY(0)).toBeCloseTo(20);
});
