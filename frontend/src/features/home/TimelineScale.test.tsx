import { render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { stubIntersectionObserver } from '@/test/stub-intersection-observer';
import { TimelineScale } from './TimelineScale';

let reducedMotion = false;
let scrollIntoView: ReturnType<typeof stubIntersectionObserver>;
const animate = vi.fn(() => ({ cancel: vi.fn() }));

beforeEach(() => {
  vi.useFakeTimers();
  reducedMotion = false;
  animate.mockClear();
  scrollIntoView = stubIntersectionObserver();
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('reduce') && reducedMotion }));
  HTMLElement.prototype.animate = animate as unknown as HTMLElement['animate'];
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  delete (HTMLElement.prototype as Partial<HTMLElement>).animate;
});

const arm = () => vi.advanceTimersByTime(600);

it('stands each event on the scale at its year', () => {
  const { container } = render(<TimelineScale locale="sl" />);
  const [founded] = container.querySelectorAll<HTMLElement>('[data-tl="event"]');
  expect(parseFloat(founded.style.left)).toBeCloseTo((100 * (2010 - 2009)) / 18);
});

it('graduates the scale yearly from 2009 to 2027', () => {
  const { container } = render(<TimelineScale locale="sl" />);
  expect(container.querySelectorAll('[data-tl="tick"]')).toHaveLength(19);
});

it('numbers the event years and every fifth year', () => {
  const { container } = render(<TimelineScale locale="sl" />);
  expect([...container.querySelectorAll('[data-tl="year"]')].map((year) => year.textContent)).toEqual([
    '2010',
    '2015',
    '2019',
    '2020',
    '2022',
    '2025',
  ]);
});

it('is decoration for sighted visitors; the list tells assistive tech', () => {
  const { container } = render(<TimelineScale locale="sl" />);
  expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
});

it('plots itself once 60% of it is in view', () => {
  render(<TimelineScale locale="sl" />);
  arm();
  scrollIntoView(0.6);
  expect(animate).toHaveBeenCalled();
});

it('waits until 60% of it is in view', () => {
  render(<TimelineScale locale="sl" />);
  arm();
  scrollIntoView(0.4);
  expect(animate).not.toHaveBeenCalled();
});

it('plots again after it was scrolled away and back', () => {
  render(<TimelineScale locale="sl" />);
  arm();
  scrollIntoView(0.6);
  const once = animate.mock.calls.length;
  scrollIntoView(0);
  scrollIntoView(0.6);
  expect(animate).toHaveBeenCalledTimes(2 * once);
});

it('stays drawn for visitors who reduce motion', () => {
  reducedMotion = true;
  render(<TimelineScale locale="sl" />);
  arm();
  scrollIntoView(1);
  expect(animate).not.toHaveBeenCalled();
});
