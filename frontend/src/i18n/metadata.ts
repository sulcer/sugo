import type { Metadata } from 'next';
import { COMPANY } from '@/content/company';
import { SEO } from '@/content/seo';
import { languageAlternates } from './alternates';
import { DEFAULT_LOCALE, isLocale, type Locale } from './locales';
import { localePath, type RouteKey } from './routes';

const OPEN_GRAPH_LOCALE: Record<Locale, string> = { sl: 'sl_SI', de: 'de_DE', en: 'en_GB' };

/** Title, description, canonical url, hreflang alternates and the link-preview card of a page. */
export function pageMetadata(locale: Locale, route: RouteKey): Metadata {
  const { title, description } = SEO[locale][route];
  const url = localePath(locale, route);
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(route) },
    openGraph: {
      type: 'website',
      siteName: COMPANY.name,
      locale: OPEN_GRAPH_LOCALE[locale],
      url,
      title: `${title} · ${COMPANY.name}`,
      description,
    },
  };
}

/** A page's `generateMetadata`: `export const generateMetadata = metadataFor('park');` */
export function metadataFor(route: RouteKey) {
  return async ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> => {
    const { locale } = await params;
    return pageMetadata(isLocale(locale) ? locale : DEFAULT_LOCALE, route);
  };
}
