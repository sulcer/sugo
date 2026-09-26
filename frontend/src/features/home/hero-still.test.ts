import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import manifest from './hero-still.json';

it('was rendered from the current part, materials and camera (if not: npm run hero-still)', () => {
  const hash = createHash('sha256');
  for (const source of manifest.sources) hash.update(readFileSync(source));
  expect(hash.digest('hex')).toBe(manifest.sha256);
});

it('has an image for every width it offers', () => {
  expect(manifest.widths.filter((width) => !existsSync(`public/hero/flange-${width}.webp`))).toEqual([]);
});
