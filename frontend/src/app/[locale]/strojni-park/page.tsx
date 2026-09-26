import { SheetMain } from '@/components/SheetMain';
import { SheetSection } from '@/components/SheetSection';
import { MACHINE_PARK } from '@/content/machine-park';
import { MachineGroup } from '@/features/machine-park/MachineGroup';
import { isLocale } from '@/i18n/locales';
import { metadataFor } from '@/i18n/metadata';

export const generateMetadata = metadataFor('park');

export default async function MachineParkPage({ params }: PageProps<'/[locale]/strojni-park'>) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const copy = MACHINE_PARK[locale];

  return (
    <SheetMain>
      <SheetSection number="01" divider={false} grid>
        <div className="flex min-w-0 flex-[1_1_600px] flex-wrap items-end justify-between gap-x-12 gap-y-5 px-4 pt-[clamp(8px,4cqw,64px)] pr-gutter pb-[clamp(32px,4cqw,56px)]">
          <div className="flex max-w-[40em] flex-col gap-4">
            <h1 className="m-0 text-page font-medium">{copy.title}</h1>
            <p className="m-0 text-lead text-grey">{copy.lead}</p>
          </div>
        </div>
      </SheetSection>
      <MachineGroup locale={locale} number="02" type="lathe" />
      <MachineGroup locale={locale} number="03" type="vmc" />
    </SheetMain>
  );
}
