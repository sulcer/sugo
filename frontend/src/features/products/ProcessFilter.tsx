import { useId, type RefObject } from 'react';
import type { Process } from '@/content/parts';
import type { ProductsCopy } from '@/content/products';

const OPTIONS = ['all', 'turning', 'milling', 'plastic'] as const;

type ProcessFilterProps = {
  copy: ProductsCopy;
  counts: Record<Process | 'all', number>;
  value: Process | 'all';
  onChange: (value: Process | 'all') => void;
  /** The empty state hands focus back to the first chip after a reset. */
  allRef: RefObject<HTMLButtonElement | null>;
};

/** One chip per machining process, each with the number of parts behind it. */
export function ProcessFilter({ copy, counts, value, onChange, allRef }: ProcessFilterProps) {
  const labelId = useId();

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
              className="flex h-[42px] cursor-pointer items-center gap-2 border-r border-ink px-4 text-[15px] aria-pressed:bg-ink aria-pressed:text-panel"
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
