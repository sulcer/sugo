'use client';

import { useEffect, useRef, useState } from 'react';
import { HOME } from '@/content/home';
import type { Locale } from '@/i18n/locales';
import { useCurrentYear } from '@/lib/use-current-year';
import { prefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

const FOUNDED = 2010;
const MACHINES = 6;
const PROJECTS = 1500;
const ARM_DELAY_MS = 600;
const VISIBLE_RATIO = 0.9;
const COUNT_MS = 1400;

type CountersProps = { locale: Locale; buildYear: number };

/**
 * Three figures that count up (ease-out) each time the strip comes fully into view. They render
 * final for the server, for reduced motion and for assistive tech, which never hears the count.
 */
export function Counters({ locale, buildYear }: CountersProps) {
  const rootRef = useRef<HTMLUListElement>(null);
  const [progress, setProgress] = useState(1);
  const labels = HOME[locale].counters;
  const counters = [
    { value: useCurrentYear(buildYear) - FOUNDED, suffix: '', label: labels.years },
    { value: MACHINES, suffix: '', label: labels.machines },
    { value: PROJECTS, suffix: '+', label: labels.projects },
  ];
  const eased = 1 - (1 - progress) ** 3;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    let frame = 0;
    let armed = true;
    const countUp = () => {
      let start: number | undefined;
      const step = (now: number) => {
        start ??= now;
        const next = Math.min(1, (now - start) / COUNT_MS);
        setProgress(next);
        if (next < 1) frame = requestAnimationFrame(step);
      };
      setProgress(0);
      frame = requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          armed = true;
          cancelAnimationFrame(frame);
          setProgress(0);
          return;
        }
        if (!armed || entry.intersectionRatio < VISIBLE_RATIO) return;
        armed = false;
        countUp();
      },
      { threshold: [0, VISIBLE_RATIO] },
    );
    const arming = setTimeout(() => observer.observe(root), ARM_DELAY_MS);
    return () => {
      clearTimeout(arming);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <ul
      ref={rootRef}
      className="box-border grid w-[min(560px,100%)] grid-cols-3 gap-px border-[1.5px] border-ink bg-ink/30"
    >
      {counters.map(({ value, suffix, label }) => (
        <li
          key={label}
          className="flex min-w-0 flex-col items-center gap-2 bg-paper px-[clamp(8px,2.4cqw,36px)] pt-[18px] pb-4"
        >
          <span
            aria-hidden="true"
            className="font-mono text-[clamp(30px,2.8cqw,40px)]/none tracking-[-.02em] tabular-nums"
          >
            {Math.round(value * eased)}
            {progress === 1 && suffix}
          </span>
          <span className="sr-only">
            {value}
            {suffix}
          </span>{' '}
          <span className="text-center font-mono text-[10px]/[1.2] font-medium tracking-[.14em] text-grey uppercase">
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}
