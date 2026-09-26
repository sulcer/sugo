import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { PrivacyStatement } from './PrivacyStatement';

it('titles the statement', () => {
  render(<PrivacyStatement locale="sl" />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Izjava o varovanju osebnih podatkov');
});

it('numbers its seven sections', () => {
  render(<PrivacyStatement locale="en" />);
  expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([
    '01 · General',
    '02 · Data controller',
    '03 · Purpose of personal data processing',
    '04 · Contact form',
    '05 · Retention period',
    '06 · Individual rights',
    '07 · Cookies',
  ]);
});

it('names the data controller from the company record', () => {
  render(<PrivacyStatement locale="de" />);
  expect(screen.getByRole('group', { name: 'Verantwortlicher' })).toHaveTextContent(
    'SUGO d.o.o.Spodnji Jakobski Dol 45, 2222 Jakobski Dolcncgolob@gmail.com',
  );
});

it('lists the five rights as a list', () => {
  render(<PrivacyStatement locale="en" />);
  expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
    'Right to rectification',
    'Right to erasure',
    'Right to restriction of processing',
    'Right to lodge a complaint',
    'Right to data portability',
  ]);
});

it('describes the analytics cookie in a table', () => {
  render(<PrivacyStatement locale="sl" />);
  expect(screen.getAllByRole('row').map((row) => [...row.children].map((cell) => cell.textContent))).toEqual([
    ['Ime', 'Namen', 'Trajanje'],
    ['_ga', 'Analitični piškotek, ki se uporablja za izračun podatkov o obisku spletnega mesta', '2 leti'],
  ]);
});
