import type { TurnedPart } from '@/drawing/geometry/parts-table';
import { createStock, profileRadius, STOCK_RADIUS, type CutMode } from './stock';

export type Tool = 'turn' | 'thread' | 'drill' | 'part';
/** Operation index: 0 facing, 1 roughing, 2 finishing, 3 threading, 4 drilling / boring, 5 parting off. */
export type Operation = 0 | 1 | 2 | 3 | 4 | 5;

/** One CNC block: move the tool tip to (x, r), rapid or at feed `v` (mm/s) while cutting. */
export type Move = {
  x: number;
  r: number;
  op: Operation;
  rapid?: true;
  tool?: Tool;
  v?: number;
  mode?: CutMode;
  f?: number;
  R?: number;
  xe?: number;
};

const ROUGHING_ALLOWANCE = 0.35;
const ROUGHING_DEPTH = 4;

/**
 * The turning program for a part, as a machinist would set it up: face, rough in 4 mm passes,
 * finish along the profile, cut the thread in three passes, drill and bore, part off.
 */
export function buildProgram(part: TurnedPart): Move[] {
  const program: Move[] = [];
  const move = (x: number, r: number, options: Omit<Move, 'x' | 'r'>) => program.push({ x, r, ...options });
  const length = part.L;
  const R = STOCK_RADIUS;
  const { xs, target } = createStock(part);
  const minTarget = Math.min(...Array.from(target).filter((_, i) => xs[i] >= 0 && xs[i] <= length));

  // Facing.
  move(-0.3, R + 4, { rapid: true, op: 0, tool: 'turn' });
  move(-0.3, 0, { v: 70, mode: 'face', op: 0 });
  move(2, 2, { rapid: true, op: 0 });

  // Roughing: each pass runs from the free end towards the chuck until it meets the profile.
  for (let pass = R - ROUGHING_DEPTH; pass > minTarget + ROUGHING_ALLOWANCE; pass -= ROUGHING_DEPTH) {
    let stopAt = 0;
    for (let x = length; x >= 0; x -= 0.1) {
      if (profileRadius(part.outer, x) + ROUGHING_ALLOWANCE > pass) {
        stopAt = x;
        break;
      }
    }
    if (stopAt >= length - 0.5) continue;
    move(length + 0.8, pass + 2.5, { rapid: true, op: 1 });
    move(length + 0.8, pass, { v: 60, op: 1 });
    move(stopAt + 0.05, pass, { v: 85, mode: 'turn', op: 1 });
    move(stopAt + 1.2, pass + 2.5, { v: 85, op: 1 });
  }

  // Finishing along the profile.
  const finish = part.outer.slice(1, -1).reverse();
  move(length + 0.8, finish[0][1] - 0.6, { rapid: true, op: 2 });
  finish.forEach(([x, r]) => move(x, r, { v: 48, mode: 'turn', op: 2 }));
  const [lastX, lastR] = finish[finish.length - 1];
  move(lastX - 1, lastR + 1.5, { v: 48, op: 2 });

  // Threading in three passes.
  const thread = part.threads?.[0];
  if (thread) {
    [0.4, 0.75, 1].forEach((fraction) => {
      const depth = thread.rMaj - fraction * (thread.rMaj - thread.rMin);
      move(thread.x1 + 1.2, thread.rMaj + 2, { rapid: true, op: 3, tool: 'thread' });
      move(thread.x1 + 1.2, depth, { rapid: true, op: 3 });
      move(thread.x0, depth, { v: 120, mode: 'thread', f: fraction, op: 3 });
      move(thread.x0, thread.rMaj + 2, { rapid: true, op: 3 });
    });
  }

  // Drilling to the smallest bore, then boring the counterbore.
  const inner = part.inner ?? [
    [0, 0],
    [length, 0],
  ];
  const drill = Math.min(...inner.map(([, r]) => r).filter((r) => r > 0));
  const bored = Number.isFinite(drill);
  if (bored) {
    move(-16, 0, { rapid: true, op: 4, tool: 'drill' });
    move(-1.5, 0, { rapid: true, op: 4 });
    move(length + 1.2, 0, { v: 42, mode: 'drill', R: drill, op: 4 });
    move(-16, 0, { rapid: true, op: 4 });
    const counterbore = inner.find(([, r]) => r > drill + 0.5);
    if (counterbore) {
      const boreEnd = inner.find(([x, r]) => r <= drill + 1e-6 && x > 0)![0];
      move(-1.5, -(counterbore[1] - 1.2), { rapid: true, op: 4, tool: 'thread' });
      move(-1.5, -(counterbore[1] - 0.2), { rapid: true, op: 4 });
      move(boreEnd, -(counterbore[1] - 0.2), { v: 30, mode: 'bore', R: counterbore[1], xe: boreEnd, op: 4 });
      move(boreEnd, -(drill + 0.3), { v: 30, op: 4 });
      move(-4, -(drill + 0.3), { rapid: true, op: 4 });
    }
  }

  // Parting off.
  move(length + 0.6, R + 5, { rapid: true, op: 5, tool: 'part' });
  move(length + 0.6, Math.max(0, (bored ? drill : 0) - 0.6), { v: 34, mode: 'part', op: 5 });
  move(length + 0.6, R + 8, { rapid: true, op: 5 });
  move(length + 24, R + 30, { rapid: true, op: 5 });
  return program;
}
