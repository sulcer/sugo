import { render, screen } from '@testing-library/react';
import { SheetSection } from './SheetSection';

it('renders the zone number as a first rail hidden from assistive tech, then the content', () => {
  render(
    <SheetSection number="03" aria-label="Zmogljivosti">
      <p>content</p>
    </SheetSection>,
  );
  const section = screen.getByRole('region', { name: 'Zmogljivosti' });
  expect(section.firstElementChild).toHaveTextContent('03');
  expect(section.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  expect(section).toHaveClass('border-t');
});

it('drops the top hairline for the first zone of a sheet', () => {
  render(<SheetSection number="01" divider={false} aria-label="Uvod" />);
  expect(screen.getByRole('region', { name: 'Uvod' })).not.toHaveClass('border-t');
});
