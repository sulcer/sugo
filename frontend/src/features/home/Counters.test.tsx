import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { stubIntersectionObserver } from '@/test/stub-intersection-observer';
import { Counters } from './Counters';

let reducedMotion = false;
let scrollIntoView: ReturnType<typeof stubIntersectionObserver>;
let frames: FrameRequestCallback[] = [];

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
  vi.setSystemTime(new Date(2026, 8, 26));
  reducedMotion = false;
  frames = [];
  scrollIntoView = stubIntersectionObserver();
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('reduce') && reducedMotion }));
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback));
  vi.stubGlobal('cancelAnimationFrame', () => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/** What sighted visitors see: the animated figures. */
const figures = () =>
  [...document.querySelectorAll('li > [aria-hidden="true"]')].map((figure) => figure.textContent);
/** What assistive tech reads: everything that is not aria-hidden. */
const spoken = (item: HTMLElement) => {
  const copy = item.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('[aria-hidden="true"]').forEach((hidden) => hidden.remove());
  return copy.textContent;
};
const arm = () => act(() => vi.advanceTimersByTime(600));
const frameAt = (time: number) =>
  act(() => {
    const due = frames;
    frames = [];
    due.forEach((callback) => callback(time));
  });

it('shows the final figures before it is armed', () => {
  render(<Counters locale="sl" buildYear={2026} />);
  expect(figures()).toEqual(['16', '6', '1500+']);
});

it('counts years in business from the visitor’s current year', () => {
  vi.setSystemTime(new Date(2031, 0, 2));
  render(<Counters locale="sl" buildYear={2026} />);
  expect(figures()[0]).toBe('21');
});

it('drops to zero while out of view', () => {
  render(<Counters locale="sl" buildYear={2026} />);
  arm();
  scrollIntoView(0);
  expect(figures()).toEqual(['0', '0', '0']);
});

it('counts up with an ease-out once 90% of it is in view, the plus sign last', () => {
  render(<Counters locale="sl" buildYear={2026} />);
  arm();
  scrollIntoView(0);
  scrollIntoView(0.9);
  frameAt(1000);
  frameAt(1700);
  expect(figures()).toEqual(['14', '5', '1313']);
});

it('lands on the final figures after 1.4 s', () => {
  render(<Counters locale="sl" buildYear={2026} />);
  arm();
  scrollIntoView(0);
  scrollIntoView(1);
  frameAt(1000);
  frameAt(2400);
  expect(figures()).toEqual(['16', '6', '1500+']);
});

it('waits until 90% of it is in view', () => {
  render(<Counters locale="sl" buildYear={2026} />);
  arm();
  scrollIntoView(0);
  scrollIntoView(0.5);
  expect(frames).toHaveLength(0);
});

it('keeps the final figures for visitors who reduce motion', () => {
  reducedMotion = true;
  render(<Counters locale="sl" buildYear={2026} />);
  arm();
  scrollIntoView(0);
  scrollIntoView(0.5);
  expect(figures()).toEqual(['16', '6', '1500+']);
});

it('gives assistive tech the final figures with their labels, even mid-count', () => {
  render(<Counters locale="en" buildYear={2026} />);
  arm();
  scrollIntoView(0);
  expect(screen.getAllByRole('listitem').map(spoken)).toEqual([
    '16 years in business',
    '6 CNC machines',
    '1500+ projects',
  ]);
});
