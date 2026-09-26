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
  canvas: HTMLCanvasElement;
  /** CSS size of the canvas. */
  size: readonly [width: number, height: number];
  /** The drawing's view box; the camera frames it exactly as the SVG does. */
  viewBox: ViewBox;
  /** View box units per CSS pixel, as used for the drawing. */
  k: number;
  preserveDrawingBuffer?: boolean;
};

export type Stage = { scene: Scene; render(): void; dispose(): void };

/**
 * Renderer, studio lighting and an orthographic camera looking at the drawing plane, so a model
 * placed in drawing coordinates (y flipped) sits exactly on its drawing.
 */
export function createStage({
  canvas,
  size,
  viewBox,
  k,
  preserveDrawingBuffer = false,
}: StageOptions): Stage {
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
  const [halfW, halfH] = [(width * k) / 2, (height * k) / 2];
  const camera = new OrthographicCamera(-halfW, halfW, halfH, -halfH, -2000, 2000);
  camera.position.set(cx, -cy, 500);
  camera.lookAt(cx, -cy, 0);

  return {
    scene,
    render: () => renderer.render(scene, camera),
    dispose: () => {
      scene.traverse((object) => {
        if (object instanceof Mesh || object instanceof LineSegments) object.geometry.dispose();
      });
      scene.environment?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
