import { DEFAULT_LOCALE, isLocale } from './locales';
import { NOT_FOUND_SLUG, ROUTE_KEYS, ROUTES } from './routes';

export type ProxyDecision =
  | { action: 'next' }
  | { action: 'redirect'; pathname: string }
  | { action: 'rewrite'; pathname: string; status?: 404 };

const isKnownSlug = (slug: string) => ROUTE_KEYS.some((key) => ROUTES[key] === slug);

/**
 * Slovenian lives at the unprefixed URL (served from the /sl tree), German and English under their
 * prefix. `/sl/…` and mis-cased prefixes redirect to the canonical URL. Anything that is not a known
 * page is answered with the locale's statically generated not-found sheet and status 404.
 */
export function decideProxy(pathname: string): ProxyDecision {
  const [first = '', ...rest] = pathname.split('/').filter(Boolean);
  const prefix = first.toLowerCase();

  if (isLocale(prefix) && (prefix !== first || prefix === DEFAULT_LOCALE)) {
    const segments = [prefix === DEFAULT_LOCALE ? '' : prefix, ...rest].filter(Boolean);
    return { action: 'redirect', pathname: `/${segments.join('/')}` };
  }

  const locale = isLocale(first) ? first : DEFAULT_LOCALE;
  const slug = (isLocale(first) ? rest : [first, ...rest]).filter(Boolean).join('/');
  if (!isKnownSlug(slug)) return { action: 'rewrite', pathname: `/${locale}/${NOT_FOUND_SLUG}`, status: 404 };
  if (isLocale(first)) return { action: 'next' };
  return { action: 'rewrite', pathname: `/${DEFAULT_LOCALE}${slug ? `/${slug}` : ''}` };
}
