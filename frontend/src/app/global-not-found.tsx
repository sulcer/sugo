import type { Metadata } from 'next';
import { NotFoundMain } from '@/components/NotFoundMain';
import { SiteShell } from '@/components/SiteShell';
import { COMPANY } from '@/content/company';
import { NOT_FOUND } from '@/content/shell';
import { DEFAULT_LOCALE } from '@/i18n/locales';
import { fontVariables } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: `${NOT_FOUND[DEFAULT_LOCALE].title} · ${COMPANY.name}`,
  robots: { index: false },
};

/**
 * Unknown URLs the proxy never sees (those with a dot, such as /pregled.php) match no route at all.
 * They get the Slovenian not-found sheet; every other unknown URL gets the localized one.
 */
export default function GlobalNotFound() {
  return (
    <html lang={DEFAULT_LOCALE} className={fontVariables}>
      <body>
        <SiteShell locale={DEFAULT_LOCALE}>
          <NotFoundMain locale={DEFAULT_LOCALE} />
        </SiteShell>
      </body>
    </html>
  );
}
