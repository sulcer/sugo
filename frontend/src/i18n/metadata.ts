import type { Metadata } from 'next';
import { COMPANY } from '@/content/company';
import { SEO } from '@/content/seo';
import { languageAlternates } from './alternates';
import { DEFAULT_LOCALE, isLocale, type Locale } from './locales';
import { localePath, type RouteKey } from './routes';

/** The link-preview card: the top of the home sheet (public/og.png). */
const SHARE_CARD = { url: '/og.png', width: 1200, height: 630 };

const OPEN_GRAPH_LOCALE: Record<Locale, string> = { sl: 'sl_SI', de: 'de_DE', en: 'en_GB' };

/** Title, description, canonical url, hreflang alternates and the link-preview card of a page. */
export function pageMetadata(locale: Locale, route: RouteKey): Metadata {
  const { title, description } = SEO[locale][route];
  const url = localePath(locale, route);
  const branded = `${title} · ${COMPANY.name}`;
  return {
    // The layout's title template applies to child segments only; the home page shares its segment.
    title: route === 'home' ? { absolute: branded } : title,
    description,
    alternates: { canonical: url, languages: languageAlternates(route) },
    openGraph: {
      type: 'website',
      siteName: COMPANY.name,
      locale: OPEN_GRAPH_LOCALE[locale],
      url,
      title: branded,
      description,
      images: [{ ...SHARE_CARD, alt: `${COMPANY.name} — ${SEO[locale].home.title}` }],
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
