import { SheetSection } from '@/components/SheetSection';
import { cn } from '@/lib/cn';
import { HOME } from '@/content/home';
import type { Locale } from '@/i18n/locales';

const LABEL_COLUMN = 'min-w-0 flex-[1_1_240px] p-0 text-left';
const VALUE_COLUMN = 'min-w-0 flex-[1.5_1_300px] p-0 text-left';

/**
 * A real table, laid out as the design's wrapping rows (the value drops below its label on narrow
 * sheets). The explicit roles keep the table semantics that WebKit drops for non-table display.
 */
export function Capabilities({ locale }: { locale: Locale }) {
  const copy = HOME[locale];
  return (
    <SheetSection number="03">
      <div className="min-w-0 flex-[1_1_240px] px-4 pt-[clamp(8px,2.2cqw,28px)]">
        <h2 id="capabilities" className="text-section font-medium">
          {copy.capabilitiesTitle}
        </h2>
      </div>
      <div className="min-w-0 flex-[2.8_1_560px] pt-[clamp(16px,2.2cqw,28px)] pr-gutter pb-[clamp(48px,5cqw,72px)] pl-4">
        <table role="table" aria-labelledby="capabilities" className="block">
          <thead role="rowgroup" className="block">
            <tr role="row" className="flex flex-wrap gap-x-6 gap-y-1 border-b-[1.5px] border-ink pb-2.5">
              <th role="columnheader" scope="col" className={cn(LABEL_COLUMN, 'label-mono')}>
                {copy.columns.item}
              </th>
              <th role="columnheader" scope="col" className={cn(VALUE_COLUMN, 'label-mono')}>
                {copy.columns.value}
              </th>
            </tr>
          </thead>
          <tbody role="rowgroup" className="block">
            {copy.capabilities.map((capability) => (
              <tr
                key={capability.label}
                role="row"
                className="flex flex-wrap items-baseline gap-x-6 gap-y-1.5 border-b border-rule py-4.5"
              >
                <th
                  role="rowheader"
                  scope="row"
                  className={cn(LABEL_COLUMN, 'text-[15px]/[1.4] font-normal text-grey')}
                >
                  {capability.label}
                </th>
                {capability.unit ? (
                  <td role="cell" className={cn(VALUE_COLUMN, 'font-mono text-[18px]/[1.35] tabular-nums')}>
                    {/* The mono space (0.6em) less 0.1em leaves the design's 0.5em before the unit. */}
                    {capability.value}{' '}
                    <span className="-ml-[.1em] font-light text-grey">{capability.unit}</span>
                  </td>
                ) : (
                  <td role="cell" className={cn(VALUE_COLUMN, 'text-[17px]/[1.45]')}>
                    {capability.value}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SheetSection>
  );
}
