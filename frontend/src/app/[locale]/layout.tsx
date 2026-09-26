import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { IBM_Plex_Mono, Instrument_Sans } from 'next/font/google';
import { LOCALES, isLocale } from '@/i18n/locales';
import '../globals.css';

const sans = Instrument_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-instrument-sans',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500'],
  variable: '--font-plex-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://sugo.si'),
};

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} className={`${sans.variable} ${mono.variable}`}>
      <body>
        <div className="sheet-page">{children}</div>
      </body>
    </html>
  );
}
