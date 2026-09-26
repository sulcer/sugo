import type { Ref } from 'react';

type OperationStripProps = {
  /** The six operation names, N10 … N60. */
  operations: readonly string[];
  /** Index of the running operation; −1 before the first, `operations.length` once all are done. */
  current: number;
  /** Shows the DRO (on strips wide enough for it). */
  readoutVisible?: boolean;
  readoutX?: Ref<HTMLSpanElement>;
  readoutZ?: Ref<HTMLSpanElement>;
};

/** The machine's program strip under the hero: operations tick off as the part is turned. */
export function OperationStrip({
  operations,
  current,
  readoutVisible = false,
  readoutX,
  readoutZ,
}: OperationStripProps) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 flex h-11 flex-wrap overflow-hidden border border-ink/30 bg-paper @max-[560px]:h-22"
    >
      {operations.map((operation, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'pending';
        return (
          <div
            key={operation}
            data-op={state}
            className="group flex min-w-0 flex-1 basis-0 flex-col justify-center gap-1.25 border-r border-rule px-2 transition-shadow duration-150 ease-linear data-[op=active]:shadow-[inset_0_-2px_0_var(--color-accent)] @max-[560px]:box-border @max-[560px]:h-10.75 @max-[560px]:flex-[0_0_33.333%] @max-[560px]:border-b"
          >
            <span className="font-mono text-[10px] leading-none font-medium tracking-[.1em] text-grey">
              N{i + 1}0
            </span>
            <span
              data-op-label=""
              className="truncate font-mono text-[12px] leading-[1.1] font-medium text-grey-light group-data-[op=active]:text-accent group-data-[op=done]:text-ink"
            >
              {operation}
              {state === 'done' && <span data-op-mark=""> ✓</span>}
            </span>
          </div>
        );
      })}
      <div
        className="hidden min-w-29.5 flex-none flex-col justify-center gap-1.25 px-3 font-mono text-[11px] leading-none tabular-nums @min-[620px]:flex"
        style={{ opacity: readoutVisible ? 1 : 0 }}
      >
        <span ref={readoutX}>X Ø 69.000</span>
        <span ref={readoutZ}>Z 0.000</span>
      </div>
    </div>
  );
}
