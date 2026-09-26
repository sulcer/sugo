import { Group, LineSegments, Mesh } from 'three';
import { expect, it } from 'vitest';
import { PART_GEOMETRY } from '@/drawing/geometry/parts-table';
import type { MilledPart, TurnedPart } from '@/drawing/geometry/parts-table';
import { createMaterials } from './materials';
import { buildMilledMesh } from './milled-mesh';
import { buildTurnedMesh, threadedProfile } from './turned-mesh';

const flange = PART_GEOMETRY.flange as TurnedPart;
const bolt = PART_GEOMETRY.r08 as TurnedPart;
const plate = PART_GEOMETRY.r14 as MilledPart;

const meshes = (group: Group) => group.children.filter((child): child is Mesh => child instanceof Mesh);
const edges = (group: Group) => group.children.filter((child) => child instanceof LineSegments);

it('cuts the thread into the profile as a zig-zag between minor and major radius', () => {
  const profile = threadedProfile(flange);
  const start = profile.findIndex(([x, r]) => x === 14.8 && r === 18);
  expect(profile.slice(start + 1, start + 4)).toEqual([
    [15.55, 16.9],
    [16.3, 18],
    [17.05, 16.9],
  ]);
});

it('leaves unthreaded profiles untouched', () => {
  const plain = PART_GEOMETRY.r20 as TurnedPart;
  expect(threadedProfile(plain)).toEqual(plain.outer.map(([x, r]) => [x, r]));
});

it('caps the cut-away model with two section faces', () => {
  const materials = createMaterials('metal');
  const group = buildTurnedMesh(bolt, true, materials);
  expect(meshes(group).filter((mesh) => mesh.material === materials.cap)).toHaveLength(2);
});

it('drills the bolt circle into the full flange model', () => {
  const materials = createMaterials('metal');
  const group = buildTurnedMesh(flange, false, materials);
  expect(meshes(group).filter((mesh) => mesh.material === materials.hole)).toHaveLength(3);
});

it('lays the turned model along the x axis like the drawing', () => {
  expect(buildTurnedMesh(bolt, false, createMaterials('metal')).rotation.z).toBeCloseTo(-Math.PI / 2);
});

it('builds a milled block from one slab per pocket depth level', () => {
  // r14: top face at 0, rib pockets 7 deep, block 14 high → two slabs.
  expect(meshes(buildMilledMesh(plate, createMaterials('metal')))).toHaveLength(2);
});

it('outlines the milled block with edge lines', () => {
  expect(edges(buildMilledMesh(plate, createMaterials('metal')))).toHaveLength(1);
});

it('uses the part tone for the metal', () => {
  expect(createMaterials('brass').metal.color.getHex()).toBe(0xc8a45e);
});
