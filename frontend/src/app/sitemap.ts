import type { MetadataRoute } from 'next';
import { COMPANY } from '@/content/company';
import { languageAlternates } from '@/i18n/alternates';
import { LOCALES } from '@/i18n/locales';
import { localePath, ROUTE_KEYS } from '@/i18n/routes';

const absolute = (path: string) => (path === '/' ? COMPANY.url : `${COMPANY.url}${path}`);

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTE_KEYS.flatMap((route) => {
    const languages = Object.fromEntries(
      Object.entries(languageAlternates(route)).map(([language, path]) => [language, absolute(path)]),
    );
    return LOCALES.map((locale) => ({ url: absolute(localePath(locale, route)), alternates: { languages } }));
  });
}
