import { SheetMain } from '@/components/SheetMain';
import { About } from '@/features/home/About';
import { Capabilities } from '@/features/home/Capabilities';
import { Hero } from '@/features/home/Hero';
import { Production } from '@/features/home/Production';
import { Services } from '@/features/home/Services';
import { localBusiness } from '@/features/home/structured-data';
import { isLocale } from '@/i18n/locales';
import { metadataFor } from '@/i18n/metadata';

export const generateMetadata = metadataFor('home');

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  return (
    <SheetMain>
      <script
        type="application/ld+json"
        // `<` escaped so the JSON can never close the script element.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness(locale)).replace(/</g, '\\u003c') }}
      />
      <Hero locale={locale} />
      <Services locale={locale} />
      <Capabilities locale={locale} />
      <About locale={locale} />
      <Production locale={locale} />
    </SheetMain>
  );
}
