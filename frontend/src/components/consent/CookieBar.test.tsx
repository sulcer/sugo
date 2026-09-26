import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { COOKIE_NOTICE } from '@/content/shell';
import { CookieBar } from './CookieBar';

const copy = COOKIE_NOTICE.sl;
const gtag = vi.fn();

beforeEach(() => {
  localStorage.clear();
  window.scrollY = 0;
  window.gtag = gtag;
  gtag.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
  delete window.gtag;
});

const scrollTo = (y: number) =>
  act(() => {
    window.scrollY = y;
    window.dispatchEvent(new Event('scroll'));
  });

const renderBar = () => render(<CookieBar copy={copy} privacyHref="/varovanje-osebnih-podatkov" />);
const notice = () => screen.queryByRole('region', { name: copy.label });

it('stays out of the way above the fold', () => {
  renderBar();
  expect(notice()).not.toBeInTheDocument();
});

it('appears once the visitor has scrolled past the hero', () => {
  renderBar();
  scrollTo(600);
  expect(notice()).toBeInTheDocument();
});

it('links to the privacy policy', () => {
  renderBar();
  scrollTo(600);
  expect(screen.getByRole('link', { name: copy.more })).toHaveAttribute(
    'href',
    '/varovanje-osebnih-podatkov',
  );
});

it('remembers acceptance', async () => {
  renderBar();
  scrollTo(600);
  await userEvent.click(screen.getByRole('button', { name: copy.accept }));
  expect(localStorage.getItem('sugo-cookie')).toBe('yes');
});

it('grants analytics storage when accepted', async () => {
  renderBar();
  scrollTo(600);
  await userEvent.click(screen.getByRole('button', { name: copy.accept }));
  expect(gtag).toHaveBeenCalledWith('consent', 'update', { analytics_storage: 'granted' });
});

it('remembers a refusal', async () => {
  renderBar();
  scrollTo(600);
  await userEvent.click(screen.getByRole('button', { name: copy.decline }));
  expect(localStorage.getItem('sugo-cookie')).toBe('no');
});

it('goes away after a choice', async () => {
  renderBar();
  scrollTo(600);
  await userEvent.click(screen.getByRole('button', { name: copy.decline }));
  expect(notice()).not.toBeInTheDocument();
});

it('never asks again once the visitor has chosen', () => {
  localStorage.setItem('sugo-cookie', 'no');
  renderBar();
  scrollTo(600);
  expect(notice()).not.toBeInTheDocument();
});

it('still works when storage is blocked', async () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  renderBar();
  scrollTo(600);
  await userEvent.click(screen.getByRole('button', { name: copy.accept }));
  expect(notice()).not.toBeInTheDocument();
});
