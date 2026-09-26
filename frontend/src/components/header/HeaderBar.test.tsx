import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import { NAVIGATION } from '@/content/shell';
import type { Locale } from '@/i18n/locales';
import { HeaderBar } from './HeaderBar';

const navigation = vi.hoisted(() => ({ pathname: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => navigation.pathname }));

beforeEach(() => {
  navigation.pathname = '/';
});

const renderAt = (pathname: string, locale: Locale) => {
  navigation.pathname = pathname;
  return render(<HeaderBar locale={locale} copy={NAVIGATION[locale]} logo={<span>SUGO</span>} />);
};

const languageLinks = () =>
  within(screen.getByRole('group', { name: /jezik|sprache|language/i })).getAllByRole('link');

it('marks the current sheet in the navigation', () => {
  renderAt('/de/izdelki', 'de');
  const primary = screen.getByRole('navigation', { name: 'Menü' });
  expect(within(primary).getByRole('link', { name: /Produkte/ })).toHaveAttribute('aria-current', 'page');
});

it('numbers the sheets like drawing zones', () => {
  renderAt('/', 'sl');
  const primary = screen.getByRole('navigation', { name: 'Meni' });
  expect(
    within(primary)
      .getAllByRole('link')
      .map((link) => link.textContent),
  ).toEqual(['02Strojni park', '03Izdelki', '04Kontakt']);
});

it('links every language to the same page', () => {
  renderAt('/izdelki', 'sl');
  expect(languageLinks().map((link) => link.getAttribute('href'))).toEqual([
    '/izdelki',
    '/de/izdelki',
    '/en/izdelki',
  ]);
});

it('marks the active language', () => {
  renderAt('/en/kontakt', 'en');
  expect(languageLinks().map((link) => link.getAttribute('aria-current'))).toEqual([null, null, 'true']);
});

it('sends language links to the home page when the current url is unknown', () => {
  renderAt('/de/gibt-es-nicht', 'de');
  expect(languageLinks().map((link) => link.getAttribute('href'))).toEqual(['/', '/de', '/en']);
});

it('opens the sheet menu from the menu button', async () => {
  renderAt('/', 'sl');
  await userEvent.click(screen.getByRole('button', { name: /Meni/ }));
  expect(screen.getByRole('button', { name: /Meni/ })).toHaveAttribute('aria-expanded', 'true');
});

it('lists the sheets with their descriptions in the menu', async () => {
  renderAt('/', 'sl');
  await userEvent.click(screen.getByRole('button', { name: /Meni/ }));
  expect(screen.getByRole('link', { name: /Šest CNC strojev z delovnimi prostori/ })).toHaveAttribute(
    'href',
    '/strojni-park',
  );
});

it('closes the menu with Escape', async () => {
  renderAt('/', 'sl');
  await userEvent.click(screen.getByRole('button', { name: /Meni/ }));
  await userEvent.keyboard('{Escape}');
  expect(screen.getByRole('button', { name: /Meni/ })).toHaveAttribute('aria-expanded', 'false');
});

it('closes the menu with its close button', async () => {
  renderAt('/', 'sl');
  await userEvent.click(screen.getByRole('button', { name: /Meni/ }));
  await userEvent.click(screen.getByRole('button', { name: /Zapri/ }));
  expect(screen.queryByRole('link', { name: /Šest CNC strojev/ })).not.toBeInTheDocument();
});

it('closes the menu when a sheet is chosen', async () => {
  renderAt('/', 'sl');
  await userEvent.click(screen.getByRole('button', { name: /Meni/ }));
  await userEvent.click(screen.getByRole('link', { name: /Pošljite risbo · podatki · lokacija/ }));
  expect(screen.getByRole('button', { name: /Meni/ })).toHaveAttribute('aria-expanded', 'false');
});
