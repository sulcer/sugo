import { describe, expect, it } from 'vitest';
import { LOCALES } from '@/i18n/locales';
import * as company from './company';
import * as contact from './contact';
import * as home from './home';
import * as inquiry from './inquiry';
import * as machinePark from './machine-park';
import * as machines from './machines';
import * as products from './products';
import * as privacy from './privacy';
import * as seo from './seo';
import * as shell from './shell';

/** Every `Localized` export, i.e. every object keyed by all three locales. */
const localizedExports = Object.entries({
  ...company,
  ...contact,
  ...home,
  ...inquiry,
  ...machinePark,
  ...machines,
  ...products,
  ...privacy,
  ...seo,
  ...shell,
}).flatMap(([name, value]) => collectLocalized(name, value));

function collectLocalized(path: string, value: unknown): [string, Record<string, unknown>][] {
  if (!value || typeof value !== 'object') return [];
  const record = value as Record<string, unknown>;
  if (LOCALES.every((locale) => locale in record)) return [[path, record]];
  return Object.entries(record).flatMap(([key, nested]) => collectLocalized(`${path}.${key}`, nested));
}

const shapeOf = (value: unknown): unknown =>
  Array.isArray(value)
    ? value.map(shapeOf)
    : value && typeof value === 'object'
      ? Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, shapeOf(nested)]))
      : typeof value;

const strings = (value: unknown): string[] =>
  typeof value === 'string'
    ? [value]
    : value && typeof value === 'object'
      ? Object.values(value).flatMap(strings)
      : [];

it('finds localized copy to check', () => {
  expect(localizedExports.length).toBeGreaterThan(0);
});

describe.each(localizedExports)('%s', (_name, record) => {
  it.each(LOCALES)('has the same structure in %s as in sl', (locale) => {
    expect(shapeOf(record[locale])).toEqual(shapeOf(record.sl));
  });

  it.each(LOCALES)('has no empty strings in %s', (locale) => {
    expect(strings(record[locale]).filter((text) => !text.trim())).toEqual([]);
  });
});
