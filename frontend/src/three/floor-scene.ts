import { PARTS_FLOOR } from '@/drawing/geometry/parts-floor';
import { buildFloorItems, poseFloorItems } from './floor-items';
import { createStage } from './stage';

const HANDOVER_MS = 480;
const TILT_IN_MS = 420;
const SPIN_RAD_PER_S = 0.45;

type FloorOptions = {
  canvas: HTMLCanvasElement;
  /** Wrapper of the floor drawing, faded out once the models have taken over. */
  drawing: HTMLElement;
  size: readonly [width: number, height: number];
  /** Rendering pauses while the floor is scrolled out of view. */
  isVisible: () => boolean;
};

/**
 * Brings the floor to life: the models appear exactly over their drawings, the hatching gives way
 * to metal, the drawing hands over, then every part tilts in and turns. Returns a stop function
 * that restores the drawing and frees the WebGL context.
 */
export function startFloor({ canvas, drawing, size, isVisible }: FloorOptions): () => void {
  const [, , vw, vh] = PARTS_FLOOR.viewBox;
  const k = Math.max(vw / size[0], vh / size[1]);
  const stage = createStage({ canvas, size, viewBox: PARTS_FLOOR.viewBox, k });
  const floor = buildFloorItems();
  floor.items.forEach((item) => stage.scene.add(item.holder));
  const hatching = [...drawing.querySelectorAll<SVGElement>('[data-hatch]')];
  let frame = 0;

  stage.render();
  canvas.style.opacity = '1';
  hatching.forEach((hatch) => (hatch.style.opacity = '0'));

  const handover = setTimeout(() => {
    drawing.style.opacity = '0';
    hatching.forEach((hatch) => (hatch.style.opacity = ''));
    const start = performance.now();
    let last = start;
    let angle = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const progress = Math.min(1, (now - start) / TILT_IN_MS);
      if (progress >= 1 && !document.hidden) angle += dt * SPIN_RAD_PER_S;
      poseFloorItems(floor.items, progress, angle);
      if (isVisible()) stage.render();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  }, HANDOVER_MS);

  return () => {
    clearTimeout(handover);
    cancelAnimationFrame(frame);
    stage.dispose();
    floor.dispose();
    canvas.style.opacity = '0';
    drawing.style.opacity = '';
    hatching.forEach((hatch) => (hatch.style.opacity = ''));
  };
}
