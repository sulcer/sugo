import type { Point } from './path';

/**
 * Geometry of the parts drawn on the site, traced from parts made at SUGO. Millimetres.
 * Turned parts are described by their radial profile `[x along the axis, radius]`; milled parts by a
 * block with pockets and holes seen from above.
 */

export type Thread = { x0: number; x1: number; rMaj: number; rMin: number; pitch: number };

export type EndView = {
  circles: readonly (readonly [radius: number, weight: 'thick' | 'thin'])[];
  /** Across-corners radius of a hex seen end-on. */
  hex?: number;
  boltCircle?: { radius: number; holeRadius: number; count: number; startAngle: number };
};

export type TurnedPart = {
  type: 'turned';
  /** Overall length. */
  L: number;
  /** Outer contour from the left face on the axis, round the part, to the right face on the axis. */
  outer: readonly Point[];
  /** Bore contour from left to right; solid parts have none. */
  inner?: readonly Point[];
  threads?: readonly Thread[];
  /** Knurled band from x0 to x1 at radius r. */
  knurl?: readonly [x0: number, x1: number, r: number];
  /** Hex section from x0 to x1 with across-corners radius R. */
  hex?: { x0: number; x1: number; R: number };
  /** Flange thickness, for the bolt holes of the 3D model. */
  flangeT?: number;
  end?: EndView;
};

/** Rectangular pocket seen from above: corner x/y, width w, length d, depth and corner radius r. */
export type Pocket = { x: number; y: number; w: number; d: number; depth: number; r?: number };
/** Drilled hole: centre x/y, diameter d, blind depth (through when omitted). */
export type Hole = { x: number; y: number; d: number; depth?: number };

export type MilledPart = {
  type: 'milled';
  /** Block width (x), length (y) and height. */
  W: number;
  D: number;
  H: number;
  /** y of the section plane A–A; the middle of the block when omitted. */
  cut?: number;
  pockets?: readonly Pocket[];
  holes?: readonly Hole[];
};

export type PartGeometry = TurnedPart | MilledPart;

// prettier-ignore
const PARTS = {
  flange: {
    type: 'turned',
    L: 36,
    flangeT: 4,
    outer: [[0, 0], [0, 31], [1, 32], [4, 32], [4, 20], [12, 20], [12, 16.5], [14, 16.5], [14, 17.2], [14.8, 18], [35, 18], [36, 17], [36, 0]],
    inner: [[0, 15], [3, 15], [3, 12], [35.4, 12], [36, 12.6]],
    threads: [{ x0: 14.8, x1: 35, rMaj: 18, rMin: 16.9, pitch: 1.5 }],
    knurl: [4, 12, 20],
    end: { circles: [[32, 'thick'], [31, 'thick'], [15, 'thick'], [12, 'thick']], boltCircle: { radius: 26, holeRadius: 2, count: 3, startAngle: -90 } },
  },
  r01: {
    type: 'milled',
    W: 160,
    D: 70,
    H: 8,
    pockets: [0, 1, 2, 3, 4, 5].flatMap((i) => [
      { x: 8 + i * 25, y: 9, w: 18, d: 22, depth: 5, r: 2 },
      { x: 8 + i * 25, y: 39, w: 18, d: 22, depth: 5, r: 2 },
    ]),
    holes: [{ x: 3.5, y: 3.5, d: 3.5 }, { x: 156.5, y: 3.5, d: 3.5 }, { x: 3.5, y: 66.5, d: 3.5 }, { x: 156.5, y: 66.5, d: 3.5 }],
  },
  r02: {
    type: 'milled',
    W: 90,
    D: 45,
    H: 8,
    pockets: [{ x: 12, y: 8, w: 16, d: 12, depth: 5, r: 2 }, { x: 34, y: 8, w: 16, d: 12, depth: 5, r: 2 }, { x: 12, y: 25, w: 16, d: 12, depth: 5, r: 2 }, { x: 34, y: 25, w: 16, d: 12, depth: 3, r: 2 }],
    holes: [
      ...[0, 1, 2, 3, 4, 5].map((i) => ({ x: 62 + i * 4, y: 12, d: 2 })),
      { x: 5, y: 5, d: 3.5 }, { x: 85, y: 5, d: 3.5 }, { x: 5, y: 40, d: 3.5 }, { x: 85, y: 40, d: 3.5 },
    ],
  },
  r03: {
    type: 'turned',
    L: 70,
    outer: [[0, 0], [0, 8.4], [0.6, 9], [38, 9], [38, 10], [44, 10], [44, 7], [46, 7], [46, 7.5], [69.4, 7.5], [70, 6.9], [70, 0]],
    inner: [[0, 4.6], [0.6, 4], [14, 4], [15.5, 0], [70, 0]],
    end: { circles: [[10, 'thick'], [9, 'thick'], [4.6, 'thick'], [4, 'thick']] },
  },
  r04: {
    type: 'turned',
    L: 17,
    outer: [[0, 0], [0, 8.5], [0.5, 9], [8, 9], [8, 13.5], [10, 14], [10.5, 14], [12.5, 10.5], [14.5, 14], [15, 14], [17, 13.5], [17, 0]],
    inner: [[0, 4.5], [17, 4.5]],
    end: { circles: [[14, 'thick'], [9, 'thick'], [4.5, 'thick']] },
  },
  r05: {
    type: 'turned',
    L: 150,
    outer: [[0, 0], [0, 4.6], [0.4, 5], [4, 5], [4, 4.2], [5.5, 4.2], [5.5, 5], [143, 5], [143, 8], [149.5, 8], [150, 7.5], [150, 0]],
    end: { circles: [[8, 'thick'], [7.5, 'thick'], [5, 'thick']] },
  },
  r06: {
    type: 'milled',
    W: 50,
    D: 32,
    H: 26,
    holes: [{ x: 14, y: 16, d: 14 }, { x: 38, y: 16, d: 6 }],
  },
  r07: {
    type: 'milled',
    W: 130,
    D: 20,
    H: 18,
    holes: [{ x: 8, y: 10, d: 6 }, { x: 122, y: 10, d: 6 }, { x: 65, y: 10, d: 4, depth: 10 }],
  },
  r08: {
    type: 'turned',
    L: 44,
    outer: [[0, 0], [0, 9], [0.6, 9.5], [8, 9.5], [8, 6], [26, 6], [26, 4.5], [26.5, 4.5], [27, 5], [43.4, 5], [44, 4.4], [44, 0]],
    threads: [{ x0: 27, x1: 43.4, rMaj: 5, rMin: 4.2, pitch: 1.25 }],
    end: { circles: [[9.5, 'thick'], [9, 'thick'], [6, 'thick']] },
  },
  r09: {
    type: 'turned',
    L: 26,
    outer: [[0, 0], [0, 29], [1, 30], [20, 30], [20, 14], [25.5, 14], [26, 13.5], [26, 0]],
    inner: [[0, 6], [26, 6]],
    end: { circles: [[30, 'thick'], [29, 'thick'], [14, 'thick'], [6, 'thick']], boltCircle: { radius: 21, holeRadius: 4, count: 4, startAngle: 45 } },
  },
  r10: {
    type: 'turned',
    L: 22,
    outer: [[0, 0], [0, 5.5], [0.5, 6], [3, 6], [3, 3.5], [10, 3.5], [10, 3], [21.6, 3], [22, 2.6], [22, 0]],
    threads: [{ x0: 10, x1: 21.6, rMaj: 3, rMin: 2.5, pitch: 0.7 }],
    end: { circles: [[6, 'thick'], [5.5, 'thick'], [3.5, 'thick']] },
  },
  r11: {
    type: 'turned',
    L: 55,
    outer: [[0, 0], [0, 17.5], [0.8, 18.3], [16, 18.3], [16, 16], [18, 15], [54.2, 15], [55, 14.2], [55, 0]],
    inner: [[0, 13.6], [55, 13.6]],
    threads: [{ x0: 0.8, x1: 16, rMaj: 18.3, rMin: 17.4, pitch: 1.5 }],
    end: { circles: [[18.3, 'thick'], [15, 'thick'], [13.6, 'thick']] },
  },
  r12: {
    type: 'turned',
    L: 34,
    outer: [[0, 0], [0, 6.5], [0.5, 7], [6, 7], [6, 4.5], [16, 4.5], [16, 3.5], [33.6, 3.5], [34, 3.1], [34, 0]],
    threads: [{ x0: 16, x1: 33.6, rMaj: 3.5, rMin: 2.9, pitch: 1 }],
    end: { circles: [[7, 'thick'], [6.5, 'thick'], [4.5, 'thick']] },
  },
  r13: {
    type: 'milled',
    W: 40,
    D: 36,
    H: 32,
    holes: [{ x: 20, y: 18, d: 16 }, { x: 6, y: 6, d: 4 }, { x: 34, y: 30, d: 4, depth: 12 }],
  },
  r14: {
    type: 'milled',
    W: 80,
    D: 70,
    H: 14,
    pockets: [7, 19.5, 32, 44.5, 57, 69.5].map((x) => ({ x, y: 4, w: 6, d: 62, depth: 7, r: 1 })),
    holes: [{ x: 16.25, y: 35, d: 3.5 }, { x: 53.75, y: 35, d: 3.5 }],
  },
  r15: {
    type: 'milled',
    W: 56,
    D: 48,
    H: 44,
    pockets: [{ x: 4, y: 28, w: 48, d: 16, depth: 30, r: 1 }],
    holes: [{ x: 16, y: 14, d: 8, depth: 20 }, { x: 40, y: 14, d: 8, depth: 20 }],
  },
  r16: {
    type: 'turned',
    L: 26,
    hex: { x0: 7, x1: 26, R: 13 },
    outer: [[0, 0], [0, 10.4], [0.6, 11], [6, 11], [7, 11], [7, 13], [25, 13], [26, 12], [26, 0]],
    inner: [[0, 9], [1, 8], [26, 8]],
    end: { circles: [[11, 'thick'], [9, 'thin'], [8, 'thick']], hex: 13 },
  },
  r17: {
    type: 'turned',
    L: 14,
    outer: [[0, 0], [0, 31.5], [0.5, 32], [6, 32], [6, 16], [13.5, 16], [14, 15.5], [14, 0]],
    inner: [[0, 11.5], [0.5, 11], [14, 11]],
    end: { circles: [[32, 'thick'], [31.5, 'thick'], [16, 'thick'], [11, 'thick']], boltCircle: { radius: 24, holeRadius: 2.6, count: 8, startAngle: 22.5 } },
  },
  r18: {
    type: 'turned',
    L: 24,
    outer: [[0, 0], [0, 9.4], [0.6, 10], [10, 10], [10, 12.5], [23.4, 12.5], [24, 11.9], [24, 0]],
    inner: [[0, 5.5], [24, 5.5]],
    end: { circles: [[12.5, 'thick'], [10, 'thick'], [5.5, 'thick']] },
  },
  r19: {
    type: 'turned',
    L: 130,
    outer: [[0, 0], [0, 5.6], [0.4, 6], [46, 6], [46, 5.5], [48, 5.5], [48, 6], [124, 6], [124, 8.5], [129.5, 8.5], [130, 8], [130, 0]],
    end: { circles: [[8.5, 'thick'], [8, 'thick'], [6, 'thick']] },
  },
  r20: {
    type: 'turned',
    L: 26,
    outer: [[0, 0], [0, 12.4], [0.6, 13], [25.4, 13], [26, 12.4], [26, 0]],
    inner: [[0, 5.6], [0.6, 5], [26, 5]],
    end: { circles: [[13, 'thick'], [12.4, 'thick'], [5.6, 'thick'], [5, 'thick']] },
  },
} as const satisfies Record<string, PartGeometry>;

export type PartKind = keyof typeof PARTS;

export const PART_GEOMETRY: Readonly<Record<PartKind, PartGeometry>> = PARTS;
