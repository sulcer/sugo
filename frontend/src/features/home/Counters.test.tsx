import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { stubIntersectionObserver } from '@/test/stub-intersection-observer';
import { HOME } from '@/content/home';
import { Counters } from './Counters';

let reducedMotion = false;
let scrollIntoView: ReturnType<typeof stubIntersectionObserver>['scrollIntoView'];
let isObserving: ReturnType<typeof stubIntersectionObserver>['isObserving'];
let frames: FrameRequestCallback[] = [];

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
  vi.setSystemTime(new Date(2026, 8, 26));
  reducedMotion = false;
  frames = [];
  ({ scrollIntoView, isObserving } = stubIntersectionObserver());
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
  render(<Counters labels={HOME.sl.counters} buildYear={2026} />);
  expect(figures()).toEqual(['16', '6', '1500+']);
});

it('counts years in business from the visitor’s current year', () => {
  vi.setSystemTime(new Date(2031, 0, 2));
  render(<Counters labels={HOME.sl.counters} buildYear={2026} />);
  expect(figures()[0]).toBe('21');
});

it('drops to zero while out of view', () => {
  render(<Counters labels={HOME.sl.counters} buildYear={2026} />);
  arm();
  scrollIntoView(0);
  expect(figures()).toEqual(['0', '0', '0']);
});

it('counts up with an ease-out once 90% of it is in view, the plus sign last', () => {
  render(<Counters labels={HOME.sl.counters} buildYear={2026} />);
  arm();
  scrollIntoView(0);
  scrollIntoView(0.9);
  frameAt(1000);
  frameAt(1700);
  expect(figures()).toEqual(['14', '5', '1313']);
});

it('lands on the final figures after 1.4 s', () => {
  render(<Counters labels={HOME.sl.counters} buildYear={2026} />);
  arm();
  scrollIntoView(0);
  scrollIntoView(1);
  frameAt(1000);
  frameAt(2400);
  expect(figures()).toEqual(['16', '6', '1500+']);
});

it('waits until 90% of it is in view', () => {
  render(<Counters labels={HOME.sl.counters} buildYear={2026} />);
  arm();
  scrollIntoView(0);
  scrollIntoView(0.5);
  expect(frames).toHaveLength(0);
});

it('keeps the final figures for visitors who reduce motion', () => {
  reducedMotion = true;
  render(<Counters labels={HOME.sl.counters} buildYear={2026} />);
  arm();
  scrollIntoView(0);
  scrollIntoView(0.5);
  expect(figures()).toEqual(['16', '6', '1500+']);
});

it('gives assistive tech the final figures with their labels, even mid-count', () => {
  render(<Counters labels={HOME.en.counters} buildYear={2026} />);
  arm();
  scrollIntoView(0);
  expect(screen.getAllByRole('listitem').map(spoken)).toEqual([
    '16 years in business',
    '6 CNC machines',
    '1500+ projects',
  ]);
});

it('keeps its list semantics in Safari, which drops them for unstyled lists', () => {
  render(<Counters labels={HOME.en.counters} buildYear={2026} />);
  expect(screen.getByRole('list')).toHaveAttribute('role', 'list');
});

it('does nothing until it has been on the page for 600 ms', () => {
  render(<Counters labels={HOME.sl.counters} buildYear={2026} />);
  act(() => vi.advanceTimersByTime(599));
  scrollIntoView(0);
  expect(figures()).toEqual(['16', '6', '1500+']);
});

it('counts once per visit, however the strip moves while in view', () => {
  render(<Counters labels={HOME.sl.counters} buildYear={2026} />);
  arm();
  scrollIntoView(0);
  scrollIntoView(0.9);
  frameAt(1000);
  scrollIntoView(0.5);
  scrollIntoView(0.95);
  frameAt(1700);
  expect(figures()).toEqual(['14', '5', '1313']);
});

it('catches up with entries the browser queued into one report', () => {
  render(<Counters labels={HOME.sl.counters} buildYear={2026} />);
  arm();
  scrollIntoView(0, 0.95);
  frameAt(1000);
  frameAt(1700);
  expect(figures()).toEqual(['14', '5', '1313']);
});

it('shows the final figures once the visitor turns motion off, even mid-count', () => {
  render(<Counters labels={HOME.sl.counters} buildYear={2026} />);
  arm();
  scrollIntoView(0);
  scrollIntoView(0.9);
  frameAt(1000);
  reducedMotion = true;
  scrollIntoView(0);
  expect(figures()).toEqual(['16', '6', '1500+']);
});

it('stops watching the viewport when it leaves the page', () => {
  const { unmount } = render(<Counters labels={HOME.sl.counters} buildYear={2026} />);
  arm();
  unmount();
  expect(isObserving()).toBe(false);
});
