import { PARTS_FLOOR } from '@/drawing/geometry/parts-floor';
import { buildFloorItems, poseFloorItems } from './floor-items';
import { createStage } from './stage';

const HANDOVER_MS = 480;
const TILT_IN_MS = 420;
const SPIN_RAD_PER_S = 0.45;

type FloorOptions = {
  /** Receives the floor's canvas. */
  host: HTMLElement;
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
export function startFloor({ host, drawing, size, isVisible }: FloorOptions): () => void {
  const stage = createStage({ host, size, viewBox: PARTS_FLOOR.viewBox });
  const floor = buildFloorItems();
  floor.items.forEach((item) => stage.scene.add(item.holder));
  const hatching = [...drawing.querySelectorAll<SVGElement>('[data-hatch]')];
  let frame = 0;

  stage.render();
  stage.canvas.style.opacity = '1';
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
    drawing.style.opacity = '';
    hatching.forEach((hatch) => (hatch.style.opacity = ''));
  };
}
