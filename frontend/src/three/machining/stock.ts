import type { Point } from '@/drawing/geometry/path';
import type { TurnedPart } from '@/drawing/geometry/parts-table';

/** Bar stock the hero part is turned from (Ø 69). */
export const STOCK_RADIUS = 34.5;
const SAMPLES = 320;

export type CutMode = 'face' | 'turn' | 'thread' | 'drill' | 'bore' | 'part';
export type Cut = { mode?: CutMode; f?: number; R?: number; xe?: number };

/**
 * The bar as radii sampled along its axis: `outer` shrinks as the tool turns it down, `inner` grows
 * as it is drilled and bored. `target` is the finished outer profile the tool must not cut into.
 */
export type Stock = {
  part: TurnedPart;
  xs: Float32Array;
  outer: Float32Array;
  inner: Float32Array;
  target: Float32Array;
  x0: number;
  step: number;
};

/** Largest radius of a profile at `x` (a shoulder counts its outer corner), 0 outside it. */
export function profileRadius(profile: readonly Point[], x: number): number {
  let best: number | null = null;
  for (let i = 0; i < profile.length - 1; i++) {
    const [xa, ra] = profile[i];
    const [xb, rb] = profile[i + 1];
    if (x >= Math.min(xa, xb) - 1e-6 && x <= Math.max(xa, xb) + 1e-6) {
      const r = Math.abs(xb - xa) < 1e-6 ? Math.max(ra, rb) : ra + ((rb - ra) * (x - xa)) / (xb - xa);
      best = best === null ? r : Math.max(best, r);
    }
  }
  return best ?? 0;
}

export function createStock(part: TurnedPart): Stock {
  const x0 = -1.6;
  const x1 = part.L + 7;
  const step = (x1 - x0) / (SAMPLES - 1);
  const xs = Float32Array.from({ length: SAMPLES }, (_, i) => x0 + step * i);
  return {
    part,
    xs,
    outer: new Float32Array(SAMPLES).fill(STOCK_RADIUS),
    inner: new Float32Array(SAMPLES),
    target: Float32Array.from(xs, (x) =>
      x < 0 ? 0 : x > part.L ? STOCK_RADIUS : profileRadius(part.outer, x),
    ),
    x0,
    step,
  };
}

/** Thread form at `x` after a pass that cut `fraction` of the depth: a triangle wave between the radii. */
function threadRadius(part: TurnedPart, x: number, fraction: number) {
  const thread = part.threads?.[0];
  if (!thread || x < thread.x0 || x > thread.x1) return 1e9;
  const phase = ((x - thread.x0) / thread.pitch) % 1;
  const triangle = 1 - Math.abs(2 * phase - 1);
  return thread.rMaj - fraction * (thread.rMaj - thread.rMin) * triangle;
}

/** Removes the material the tool tip at (x, r) takes away in the given cutting mode. */
export function cutStock(stock: Stock, x: number, r: number, cut: Cut) {
  const { xs, outer, inner, target, part } = stock;
  const n = xs.length;
  const first = Math.max(0, Math.floor((x - 0.45 - stock.x0) / stock.step));
  const last = Math.min(n - 1, Math.ceil((x + 0.45 - stock.x0) / stock.step));
  switch (cut.mode) {
    case 'turn':
      for (let i = first; i <= last; i++)
        if (Math.abs(xs[i] - x) <= 0.3 && xs[i] <= part.L)
          outer[i] = Math.min(outer[i], Math.max(r, target[i]));
      break;
    case 'face':
      for (let i = 0; i < n && xs[i] <= x + 0.02; i++) outer[i] = Math.min(outer[i], Math.max(r, target[i]));
      break;
    case 'thread':
      for (let i = first; i <= last; i++)
        if (Math.abs(xs[i] - x) <= 0.35) outer[i] = Math.min(outer[i], threadRadius(part, xs[i], cut.f ?? 1));
      break;
    case 'drill':
      for (let i = 0; i < n && xs[i] <= x; i++) inner[i] = Math.max(inner[i], cut.R ?? 0);
      break;
    case 'bore':
      for (let i = 0; i < n && xs[i] <= Math.min(x, cut.xe ?? x); i++)
        inner[i] = Math.max(inner[i], cut.R ?? 0);
      break;
    case 'part':
      for (let i = 0; i < n; i++)
        if (Math.abs(xs[i] - x) <= 0.62) outer[i] = Math.min(outer[i], Math.max(r, inner[i]));
      break;
  }
}

/** After parting off, the offcut still held in the chuck is gone. */
export function dropOffcut(stock: Stock) {
  stock.xs.forEach((x, i) => {
    if (x > stock.part.L + 0.6) {
      stock.outer[i] = 0;
      stock.inner[i] = 0;
    }
  });
}
