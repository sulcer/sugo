'use client';

import { useState, type RefObject } from 'react';
import type { INQUIRY } from '@/content/inquiry';
import { INQUIRY_LIMITS } from '@/features/inquiry/limits';
import type { Locale } from '@/i18n/locales';
import { cn } from '@/lib/cn';

type DropZoneProps = {
  copy: (typeof INQUIRY)[Locale];
  onFiles: (files: File[]) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
};

const frame = 'border-ink/45';
const accept = INQUIRY_LIMITS.extensions.map((extension) => `.${extension}`).join(',');

/** The sheet the drawing is dropped on: a label, so the keyboard and the mouse take the same path. */
export function DropZone({ copy, onFiles, inputRef }: DropZoneProps) {
  const [over, setOver] = useState(false);

  return (
    <label
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        onFiles([...event.dataTransfer.files]);
      }}
      className={cn(
        'relative flex min-h-55 cursor-pointer items-center justify-center border-[1.5px] bg-panel',
        'focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-ink',
        over ? 'border-accent shadow-[inset_0_0_0_10px_rgb(31_63_191_/_0.06)]' : 'border-ink',
      )}
    >
      <span aria-hidden="true" className={cn('pointer-events-none absolute inset-2.5 border', frame)} />
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute right-2.5 bottom-2.5 grid border-t border-l',
          'grid-cols-[72px_96px_44px] grid-rows-[18px_18px]',
          frame,
        )}
      >
        <span className={cn('border-r border-b', frame)} />
        <span className={cn('border-r border-b', frame)} />
        <span className={cn('border-b', frame)} />
        <span className={cn('col-span-2 border-r', frame)} />
        <span />
      </span>
      <span className="relative flex flex-col items-center gap-2.5 px-6 text-center">
        <span className="font-mono text-[11px] leading-none font-medium tracking-[.14em] text-grey uppercase">
          {copy.formats}
        </span>
        <span className="text-[22px] font-medium tracking-[-.01em]">{copy.drop}</span>
        <span className="text-[15px] text-accent underline underline-offset-[3px]">{copy.pick}</span>
      </span>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={(event) => {
          onFiles([...(event.target.files ?? [])]);
          event.target.value = '';
        }}
        className="sr-only"
      />
    </label>
  );
}
