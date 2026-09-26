import { act, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';

vi.mock('next/script', () => ({
  default: ({ id, src, children }: { id?: string; src?: string; children?: ReactNode }) => (
    <script data-testid="script" data-id={id} data-src={src}>
      {children}
    </script>
  ),
}));

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
});

const renderAnalytics = async () => {
  const { Analytics } = await import('./Analytics');
  return render(<Analytics measurementId="G-TEST123" />);
};

it('loads nothing before the visitor has chosen', async () => {
  const { container } = await renderAnalytics();
  expect(container.querySelectorAll('script')).toHaveLength(0);
});

it('loads nothing after a refusal', async () => {
  localStorage.setItem('sugo-cookie', 'no');
  const { container } = await renderAnalytics();
  expect(container.querySelectorAll('script')).toHaveLength(0);
});

it('loads Google Analytics once the visitor accepts', async () => {
  const { container } = await renderAnalytics();
  const { writeConsent } = await import('./consent-store');
  act(() => writeConsent('yes'));
  expect(container.querySelector('[data-src]')).toHaveAttribute(
    'data-src',
    'https://www.googletagmanager.com/gtag/js?id=G-TEST123',
  );
});

it('loads Google Analytics right away for a visitor who accepted before', async () => {
  localStorage.setItem('sugo-cookie', 'yes');
  const { container } = await renderAnalytics();
  expect(container.querySelectorAll('script')).toHaveLength(2);
});

it('keeps the tag switched off for a visitor who refused', async () => {
  localStorage.setItem('sugo-cookie', 'no');
  const { unmount } = await renderAnalytics();
  const disabled = (window as unknown as Record<string, unknown>)['ga-disable-G-TEST123'];
  unmount();
  expect(disabled).toBe(true);
});
