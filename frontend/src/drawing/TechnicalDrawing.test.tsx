import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { TechnicalDrawing } from './TechnicalDrawing';

let reducedMotion = false;

beforeEach(() => {
  reducedMotion = false;
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
});

afterEach(() => vi.unstubAllGlobals());

it('reserves the drawing aspect ratio before it is measured', () => {
  const { container } = render(<TechnicalDrawing subject={{ type: 'map' }} nominalWidth={600} />);
  expect(parseFloat((container.firstElementChild as HTMLElement).style.aspectRatio)).toBeCloseTo(600 / 380);
});

it('uses an explicit aspect ratio when the layout sets one', () => {
  const { container } = render(
    <TechnicalDrawing subject={{ type: 'map' }} nominalWidth={600} aspect={1.58} />,
  );
  expect(parseFloat((container.firstElementChild as HTMLElement).style.aspectRatio)).toBe(1.58);
});

it('sweeps the section hatching in when a part is hovered', () => {
  const { container } = render(
    <TechnicalDrawing
      subject={{ type: 'part', kind: 'r17', views: 'front' }}
      nominalWidth={300}
      hover="hatch"
    />,
  );
  fireEvent.mouseEnter(container.firstElementChild!);
  expect(container.querySelector('[data-hatch-clip]')).toHaveAttribute('width', '0');
});

it('keeps the drawing still on hover when the visitor prefers reduced motion', () => {
  reducedMotion = true;
  const { container } = render(
    <TechnicalDrawing
      subject={{ type: 'part', kind: 'r17', views: 'front' }}
      nominalWidth={300}
      hover="hatch"
    />,
  );
  const fullWidth = container.querySelector('[data-hatch-clip]')?.getAttribute('width');
  fireEvent.mouseEnter(container.firstElementChild!);
  expect(container.querySelector('[data-hatch-clip]')).toHaveAttribute('width', fullWidth);
});
