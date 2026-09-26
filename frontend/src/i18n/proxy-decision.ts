import { DEFAULT_LOCALE, isLocale } from './locales';

export type ProxyDecision = { action: 'next' } | { action: 'redirect' | 'rewrite'; pathname: string };

/** Slovenian lives at the unprefixed URL; `/sl/...` is folded back onto it, everything else is Slovenian. */
export function decideProxy(pathname: string): ProxyDecision {
  const [first = ''] = pathname.split('/').filter(Boolean);
  if (first.toLowerCase() === DEFAULT_LOCALE) {
    return { action: 'redirect', pathname: pathname.slice(first.length + 1) || '/' };
  }
  if (isLocale(first)) return { action: 'next' };
  return { action: 'rewrite', pathname: `/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}` };
}
