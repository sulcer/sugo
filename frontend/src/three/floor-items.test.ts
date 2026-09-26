import { Mesh, MeshStandardMaterial } from 'three';
import { expect, it } from 'vitest';
import { buildFloorItems, poseFloorItems } from './floor-items';

const round = (n: number) => Math.round(n * 1000) / 1000;

it('builds one model per part on the floor', () => {
  expect(buildFloorItems().items).toHaveLength(10);
});

it('places each model where its drawing lies, with y pointing up', () => {
  const [hub] = buildFloorItems().items;
  expect([hub.holder.position.x, hub.holder.position.y]).toEqual([46, -58]);
});

it('turns round parts drawn end-on to face the camera', () => {
  const [hub, shaft] = buildFloorItems().items;
  expect([round(hub.orient.rotation.y), round(shaft.orient.rotation.y)]).toEqual([round(Math.PI / 2), 0]);
});

it('keeps every model flat on the drawing before the tilt starts', () => {
  const { items } = buildFloorItems();
  poseFloorItems(items, 0, 0);
  const angles = items.flatMap((item) => [item.tilt.rotation.x, item.tilt.rotation.y, item.spin.rotation[item.axis]]);
  expect(angles.filter((angle) => angle !== 0)).toEqual([]);
});

it('tilts end views, side views and milled parts to their own angles', () => {
  const { items } = buildFloorItems();
  poseFloorItems(items, 1, 0);
  expect(
    [items[0], items[1], items[5]].map((item) => [round(item.tilt.rotation.x), round(item.tilt.rotation.y)]),
  ).toEqual([
    [0.55, 0],
    [0, 0.5],
    [-0.85, 0],
  ]);
});

it('spins each model with its own phase so they never turn in step', () => {
  const { items } = buildFloorItems();
  poseFloorItems(items, 1, 0);
  expect(items.slice(0, 3).map((item) => round(item.spin.rotation[item.axis]))).toEqual([0, 0.9, 1.8]);
});

it('gives the brass nut its brass finish', () => {
  const nut = buildFloorItems().items[4];
  let colour = 0;
  nut.spin.traverse((object) => {
    if (object instanceof Mesh && object.material instanceof MeshStandardMaterial)
      colour ||= object.material.color.getHex();
  });
  expect(colour).toBe(0xc8a45e);
});
