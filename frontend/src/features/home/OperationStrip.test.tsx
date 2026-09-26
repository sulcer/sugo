import { render } from '@testing-library/react';
import { expect, it } from 'vitest';
import { OperationStrip } from './OperationStrip';

const OPERATIONS = ['Čelo', 'Grobo', 'Fino', 'Navoj', 'Vrtanje', 'Odrez'];
const cells = (container: HTMLElement) => [...container.querySelectorAll('[data-op]')];

it('numbers the six operations like program blocks', () => {
  const { container } = render(<OperationStrip operations={OPERATIONS} current={-1} />);
  expect(cells(container).map((cell) => cell.firstElementChild?.textContent)).toEqual([
    'N10',
    'N20',
    'N30',
    'N40',
    'N50',
    'N60',
  ]);
});

it('marks finished operations with a tick, the running one as active', () => {
  const { container } = render(<OperationStrip operations={OPERATIONS} current={2} />);
  expect(
    cells(container).map((cell) => `${cell.getAttribute('data-op')}:${cell.lastElementChild?.textContent}`),
  ).toEqual([
    'done:Čelo ✓',
    'done:Grobo ✓',
    'active:Fino',
    'pending:Navoj',
    'pending:Vrtanje',
    'pending:Odrez',
  ]);
});

it('ticks every operation once the part is finished', () => {
  const { container } = render(<OperationStrip operations={OPERATIONS} current={OPERATIONS.length} />);
  expect(cells(container).every((cell) => cell.getAttribute('data-op') === 'done')).toBe(true);
});

it('is decorative for assistive tech', () => {
  const { container } = render(<OperationStrip operations={OPERATIONS} current={-1} />);
  expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
});
