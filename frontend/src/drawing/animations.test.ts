import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { plotLines, revealHatch, showFrame } from './animations';

type FakeAnimation = {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  onfinish: (() => void) | null;
  cancel: () => void;
  cancelled: boolean;
};

let animations: FakeAnimation[] = [];

beforeEach(() => {
  animations = [];
  Element.prototype.animate = function (keyframes: Keyframe[], options: KeyframeAnimationOptions) {
    const animation: FakeAnimation = {
      keyframes,
      options,
      onfinish: null,
      cancelled: false,
      cancel() {
        this.cancelled = true;
      },
    };
    animations.push(animation);
    return animation as unknown as Animation;
  } as typeof Element.prototype.animate;
});

afterEach(() => {
  // @ts-expect-error jsdom has no Web Animations API; remove the stub again
  delete Element.prototype.animate;
  vi.unstubAllGlobals();
});

const drawingWith = (lines: number) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.innerHTML =
    Array.from({ length: lines }, () => '<path data-plot="" d="M0 0 L1 1"/>').join('') +
    '<path data-fade="" d="M0 0"/>';
  return svg;
};

describe('plotLines', () => {
  it('draws each line over 40 % of the duration', () => {
    plotLines(drawingWith(4), '[data-plot]', '[data-fade]', 1000);
    expect(animations.slice(0, 4).map((a) => a.options.duration)).toEqual([400, 400, 400, 400]);
  });

  it('staggers the lines over the first 60 % of the duration', () => {
    plotLines(drawingWith(4), '[data-plot]', '[data-fade]', 1000);
    expect(animations.slice(0, 4).map((a) => a.options.delay)).toEqual([0, 150, 300, 450]);
  });

  it('fades the labels in once the pen is done', () => {
    plotLines(drawingWith(2), '[data-plot]', '[data-fade]', 1000);
    expect(animations[2].keyframes).toEqual([{ opacity: 0 }, { opacity: 0 }, { opacity: 1 }]);
  });

  it('restores the plain stroke when a line has finished drawing', () => {
    const svg = drawingWith(1);
    plotLines(svg, '[data-plot]', '[data-fade]', 1000);
    animations[0].onfinish?.();
    const line = svg.querySelector('[data-plot]') as SVGPathElement;
    expect([line.style.strokeDasharray, line.getAttribute('pathLength')]).toEqual(['', null]);
  });

  it('lets the labels go once they have faded in, so nothing stays animated', () => {
    plotLines(drawingWith(1), '[data-plot]', '[data-fade]', 1000);
    animations[1].onfinish?.();
    expect(animations[1].cancelled).toBe(true);
  });

  it('cancels the previous run when the drawing is plotted again', () => {
    const svg = drawingWith(1);
    plotLines(svg, '[data-plot]', '[data-fade]', 1000);
    plotLines(svg, '[data-plot]', '[data-fade]', 1000);
    expect(animations[0].cancelled).toBe(true);
  });

  it('lets only the latest run clean up a line', () => {
    const svg = drawingWith(1);
    plotLines(svg, '[data-plot]', '[data-fade]', 1000);
    plotLines(svg, '[data-plot]', '[data-fade]', 1000);
    animations[0].onfinish?.();
    expect((svg.querySelector('[data-plot]') as SVGPathElement).style.strokeDasharray).toBe('1 1');
  });
});

describe('revealHatch', () => {
  let frames: FrameRequestCallback[] = [];
  let now = 0;

  beforeEach(() => {
    frames = [];
    now = 0;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback));
    vi.stubGlobal('cancelAnimationFrame', () => {});
    vi.spyOn(performance, 'now').mockImplementation(() => now);
  });

  const drawing = () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 200 100');
    svg.innerHTML = '<clipPath><rect data-hatch-clip="" width="200"/></clipPath>';
    return svg;
  };
  const clipWidth = (svg: SVGSVGElement) => svg.querySelector('[data-hatch-clip]')?.getAttribute('width');
  const advanceTo = (time: number) => {
    now = time;
    const pending = frames;
    frames = [];
    pending.forEach((frame) => frame(time));
  };

  it('starts with the hatching hidden', () => {
    const svg = drawing();
    revealHatch(svg, 500);
    expect(clipWidth(svg)).toBe('0');
  });

  it('stays hidden when the first frame is timed before the sweep started', () => {
    now = 10;
    const svg = drawing();
    revealHatch(svg, 500);
    advanceTo(8);
    expect(clipWidth(svg)).toBe('0');
  });

  it('is half revealed half-way through', () => {
    const svg = drawing();
    revealHatch(svg, 500);
    advanceTo(250);
    expect(clipWidth(svg)).toBe('100');
  });

  it('ends fully revealed', () => {
    const svg = drawing();
    revealHatch(svg, 500);
    advanceTo(250);
    advanceTo(500);
    expect(clipWidth(svg)).toBe('200');
  });
});

describe('showFrame', () => {
  const drawing = () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.innerHTML = '<g data-view="a"><g data-hatch=""></g></g><g data-view="b"></g>';
    return svg;
  };
  const opacities = (svg: SVGSVGElement) => [
    (svg.querySelector('[data-view="a"]') as SVGGElement).style.opacity,
    (svg.querySelector('[data-hatch]') as SVGGElement).style.opacity,
  ];

  it('shows the whole drawing in frame 1', () => {
    const svg = drawing();
    showFrame(svg, 1);
    expect(opacities(svg)).toEqual(['1', '1']);
  });

  it('drops the hatching in frame 2 while the metal fills the section', () => {
    const svg = drawing();
    showFrame(svg, 2);
    expect(opacities(svg)).toEqual(['1', '0']);
  });

  it('hides the main view in frame 3 while the model stands in for it', () => {
    const svg = drawing();
    showFrame(svg, 3);
    expect(opacities(svg)).toEqual(['0', '0']);
  });
});
