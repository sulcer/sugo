import { act, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { HeroMachining } from './HeroMachining';

const three = vi.hoisted(() => ({
  renderStill: vi.fn(),
  createModelScene: vi.fn(),
  runMachining: vi.fn(),
  startSpin: vi.fn(),
  dispose: vi.fn(),
}));
vi.mock('@/three/load-hero', () => ({
  loadHeroThree: async () => ({
    renderStill: three.renderStill,
    createModelScene: three.createModelScene,
    runMachining: three.runMachining,
    startSpin: three.startSpin,
  }),
}));

const OPERATIONS = ['Čelo', 'Grobo', 'Fino', 'Navoj', 'Vrtanje', 'Odrez'];
let reducedMotion = false;
let width = 700;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  reducedMotion = false;
  width = 700;
  three.renderStill.mockReset().mockReturnValue('data:image/png;base64,AAAA');
  three.createModelScene
    .mockReset()
    .mockReturnValue({ dispose: three.dispose, pose: vi.fn(), render: vi.fn() });
  three.runMachining.mockReset().mockReturnValue(new Promise(() => {}));
  three.startSpin.mockReset().mockReturnValue(() => {});
  three.dispose.mockReset();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('reduce') && reducedMotion,
    addEventListener() {},
    removeEventListener() {},
  }));
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => width);
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

it('shows a still of the finished part when the visitor prefers reduced motion', async () => {
  reducedMotion = true;
  await renderHero();
  expect([three.renderStill.mock.calls.length, three.runMachining.mock.calls.length]).toEqual([1, 0]);
});

it('shows a still of the finished part on narrow screens', async () => {
  width = 400;
  await renderHero();
  expect([three.renderStill.mock.calls.length, three.runMachining.mock.calls.length]).toEqual([1, 0]);
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

it('keeps the complete drawing when the browser cannot render 3D', async () => {
  reducedMotion = true;
  three.renderStill.mockImplementation(() => {
    throw new Error('WebGL unavailable');
  });
  const { container } = await renderHero();
  expect((container.querySelector('[data-view="a"]') as SVGGElement).style.opacity).not.toBe('0');
});

it('frees the 3D scene when it leaves the page', async () => {
  const { unmount } = await renderHero();
  await settle(1300);
  await settle();
  unmount();
  expect(three.dispose).toHaveBeenCalledOnce();
});

it('is decorative for assistive tech', async () => {
  const { container } = await renderHero();
  expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
});
