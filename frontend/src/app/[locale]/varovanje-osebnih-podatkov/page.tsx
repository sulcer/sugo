import { SheetMain } from '@/components/SheetMain';
import { SheetSection } from '@/components/SheetSection';
import { PrivacyStatement } from '@/features/privacy/PrivacyStatement';
import { isLocale } from '@/i18n/locales';
import { metadataFor } from '@/i18n/metadata';

export const generateMetadata = metadataFor('privacy');

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
