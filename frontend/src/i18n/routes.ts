import { DEFAULT_LOCALE, isLocale, type Locale } from './locales';

export const ROUTES = {
  home: '',
  park: 'strojni-park',
  products: 'izdelki',
  contact: 'kontakt',
  privacy: 'varovanje-osebnih-podatkov',
} as const;

export type RouteKey = keyof typeof ROUTES;

export const ROUTE_KEYS = Object.keys(ROUTES) as RouteKey[];

export function localePath(locale: Locale, route: RouteKey, hash?: string): string {
  const segments = [locale === DEFAULT_LOCALE ? '' : locale, ROUTES[route]].filter(Boolean);
  const path = `/${segments.join('/')}`;
  return hash ? `${path}#${hash}` : path;
}

export function parsePathname(pathname: string): { locale: Locale; route: RouteKey | null } {
  const segments = pathname.split('/').filter(Boolean);
  const [first = ''] = segments;
  const locale = isLocale(first) ? first : DEFAULT_LOCALE;
  const slug = (isLocale(first) ? segments.slice(1) : segments).join('/');
  const route = ROUTE_KEYS.find((key) => ROUTES[key] === slug) ?? null;
  return { locale, route };
}
