import { drawSubject, viewBoxOf } from '@/drawing/geometry';
import { HERO_PART, HERO_SUBJECT, HERO_TONE } from '@/features/home/hero-part';
import { createModelScene } from '@/three/model-scene';

/**
 * The finished hero part as a PNG data URL `width` px wide: frame 3, at rest, framed exactly like the
 * drawing's view box, so the page can lay it over the drawing with `object-fit: contain` at any size.
 */
export function renderHeroStill(width: number): string {
  const [, , viewWidth, viewHeight] = viewBoxOf(HERO_SUBJECT);
  const k = viewWidth / width;
  const model = createModelScene({
    part: HERO_PART,
    drawing: drawSubject(HERO_SUBJECT, k),
    size: [width, Math.round(viewHeight / k)],
    tone: HERO_TONE,
    preserveDrawingBuffer: true,
  });
  try {
    model.pose(3);
    model.spinTo(model.restAngle);
    model.render();
    return model.canvas.toDataURL('image/png');
  } finally {
    model.dispose();
  }
}
