import { act, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';
import { CurrentYear } from './CurrentYear';

afterEach(() => vi.useRealTimers());

it('replaces a stale prerendered year with the visitor year after hydration', async () => {
  const container = document.createElement('div');
  container.innerHTML = renderToString(<CurrentYear buildYear={2026} />);
  document.body.append(container);
  vi.useFakeTimers({ now: new Date('2031-01-02T08:00:00Z'), toFake: ['Date'] });
  await act(async () => {
    render(<CurrentYear buildYear={2026} />, { container, hydrate: true });
  });
  expect(container).toHaveTextContent('2031');
});

it('keeps the build year for visitors without javascript', () => {
  expect(renderToString(<CurrentYear buildYear={2026} />)).toContain('2026');
});
