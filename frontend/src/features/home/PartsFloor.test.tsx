import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { PartsFloor } from './PartsFloor';

const floor = vi.hoisted(() => ({ start: vi.fn(), stop: vi.fn() }));
vi.mock('@/three/floor-scene', () => ({
  startFloor: floor.start,
}));

let reducedMotion = false;
let observe: (entry: Partial<IntersectionObserverEntry>) => void = () => {};

beforeEach(() => {
  vi.useFakeTimers();
  reducedMotion = false;
  floor.start.mockReset().mockReturnValue(floor.stop);
  floor.stop.mockReset();
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
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        observe = (entry) =>
          callback([entry as IntersectionObserverEntry], this as unknown as IntersectionObserver);
      }
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1200);
  window.innerWidth = 1440;
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const scrollIntoView = (ratio: number) =>
  act(() => observe({ isIntersecting: ratio > 0, intersectionRatio: ratio }));

it('draws the ten parts on the floor', () => {
  const { container } = render(<PartsFloor />);
  expect(container.querySelectorAll('svg > g')).toHaveLength(10);
});

it('comes to life 600 ms after half of it is in view', async () => {
  render(<PartsFloor />);
  scrollIntoView(0.6);
  await act(() => vi.advanceTimersByTimeAsync(600));
  expect(floor.start).toHaveBeenCalledOnce();
});

it('waits until half of it is in view', async () => {
  render(<PartsFloor />);
  scrollIntoView(0.3);
  await act(() => vi.advanceTimersByTimeAsync(1000));
  expect(floor.start).not.toHaveBeenCalled();
});

it('comes to life only once', async () => {
  render(<PartsFloor />);
  scrollIntoView(0.6);
  scrollIntoView(0);
  scrollIntoView(0.6);
  await act(() => vi.advanceTimersByTimeAsync(1000));
  expect(floor.start).toHaveBeenCalledOnce();
});

it('stays a drawing on phones', async () => {
  window.innerWidth = 390;
  render(<PartsFloor />);
  scrollIntoView(1);
  await act(() => vi.advanceTimersByTimeAsync(1000));
  expect(floor.start).not.toHaveBeenCalled();
});

it('stays a drawing for visitors who prefer reduced motion', async () => {
  reducedMotion = true;
  render(<PartsFloor />);
  scrollIntoView(1);
  await act(() => vi.advanceTimersByTimeAsync(1000));
  expect(floor.start).not.toHaveBeenCalled();
});

it('frees the 3D scene when it leaves the page', async () => {
  const { unmount } = render(<PartsFloor />);
  scrollIntoView(0.6);
  await act(() => vi.advanceTimersByTimeAsync(600));
  unmount();
  expect(floor.stop).toHaveBeenCalledOnce();
});

it('reserves its room from its aspect ratio', () => {
  const { container } = render(<PartsFloor aspect={2.7} />);
  expect(parseFloat((container.firstElementChild as HTMLElement).style.aspectRatio)).toBe(2.7);
});
