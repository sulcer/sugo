/** SVG path builders. Every coordinate is rounded to 0.01 so output is stable and compact. */

export type Point = readonly [number, number];

export const round2 = (n: number) => Math.round(n * 100) / 100;

export const polyline = (points: readonly Point[], close = false) =>
  'M' + points.map(([x, y]) => `${round2(x)} ${round2(y)}`).join(' L') + (close ? ' Z' : '');

export const line = (x1: number, y1: number, x2: number, y2: number) =>
  `M${round2(x1)} ${round2(y1)} L${round2(x2)} ${round2(y2)}`;

export const circle = (cx: number, cy: number, r: number) => {
  const [right, left, y, radius] = [round2(cx + r), round2(cx - r), round2(cy), round2(r)];
  return `M${right} ${y} A${radius} ${radius} 0 1 1 ${left} ${y} A${radius} ${radius} 0 1 1 ${right} ${y}`;
};

export const roundedRect = (x: number, y: number, w: number, h: number, radius = 0) => {
  const r = Math.min(radius, w / 2, h / 2);
  if (!r)
    return polyline(
      [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
      ],
      true,
    );
  const R = round2(r);
  const arc = (ex: number, ey: number) => `A${R} ${R} 0 0 1 ${round2(ex)} ${round2(ey)}`;
  return (
    `M${round2(x + r)} ${round2(y)} H${round2(x + w - r)} ${arc(x + w, y + r)} ` +
    `V${round2(y + h - r)} ${arc(x + w - r, y + h)} H${round2(x + r)} ${arc(x, y + h - r)} ` +
    `V${round2(y + r)} ${arc(x + r, y)} Z`
  );
};

export const rect = (x: number, y: number, w: number, h: number) => roundedRect(x, y, w, h, 0);

/** Liang–Barsky: the part of segment (x1,y1)–(x2,y2) inside the box, or null. */
export function clipSegment(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  xMin: number,
  yMin: number,
  xMax: number,
  yMax: number,
): [number, number, number, number] | null {
  let t0 = 0;
  let t1 = 1;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const p = [-dx, dx, -dy, dy];
  const q = [x1 - xMin, xMax - x1, y1 - yMin, yMax - y1];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return null;
      continue;
    }
    const r = q[i] / p[i];
    if (p[i] < 0) {
      if (r > t1) return null;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return null;
      if (r < t1) t1 = r;
    }
  }
  return [x1 + t0 * dx, y1 + t0 * dy, x1 + t1 * dx, y1 + t1 * dy];
}
