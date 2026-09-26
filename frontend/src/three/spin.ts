import type { ModelScene } from './model-scene';

const TILT_IN_MS = 420;
/** ≈ 4 rpm: a slow, constant spindle speed. */
const SPIN_RAD_PER_S = 0.45;
const DRAG_RAD_PER_PX = 0.012;

/**
 * Tilts the model into frame 3 (linear, hard stop), then turns it about its own axis. Dragging
 * turns it by hand; the spindle pauses while the tab is hidden. Held `still` (reduced motion), the
 * model rests in frame 3 at once and turns only by hand. Returns a function that stops it.
 */
export function startSpin(model: ModelScene, { still = false }: { still?: boolean } = {}): () => void {
  const { canvas } = model;
  const tiltInMs = still ? 0 : TILT_IN_MS;
  const start = performance.now();
  let last = start;
  let angle = 0;
  let drag: { x: number; angle: number } | null = null;
  let frame = 0;

  const onPointerDown = (event: PointerEvent) => {
    drag = { x: event.clientX, angle };
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = 'grabbing';
  };
  const onPointerMove = (event: PointerEvent) => {
    if (drag) angle = drag.angle + (event.clientX - drag.x) * DRAG_RAD_PER_PX;
  };
  const onPointerUp = () => {
    drag = null;
    canvas.style.cursor = 'grab';
  };
  canvas.style.cursor = 'grab';
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);

  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const progress = tiltInMs ? Math.min(1, (now - start) / tiltInMs) : 1;
    model.pose(3, progress);
    if (progress >= 1 && !still && !drag && !document.hidden) angle += dt * SPIN_RAD_PER_S;
    model.spinTo(model.restAngle * progress + angle);
    model.render();
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frame);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointercancel', onPointerUp);
    canvas.style.cursor = '';
  };
}
