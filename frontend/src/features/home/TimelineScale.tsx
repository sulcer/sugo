'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import { prefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

const FIRST_YEAR = 2009;
const LAST_YEAR = 2027;
const YEARS = Array.from({ length: LAST_YEAR - FIRST_YEAR + 1 }, (_, index) => FIRST_YEAR + index);
/** Leaders step up so neighbouring labels clear each other; a flipped label hangs left of its leader. */
const PLACEMENTS = [
  { level: 0, flip: false },
  { level: 1, flip: true },
  { level: 2, flip: false },
  { level: 0, flip: false },
];
/** A label may run this far past either end of the scale: the narrowest sheet margin. */
const LABEL_OVERHANG_PX = 16;
const ARM_DELAY_MS = 600;
const VISIBLE_RATIO = 0.6;
const START_MS = 200;
const LINE_MS = 1500;
const GAP_MS = 250;
const EVENT_STEP_MS = 520;

const position = (year: number) => ((year - FIRST_YEAR) / (LAST_YEAR - FIRST_YEAR)) * 100;
type TimelineEvent = { year: number; label: string };
type TimelineScaleProps = { events: readonly TimelineEvent[]; className?: string };

/** The company history as graduations on a measuring scale that plots itself when scrolled into view. */
export function TimelineScale({ events, className }: TimelineScaleProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const eventYears = new Set(events.map((event) => event.year));
  const tickHeight = (year: number) => (eventYears.has(year) ? 12 : year % 5 === 0 ? 9 : 5);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let animations: Animation[] = [];
    let armed = true;
    const onEntry = (entry: IntersectionObserverEntry) => {
      if (!entry.isIntersecting) {
        armed = true;
        return;
      }
      if (!armed || entry.intersectionRatio < VISIBLE_RATIO) return;
      armed = false;
      animations.forEach((animation) => animation.cancel());
      animations = plotTimeline(root);
    };
    // Entries queue up while the main thread is busy; replay them in order.
    const observer = new IntersectionObserver((entries) => entries.forEach(onEntry), {
      threshold: [0, VISIBLE_RATIO],
    });
    const arming = setTimeout(() => observer.observe(root), ARM_DELAY_MS);
    return () => {
      clearTimeout(arming);
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
    };
  }, []);

  return (
    <div ref={rootRef} aria-hidden="true" className={cn('@container relative h-[300px] w-full', className)}>
      {events.map((event, index) => {
        const { level, flip } = PLACEMENTS[index % PLACEMENTS.length];
        const height = 58 + level * 72;
        const x = position(event.year);
        return (
          <div
            key={event.year}
            data-tl="event"
            data-x={x}
            className="absolute bottom-[31px] w-0"
            style={{ left: `${x}%`, height: height + 50 }}
          >
            <div
              data-tl="label"
              className={cn(
                'absolute box-border flex w-max min-w-[120px] flex-col border-b border-ink pb-2 text-balance',
                flip ? 'right-0 pr-2.5 text-right' : 'left-0 pl-2.5 text-left',
              )}
              // One line, as drawn, while it fits beside its leader; wrapped rather than past the sheet.
              style={{
                bottom: height - 4,
                maxWidth: `calc(${flip ? x : 100 - x}cqw + ${LABEL_OVERHANG_PX}px)`,
              }}
            >
              <span className="text-[14px]/[1.35]">{event.label}</span>
            </div>
            <div
              data-tl="leader"
              className="absolute bottom-0 left-0 w-px origin-bottom bg-ink"
              style={{ height }}
            />
          </div>
        );
      })}
      <div data-tl="line" className="absolute inset-x-0 bottom-[30px] h-[1.5px] bg-ink" />
      <div data-tl="pen" className="absolute bottom-6 left-0 -ml-px h-3.5 w-0.5 bg-accent opacity-0" />
      {YEARS.map((year) => (
        <span
          key={year}
          data-tl="tick"
          data-x={position(year)}
          className="absolute bottom-[31px] w-px origin-bottom bg-ink"
          style={{ left: `${position(year)}%`, height: tickHeight(year) }}
        />
      ))}
      {YEARS.filter((year) => eventYears.has(year) || year % 5 === 0).map((year) => (
        <span
          key={year}
          data-tl="year"
          data-x={position(year)}
          className={cn(
            'absolute bottom-0 -translate-x-1/2 font-mono text-[11px]/none',
            eventYears.has(year) ? 'text-ink' : 'text-grey-light',
          )}
          style={{ left: `${position(year)}%` }}
        >
          {year}
        </span>
      ))}
    </div>
  );
}

/**
 * The pen draws the scale left to right, graduations and years appear as it passes, then each event's
 * leader rises and its label is written out. `backwards` fill hides everything during the delays and
 * lets the finished scale fall back to its static styles.
 */
function plotTimeline(root: HTMLElement): Animation[] {
  if (prefersReducedMotion() || typeof root.animate !== 'function') return [];
  const animations: Animation[] = [];
  const play = (element: Element, keyframes: Keyframe[], timing: { duration: number; delay: number }) =>
    animations.push(element.animate(keyframes, { easing: 'linear', fill: 'backwards', ...timing }));
  const passedAt = (element: HTMLElement) => START_MS + (Number(element.dataset.x) / 100) * LINE_MS;
  const all = (part: string) => root.querySelectorAll<HTMLElement>(`[data-tl="${part}"]`);

  all('line').forEach((line) =>
    play(line, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], {
      duration: LINE_MS,
      delay: START_MS,
    }),
  );
  all('pen').forEach((pen) =>
    play(
      pen,
      [
        { left: '0%', opacity: 1 },
        { left: '100%', opacity: 1, offset: 0.97 },
        { left: '100%', opacity: 0 },
      ],
      { duration: LINE_MS + 60, delay: START_MS },
    ),
  );
  all('tick').forEach((tick) =>
    play(tick, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], {
      duration: 80,
      delay: passedAt(tick),
    }),
  );
  all('year').forEach((year) =>
    play(year, [{ opacity: 0 }, { opacity: 1 }], { duration: 140, delay: passedAt(year) }),
  );
  all('event').forEach((event, index) => {
    const at = START_MS + LINE_MS + GAP_MS + index * EVENT_STEP_MS;
    const [label, leader] = [
      event.querySelector('[data-tl="label"]'),
      event.querySelector('[data-tl="leader"]'),
    ];
    if (leader)
      play(leader, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 240, delay: at });
    if (label) {
      play(
        label,
        [
          { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
          { opacity: 1, clipPath: 'inset(0 0% 0 0)' },
        ],
        { duration: 300, delay: at + 240 },
      );
    }
  });
  return animations;
}
