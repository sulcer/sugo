import { round2 } from './geometry/path';

/** The run currently drawing each element; a replay cancels it so stale cleanup cannot fire. */
const runningAnimation = new WeakMap<Element, Animation>();

function animateOnce(element: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) {
  runningAnimation.get(element)?.cancel();
  const animation = element.animate(keyframes, options);
  runningAnimation.set(element, animation);
  return animation;
}

/**
 * Plotter pen: every matched path draws itself in turn (staggered over 60 % of the duration), then
 * the `fadeSelector` elements (centre lines, arrows, labels) appear. Linear, no easing.
 */
export function plotLines(root: Element, selector: string, fadeSelector: string, durationMs: number) {
  const paths = [...root.querySelectorAll<SVGPathElement>(selector)];
  if (!paths.length || typeof paths[0].animate !== 'function') return;
  paths.forEach((path, i) => {
    path.setAttribute('pathLength', '1');
    path.style.strokeDasharray = '1 1';
    const animation = animateOnce(path, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
      duration: durationMs * 0.4,
      delay: (i / paths.length) * durationMs * 0.6,
      easing: 'linear',
      fill: 'both',
    });
    animation.onfinish = () => {
      if (runningAnimation.get(path) !== animation) return;
      path.style.strokeDasharray = '';
      path.removeAttribute('pathLength');
      animation.cancel();
    };
  });
  root.querySelectorAll<SVGElement>(fadeSelector).forEach((element) => {
    const animation = animateOnce(element, [{ opacity: 0 }, { opacity: 0 }, { opacity: 1 }], {
      duration: durationMs * 1.05,
      easing: 'linear',
      fill: 'both',
    });
    // A finished fill would keep the drawing on its own compositor layer, softening its lines.
    animation.onfinish = () => {
      if (runningAnimation.get(element) === animation) animation.cancel();
    };
  });
}

/** Sweeps the section hatching in from the left by widening its clip rectangle. */
export function revealHatch(svg: SVGSVGElement, durationMs: number) {
  const clip = svg.querySelector('[data-hatch-clip]');
  if (!clip) return;
  const width = svg.viewBox.baseVal.width;
  const start = performance.now();
  const step = (now: number) => {
    // A frame's timestamp is the start of the frame, so it can predate `start`; a negative width throws.
    const progress = Math.min(1, Math.max(0, (now - start) / durationMs));
    clip.setAttribute('width', String(round2(width * progress)));
    if (progress < 1) requestAnimationFrame(step);
  };
  clip.setAttribute('width', '0');
  requestAnimationFrame(step);
}

/**
 * Drawing → metal → model sequence: 1 = the drawing, 2 = hatching gone (metal fills the section),
 * 3 = main view hidden (the 3D model stands in for it).
 */
export function showFrame(svg: SVGSVGElement, frame: 1 | 2 | 3) {
  const main = svg.querySelector<SVGGElement>('[data-view="a"]');
  if (!main) return;
  main.style.opacity = frame === 3 ? '0' : '1';
  const hatch = main.querySelector<SVGGElement>('[data-hatch]');
  if (hatch) hatch.style.opacity = frame >= 2 ? '0' : '1';
}
