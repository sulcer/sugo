import { SheetSection } from '@/components/SheetSection';
import { MACHINE_PARK } from '@/content/machine-park';
import { machineRows, type MachineType } from '@/content/machines';
import type { Locale } from '@/i18n/locales';
import { MachineRow } from './MachineRow';

type MachineGroupProps = { locale: Locale; number: string; type: MachineType };

/** One zone of the sheet: the machines of a single type, headed by how many of them there are. */
export function MachineGroup({ locale, number, type }: MachineGroupProps) {
  const copy = MACHINE_PARK[locale];
  const machines = machineRows(locale).filter((machine) => machine.type === type);
  return (
    <SheetSection number={number}>
      <div className="flex min-w-0 flex-[1_1_600px] flex-col gap-6 px-4 pt-[clamp(8px,2.2cqw,28px)] pr-gutter pb-[clamp(40px,5cqw,64px)]">
        <div className="flex flex-wrap items-baseline gap-4">
          <h2 className="m-0 text-section font-medium">{type === 'lathe' ? copy.lathes : copy.vmcs}</h2>
          <span className="font-mono text-sm text-grey">({machines.length})</span>
        </div>
        <ul role="list" className="border-t-[1.5px] border-ink">
          {machines.map((machine) => (
            <MachineRow key={machine.kind} machine={machine} locale={locale} />
          ))}
        </ul>
      </div>
    </SheetSection>
  );
}
