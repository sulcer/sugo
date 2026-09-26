import { SheetSection } from '@/components/SheetSection';
import { HOME } from '@/content/home';
import type { Locale } from '@/i18n/locales';
import { TimelineList } from './TimelineList';
import { TimelineScale } from './TimelineScale';

export function About({ locale }: { locale: Locale }) {
  const copy = HOME[locale];
  const [intro, business] = copy.paragraphs;
  return (
    <SheetSection number="04">
      <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-5 px-4 pt-[clamp(8px,2.2cqw,28px)] pb-[clamp(32px,4cqw,72px)]">
        <h2 className="text-section font-medium">{copy.aboutTitle}</h2>
        <p className="max-w-[34em] text-[17px]/[1.6] text-pretty">{intro}</p>
        <p className="max-w-[34em] text-[17px]/[1.6] text-pretty text-grey">{business}</p>
      </div>
      <div className="flex min-w-0 flex-[1.5_1_520px] items-end pt-[clamp(16px,3cqw,40px)] pr-gutter pb-[clamp(48px,5cqw,72px)] pl-4">
        {/* The scale is drawn on wide sheets; the list, always present for assistive tech, on narrow ones. */}
        <TimelineScale locale={locale} className="@max-wide:hidden" />
        <TimelineList locale={locale} className="@wide:sr-only" />
      </div>
    </SheetSection>
  );
}
