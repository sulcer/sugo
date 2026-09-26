import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { SheetSection } from './SheetSection';

const renderZone = (divider?: boolean) =>
  render(
    <SheetSection number="03" divider={divider} aria-label="Zmogljivosti">
      <p>content</p>
    </SheetSection>,
  );

it('puts the zone number in the first child, the margin rail', () => {
  renderZone();
  expect(screen.getByRole('region', { name: 'Zmogljivosti' }).firstElementChild).toHaveTextContent('03');
});

it('hides the zone number from assistive tech', () => {
  renderZone();
  expect(screen.getByText('03')).toHaveAttribute('aria-hidden', 'true');
});

it('rules zones off from each other with a hairline by default', () => {
  renderZone();
  expect(screen.getByRole('region', { name: 'Zmogljivosti' })).toHaveClass('border-t');
});

it('drops the hairline for the first zone of a sheet', () => {
  renderZone(false);
  expect(screen.getByRole('region', { name: 'Zmogljivosti' })).not.toHaveClass('border-t');
});
