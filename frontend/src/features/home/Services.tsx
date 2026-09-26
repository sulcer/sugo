import { SheetSection } from '@/components/SheetSection';
import { HOME } from '@/content/home';
import type { Locale } from '@/i18n/locales';

export function Services({ locale }: { locale: Locale }) {
  const copy = HOME[locale];
  return (
    <SheetSection number="02">
      <div className="flex min-w-0 flex-[1_1_240px] flex-col gap-3 px-4 pt-[clamp(8px,2.2cqw,28px)]">
        <h2 className="text-section font-medium">{copy.servicesTitle}</h2>
        <p className="text-[17px]/[1.5] text-grey">{copy.servicesLead}</p>
      </div>
      <ul
        role="list"
        className="flex min-w-0 flex-[2.8_1_560px] flex-wrap gap-8 pt-[clamp(16px,2.2cqw,28px)] pr-gutter pb-[clamp(48px,5cqw,72px)] pl-4"
      >
        {copy.services.map((service, index) => (
          <li
            key={service.name}
            className="flex min-w-0 flex-[1_1_220px] flex-col gap-3.5 border-t-[1.5px] border-ink pt-4"
          >
            <span
              aria-hidden="true"
              className="font-mono text-xs/none font-medium tracking-[.08em] text-grey"
            >
              02.{index + 1}
            </span>
            <h3 className="text-[clamp(22px,1.9cqw,26px)]/[1.15] font-medium tracking-[-.01em]">
              {service.name}
            </h3>
            <p className="text-base/[1.55] text-pretty text-grey">{service.text}</p>
          </li>
        ))}
      </ul>
    </SheetSection>
  );
}
