import type { Drawing, ViewBox } from './layer';
import { drawMachine, machineViewBox, type MachineKind } from './machines';
import { drawMap, MAP_VIEW_BOX } from './map';
import { drawMilled, milledGeometry } from './milled';
import { PART_GEOMETRY, type PartKind } from './parts-table';
import { drawTurned, turnedGeometry, type PartViews } from './turned';

export type { Drawing, DrawingLayer, DrawingText, ViewBox } from './layer';
export type { MachineKind } from './machines';
export type { PartKind } from './parts-table';
export type { PartViews } from './turned';

export type DrawingSubject =
  | { type: 'part'; kind: PartKind; views: PartViews }
  | { type: 'machine'; kind: MachineKind }
  | { type: 'map' };

export function drawSubject(subject: DrawingSubject, k: number): Drawing {
  if (subject.type === 'map') return drawMap(k);
  if (subject.type === 'machine') return drawMachine(subject.kind, k);
  const part = PART_GEOMETRY[subject.kind];
  return part.type === 'milled' ? drawMilled(part, k) : drawTurned(part, k, subject.views);
}

/** The view box does not depend on scale, so aspect ratios are known before anything is measured. */
export function viewBoxOf(subject: DrawingSubject): ViewBox {
  if (subject.type === 'map') return MAP_VIEW_BOX;
  if (subject.type === 'machine') return machineViewBox(subject.kind);
  const part = PART_GEOMETRY[subject.kind];
  return part.type === 'milled' ? milledGeometry(part).viewBox : turnedGeometry(part, subject.views).viewBox;
}
