import { NAVIGATION } from '@/content/shell';
import type { Locale } from '@/i18n/locales';
import { Logo } from '../Logo';
import { HeaderBar } from './HeaderBar';

export function SiteHeader({ locale }: { locale: Locale }) {
  const copy = NAVIGATION[locale];
  return (
    <header className="sticky top-0 z-30 border-b border-ink bg-paper text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:border focus:border-ink focus:bg-panel focus:px-3 focus:py-2 focus:text-sm"
      >
        {copy.skipToContent}
      </a>
      <HeaderBar locale={locale} copy={copy} logo={<Logo className="h-10 w-auto @nav:h-11.5" />} />
    </header>
  );
}
