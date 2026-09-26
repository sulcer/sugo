import { render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { MachineGroup } from './MachineGroup';

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
});

it('keeps its list semantics in Safari, which drops them for unstyled lists', () => {
  render(<MachineGroup locale="en" number="02" type="lathe" />);
  expect(screen.getByRole('list')).toHaveAttribute('role', 'list');
});

it('lists only the machines of its own type', () => {
  render(<MachineGroup locale="en" number="03" type="vmc" />);
  expect(screen.getAllByRole('listitem')).toHaveLength(2);
});
