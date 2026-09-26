import { act, render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { ViewBox } from './geometry';
import { useDrawingScale } from './use-drawing-scale';

const VIEW_BOX: ViewBox = [0, 0, 600, 300];
let notify: () => void = () => {};
const size = { width: 0, height: 0 };

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        notify = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => size.width);
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => size.height);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function Probe({ nominalWidth }: { nominalWidth: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const k = useDrawingScale(ref, VIEW_BOX, nominalWidth);
  return <div ref={ref} data-testid="probe" data-k={k} />;
}

const resizeTo = (width: number, height: number) =>
  act(() => {
    Object.assign(size, { width, height });
    notify();
  });

const kOf = (container: HTMLElement) => Number(container.querySelector('[data-k]')?.getAttribute('data-k'));

it('starts from the nominal width so server html already has sensible line weights', () => {
  const { container } = render(<Probe nominalWidth={300} />);
  expect(kOf(container)).toBe(2);
});

it('adopts the first real measurement exactly', () => {
  const { container } = render(<Probe nominalWidth={300} />);
  resizeTo(290, 145);
  expect(kOf(container)).toBeCloseTo(600 / 290);
});

it('ignores later width changes under 12 %', () => {
  const { container } = render(<Probe nominalWidth={300} />);
  resizeTo(300, 150);
  resizeTo(320, 160);
  expect(kOf(container)).toBe(2);
});

it('rescales when the width changes by more than 12 %', () => {
  const { container } = render(<Probe nominalWidth={300} />);
  resizeTo(300, 150);
  resizeTo(600, 300);
  expect(kOf(container)).toBe(1);
});

it('rescales when the height alone changes by more than 30 px', () => {
  const { container } = render(<Probe nominalWidth={300} />);
  resizeTo(300, 150);
  resizeTo(300, 100);
  expect(kOf(container)).toBe(3);
});

it('treats a collapsed height as the drawing aspect instead of dividing by zero', () => {
  const { container } = render(<Probe nominalWidth={300} />);
  resizeTo(300, 0);
  expect(kOf(container)).toBe(2);
});
