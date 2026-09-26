import type { Metadata } from 'next';
import { SheetMain } from '@/components/SheetMain';
import { SheetSection } from '@/components/SheetSection';
import { PRIVACY } from '@/content/privacy';
import { DEFAULT_LOCALE, isLocale } from '@/i18n/locales';
import { PrivacyStatement } from '@/features/privacy/PrivacyStatement';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/varovanje-osebnih-podatkov'>): Promise<Metadata> {
  const { locale } = await params;
  return { title: PRIVACY[isLocale(locale) ? locale : DEFAULT_LOCALE].title };
}

export default async function PrivacyPage({ params }: PageProps<'/[locale]/varovanje-osebnih-podatkov'>) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  return (
    <SheetMain>
      <SheetSection number="01" divider={false}>
        <PrivacyStatement locale={locale} />
      </SheetSection>
    </SheetMain>
  );
}
