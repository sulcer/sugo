/**
 * A drawing is a stack of layers; each layer is one orthographic view.
 * `k` is viewBox units per screen pixel: every line weight, dash, hatch pitch
 * and text size is multiplied by it so the drawing reads the same at any size.
 */

export type ViewBox = readonly [x: number, y: number, width: number, height: number];

/** 'a' = main view (section / plan), 'b' = secondary view (end view / section A–A). */
export type ViewId = 'a' | 'b' | '';

export type DrawingText = {
  x: number;
  y: number;
  size: number;
  text: string;
  anchor: 'start' | 'middle' | 'end';
  accent?: boolean;
  muted?: boolean;
};

export type DrawingLayer = {
  k: number;
  view: ViewId;
  /** Visible edges, 1.5 px. */
  thick: string[];
  /** Thread cores, knurls, outlines of machines, 0.7 px. */
  thin: string[];
  /** Dash-dot centre lines. */
  centre: string[];
  /** Closed regions filled with 45° section hatching. */
  hatch: string[];
  /** Machine work envelope (accent, 1.8 px) and its dimensioning (0.8 px + arrowheads). */
  envelope: string[];
  envelopeThin: string[];
  envelopeFill: string[];
  texts: DrawingText[];
  /** Solid ink fills (section arrows, north arrow). */
  fills: string[];
  /** Map roads: drawn as a wide ink stroke with a paper core. */
  roads: string[];
};

export type Drawing = {
  layers: DrawingLayer[];
  viewBox: ViewBox;
  /** Area of the main view, used to fit the 3D model over it. */
  region?: readonly [x0: number, x1: number, y0: number, y1: number];
  /** Vertical offset of a milled part's plan view below its section. */
  planOffset?: number;
};

export const createLayer = (k: number, view: ViewId = ''): DrawingLayer => ({
  k,
  view,
  thick: [],
  thin: [],
  centre: [],
  hatch: [],
  envelope: [],
  envelopeThin: [],
  envelopeFill: [],
  texts: [],
  fills: [],
  roads: [],
});
