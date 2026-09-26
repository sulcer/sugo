import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Logo } from './Logo';

it('is announced as the company name', () => {
  render(<Logo />);
  expect(screen.getByRole('img', { name: 'SUGO d.o.o.' })).toBeInTheDocument();
});

it('inherits its ink from the surrounding text colour', () => {
  render(<Logo />);
  expect(screen.getByRole('img')).toHaveAttribute('fill', 'currentColor');
});
