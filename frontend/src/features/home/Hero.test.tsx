import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Hero } from './Hero';

vi.mock('./HeroMachining', () => ({ HeroMachining: () => null }));

it.each([
  ['sl', 'Kakovostna mehanska obdelava kovin za vaše inovativne ideje'],
  ['de', 'Hochwertige Metallbearbeitung für Ihre innovativen Ideen'],
  ['en', 'Quality metal machining for your innovative ideas'],
] as const)('states what SUGO does as the %s page heading', (locale, heading) => {
  render(<Hero locale={locale} />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(heading);
});

it('sends visitors straight to the drawing upload on the contact page', () => {
  render(<Hero locale="de" />);
  expect(screen.getByRole('link', { name: 'Zeichnung senden →' })).toHaveAttribute(
    'href',
    '/de/kontakt#risba',
  );
});
