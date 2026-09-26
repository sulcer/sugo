// Renders the hero's finished part once, so narrow heroes and reduced motion show a prerendered image
// instead of building a WebGL scene on the visitor's device. Run `npm run hero-still` after changing
// any of SOURCES; a unit test fails until the images match them again.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { build } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const WIDTHS = [600, 1200];
/** Everything that decides how the still looks. */
const SOURCES = [
  'scripts/hero-still-entry.ts',
  'src/features/home/hero-part.ts',
  'src/drawing/geometry/parts-table.ts',
  'src/drawing/geometry/turned.ts',
  'src/three/model-scene.ts',
  'src/three/stage.ts',
  'src/three/environment.ts',
  'src/three/materials.ts',
  'src/three/turned-mesh.ts',
];

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

// Headless Chromium renders WebGL through SwiftShader.
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
await page.addScriptTag({ content: bundle.code });
await mkdir(`${ROOT}public/hero`, { recursive: true });
let size;
for (const width of WIDTHS) {
  const { webp, height } = await page.evaluate(async (pixels) => {
    const image = new Image();
    image.src = window.HeroStill.renderHeroStill(pixels);
    await image.decode();
    const canvas = Object.assign(document.createElement('canvas'), {
      width: image.width,
      height: image.height,
    });
    canvas.getContext('2d').drawImage(image, 0, 0);
    return { webp: canvas.toDataURL('image/webp', 0.9), height: image.height };
  }, width);
  await writeFile(`${ROOT}public/hero/flange-${width}.webp`, Buffer.from(webp.split(',')[1], 'base64'));
  size = { width, height };
}
await browser.close();

const hash = createHash('sha256');
for (const source of SOURCES) hash.update(await readFile(`${ROOT}${source}`));
const manifest = { widths: WIDTHS, size, sources: SOURCES, sha256: hash.digest('hex') };
await writeFile(`${ROOT}src/features/home/hero-still.json`, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `hero still: ${WIDTHS.map((width) => `flange-${width}.webp`).join(', ')} (${size.width}×${size.height})`,
);
