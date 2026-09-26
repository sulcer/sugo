import { render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { SiteFooter } from './SiteFooter';

afterEach(() => vi.useRealTimers());

const renderFooter = (locale: 'sl' | 'de' | 'en' = 'sl') => render(<SiteFooter locale={locale} />);

it('lists both phone numbers as tel: links', () => {
  renderFooter();
  expect(screen.getAllByRole('link', { name: /^\+386/ }).map((link) => link.getAttribute('href'))).toEqual([
    'tel:+38631876138',
    'tel:+38631557929',
  ]);
});

it('links the e-mail address', () => {
  renderFooter();
  expect(screen.getByRole('link', { name: 'cncgolob@gmail.com' })).toHaveAttribute(
    'href',
    'mailto:cncgolob@gmail.com',
  );
});

it('shows the tax and registration numbers', () => {
  renderFooter();
  const footer = screen.getByRole('contentinfo');
  expect([within(footer).getByText('59203676'), within(footer).getByText('8550859000')]).toHaveLength(2);
});

it('names the country in the visitor language', () => {
  renderFooter('de');
  expect(screen.getByText(/Slowenien/)).toBeInTheDocument();
});

it('links the privacy policy of the current language', () => {
  renderFooter('en');
  expect(screen.getByRole('link', { name: 'Privacy policy' })).toHaveAttribute(
    'href',
    '/en/varovanje-osebnih-podatkov',
  );
});

it('always shows the current year in the copyright', () => {
  vi.useFakeTimers({ now: new Date('2031-03-01T12:00:00Z'), toFake: ['Date'] });
  renderFooter();
  expect(screen.getByRole('contentinfo')).toHaveTextContent('© 2031 SUGO d.o.o.');
});
