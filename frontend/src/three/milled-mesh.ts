import { BufferGeometry, ExtrudeGeometry, Group, LineSegments, Mesh, Path, Shape, Vector3 } from 'three';
import type { MilledPart, Pocket } from '@/drawing/geometry/parts-table';
import type { PartMaterials } from './materials';

/** Rounded pocket outline in the block's plan coordinates (y down in the drawing, up in 3D). */
function pocketPath(pocket: Pocket, into: Path = new Path()) {
  const { x, y, w, d } = pocket;
  const r = Math.min(pocket.r || 0.001, w / 2, d / 2);
  const [x0, x1, y0, y1] = [x, x + w, -y, -(y + d)];
  into.moveTo(x0 + r, y0);
  into.lineTo(x1 - r, y0);
  into.absarc(x1 - r, y0 - r, r, Math.PI / 2, 0, true);
  into.lineTo(x1, y1 + r);
  into.absarc(x1 - r, y1 + r, r, 0, -Math.PI / 2, true);
  into.lineTo(x0 + r, y1);
  into.absarc(x0 + r, y1 + r, r, -Math.PI / 2, -Math.PI, true);
  into.lineTo(x0, y0 - r);
  into.absarc(x0 + r, y0 - r, r, Math.PI, Math.PI / 2, true);
  return into;
}

/**
 * A milled block as stacked slabs, one per depth level, each with the pockets and holes that
 * reach below it cut out; plus edge lines for the outline, pocket rims and hole rims.
 */
export function buildMilledMesh(part: MilledPart, materials: PartMaterials): Group {
  const group = new Group();
  const { W, D, H } = part;
  const pockets = part.pockets ?? [];
  const holes = part.holes ?? [];
  const insidePocket = (x: number, y: number, pocket: Pocket) =>
    x > pocket.x && x < pocket.x + pocket.w && y > pocket.y && y < pocket.y + pocket.d;

  const levels = [...new Set([0, H, ...pockets.map((q) => q.depth), ...holes.map((h) => h.depth ?? H)])]
    .filter((depth) => depth <= H)
    .sort((a, b) => a - b);

  for (let i = 0; i < levels.length - 1; i++) {
    const [top, bottom] = [levels[i], levels[i + 1]];
    const slab = new Shape();
    slab.moveTo(0, 0);
    slab.lineTo(W, 0);
    slab.lineTo(W, -D);
    slab.lineTo(0, -D);
    slab.lineTo(0, 0);
    pockets.forEach((pocket) => {
      if (pocket.depth > top + 1e-6) slab.holes.push(pocketPath(pocket));
    });
    holes.forEach((hole) => {
      const reaches = (hole.depth ?? H) > top + 1e-6;
      const inCutPocket = pockets.some(
        (pocket) => pocket.depth > top + 1e-6 && insidePocket(hole.x, hole.y, pocket),
      );
      if (!reaches || inCutPocket) return;
      const circle = new Path();
      circle.absarc(hole.x, -hole.y, hole.d / 2, 0, Math.PI * 2, true);
      slab.holes.push(circle);
    });
    const mesh = new Mesh(
      new ExtrudeGeometry(slab, { depth: bottom - top, bevelEnabled: false, curveSegments: 24 }),
      materials.metal,
    );
    mesh.position.z = -bottom;
    group.add(mesh);
  }

  const points: Vector3[] = [];
  const segment = (a: [number, number, number], b: [number, number, number]) =>
    points.push(new Vector3(...a), new Vector3(...b));
  const corners: [number, number][] = [
    [0, 0],
    [W, 0],
    [W, -D],
    [0, -D],
  ];
  corners.forEach(([ax, ay], i) => {
    const [bx, by] = corners[(i + 1) % 4];
    segment([ax, ay, 0], [bx, by, 0]);
    segment([ax, ay, -H], [bx, by, -H]);
    segment([ax, ay, 0], [ax, ay, -H]);
  });
  const rim = (path: Path, z: number) => {
    const samples = path.getSpacedPoints(96);
    for (let i = 0; i < samples.length - 1; i++)
      segment([samples[i].x, samples[i].y, z], [samples[i + 1].x, samples[i + 1].y, z]);
  };
  pockets.forEach((pocket) => {
    const outline = pocketPath(pocket);
    rim(outline, 0);
    rim(outline, -pocket.depth);
  });
  holes.forEach((hole) => {
    const circle = new Path();
    circle.absarc(hole.x, -hole.y, hole.d / 2, 0, Math.PI * 2, false);
    const top = Math.max(
      0,
      ...pockets.filter((pocket) => insidePocket(hole.x, hole.y, pocket)).map((pocket) => pocket.depth),
    );
    rim(circle, -top);
    rim(circle, -(hole.depth ?? H));
  });
  group.add(new LineSegments(new BufferGeometry().setFromPoints(points), materials.edge));
  return group;
}
