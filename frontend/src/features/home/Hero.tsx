import Link from 'next/link';
import { SheetSection } from '@/components/SheetSection';
import { HOME } from '@/content/home';
import type { Locale } from '@/i18n/locales';
import { localePath } from '@/i18n/routes';
import { HeroMachining } from './HeroMachining';

export function Hero({ locale }: { locale: Locale }) {
  const copy = HOME[locale];
  return (
    <SheetSection number="01" grid divider={false}>
      <div className="flex min-w-0 flex-[1_1_380px] flex-col justify-center gap-7 px-4 pt-[clamp(8px,5cqw,88px)] pb-[clamp(32px,4cqw,72px)]">
        <h1 className="text-display font-medium text-balance hyphens-manual">{copy.h1}</h1>
        <p className="max-w-[34em] text-[clamp(17px,1.45cqw,20px)]/[1.5] text-pretty text-grey">{copy.sub}</p>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-4 pt-1">
          <Link href={localePath(locale, 'contact', 'risba')} className="button-primary">
            {copy.cta} <span className="font-mono">→</span>
          </Link>
        </div>
      </div>
      <div className="flex min-w-0 flex-[1.45_1_500px] flex-col justify-center gap-5 pt-[clamp(16px,3cqw,48px)] pr-gutter pb-[clamp(24px,3cqw,48px)] pl-4">
        <HeroMachining operations={copy.operations} />
      </div>
    </SheetSection>
  );
}
