import { BufferAttribute, BufferGeometry, DoubleSide, Mesh, MeshStandardMaterial } from 'three';
import type { Stock } from './stock';

const SEGMENTS = 80;

/**
 * The bar being machined: the outer profile (along the axis) and the bore (back again) revolved
 * into one closed surface, rewritten in place every frame as the stock is cut.
 */
export function createStockMesh(stock: Stock) {
  const samples = stock.xs.length;
  const loop = 2 * samples;
  const vertices = loop * (SEGMENTS + 1);
  const positions = new Float32Array(vertices * 3);
  const normals = new Float32Array(vertices * 3);
  const index: number[] = [];
  for (let j = 0; j < loop; j++) {
    const next = (j + 1) % loop;
    for (let m = 0; m < SEGMENTS; m++) {
      const a = j * (SEGMENTS + 1) + m;
      const b = next * (SEGMENTS + 1) + m;
      index.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new BufferAttribute(normals, 3));
  geometry.setIndex(index);
  const material = new MeshStandardMaterial({
    color: 0xc4c7ca,
    metalness: 0.88,
    roughness: 0.34,
    side: DoubleSide,
  });
  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;

  const cos = Array.from({ length: SEGMENTS + 1 }, (_, m) => Math.cos((m / SEGMENTS) * Math.PI * 2));
  const sin = Array.from({ length: SEGMENTS + 1 }, (_, m) => Math.sin((m / SEGMENTS) * Math.PI * 2));
  const loopX = new Float32Array(loop);
  const loopR = new Float32Array(loop);

  const update = () => {
    for (let j = 0; j < samples; j++) {
      loopX[j] = stock.xs[j];
      loopR[j] = stock.outer[j];
      const back = loop - 1 - j;
      loopX[back] = stock.xs[j];
      loopR[back] = Math.min(stock.inner[j], stock.outer[j]);
    }
    for (let j = 0; j < loop; j++) {
      const before = (j + loop - 1) % loop;
      const after = (j + 1) % loop;
      let tx = loopX[after] - loopX[before];
      let tr = loopR[after] - loopR[before];
      const length = Math.hypot(tx, tr) || 1;
      tx /= length;
      tr /= length;
      const [nx, nr, x, r] = [-tr, tx, loopX[j], loopR[j]];
      for (let m = 0; m <= SEGMENTS; m++) {
        const o = (j * (SEGMENTS + 1) + m) * 3;
        positions[o] = x;
        positions[o + 1] = r * cos[m];
        positions[o + 2] = r * sin[m];
        normals[o] = nx;
        normals[o + 1] = nr * cos[m];
        normals[o + 2] = nr * sin[m];
      }
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.normal.needsUpdate = true;
  };
  update();

  return {
    mesh,
    update,
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}
