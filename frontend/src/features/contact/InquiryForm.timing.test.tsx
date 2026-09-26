import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { INQUIRY } from '@/content/inquiry';
import type { InquiryState } from '@/features/inquiry/handle-inquiry';
import { INQUIRY_LIMITS } from '@/features/inquiry/limits';
import { InquiryForm } from './InquiryForm';

const copy = INQUIRY.sl;
const action = vi.fn<(previous: InquiryState, form: FormData) => Promise<InquiryState>>();

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] });
  action.mockReset().mockResolvedValue({ status: 'sent' });
  render(<InquiryForm locale="sl" privacyHref="/varovanje-osebnih-podatkov" action={action} />);
  // An autofilled address and a quick tick, sent right away.
  fireEvent.change(screen.getByLabelText(new RegExp(copy.email)), { target: { value: 'ana@primer.si' } });
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.submit(screen.getByRole('button', { name: new RegExp(copy.send) }).closest('form')!);
});

afterEach(() => vi.useRealTimers());

it('holds a quick visitor’s inquiry until the spam guard’s minimum has passed', () => {
  expect(action).not.toHaveBeenCalled();
});

it('then sends it, timed so the server keeps it', async () => {
  // The minimum plus the form's small safety margin.
  await act(() => vi.advanceTimersByTimeAsync(INQUIRY_LIMITS.minFillMs + 50));
  expect(Number(action.mock.calls[0]?.[1].get('elapsedMs'))).toBeGreaterThanOrEqual(INQUIRY_LIMITS.minFillMs);
});
