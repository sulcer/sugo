import {
  ACESFilmicToneMapping,
  AmbientLight,
  Box3,
  DirectionalLight,
  Group,
  LineSegments,
  Mesh,
  OrthographicCamera,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
import type { Drawing } from '@/drawing/geometry';
import type { PartGeometry } from '@/drawing/geometry/parts-table';
import { createStudioEnvironment } from './environment';
import { createMaterials, disposeMaterials, type Tone } from './materials';
import { buildMilledMesh } from './milled-mesh';
import { buildTurnedMesh } from './turned-mesh';

export type ModelSceneOptions = {
  canvas: HTMLCanvasElement;
  part: PartGeometry;
  /** The drawing the model stands in for: same view box, same scale, so the two line up exactly. */
  drawing: Drawing;
  size: readonly [width: number, height: number];
  tone: Tone;
  /** Keep the frame readable after rendering (needed to copy a still into an image). */
  preserveDrawingBuffer?: boolean;
};

export type ModelScene = {
  scene: Scene;
  /** Frame 2: the cut-away model lies exactly on the drawing's section. Frame 3: tilted, whole. */
  pose(frame: 2 | 3, progress?: number): void;
  /** Rotation about the part's own axis, radians, on top of the resting angle. */
  spinTo(angle: number): void;
  /** Resting spin angle of frame 3. */
  restAngle: number;
  hideModels(): void;
  render(): void;
  dispose(): void;
};

type Tilt = { x: number; y: number; rest: number };
const TURNED_TILT: Tilt = { x: 0.3, y: 0.62, rest: 0.35 };
const MILLED_TILT: Tilt = { x: -0.98, y: 0, rest: -0.55 };

/**
 * An orthographic scene aligned to the drawing's view box, so frame 2 overlays the section exactly
 * and frame 3 tilts the part into view and scales it to fit the main view's region.
 */
export function createModelScene({
  canvas,
  part,
  drawing,
  size,
  tone,
  preserveDrawingBuffer = false,
}: ModelSceneOptions): ModelScene {
  const [width, height] = size;
  const k = drawing.layers[0].k;
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

  const [vx, vy, vw, vh] = drawing.viewBox;
  const [cx, cy] = [vx + vw / 2, vy + vh / 2];
  const [halfW, halfH] = [(width * k) / 2, (height * k) / 2];
  const camera = new OrthographicCamera(-halfW, halfW, halfH, -halfH, -2000, 2000);
  camera.position.set(cx, -cy, 500);
  camera.lookAt(cx, -cy, 0);

  const materials = createMaterials(tone);
  const tilt = new Group();
  const spin = new Group();
  tilt.add(spin);
  scene.add(tilt);

  let cutAway: Group | null = null;
  let whole: Group;
  let tiltTo: Tilt;
  let spinAxis: 'x' | 'z';
  if (part.type === 'milled') {
    whole = buildMilledMesh(part, materials);
    tilt.position.set(part.W / 2, -((drawing.planOffset ?? 0) + part.D / 2), -part.H / 2);
    whole.position.set(-part.W / 2, part.D / 2, part.H / 2);
    spin.add(whole);
    tiltTo = MILLED_TILT;
    spinAxis = 'z';
  } else {
    cutAway = buildTurnedMesh(part, true, materials);
    whole = buildTurnedMesh(part, false, materials);
    tilt.position.set(part.L / 2, 0, 0);
    [cutAway, whole].forEach((model) => {
      model.position.x = -part.L / 2;
      spin.add(model);
    });
    tiltTo = TURNED_TILT;
    spinAxis = 'x';
  }

  const rest = tilt.position.clone();
  let fitted: { position: Vector3; scale: number } | null = null;

  const pose = (frame: 2 | 3, progress = 1) => {
    if (cutAway) {
      cutAway.visible = frame < 3;
      whole.visible = frame >= 3;
    }
    const v = frame >= 3 ? progress : 0;
    tilt.rotation.set(tiltTo.x * v, tiltTo.y * v, 0, 'YXZ');
    if (fitted) {
      tilt.position.lerpVectors(rest, fitted.position, v);
      tilt.scale.setScalar(1 + (fitted.scale - 1) * v);
    }
  };

  // Fit the tilted, resting model into the main view's region of the drawing.
  pose(3);
  spin.rotation[spinAxis] = tiltTo.rest;
  tilt.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(whole);
  const centre = bounds.getCenter(new Vector3());
  const extent = bounds.getSize(new Vector3());
  const [rx0, rx1, ry0, ry1] = drawing.region ?? [vx, vx + vw, vy, vy + vh];
  const regionCentre = new Vector3((rx0 + rx1) / 2, -(ry0 + ry1) / 2, centre.z);
  const scale = Math.min(1, (0.9 * (rx1 - rx0)) / extent.x, (0.9 * (ry1 - ry0)) / extent.y);
  fitted = {
    scale,
    position: new Vector3(
      regionCentre.x - scale * (centre.x - rest.x),
      regionCentre.y - scale * (centre.y - rest.y),
      rest.z,
    ),
  };
  spin.rotation[spinAxis] = 0;
  pose(2);

  return {
    scene,
    pose,
    restAngle: tiltTo.rest,
    spinTo: (angle) => {
      spin.rotation[spinAxis] = angle;
    },
    hideModels: () => {
      whole.visible = false;
      if (cutAway) cutAway.visible = false;
    },
    render: () => renderer.render(scene, camera),
    dispose: () => {
      scene.traverse((object) => {
        if (object instanceof Mesh || object instanceof LineSegments) object.geometry.dispose();
      });
      disposeMaterials(materials);
      scene.environment?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

/** Renders frame 3 once into an offscreen canvas and returns it as an image (for static visitors). */
export function renderStill(options: Omit<ModelSceneOptions, 'canvas' | 'preserveDrawingBuffer'>): string {
  const canvas = document.createElement('canvas');
  const model = createModelScene({ ...options, canvas, preserveDrawingBuffer: true });
  try {
    model.pose(3);
    model.spinTo(model.restAngle);
    model.render();
    return canvas.toDataURL('image/png');
  } finally {
    model.dispose();
  }
}
