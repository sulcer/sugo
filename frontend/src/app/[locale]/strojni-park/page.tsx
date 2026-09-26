import type { Metadata } from 'next';
import { SheetMain } from '@/components/SheetMain';
import { SheetSection } from '@/components/SheetSection';
import { MACHINE_PARK } from '@/content/machine-park';
import { machineRows } from '@/content/machines';
import { TechnicalDrawing } from '@/drawing/TechnicalDrawing';
import { DEFAULT_LOCALE, isLocale } from '@/i18n/locales';

export async function generateMetadata({ params }: PageProps<'/[locale]/strojni-park'>): Promise<Metadata> {
  const { locale } = await params;
  return { title: MACHINE_PARK[isLocale(locale) ? locale : DEFAULT_LOCALE].title };
}

export default async function MachineParkPage({ params }: PageProps<'/[locale]/strojni-park'>) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const copy = MACHINE_PARK[locale];
  const rows = machineRows(locale);
  const groups = [
    { number: '02', title: copy.lathes, type: 'lathe' },
    { number: '03', title: copy.vmcs, type: 'vmc' },
  ] as const;

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

      {groups.map((group) => (
        <SheetSection key={group.number} number={group.number}>
          <div className="flex min-w-0 flex-[1_1_600px] flex-col gap-6 px-4 pt-[clamp(8px,2.2cqw,28px)] pr-gutter pb-[clamp(40px,5cqw,64px)]">
            <div className="flex flex-wrap items-baseline gap-4">
              <h2 className="m-0 text-section font-medium">{group.title}</h2>
              <span className="font-mono text-sm text-grey">
                ({rows.filter((machine) => machine.type === group.type).length})
              </span>
            </div>
            <ol className="border-t-[1.5px] border-ink">
              {rows
                .filter((machine) => machine.type === group.type)
                .map((machine) => (
                  <li key={machine.kind} className="border-b border-rule">
                    <div className="box-border flex w-full flex-wrap items-center gap-x-8 gap-y-4 py-5">
                      <span className="flex-[0_0_32px] self-start pt-1 font-mono text-[13px] font-medium text-grey">
                        {machine.no}
                      </span>
                      <span className="flex min-w-0 flex-[1_1_220px] flex-col gap-1.5 self-start">
                        <span className="text-[20px] font-medium tracking-[-.01em] hyphens-manual">
                          {machine.name}
                        </span>
                        <span className="text-[15px] text-grey">{machine.typeLabel}</span>
                      </span>
                      <TechnicalDrawing
                        subject={{ type: 'machine', kind: machine.kind }}
                        nominalWidth={300}
                        aspect={1.3}
                        hover="envelope"
                        className="block max-w-[300px] flex-[1_1_260px]"
                      />
                      <div className="flex flex-[0_1_190px] flex-col gap-1.5 self-start">
                        <span className="pb-1.5 label-mono">{copy.env}</span>
                        <dl className="m-0 flex flex-col gap-1.5">
                          {machine.figures.map(([axis, value]) => (
                            <div
                              key={axis}
                              className="grid grid-cols-[24px_1fr_32px] items-baseline border-b border-ink/12 py-1 font-mono text-[17px] leading-[1.3] tabular-nums"
                            >
                              <dt className="text-accent">{axis}</dt>
                              <dd className="col-span-2 m-0 grid grid-cols-subgrid items-baseline">
                                <span className="text-right">{value}</span>
                                <span className="text-right text-[14px] font-light text-grey">mm</span>
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    </div>
                  </li>
                ))}
            </ol>
          </div>
        </SheetSection>
      ))}
    </SheetMain>
  );
}
