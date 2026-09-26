import {
  CylinderGeometry,
  EdgesGeometry,
  Group,
  LatheGeometry,
  LineSegments,
  Mesh,
  Shape,
  ShapeGeometry,
  Vector2,
} from 'three';
import type { TurnedPart } from '@/drawing/geometry/parts-table';
import type { Point } from '@/drawing/geometry/path';
import type { PartMaterials } from './materials';

/** The outer profile with each thread cut in as a zig-zag between its minor and major radius. */
export function threadedProfile(part: TurnedPart): [number, number][] {
  const profile = part.outer.map(([x, r]): [number, number] => [x, r]);
  part.threads?.forEach((thread) => {
    const start = profile.findIndex(
      ([x, r], j) =>
        j < profile.length - 1 &&
        Math.abs(x - thread.x0) < 1e-6 &&
        Math.abs(r - thread.rMaj) < 1e-6 &&
        Math.abs(profile[j + 1][0] - thread.x1) < 1e-6,
    );
    if (start < 0) return;
    const teeth: [number, number][] = [];
    const halfPitch = thread.pitch / 2;
    let low = true;
    for (let x = thread.x0 + halfPitch; x < thread.x1 - halfPitch * 0.5; x += halfPitch) {
      teeth.push([x, low ? thread.rMin : thread.rMaj]);
      low = !low;
    }
    profile.splice(start + 1, 0, ...teeth);
  });
  return profile;
}

/**
 * A turned part revolved from its profile, one lathe band per profile segment (so every shoulder
 * gets a crisp edge line). `cutAway` removes a quarter to show the half-section, capped in grey.
 * Built along y, then laid along x to match the drawing.
 */
export function buildTurnedMesh(part: TurnedPart, cutAway: boolean, materials: PartMaterials): Group {
  const group = new Group();
  const inner: readonly Point[] = part.inner ?? [
    [0, 0],
    [part.L, 0],
  ];
  const profile = threadedProfile(part);
  const loop = [...profile.slice(1, -1), ...[...inner].reverse()];
  const sweep = cutAway ? Math.PI * 1.5 : Math.PI * 2;

  for (let i = 0; i < loop.length; i++) {
    const a = loop[i];
    const c = loop[(i + 1) % loop.length];
    if (a[1] < 1e-6 && c[1] < 1e-6) continue;
    if (Math.abs(a[0] - c[0]) < 1e-9 && Math.abs(a[1] - c[1]) < 1e-9) continue;
    const onHex =
      part.hex &&
      i < profile.length - 3 &&
      Math.min(a[0], c[0]) >= part.hex.x0 - 1e-6 &&
      Math.max(a[0], c[0]) <= part.hex.x1 + 1e-6;
    const band = [new Vector2(a[1], a[0]), new Vector2(c[1], c[0])];
    const geometry = onHex
      ? new LatheGeometry(band, 6, Math.PI / 6, Math.PI * 2)
      : new LatheGeometry(band, 128, 0, sweep);
    if (onHex) geometry.computeVertexNormals();
    group.add(
      new Mesh(geometry, materials.metal),
      new LineSegments(new EdgesGeometry(geometry, 25), materials.edge),
    );
  }

  if (cutAway) {
    const section = new ShapeGeometry(new Shape(loop.map(([x, r]) => new Vector2(r, x))));
    const front = new Mesh(section, materials.cap);
    front.scale.x = -1;
    const side = new Mesh(section, materials.cap);
    side.rotation.y = -Math.PI / 2;
    const frontEdges = new LineSegments(new EdgesGeometry(section), materials.edge);
    frontEdges.scale.x = -1;
    const sideEdges = new LineSegments(new EdgesGeometry(section), materials.edge);
    sideEdges.rotation.y = -Math.PI / 2;
    group.add(front, side, frontEdges, sideEdges);
  } else if (part.end?.boltCircle) {
    const bolts = part.end.boltCircle;
    const thickness = part.flangeT ?? 4;
    for (let i = 0; i < bolts.count; i++) {
      const angle = ((bolts.startAngle + (i * 360) / bolts.count) * Math.PI) / 180;
      const geometry = new CylinderGeometry(bolts.holeRadius, bolts.holeRadius, thickness + 0.25, 32);
      const hole = new Mesh(geometry, materials.hole);
      hole.position.set(bolts.radius * Math.cos(angle), thickness / 2, bolts.radius * Math.sin(angle));
      const holeEdges = new LineSegments(new EdgesGeometry(geometry, 30), materials.edge);
      holeEdges.position.copy(hole.position);
      group.add(hole, holeEdges);
    }
  }

  group.rotation.z = -Math.PI / 2;
  return group;
}
