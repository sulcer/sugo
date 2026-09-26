import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { PRODUCTS } from '@/content/products';
import type { Locale } from '@/i18n/locales';
import { catalogParts } from './catalog-parts';
import { ProductCatalog } from './ProductCatalog';

vi.mock('@/three/model-scene', () => ({
  createModelScene: () => ({
    canvas: document.createElement('canvas'),
    pose: vi.fn(),
    render: vi.fn(),
    spinTo: vi.fn(),
    restAngle: 0,
    dispose: vi.fn(),
  }),
}));
vi.mock('@/three/spin', () => ({ startSpin: () => vi.fn() }));

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }));
});

afterEach(() => vi.unstubAllGlobals());

/** The card's title block; the drawing above it carries its own text (dimensions, section marks). */
const captionOf = (name: string) =>
  screen.getByRole('button', { name }).closest('li')?.querySelector('[data-caption]')?.textContent;

const renderCatalog = (locale: Locale) =>
  render(<ProductCatalog copy={PRODUCTS[locale]} parts={catalogParts(locale)} />);

const captions = () =>
  screen.getAllByRole('listitem').map((card) => card.querySelector('[data-caption]')?.textContent);

it('shows the whole catalogue before anything is filtered', () => {
  renderCatalog('sl');
  expect(screen.getAllByRole('listitem')).toHaveLength(20);
});

it('counts the parts of every process on its chip', () => {
  renderCatalog('sl');
  expect(screen.getByRole('group', { name: 'Postopek' }).textContent).toBe(
    'Vse 20Struženje 13Rezkanje 6Plastika 1',
  );
});

it('shows only the milled parts when milling is chosen', async () => {
  renderCatalog('sl');
  await userEvent.click(screen.getByRole('button', { name: /Rezkanje/ }));
  expect(screen.getAllByRole('listitem')).toHaveLength(6);
});

it('marks the chosen process chip as the pressed one', async () => {
  renderCatalog('sl');
  await userEvent.click(screen.getByRole('button', { name: /Rezkanje/ }));
  expect(
    screen.getByRole('group', { name: 'Postopek' }).querySelectorAll('[aria-pressed="true"]')[0]?.textContent,
  ).toBe('Rezkanje 6');
});

it('announces how many parts of the catalogue are shown', async () => {
  renderCatalog('sl');
  await userEvent.click(screen.getByRole('button', { name: /Rezkanje/ }));
  expect(screen.getByRole('status')).toHaveTextContent('6 / 20 prikazanih delov');
});

it('offers only the materials the parts are actually made of', () => {
  renderCatalog('sl');
  expect(
    [...screen.getByLabelText('Material').querySelectorAll('option')].map((option) => [
      option.value,
      option.textContent,
    ]),
  ).toEqual([
    ['all', 'Vsi materiali'],
    ['brass', 'medenina'],
    ['PVC', 'PVC'],
  ]);
});

it('says so when no part matches both filters', async () => {
  renderCatalog('sl');
  await userEvent.click(screen.getByRole('button', { name: /Rezkanje/ }));
  await userEvent.selectOptions(screen.getByLabelText('Material'), 'PVC');
  expect(screen.getByText('Za izbrani filter ni delov.')).toBeInTheDocument();
});

it('restores the whole catalogue when the filters are reset', async () => {
  renderCatalog('sl');
  await userEvent.click(screen.getByRole('button', { name: /Rezkanje/ }));
  await userEvent.selectOptions(screen.getByLabelText('Material'), 'PVC');
  await userEvent.click(screen.getByRole('button', { name: 'Ponastavi filtre' }));
  expect(screen.getAllByRole('listitem')).toHaveLength(20);
});

it('moves focus to the process chips after a reset, so the empty state is not a dead end', async () => {
  renderCatalog('sl');
  await userEvent.click(screen.getByRole('button', { name: /Rezkanje/ }));
  await userEvent.selectOptions(screen.getByLabelText('Material'), 'PVC');
  await userEvent.click(screen.getByRole('button', { name: 'Ponastavi filtre' }));
  expect(screen.getByRole('button', { name: /Vse/ })).toHaveFocus();
});

it('captions a part with its number, name, process and confirmed material', () => {
  renderCatalog('sl');
  expect(captionOf('Medeninasta matica')).toBe('20Medeninasta maticastruženje · medenina');
});

it('leaves an unconfirmed material out of the caption instead of a placeholder', () => {
  renderCatalog('sl');
  expect(captionOf('Nosilna plošča z žepi')).toBe('01Nosilna plošča z žepirezkanje');
});

it('keeps the catalogue numbers of the parts while a filter is on', async () => {
  renderCatalog('de');
  await userEvent.click(screen.getByRole('button', { name: /Fräsen/ }));
  expect(captions().map((caption) => caption?.slice(0, 2))).toEqual(['01', '02', '07', '13', '14', '15']);
});
