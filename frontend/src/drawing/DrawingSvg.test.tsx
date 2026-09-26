import { render } from '@testing-library/react';
import { expect, it } from 'vitest';
import { DrawingSvg } from './DrawingSvg';
import { drawSubject } from './geometry';

const flange = drawSubject({ type: 'part', kind: 'r17', views: 'full' }, 2);
const machine = drawSubject({ type: 'machine', kind: 'm5' }, 1);

it('scales the hatch line weight by k', () => {
  const { container } = render(<DrawingSvg drawing={flange} />);
  expect(container.querySelector('[data-hatch-pattern] path')).toHaveAttribute('stroke-width', '1.26');
});

it('scales the hatch pitch by k', () => {
  const { container } = render(<DrawingSvg drawing={flange} />);
  expect(container.querySelector('[data-hatch-pattern]')).toHaveAttribute('width', '10');
});

it('scales the dash-dot pattern of centre lines by k', () => {
  const { container } = render(<DrawingSvg drawing={flange} />);
  expect(container.querySelector('[data-centre]')).toHaveAttribute('stroke-dasharray', '28 6 4 6');
});

it('gives every instance its own hatch pattern id', () => {
  const { container } = render(
    <>
      <DrawingSvg drawing={flange} />
      <DrawingSvg drawing={flange} />
    </>,
  );
  const ids = [...container.querySelectorAll('pattern')].map((pattern) => pattern.id);
  expect(new Set(ids).size).toBe(2);
});

it('uses ids that are valid inside url() references', () => {
  const { container } = render(<DrawingSvg drawing={flange} />);
  expect(container.querySelector('pattern')?.id).toMatch(/^[\w-]+$/);
});

it('fills section regions with its own hatch pattern', () => {
  const { container } = render(<DrawingSvg drawing={flange} />);
  const patternId = container.querySelector('pattern')?.id;
  expect(container.querySelector('[data-hatch] path')).toHaveAttribute('fill', `url(#${patternId})`);
});

it('marks every visible edge for the plotter animation', () => {
  const { container } = render(<DrawingSvg drawing={flange} />);
  const edges = flange.layers.reduce((n, layer) => n + layer.thick.length + layer.thin.length, 0);
  expect(container.querySelectorAll('[data-plot]')).toHaveLength(edges);
});

it('draws work-envelope dimensions in accent ink', () => {
  const { container } = render(<DrawingSvg drawing={machine} />);
  expect(container.querySelector('text[data-envelope-fade]')).toHaveAttribute('fill', '#1F3FBF');
});

it('is decorative for assistive tech', () => {
  const { container } = render(<DrawingSvg drawing={flange} />);
  expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
});
