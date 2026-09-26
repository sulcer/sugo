import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

type SheetSectionProps = ComponentProps<'section'> & {
  number: string;
  grid?: boolean;
  divider?: boolean;
};

/** A numbered zone of the drawing sheet: the zone number sits in the margin rail, content follows. */
export function SheetSection({
  number,
  grid = false,
  divider = true,
  className,
  children,
  ...rest
}: SheetSectionProps) {
  return (
    <section
      className={cn('flex flex-wrap', divider && 'border-t border-rule', grid && 'sheet-grid', className)}
      {...rest}
    >
      <div className="sheet-rail" aria-hidden="true">
        {number}
      </div>
      {children}
    </section>
  );
}
