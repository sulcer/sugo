import { COMPANY } from '@/content/company';
import { INQUIRY } from '@/content/inquiry';
import type { Locale } from '@/i18n/locales';

const row =
  'flex min-h-13 items-center justify-between gap-3 border-b border-ink/20 text-ink no-underline hover:text-accent';
const label = 'font-mono text-[11px] leading-none font-medium tracking-[.12em] text-grey uppercase';
const value = 'font-mono text-[17px]';

/** For the visitor who would rather not fill in a form at all. */
export function DirectContact({ locale }: { locale: Locale }) {
  const copy = INQUIRY[locale];
  return (
    <div className="flex min-w-0 flex-[1_1_260px] flex-col self-start border-t-[1.5px] border-ink">
      <div className={`${label} pt-4 pb-4.5`}>{copy.direct}</div>
      <div className="pb-5 text-[22px] font-medium tracking-[-.01em]">{COMPANY.representative[locale]}</div>
      <div className="flex flex-col border-t border-ink/20">
        {COMPANY.phones.map((phone) => (
          <a key={phone.href} href={phone.href} className={row}>
            <span className={label}>{copy.phone}</span>
            <span className={value}>{phone.display}</span>
          </a>
        ))}
        <a href={`mailto:${COMPANY.email}`} className={row}>
          <span className={label}>{copy.mail}</span>
          <span className={value}>{COMPANY.email}</span>
        </a>
      </div>
    </div>
  );
}
