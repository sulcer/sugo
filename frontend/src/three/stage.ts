import {
  ACESFilmicToneMapping,
  AmbientLight,
  DirectionalLight,
  LineSegments,
  Mesh,
  OrthographicCamera,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';
import type { ViewBox } from '@/drawing/geometry';
import { createStudioEnvironment } from './environment';

export type StageOptions = {
  /** Receives the stage's canvas, which is styled by its host; leave out to render offscreen. */
  host?: HTMLElement;
  /** CSS size of the canvas. */
  size: readonly [width: number, height: number];
  /** The drawing's view box; the camera frames it exactly as the SVG (`meet`) does at this size. */
  viewBox: ViewBox;
  preserveDrawingBuffer?: boolean;
};

export type Stage = { canvas: HTMLCanvasElement; scene: Scene; render(): void; dispose(): void };

/**
 * Renderer, studio lighting and an orthographic camera looking at the drawing plane, so a model
 * placed in drawing coordinates (y flipped) sits exactly on its drawing.
 *
 * Disposing forces the WebGL context lost, so a page of models stays under the browser's context
 * limit. A lost context never comes back to its canvas, so every stage draws on a canvas of its own
 * and takes it out of the page again.
 */
export function createStage({ host, size, viewBox, preserveDrawingBuffer = false }: StageOptions): Stage {
  const canvas = document.createElement('canvas');
  if (host) {
    host.append(canvas);
    // Settle the canvas's transparent starting style, so raising its opacity fades it in.
    canvas.getBoundingClientRect();
  }
  const [width, height] = size;
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new Scene();
  scene.environment = createStudioEnvironment(renderer);
  scene.add(new AmbientLight(0xffffff, 0.2));
  const keyLight = new DirectionalLight(0xffffff, 0.9);
  keyLight.position.set(-3, 5, 6);
  scene.add(keyLight);

  const [vx, vy, vw, vh] = viewBox;
  const [cx, cy] = [vx + vw / 2, vy + vh / 2];
  const k = Math.max(vw / width, vh / height);
  const [halfW, halfH] = [(width * k) / 2, (height * k) / 2];
  const camera = new OrthographicCamera(-halfW, halfW, halfH, -halfH, -2000, 2000);
  camera.position.set(cx, -cy, 500);
  camera.lookAt(cx, -cy, 0);

  return {
    canvas,
    scene,
    render: () => renderer.render(scene, camera),
    dispose: () => {
      scene.traverse((object) => {
        if (object instanceof Mesh || object instanceof LineSegments) object.geometry.dispose();
      });
      scene.environment?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
