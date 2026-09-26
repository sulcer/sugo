import type { DrawingLayer, ViewBox } from './layer';
import { drawMilled, milledGeometry } from './milled';
import { PART_GEOMETRY, type PartKind } from './parts-table';
import { round2 } from './path';
import { drawTurned, turnedGeometry } from './turned';

/** 'e' = end view, 'f' = half-section, 'p' = plan view of a milled part. */
type FloorView = 'e' | 'f' | 'p';
export type FloorItem = { view: FloorView; x: number; y: number; rotation: number; kind: PartKind };

/** Ten parts laid out loosely, as if on a workbench, under the home page counters. */
export const PARTS_FLOOR: { viewBox: ViewBox; items: readonly FloorItem[] } = {
  viewBox: [0, 0, 540, 200],
  items: [
    { view: 'e', x: 46, y: 58, rotation: 0, kind: 'r09' },
    { view: 'f', x: 152, y: 48, rotation: -8, kind: 'r03' },
    { view: 'f', x: 252, y: 74, rotation: 22, kind: 'r08' },
    { view: 'e', x: 346, y: 56, rotation: 0, kind: 'r17' },
    { view: 'e', x: 474, y: 52, rotation: 0, kind: 'r20' },
    { view: 'p', x: 62, y: 146, rotation: 8, kind: 'r14' },
    { view: 'f', x: 202, y: 160, rotation: -6, kind: 'r19' },
    { view: 'e', x: 306, y: 150, rotation: 0, kind: 'r16' },
    { view: 'f', x: 392, y: 146, rotation: -58, kind: 'r11' },
    { view: 'p', x: 486, y: 148, rotation: -10, kind: 'r13' },
  ],
};

/** Each floor item's view, centred on its own origin and moved into place. */
export function floorPlacements(k: number): { transform: string; layer: DrawingLayer }[] {
  return PARTS_FLOOR.items.map(({ view, x, y, rotation, kind }) => {
    const part = PART_GEOMETRY[kind];
    const place = `translate(${x} ${y}) rotate(${rotation})`;
    if (part.type === 'milled') {
      const centreY = milledGeometry(part).planOffset + part.D / 2;
      return {
        transform: `${place} translate(${round2(-part.W / 2)} ${round2(-centreY)})`,
        layer: drawMilled(part, k, false).layers[1],
      };
    }
    const drawing = drawTurned(part, k, 'full');
    const centreX = view === 'e' ? turnedGeometry(part, 'full').cx : part.L / 2;
    return {
      transform: `${place} translate(${round2(-centreX)} 0)`,
      layer: drawing.layers[view === 'e' ? 1 : 0],
    };
  });
}
