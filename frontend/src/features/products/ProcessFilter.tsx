import { useId, type RefObject } from 'react';
import { PARTS, type Process } from '@/content/parts';
import type { PRODUCTS } from '@/content/products';
import type { Locale } from '@/i18n/locales';
import { processCounts } from './filter-parts';

const OPTIONS = ['all', 'turning', 'milling', 'plastic'] as const;

type ProcessFilterProps = {
  copy: (typeof PRODUCTS)[Locale];
  value: Process | 'all';
  onChange: (value: Process | 'all') => void;
  /** The empty state hands focus back to the first chip after a reset. */
  allRef: RefObject<HTMLButtonElement | null>;
};

/** One chip per machining process, each with the number of parts behind it. */
export function ProcessFilter({ copy, value, onChange, allRef }: ProcessFilterProps) {
  const labelId = useId();
  const counts = processCounts(PARTS);

  return (
    <div className="flex flex-col gap-2.5">
      <span id={labelId} className="label-mono">
        {copy.processLabel}
      </span>
      <div role="group" aria-labelledby={labelId} className="flex flex-wrap border border-ink">
        {OPTIONS.map((option) => {
          const label = option === 'all' ? copy.all : copy.process[option];
          return (
            <button
              key={option}
              ref={option === 'all' ? allRef : undefined}
              type="button"
              aria-pressed={value === option}
              onClick={() => onChange(option)}
              className="flex h-[42px] cursor-pointer items-center gap-2 border-r border-ink px-4 text-[15px] aria-pressed:cursor-auto aria-pressed:bg-ink aria-pressed:text-panel"
            >
              {label.charAt(0).toUpperCase() + label.slice(1)}{' '}
              <span className="font-mono text-xs opacity-75">{counts[option]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
