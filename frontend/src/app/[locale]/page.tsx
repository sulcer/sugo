import { SheetMain } from '@/components/SheetMain';
import { Capabilities } from '@/features/home/Capabilities';
import { Hero } from '@/features/home/Hero';
import { Services } from '@/features/home/Services';
import { isLocale } from '@/i18n/locales';

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  return (
    <SheetMain>
      <Hero locale={locale} />
      <Services locale={locale} />
      <Capabilities locale={locale} />
    </SheetMain>
  );
}
