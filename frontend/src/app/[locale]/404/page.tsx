import type { Metadata } from 'next';
import { NotFoundMain } from '@/components/NotFoundMain';
import { NOT_FOUND } from '@/content/shell';
import { isLocale } from '@/i18n/locales';

export async function generateMetadata({ params }: PageProps<'/[locale]/404'>): Promise<Metadata> {
  const { locale } = await params;
  return { title: isLocale(locale) ? NOT_FOUND[locale].title : '404', robots: { index: false } };
}

/** Served by the proxy, with status 404, for every unknown URL. */
export default async function NotFoundPage({ params }: PageProps<'/[locale]/404'>) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  return <NotFoundMain locale={locale} />;
}
