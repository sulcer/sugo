import type { Metadata } from 'next';
import { SheetMain } from '@/components/SheetMain';
import { SheetSection } from '@/components/SheetSection';
import { PRODUCTS } from '@/content/products';
import { catalogParts } from '@/features/products/catalog-parts';
import { ProductCatalog } from '@/features/products/ProductCatalog';
import { isLocale } from '@/i18n/locales';

export async function generateMetadata({ params }: PageProps<'/[locale]/izdelki'>): Promise<Metadata> {
  const { locale } = await params;
  return { title: isLocale(locale) ? PRODUCTS[locale].title : undefined };
}

export default async function ProductsPage({ params }: PageProps<'/[locale]/izdelki'>) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const copy = PRODUCTS[locale];

  return (
    <SheetMain>
      <SheetSection number="01" divider={false} grid>
        <div className="flex max-w-[52em] min-w-0 flex-[1_1_600px] flex-col gap-4 pt-[clamp(8px,4cqw,64px)] pr-gutter pb-[clamp(32px,4cqw,48px)] pl-4">
          <h1 className="text-page font-medium">{copy.title}</h1>
          <p className="text-lead text-grey">{copy.lead}</p>
        </div>
      </SheetSection>
      <SheetSection number="02">
        <div className="flex min-w-0 flex-[1_1_600px] flex-col gap-6 pt-[clamp(8px,2.2cqw,24px)] pr-gutter pb-[clamp(48px,5cqw,72px)] pl-4">
          <ProductCatalog copy={copy} parts={catalogParts(locale)} />
        </div>
      </SheetSection>
    </SheetMain>
  );
}
