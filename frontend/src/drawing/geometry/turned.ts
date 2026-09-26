import { createLayer, type Drawing, type ViewBox } from './layer';
import type { TurnedPart } from './parts-table';
import { circle, clipSegment, line, polyline, type Point } from './path';

/** 'front' = half-section only; 'full' adds the end view to the right. */
export type PartViews = 'front' | 'full';

export function turnedGeometry(part: TurnedPart, views: PartViews) {
  const R = Math.max(...part.outer.map(([, r]) => r));
  const Re = part.end ? Math.max(part.end.hex ?? 0, ...part.end.circles.map(([r]) => r)) : 0;
  const pad = Math.max(R, part.L * 0.12) * 0.22;
  const end = views === 'full' ? part.end : undefined;
  const gap = Math.max(R * 0.5, 8);
  const cx = part.L + gap + Re;
  const H = Math.max(R, end ? Re : 0);
  const viewBox: ViewBox = [-pad, -H - pad, (end ? cx + Re : part.L) + 2 * pad, 2 * (H + pad)];
  return { R, Re, pad, end, cx, viewBox };
}

/**
 * A turned part as a machinist draws it: half-section above the axis (hatched, bores and thread
 * cores visible), outside view below, optionally with the end view beside it.
 */
export function drawTurned(part: TurnedPart, k: number, views: PartViews): Drawing {
  const g = turnedGeometry(part, views);
  const length = part.L;
  const outer = part.outer;
  const inner = part.inner ?? [
    [0, 0],
    [length, 0],
  ];
  const overhang = Math.min(12 * k, g.pad * 0.85);
  const section = createLayer(k, 'a');
  const aboveAxis = (points: readonly Point[]) => points.map(([x, r]): Point => [x, -r]);

  section.hatch.push(polyline([...aboveAxis(outer.slice(1, -1)), ...aboveAxis([...inner].reverse())], true));
  section.thick.push(
    polyline([[0, -inner[0][1]], ...aboveAxis(outer.slice(1, -1)), [length, -inner[inner.length - 1][1]]]),
  );
  for (let i = 0; i < inner.length - 1; i++) {
    const [a, c] = [inner[i], inner[i + 1]];
    if (a[1] > 0 || c[1] > 0) section.thick.push(line(a[0], -a[1], c[0], -c[1]));
  }
  section.thick.push(polyline(outer));

  // Shoulder edges. A plain object on purpose: integer-like keys iterate first, which fixes the
  // stroke order of the plotter animation to match the design.
  const shoulders: Record<string, number> = {};
  outer.slice(1, -1).forEach(([x, r]) => (shoulders[x] = Math.max(shoulders[x] || 0, r)));
  Object.keys(shoulders).forEach((x) => {
    if (+x > 0 && +x < length) section.thick.push(line(+x, 0, +x, shoulders[x]));
  });
  const boreSteps: Record<string, number> = {};
  inner.slice(1, -1).forEach(([x, r]) => {
    if (r > 0) boreSteps[x] = Math.max(boreSteps[x] || 0, r);
  });
  Object.keys(boreSteps).forEach((x) => section.thick.push(line(+x, 0, +x, -boreSteps[x])));

  part.threads?.forEach((t) => {
    section.thin.push(line(t.x0, t.rMin, t.x1, t.rMin));
    section.thin.push(line(t.x0, -t.rMin, t.x1, -t.rMin));
  });
  if (part.knurl) drawKnurl(section.thin, part.knurl, k);
  section.centre.push(line(-overhang, 0, length + overhang, 0));
  if (part.hex) {
    section.thin.push(line(part.hex.x0, -part.hex.R / 2, part.hex.x1, -part.hex.R / 2));
    section.thin.push(line(part.hex.x0, part.hex.R / 2, part.hex.x1, part.hex.R / 2));
  }

  const layers = [section];
  if (g.end) layers.push(drawEndView(g.end, g.cx, g.Re, overhang, k));

  const regionRight = g.end ? g.cx - g.Re - g.pad * 0.6 : g.viewBox[0] + g.viewBox[2];
  return {
    layers,
    viewBox: g.viewBox,
    region: [g.viewBox[0], regionRight, g.viewBox[1], g.viewBox[1] + g.viewBox[3]],
  };
}

/** Diamond knurl: two families of 30° lines clipped to the band, drawn in the outside view. */
function drawKnurl(out: string[], [x0, x1, r]: readonly [number, number, number], k: number) {
  const step = Math.max(6 * k, (x1 - x0) / 5);
  const slope = Math.tan(Math.PI / 6);
  for (let c = x0 - r; c < x1 + r; c += step) {
    [1, -1].forEach((sign) => {
      const clipped = clipSegment(c, r * 0.3, c + (sign * (r * 0.7)) / slope, r, x0, r * 0.3, x1, r);
      if (clipped) out.push(line(...clipped));
    });
  }
}

function drawEndView(
  end: NonNullable<TurnedPart['end']>,
  cx: number,
  Re: number,
  overhang: number,
  k: number,
) {
  const view = createLayer(k, 'b');
  end.circles.forEach(([r, weight]) => view[weight].push(circle(cx, 0, r)));
  if (end.hex) {
    const corners: Point[] = [];
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 6 + (i * Math.PI) / 3;
      corners.push([cx + end.hex * Math.sin(a), end.hex * Math.cos(a)]);
    }
    view.thick.push(polyline(corners, true));
  }
  view.centre.push(line(cx - Re - overhang, 0, cx + Re + overhang, 0));
  view.centre.push(line(cx, -Re - overhang, cx, Re + overhang));
  const bolts = end.boltCircle;
  if (bolts) {
    view.centre.push(circle(cx, 0, bolts.radius));
    for (let i = 0; i < bolts.count; i++) {
      const a = ((bolts.startAngle + (i * 360) / bolts.count) * Math.PI) / 180;
      const hx = cx + bolts.radius * Math.cos(a);
      const hy = bolts.radius * Math.sin(a);
      view.thick.push(circle(hx, hy, bolts.holeRadius));
      const q = bolts.holeRadius * 1.6;
      view.thin.push(
        line(hx - q * Math.cos(a), hy - q * Math.sin(a), hx + q * Math.cos(a), hy + q * Math.sin(a)),
      );
    }
  }
  return view;
}
