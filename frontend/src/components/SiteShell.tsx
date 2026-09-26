import type { ReactNode } from 'react';
import { COOKIE_NOTICE } from '@/content/shell';
import type { Locale } from '@/i18n/locales';
import { localePath } from '@/i18n/routes';
import { Analytics } from './consent/Analytics';
import { CookieBar } from './consent/CookieBar';
import { SiteFooter } from './footer/SiteFooter';
import { SiteHeader } from './header/SiteHeader';

/** Everything around a sheet's main content: header, footer, the cookie notice and analytics. */
export function SiteShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <>
      <div className="sheet-page">
        <SiteHeader locale={locale} />
        {children}
        <SiteFooter locale={locale} />
      </div>
      <CookieBar copy={COOKIE_NOTICE[locale]} privacyHref={localePath(locale, 'privacy')} />
      <Analytics measurementId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ?? ''} />
    </>
  );
}
