import { SheetSection } from '@/components/SheetSection';
import { COMPANY } from '@/content/company';
import { CONTACT } from '@/content/contact';
import { TechnicalDrawing } from '@/drawing/TechnicalDrawing';
import type { Locale } from '@/i18n/locales';

/** Where the workshop is, drawn rather than photographed, with the way out to a real map. */
export function Location({ locale }: { locale: Locale }) {
  const copy = CONTACT[locale];
  return (
    <SheetSection number="02">
      <div className="flex min-w-0 flex-[1_1_600px] flex-wrap gap-x-14 gap-y-10 px-4 pt-[clamp(8px,2.2cqw,28px)] pr-gutter pb-[clamp(48px,5cqw,72px)]">
        <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-4">
          <h2 className="m-0 text-section font-medium">{copy.locationTitle}</h2>
          <p className="m-0 text-[17px] leading-[1.55]">
            {COMPANY.street}
            <br />
            {COMPANY.city}
            <br />
            {COMPANY.country[locale]}
          </p>
        </div>
        <div className="flex min-w-0 flex-[2.4_1_440px] flex-col gap-4">
          <div className="border border-ink/30 bg-panel p-4">
            <TechnicalDrawing subject={{ type: 'map' }} nominalWidth={690} aspect={1.58} className="w-full" />
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <span className="font-mono text-xs leading-[1.4] text-grey">{copy.schematic}</span>
            <a
              href={COMPANY.mapsUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-11 items-center border-b border-ink pb-0.5 text-[16px] no-underline hover:border-accent"
            >
              {copy.maps}↗
            </a>
          </div>
        </div>
      </div>
    </SheetSection>
  );
}
