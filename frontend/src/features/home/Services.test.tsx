import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Services } from './Services';

it('lists the three services as headed entries', () => {
  render(<Services locale="en" />);
  expect(screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual([
    'Turning',
    'Milling',
    'Consulting',
  ]);
});

it('keeps its list semantics in Safari, which drops them for unstyled lists', () => {
  render(<Services locale="en" />);
  expect(screen.getByRole('list')).toHaveAttribute('role', 'list');
});
