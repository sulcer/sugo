import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { TimelineList } from './TimelineList';

it('lists the company history in order, each event with its year', () => {
  render(<TimelineList locale="en" />);
  expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
    '2010Boštjan Golob s.p. founded',
    '2019SUGO d.o.o. founded',
    '2020Production relocated',
    '2022Machine park modernised',
  ]);
});

it('keeps its list semantics in Safari, which drops them for unstyled lists', () => {
  render(<TimelineList locale="en" />);
  expect(screen.getByRole('list')).toHaveAttribute('role', 'list');
});
