import { MACHINE_PARK } from '@/content/machine-park';
import type { MachineListing } from '@/content/machines';
import { TechnicalDrawing } from '@/drawing/TechnicalDrawing';
import type { Locale } from '@/i18n/locales';

/** One machine of the park: its number, name and type, its elevation, and its work envelope. */
export function MachineRow({ machine, locale }: { machine: MachineListing; locale: Locale }) {
  const envelopeLabel = `envelope-${machine.kind}`;
  return (
    <li className="border-b border-rule">
      <div className="box-border flex w-full flex-wrap items-center gap-x-8 gap-y-4 py-5">
        <span className="flex-[0_0_32px] self-start pt-1 font-mono text-[13px] font-medium text-grey">
          {machine.no}
        </span>
        <span className="flex min-w-0 flex-[1_1_220px] flex-col gap-1.5 self-start">
          <span className="text-[20px] font-medium tracking-[-.01em] hyphens-manual">{machine.name}</span>
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
          <span id={envelopeLabel} className="pb-1.5 label-mono">
            {MACHINE_PARK[locale].env}
          </span>
          <dl aria-labelledby={envelopeLabel} className="m-0 flex flex-col gap-1.5">
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
  );
}
