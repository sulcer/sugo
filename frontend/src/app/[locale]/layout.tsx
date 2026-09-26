import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { IBM_Plex_Mono, Instrument_Sans } from 'next/font/google';
import { Analytics } from '@/components/consent/Analytics';
import { CookieBar } from '@/components/consent/CookieBar';
import { SiteFooter } from '@/components/footer/SiteFooter';
import { SiteHeader } from '@/components/header/SiteHeader';
import { COMPANY } from '@/content/company';
import { COOKIE_NOTICE } from '@/content/shell';
import { LOCALES, isLocale } from '@/i18n/locales';
import { localePath } from '@/i18n/routes';
import '../globals.css';

const sans = Instrument_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-instrument-sans',
});

// No metric-adjusted Arial fallback: glyphs outside the Latin subsets (→ ↗ ✓ ●) must fall back to
// the system monospace, as in the design.
const mono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500'],
  variable: '--font-plex-mono',
  adjustFontFallback: false,
  fallback: ['monospace'],
});

export const metadata: Metadata = {
  metadataBase: new URL(COMPANY.url),
  title: { default: 'SUGO d.o.o.', template: '%s · SUGO d.o.o.' },
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
