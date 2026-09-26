import { PARTS, type Part } from '@/content/parts';
import { PRODUCTS } from '@/content/products';
import type { Locale } from '@/i18n/locales';

/** A part as the browser gets it: one locale, with its sheet number and caption already made. */
export type CatalogPart = Omit<Part, 'name'> & {
  name: string;
  number: string;
  /** The process alone, or `process · material` once the client has confirmed the material. */
  caption: string;
};

/** Resolves the catalogue on the server so no other locale's copy reaches the client bundle. */
export function catalogParts(locale: Locale): CatalogPart[] {
  const copy = PRODUCTS[locale];
  return PARTS.map(({ name, ...part }, index) => ({
    ...part,
    name: name[locale],
    number: String(index + 1).padStart(2, '0'),
    caption: [copy.process[part.process], part.material && copy.material[part.material]]
      .filter(Boolean)
      .join(' · '),
  }));
}
