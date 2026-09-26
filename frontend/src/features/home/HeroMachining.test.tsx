import { act, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { HeroMachining } from './HeroMachining';

const three = vi.hoisted(() => ({
  load: vi.fn(),
  createModelScene: vi.fn(),
  runMachining: vi.fn(),
  startSpin: vi.fn(),
  dispose: vi.fn(),
}));
vi.mock('@/three/load-hero', () => ({
  loadHeroThree: async () => {
    three.load();
    return {
      createModelScene: three.createModelScene,
      runMachining: three.runMachining,
      startSpin: three.startSpin,
    };
  },
}));

const OPERATIONS = ['Čelo', 'Grobo', 'Fino', 'Navoj', 'Vrtanje', 'Odrez'];
let reducedMotion = false;
let motionChanged = () => {};
let resizeObservers = new Set<() => void>();
/** Tells every observer the elements changed size (their new size comes from `width`). */
const resize = () => act(() => resizeObservers.forEach((callback) => callback()));
let width = 700;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  reducedMotion = false;
  width = 700;
  three.load.mockReset();
  three.createModelScene.mockReset().mockReturnValue({
    canvas: document.createElement('canvas'),
    dispose: three.dispose,
    pose: vi.fn(),
    render: vi.fn(),
  });
  three.runMachining.mockReset().mockReturnValue(new Promise(() => {}));
  three.startSpin.mockReset().mockReturnValue(() => {});
  three.dispose.mockReset();
  resizeObservers = new Set();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(private readonly callback: () => void) {}
      observe() {
        resizeObservers.add(this.callback);
      }
      disconnect() {
        resizeObservers.delete(this.callback);
      }
    },
  );
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return query.includes('reduce') && reducedMotion;
    },
    addEventListener: (_: string, onChange: () => void) => (motionChanged = onChange),
    removeEventListener() {},
  }));
  // Browsers round clientWidth; the box keeps its fraction.
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => Math.round(width));
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    () => ({ width, height: 450 }) as DOMRect,
  );
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 450);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** Moves time on, then lets effects that re-ran (after the first measurement) finish their async work. */
const settle = async (ms = 0) => {
  await act(() => vi.advanceTimersByTimeAsync(ms));
  await act(async () => {});
};

const renderHero = async () => {
  const view = render(<HeroMachining operations={OPERATIONS} />);
  await settle();
  return view;
};

it('turns the part on screens wide enough for it', async () => {
  await renderHero();
  await settle(1300);
  await settle();
  expect(three.runMachining).toHaveBeenCalledOnce();
});

it('never loads the 3D code for visitors who prefer reduced motion', async () => {
  reducedMotion = true;
  await renderHero();
  await settle(2000);
  expect(three.load).not.toHaveBeenCalled();
});

it('never loads the 3D code on heroes too narrow to machine', async () => {
  width = 400;
  await renderHero();
  await settle(2000);
  expect(three.load).not.toHaveBeenCalled();
});

it('offers the finished part as a prerendered image in two sizes', async () => {
  const { container } = await renderHero();
  expect(container.querySelector('img')?.getAttribute('srcset')).toBe(
    '/hero/flange-600.webp 600w, /hero/flange-1200.webp 1200w',
  );
});

it('never starts the plotter while hydrating for visitors who prefer reduced motion', async () => {
  reducedMotion = true;
  const animate = vi.fn(() => ({ cancel() {}, onfinish: null }));
  Element.prototype.animate = animate as unknown as typeof Element.prototype.animate;
  const container = document.createElement('div');
  container.innerHTML = renderToString(<HeroMachining operations={OPERATIONS} />);
  document.body.append(container);
  render(<HeroMachining operations={OPERATIONS} />, { container, hydrate: true });
  await settle();
  // @ts-expect-error jsdom has no Web Animations API; remove the stub again
  delete Element.prototype.animate;
  expect(animate).not.toHaveBeenCalled();
});

it('ticks off every operation in the still', async () => {
  reducedMotion = true;
  const { container } = await renderHero();
  expect(
    [...container.querySelectorAll('[data-op]')].every((cell) => cell.getAttribute('data-op') === 'done'),
  ).toBe(true);
});

const startMachining = async () => {
  const view = await renderHero();
  await settle(1300);
  await settle();
  return view;
};

it('keeps its scene through its own re-renders while the part is machined', async () => {
  await startMachining();
  expect(three.dispose).not.toHaveBeenCalled();
});

it('frees the 3D scene when it leaves the page', async () => {
  const { unmount } = await startMachining();
  unmount();
  expect(three.dispose).toHaveBeenCalledOnce();
});

it('finishes the drawing when the machining cannot start', async () => {
  three.createModelScene.mockImplementation(() => {
    throw new Error('WebGL unavailable');
  });
  const { container } = await startMachining();
  expect((container.querySelector('[data-view="a"] [data-hatch]') as SVGGElement).style.opacity).not.toBe(
    '0',
  );
});

it('ticks off every operation when the machining cannot start', async () => {
  three.createModelScene.mockImplementation(() => {
    throw new Error('WebGL unavailable');
  });
  const { container } = await startMachining();
  expect([...container.querySelectorAll('[data-op]')].map((cell) => cell.getAttribute('data-op'))).toEqual(
    Array(6).fill('done'),
  );
});

it('hides the readout when the machining fails', async () => {
  three.runMachining.mockRejectedValue(new Error('context lost'));
  await startMachining();
  expect(screen.getByText('X Ø 69.000').parentElement).toHaveStyle({ opacity: '0' });
});

it('hides the readout when the visitor turns motion off mid-run', async () => {
  await startMachining();
  reducedMotion = true;
  act(() => motionChanged());
  await settle();
  expect(screen.getByText('X Ø 69.000').parentElement).toHaveStyle({ opacity: '0' });
});

it('is decorative for assistive tech', async () => {
  const { container } = await renderHero();
  expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
});

it('leaves the half-section to the stylesheet when motion is turned off mid-run', async () => {
  const { container } = await startMachining();
  reducedMotion = true;
  act(() => motionChanged());
  await settle();
  expect((container.querySelector('[data-view="a"]') as SVGGElement).style.opacity).toBe('');
});

it('ticks off every operation when motion is turned off mid-run', async () => {
  const { container } = await startMachining();
  reducedMotion = true;
  act(() => motionChanged());
  await settle();
  expect([...container.querySelectorAll('[data-op]')].map((cell) => cell.getAttribute('data-op'))).toEqual(
    Array(6).fill('done'),
  );
});

it('stops machining when the hero narrows past 460 px, even without a redraw', async () => {
  width = 480;
  await startMachining();
  width = 450;
  resize();
  await settle();
  expect(three.dispose).toHaveBeenCalled();
});

it('shows the still, not machining, for a hero a fraction of a pixel under 460 px', async () => {
  width = 459.6;
  await renderHero();
  await settle(2000);
  expect(three.load).not.toHaveBeenCalled();
});

it('asks phones and reduced-motion visitors to fetch the still early, and nobody else', () => {
  const html = renderToString(<HeroMachining operations={OPERATIONS} />);
  expect(html.match(/<link rel="preload"[^>]*>/)?.[0]).toContain(
    'media="(max-width: 493px), (prefers-reduced-motion: reduce)"',
  );
});
