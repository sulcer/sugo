import type { Metadata } from 'next';
import { NotFoundSheet } from '@/components/NotFoundSheet';
import { SheetMain } from '@/components/SheetMain';
import { SheetSection } from '@/components/SheetSection';
import { NOT_FOUND } from '@/content/shell';
import { isLocale } from '@/i18n/locales';

export async function generateMetadata({ params }: PageProps<'/[locale]/404'>): Promise<Metadata> {
  const { locale } = await params;
  return { title: isLocale(locale) ? NOT_FOUND[locale].title : '404', robots: { index: false } };
}

/** Served by the proxy, with status 404, for every unknown URL. */
export default async function NotFoundPage({ params }: PageProps<'/[locale]/404'>) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
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
