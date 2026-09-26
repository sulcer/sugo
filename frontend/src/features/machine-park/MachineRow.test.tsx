import { render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { machineRows } from '@/content/machines';
import { MachineRow } from './MachineRow';

const machine = machineRows('en')[4];

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
});

const renderRow = () =>
  render(
    <ul>
      <MachineRow machine={machine} locale="en" />
    </ul>,
  );

it('names the envelope figures after the label they sit under', () => {
  const { container } = renderRow();
  expect(container.querySelector('dl')).toHaveAccessibleName('Work envelope');
});

it('dimensions the machine over the travels of its drawing', () => {
  renderRow();
  expect(screen.getAllByRole('term').map((term) => term.textContent)).toEqual(['X', 'Y', 'Z']);
});

it('prints every figure in millimetres', () => {
  renderRow();
  expect(screen.getAllByRole('definition').map((value) => value.textContent)).toEqual([
    '500mm',
    '350mm',
    '250mm',
  ]);
});
