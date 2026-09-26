import { COMPANY } from '@/content/company';
import { SEO } from '@/content/seo';
import type { Locale } from '@/i18n/locales';

/** schema.org `LocalBusiness` for the home page, from the company record. */
export function localBusiness(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: COMPANY.name,
    description: SEO[locale].home.description,
    url: COMPANY.url,
    email: COMPANY.email,
    telephone: COMPANY.phones.map((phone) => phone.href.replace('tel:', '')),
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.street,
      postalCode: COMPANY.postalCode,
      addressLocality: COMPANY.locality,
      addressCountry: 'SI',
    },
    foundingDate: String(COMPANY.founded),
    taxID: COMPANY.taxNumber,
  };
}
