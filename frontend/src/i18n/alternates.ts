import { DEFAULT_LOCALE, LOCALES, type Locale } from './locales';
import { localePath, type RouteKey } from './routes';

/** A page's path in every language (hreflang), with the Slovenian one as `x-default`. */
export function languageAlternates(route: RouteKey): Record<Locale | 'x-default', string> {
  const paths = Object.fromEntries(LOCALES.map((locale) => [locale, localePath(locale, route)]));
  return { ...(paths as Record<Locale, string>), 'x-default': localePath(DEFAULT_LOCALE, route) };
}
