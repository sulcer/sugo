import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { COOKIE_NOTICE } from '@/content/shell';

const copy = COOKIE_NOTICE.sl;
const gtag = vi.fn();

let pageHeight = 3000;

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  window.scrollY = 0;
  pageHeight = 3000;
  vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockImplementation(() => pageHeight);
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

/** A fresh module per test: the consent store keeps page-view state in module scope. */
const renderBar = async () => {
  const { CookieBar } = await import('./CookieBar');
  return render(<CookieBar copy={copy} privacyHref="/varovanje-osebnih-podatkov" />);
};
const notice = () => screen.queryByRole('region', { name: copy.label });

it('stays out of the way above the fold', async () => {
  await renderBar();
  expect(notice()).not.toBeInTheDocument();
});

it('appears once the visitor has scrolled past the hero', async () => {
  await renderBar();
  scrollTo(600);
  expect(notice()).toBeInTheDocument();
});

it('links to the privacy policy', async () => {
  await renderBar();
  scrollTo(600);
  expect(screen.getByRole('link', { name: copy.more })).toHaveAttribute(
    'href',
    '/varovanje-osebnih-podatkov',
  );
});

it('remembers acceptance', async () => {
  await renderBar();
  scrollTo(600);
  await userEvent.click(screen.getByRole('button', { name: copy.accept }));
  expect(localStorage.getItem('sugo-cookie')).toBe('yes');
});

it('grants analytics storage when accepted', async () => {
  await renderBar();
  scrollTo(600);
  await userEvent.click(screen.getByRole('button', { name: copy.accept }));
  expect(gtag).toHaveBeenCalledWith('consent', 'update', { analytics_storage: 'granted' });
});

it('asks straight away on a page too short to scroll past the hero', async () => {
  pageHeight = window.innerHeight + 200;
  await renderBar();
  expect(notice()).toBeInTheDocument();
});

it('denies analytics storage when refused', async () => {
  await renderBar();
  scrollTo(600);
  await userEvent.click(screen.getByRole('button', { name: copy.decline }));
  expect(gtag).toHaveBeenCalledWith('consent', 'update', { analytics_storage: 'denied' });
});

it('remembers a refusal', async () => {
  await renderBar();
  scrollTo(600);
  await userEvent.click(screen.getByRole('button', { name: copy.decline }));
  expect(localStorage.getItem('sugo-cookie')).toBe('no');
});

it('goes away after a choice', async () => {
  await renderBar();
  scrollTo(600);
  await userEvent.click(screen.getByRole('button', { name: copy.decline }));
  expect(notice()).not.toBeInTheDocument();
});

it('never asks again once the visitor has chosen', async () => {
  localStorage.setItem('sugo-cookie', 'no');
  await renderBar();
  scrollTo(600);
  expect(notice()).not.toBeInTheDocument();
});

it('goes away when storage cannot save the choice but can still be read', async () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('quota exceeded');
  });
  await renderBar();
  scrollTo(600);
  await userEvent.click(screen.getByRole('button', { name: copy.accept }));
  expect(notice()).not.toBeInTheDocument();
});

it('still works when storage is blocked', async () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  await renderBar();
  scrollTo(600);
  await userEvent.click(screen.getByRole('button', { name: copy.accept }));
  expect(notice()).not.toBeInTheDocument();
});
