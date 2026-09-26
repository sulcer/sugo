import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteShell } from '@/components/SiteShell';
import { COMPANY } from '@/content/company';
import { LOCALES, isLocale } from '@/i18n/locales';
import { fontVariables } from '../fonts';
import '../globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(COMPANY.url),
  title: { default: 'SUGO d.o.o.', template: '%s · SUGO d.o.o.' },
  verification: { google: 'CXebyOWLWwNdOPbmKFNELNAifcrmyQqAxfGWviHy6mw' },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} className={fontVariables}>
      <body>
        <SiteShell locale={locale}>{children}</SiteShell>
      </body>
    </html>
  );
}
