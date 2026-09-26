import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Capabilities } from './Capabilities';

it('names the table after its section heading', () => {
  render(<Capabilities locale="sl" />);
  expect(screen.getByRole('table', { name: 'Zmogljivosti' })).toBeInTheDocument();
});

it('heads every row with its item', () => {
  render(<Capabilities locale="en" />);
  expect(screen.getAllByRole('rowheader').map((cell) => cell.textContent)).toEqual([
    'Turning diameter (speciality)',
    'Turning, maximum',
    'Milling, work envelope',
    'Materials',
    'Batch sizes',
    'Lead time',
  ]);
});

it('reads dimensions with their unit, separated by a space', () => {
  render(<Capabilities locale="sl" />);
  expect(screen.getAllByRole('cell')[0]).toHaveTextContent(/^Ø 3 – 65 mm$/);
});
