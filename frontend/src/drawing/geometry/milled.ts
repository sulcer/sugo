import { createLayer, type Drawing, type DrawingLayer, type ViewBox } from './layer';
import type { MilledPart } from './parts-table';
import { circle, line, polyline, rect, roundedRect } from './path';

type Box = { x0: number; x1: number; y0: number; y1: number };

const EPSILON = 1e-6;
/** Samples per edge for hidden-line removal in the section. */
const EDGE_SAMPLES = 300;

export function milledGeometry(part: MilledPart) {
  const gap = Math.max(part.H * 0.9, part.D * 0.3, 12);
  const pad = Math.max(part.W, part.D) * 0.09;
  const viewBox: ViewBox = [
    -pad,
    -pad - gap * 0.2,
    part.W + 2 * pad,
    part.H + gap + part.D + 2 * pad + gap * 0.2,
  ];
  return { gap, pad, planOffset: part.H + gap, viewBox };
}

/**
 * A milled part in first-angle projection: section A–A on top (hatched, pockets and holes cut
 * open), plan view below with the section plane marked.
 */
export function drawMilled(part: MilledPart, k: number, withSectionMarks = true): Drawing {
  const g = milledGeometry(part);
  const { W, H } = part;
  const cutY = part.cut ?? part.D / 2;
  const section = createLayer(k, 'b');
  const plan = createLayer(k, 'a');

  const openings = sectionOpenings(part, cutY);
  section.hatch.push(
    rect(0, 0, W, H) + ' ' + openings.map((r) => rect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0)).join(' '),
  );
  const pushVisibleEdges = (box: Box, others: Box[], isOpening: boolean) =>
    boxEdges(box).forEach(([x1, y1, x2, y2, horizontal]) =>
      visibleSegments(x1, y1, x2, y2, others, horizontal, isOpening, H).forEach((segment) =>
        section.thick.push(line(...segment)),
      ),
    );
  pushVisibleEdges({ x0: 0, y0: 0, x1: W, y1: H }, openings, false);
  openings.forEach((box, i) =>
    pushVisibleEdges(
      box,
      openings.filter((_, j) => j !== i),
      true,
    ),
  );
  const holes = part.holes ?? [];
  const centreOverhang = Math.min(4, H * 0.25);
  holes
    .filter((h) => Math.abs(h.y - cutY) < h.d / 2)
    .forEach((h) => section.centre.push(line(h.x, -centreOverhang, h.x, H + centreOverhang)));
  section.texts.push({ x: W / 2, y: -g.gap * 0.28, size: 11, text: 'A–A', anchor: 'middle' });

  drawPlan(plan, part, g.planOffset);
  if (withSectionMarks) drawSectionPlane(plan, W, g.planOffset + cutY, g.pad, k);

  return {
    layers: [section, plan],
    viewBox: g.viewBox,
    planOffset: g.planOffset,
    region: [
      g.viewBox[0],
      g.viewBox[0] + g.viewBox[2],
      g.planOffset - g.gap * 0.45,
      g.viewBox[1] + g.viewBox[3],
    ],
  };
}

/** Where the section plane cuts pockets and holes: rectangles of removed material in the section. */
function sectionOpenings(part: MilledPart, cutY: number): Box[] {
  const pockets = part.pockets ?? [];
  const openings: Box[] = [];
  pockets.forEach((q) => {
    if (cutY < q.y || cutY > q.y + q.d) return;
    const r = q.r || 0;
    let x0 = q.x;
    let x1 = q.x + q.w;
    const dy = Math.min(cutY - q.y, q.y + q.d - cutY);
    if (dy < r) {
      const inset = r - Math.sqrt(r * r - (r - dy) * (r - dy));
      x0 += inset;
      x1 -= inset;
    }
    openings.push({ x0, x1, y0: 0, y1: q.depth });
  });
  (part.holes ?? []).forEach((h) => {
    const dy = Math.abs(cutY - h.y);
    const r = h.d / 2;
    if (dy >= r) return;
    const halfChord = Math.sqrt(r * r - dy * dy);
    let top = 0;
    pockets.forEach((q) => {
      if (h.x > q.x && h.x < q.x + q.w && h.y > q.y && h.y < q.y + q.d) top = Math.max(top, q.depth);
    });
    if (top < part.H)
      openings.push({ x0: h.x - halfChord, x1: h.x + halfChord, y0: top, y1: h.depth ?? part.H });
  });
  return openings;
}

function boxEdges(box: Box): [number, number, number, number, boolean][] {
  return [
    [box.x0, box.y0, box.x1, box.y0, true],
    [box.x0, box.y1, box.x1, box.y1, true],
    [box.x0, box.y0, box.x0, box.y1, false],
    [box.x1, box.y0, box.x1, box.y1, false],
  ];
}

/**
 * Parts of an edge not buried inside another opening, found by sampling. Horizontal edges of an
 * opening lying on the top or bottom face are dropped: there the material is open, not an edge.
 */
function visibleSegments(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  others: Box[],
  horizontal: boolean,
  isOpening: boolean,
  height: number,
): [number, number, number, number][] {
  const segments: [number, number, number, number][] = [];
  let start: number | null = null;
  for (let i = 0; i <= EDGE_SAMPLES; i++) {
    const t = (i + 0.5) / EDGE_SAMPLES;
    const px = x1 + (x2 - x1) * t;
    const py = y1 + (y2 - y1) * t;
    let hidden =
      i === EDGE_SAMPLES ||
      others.some((R) =>
        horizontal
          ? px > R.x0 + EPSILON && px < R.x1 - EPSILON && py >= R.y0 - EPSILON && py <= R.y1 + EPSILON
          : px >= R.x0 - EPSILON && px <= R.x1 + EPSILON && py > R.y0 + EPSILON && py < R.y1 - EPSILON,
      );
    if (isOpening && horizontal && (Math.abs(py) < EPSILON || Math.abs(py - height) < EPSILON)) hidden = true;
    if (!hidden && start === null) start = i / EDGE_SAMPLES;
    if (hidden && start !== null) {
      const end = Math.min(i / EDGE_SAMPLES, 1);
      segments.push([
        x1 + (x2 - x1) * start,
        y1 + (y2 - y1) * start,
        x1 + (x2 - x1) * end,
        y1 + (y2 - y1) * end,
      ]);
      start = null;
    }
  }
  return segments;
}

function drawPlan(plan: DrawingLayer, part: MilledPart, offset: number) {
  plan.thick.push(rect(0, offset, part.W, part.D));
  (part.pockets ?? []).forEach((q) => plan.thick.push(roundedRect(q.x, offset + q.y, q.w, q.d, q.r)));
  (part.holes ?? []).forEach((h) => {
    plan.thick.push(circle(h.x, offset + h.y, h.d / 2));
    const reach = h.d / 2 + Math.min(3, h.d * 0.4);
    plan.centre.push(line(h.x - reach, offset + h.y, h.x + reach, offset + h.y));
    plan.centre.push(line(h.x, offset + h.y - reach, h.x, offset + h.y + reach));
  });
}

/** Section plane A–A across the plan: chain line, thick ends, view arrows and letters. */
function drawSectionPlane(plan: DrawingLayer, width: number, y: number, pad: number, k: number) {
  const overhang = pad * 0.55;
  const arrow = Math.min(8 * k, pad * 0.5);
  plan.centre.push(line(-overhang, y, width + overhang, y));
  [-overhang, width + overhang].forEach((x, i) => {
    const toward = i ? -1 : 1;
    plan.thick.push(line(x, y, x + toward * arrow * 0.9, y));
    const ax = x + toward * arrow * 0.45;
    plan.thin.push(line(ax, y, ax, y - arrow * 1.3));
    plan.fills.push(
      polyline(
        [
          [ax, y - arrow * 1.6],
          [ax - arrow * 0.22, y - arrow * 1.05],
          [ax + arrow * 0.22, y - arrow * 1.05],
        ],
        true,
      ),
    );
    plan.texts.push({
      x: ax + toward * arrow * 0.6,
      y: y - arrow * 0.7,
      size: 11,
      text: 'A',
      anchor: i ? 'end' : 'start',
    });
  });
}
