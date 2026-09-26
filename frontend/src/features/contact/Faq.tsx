import { SheetSection } from '@/components/SheetSection';
import { CONTACT } from '@/content/contact';
import type { Locale } from '@/i18n/locales';

/** The questions that arrive by phone anyway, on native `details` so they work without JavaScript. */
export function Faq({ locale }: { locale: Locale }) {
  const copy = CONTACT[locale];
  return (
    <SheetSection number="03">
      <div className="min-w-0 flex-[1_1_240px] px-4 pt-[clamp(8px,2.2cqw,28px)]">
        <h2 className="m-0 text-section font-medium text-balance">{copy.faqTitle}</h2>
      </div>
      <div className="min-w-0 flex-[2.6_1_560px] px-4 pt-[clamp(16px,2.2cqw,28px)] pr-gutter pb-[clamp(48px,5cqw,72px)]">
        <div className="border-t-[1.5px] border-ink">
          {copy.faq.map((entry, index) => (
            <details key={entry.question} open={index === 0} className="group border-b border-rule">
              <summary className="flex cursor-pointer list-none items-start gap-5 py-5 hover:text-accent [&::-webkit-details-marker]:hidden">
                <span className="w-7 flex-none font-mono text-[13px] leading-[1.6] font-medium text-grey">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 text-[18px] leading-[1.4] font-medium text-pretty">
                  {entry.question}
                </span>
                <span
                  aria-hidden="true"
                  className="w-6 flex-none text-right font-mono text-[22px] leading-[1.1]"
                >
                  <span className="group-open:hidden">+</span>
                  <span className="hidden group-open:inline">−</span>
                </span>
              </summary>
              <p className="m-0 max-w-[44em] pr-11 pb-6 pl-12 text-[16px] leading-[1.6] text-pretty text-grey">
                {entry.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </SheetSection>
  );
}
