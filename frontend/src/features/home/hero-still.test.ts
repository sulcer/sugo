// @vitest-environment node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import still from './hero-still.json';
import { sha256, sources } from './hero-still.sources.json';

const frontend = new URL('../../../', import.meta.url);

it('was rendered from the current part, materials, camera and three.js (if not: npm run hero-still)', () => {
  const hash = createHash('sha256');
  for (const source of sources) hash.update(readFileSync(new URL(source, frontend)));
  expect(hash.digest('hex')).toBe(sha256);
});

it('has an image for every width it offers', () => {
  expect(
    still.widths.filter((width) => !existsSync(new URL(`public/hero/flange-${width}.webp`, frontend))),
  ).toEqual([]);
});
