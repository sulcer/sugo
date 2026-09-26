import type { Locale } from '@/i18n/locales';
import { NotFoundSheet } from './NotFoundSheet';
import { SheetMain } from './SheetMain';
import { SheetSection } from './SheetSection';

/** The not-found sheet as the page's main content, for the localized and the global 404. */
export function NotFoundMain({ locale }: { locale: Locale }) {
  return (
    <SheetMain>
      <SheetSection number="01" divider={false} grid>
        <div className="flex min-w-0 flex-[1_1_600px] justify-center px-4 pt-[clamp(8px,4cqw,64px)] pr-gutter pb-[clamp(48px,5cqw,72px)]">
          <NotFoundSheet locale={locale} />
        </div>
      </SheetSection>
    </SheetMain>
  );
}
