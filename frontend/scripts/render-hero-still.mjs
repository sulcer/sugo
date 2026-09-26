// Renders the hero's finished part once, so narrow heroes and reduced motion show a prerendered image
// instead of building a WebGL scene on the visitor's device. Run `npm run hero-still` after changing
// anything the still is built from; a unit test fails until the images match their sources again.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { build } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const WIDTHS = [600, 1200];

const output = await build({
  configFile: false,
  root: ROOT,
  logLevel: 'warn',
  resolve: { alias: { '@': `${ROOT}src` } },
  build: {
    write: false,
    minify: false,
    lib: { entry: 'scripts/hero-still-entry.ts', formats: ['iife'], name: 'HeroStill' },
  },
});
const [
  {
    output: [bundle],
  },
] = Array.isArray(output) ? output : [output];
/** Every module the still is built from, three.js included; the drift test hashes them. */
const sources = bundle.moduleIds
  .filter((id) => !id.startsWith('\0'))
  .map((id) => relative(ROOT, id))
  .sort();

// Headless Chromium renders WebGL through SwiftShader.
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
await page.addScriptTag({ content: bundle.code });
const renders = [];
for (const width of WIDTHS) {
  renders.push(
    await page.evaluate(async (pixels) => {
      const image = new Image();
      image.src = window.HeroStill.renderHeroStill(pixels);
      await image.decode();
      const canvas = Object.assign(document.createElement('canvas'), {
        width: image.width,
        height: image.height,
      });
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      const alpha = context.getImageData(0, 0, image.width, image.height).data.filter((_, i) => i % 4 === 3);
      if (!alpha.some((value) => value > 0)) throw new Error(`the ${pixels} px still rendered empty`);
      return { width: pixels, height: image.height, webp: canvas.toDataURL('image/webp', 0.9) };
    }, width),
  );
}
await browser.close();

// Only a complete, non-empty set of renders replaces the published images.
await mkdir(`${ROOT}public/hero`, { recursive: true });
for (const { width, webp } of renders) {
  await writeFile(`${ROOT}public/hero/flange-${width}.webp`, Buffer.from(webp.split(',')[1], 'base64'));
}
const { width, height } = renders.at(-1);
await writeFile(
  `${ROOT}src/features/home/hero-still.json`,
  `${JSON.stringify({ widths: WIDTHS, size: { width, height } }, null, 2)}\n`,
);
const hash = createHash('sha256');
for (const source of sources) hash.update(await readFile(`${ROOT}${source}`));
await writeFile(
  `${ROOT}src/features/home/hero-still.sources.json`,
  `${JSON.stringify({ sha256: hash.digest('hex'), sources }, null, 2)}\n`,
);
console.log(
  `hero still: ${WIDTHS.map((w) => `flange-${w}.webp`).join(', ')} (${width}×${height}), ${sources.length} sources`,
);
