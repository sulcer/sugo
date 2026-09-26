'use client';

import { useRef, useState } from 'react';
import { PARTS, type Material, type Process } from '@/content/parts';
import { PRODUCTS } from '@/content/products';
import { PartModel } from '@/features/parts/PartModel';
import type { Locale } from '@/i18n/locales';
import { filterParts } from './filter-parts';
import { MaterialFilter } from './MaterialFilter';
import { ProcessFilter } from './ProcessFilter';

/** Width a card's drawing is first laid out for; it is re-measured before the first paint. */
const CARD_WIDTH = 290;

/** The catalogue of parts: two filters, the result line, the cards and the footnote. */
export function ProductCatalog({ locale }: { locale: Locale }) {
  const copy = PRODUCTS[locale];
  const [process, setProcess] = useState<Process | 'all'>('all');
  const [material, setMaterial] = useState<Material | 'all'>('all');
  const allChip = useRef<HTMLButtonElement>(null);
  const shown = filterParts(PARTS, { process, material });

  const reset = () => {
    setProcess('all');
    setMaterial('all');
    allChip.current?.focus();
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b-[1.5px] border-ink pb-4">
        <ProcessFilter copy={copy} value={process} onChange={setProcess} allRef={allChip} />
        <MaterialFilter copy={copy} value={material} onChange={setMaterial} />
      </div>

      <p aria-live="polite" className="font-mono text-xs leading-none text-grey">
        {shown.length} / {PARTS.length} {copy.result}
      </p>

      {shown.length > 0 ? (
        <ul
          role="list"
          className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-px border border-ink/20 bg-ink/20"
        >
          {shown.map((part) => (
            <li key={part.kind} className="flex flex-col bg-panel">
              <div className="px-5.5 pt-5.5 pb-3.5">
                <PartModel
                  kind={part.kind}
                  tone={part.tone}
                  label={part.name[locale]}
                  nominalWidth={CARD_WIDTH}
                />
              </div>
              <div
                data-caption=""
                className="mt-auto flex gap-px border-t border-ink/20 bg-ink/20 font-mono text-xs leading-[1.3]"
              >
                <span className="flex-none bg-panel p-2.5">
                  {String(PARTS.indexOf(part) + 1).padStart(2, '0')}
                </span>
                <span className="flex min-w-0 flex-auto flex-col gap-0.75 bg-panel p-2.5">
                  <span className="font-sans text-sm leading-[1.25] font-medium">{part.name[locale]}</span>
                  <span className="text-grey">
                    {[copy.process[part.process], part.material && copy.material[part.material]]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-start gap-3.5 border border-ink/35 bg-panel px-6 py-12">
          <span className="text-lg">{copy.empty}</span>
          <button
            type="button"
            onClick={reset}
            className="cursor-pointer border-b border-ink text-[15px] hover:border-accent hover:text-accent"
          >
            {copy.reset}
          </button>
        </div>
      )}

      <p className="font-mono text-xs leading-[1.5] text-grey italic">{copy.footnote}</p>
    </>
  );
}
