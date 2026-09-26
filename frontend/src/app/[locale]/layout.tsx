import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Analytics } from '@/components/consent/Analytics';
import { CookieBar } from '@/components/consent/CookieBar';
import { SiteFooter } from '@/components/footer/SiteFooter';
import { SiteHeader } from '@/components/header/SiteHeader';
import { COMPANY } from '@/content/company';
import { COOKIE_NOTICE } from '@/content/shell';
import { LOCALES, isLocale } from '@/i18n/locales';
import { localePath } from '@/i18n/routes';
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
        <div className="sheet-page">
          <SiteHeader locale={locale} />
          {children}
          <SiteFooter locale={locale} />
        </div>
        <CookieBar copy={COOKIE_NOTICE[locale]} privacyHref={localePath(locale, 'privacy')} />
        <Analytics measurementId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ?? ''} />
      </body>
    </html>
  );
}
