import { createLayer, type Drawing, type ViewBox } from './layer';

export const MAP_VIEW_BOX: ViewBox = [0, 0, 600, 380];

const BUILDING = 'M392 236 L438 248 L431 276 L385 264 Z';

/** Location sketch in drawing style: the approach roads, the building hatched, a leader and north arrow. */
export function drawMap(k: number): Drawing {
  const layer = createLayer(k, 'a');
  layer.roads.push(
    'M-20 300 C 150 272, 300 150, 620 104',
    'M318 170 C 336 205, 352 226, 382 246',
    'M200 238 C 190 180, 170 110, 150 -10',
    'M480 118 C 500 180, 530 250, 560 400',
  );
  layer.hatch.push(BUILDING);
  layer.thick.push(BUILDING);
  layer.thin.push('M404 268 L372 318 L236 318');
  layer.texts.push(
    { x: 238, y: 311, size: 11, text: 'SUGO d.o.o.', anchor: 'start' },
    { x: 238, y: 336, size: 10, text: 'Spodnji Jakobski Dol 45', anchor: 'start', muted: true },
    { x: 18, y: 330, size: 10, text: '← MARIBOR', anchor: 'start', muted: true },
    { x: 590, y: 162, size: 10, text: 'LENART →', anchor: 'end', muted: true },
    { x: 238, y: 250, size: 10, text: 'JAKOBSKI DOL', anchor: 'start', muted: true },
  );
  layer.thin.push('M560 70 L560 22');
  layer.fills.push('M560 14 L553 32 L560 27 L567 32 Z');
  layer.texts.push({ x: 560, y: 88, size: 11, text: 'N', anchor: 'middle' });
  return { layers: [layer], viewBox: MAP_VIEW_BOX };
}
