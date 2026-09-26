import { Group } from 'three';
import { PARTS_FLOOR } from '@/drawing/geometry/parts-floor';
import { PART_GEOMETRY } from '@/drawing/geometry/parts-table';
import { toneOf } from '@/content/parts';
import { createMaterials, disposeMaterials, type PartMaterials, type Tone } from './materials';
import { buildMilledMesh } from './milled-mesh';
import { buildTurnedMesh } from './turned-mesh';

export type FloorItem = {
  /** Placed where the part lies on the floor drawing. */
  holder: Group;
  tilt: Group;
  /** Turns end views towards the camera. */
  orient: Group;
  spin: Group;
  axis: 'x' | 'z';
  tiltTo: { x: number; y: number };
  phase: number;
};

const END_VIEW_TILT = { x: 0.55, y: 0 };
const SIDE_VIEW_TILT = { x: 0, y: 0.5 };
const MILLED_TILT = { x: -0.85, y: 0 };

/** The ten floor parts as models, each lying exactly on its drawing until the tilt starts. */
export function buildFloorItems() {
  const materials = new Map<Tone, PartMaterials>();
  const materialsFor = (tone: Tone) =>
    materials.get(tone) ?? materials.set(tone, createMaterials(tone)).get(tone)!;

  const items = PARTS_FLOOR.items.map(({ view, x, y, rotation, kind }, i): FloorItem => {
    const part = PART_GEOMETRY[kind];
    const holder = new Group();
    const tilt = new Group();
    const orient = new Group();
    const spin = new Group();
    holder.add(tilt);
    tilt.add(orient);
    orient.add(spin);
    holder.position.set(x, -y, 0);
    holder.rotation.z = (-rotation * Math.PI) / 180;
    const item = { holder, tilt, orient, spin, phase: i * 0.9 };

    if (part.type === 'milled') {
      const model = buildMilledMesh(part, materialsFor(toneOf(kind)));
      model.position.set(-part.W / 2, part.D / 2, part.H / 2);
      spin.add(model);
      return { ...item, axis: 'z', tiltTo: MILLED_TILT };
    }
    const model = buildTurnedMesh(part, false, materialsFor(toneOf(kind)));
    model.position.x = -part.L / 2;
    spin.add(model);
    if (view === 'e') orient.rotation.y = Math.PI / 2;
    return { ...item, axis: 'x', tiltTo: view === 'e' ? END_VIEW_TILT : SIDE_VIEW_TILT };
  });

  return { items, dispose: () => materials.forEach(disposeMaterials) };
}

/**
 * `progress` 0 → 1 tilts every model in; `angle` then turns them, round parts also yawing slowly,
 * each offset by its phase.
 */
export function poseFloorItems(items: FloorItem[], progress: number, angle: number) {
  items.forEach((item) => {
    const yaw = item.axis === 'x' && progress >= 1 ? angle * 0.6 : 0;
    item.tilt.rotation.set(item.tiltTo.x * progress, item.tiltTo.y * progress + yaw, 0, 'YXZ');
    item.spin.rotation[item.axis] = progress >= 1 ? angle * 1.4 + item.phase : 0;
  });
}
