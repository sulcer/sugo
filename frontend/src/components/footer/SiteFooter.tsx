import Link from 'next/link';
import { COMPANY } from '@/content/company';
import { FOOTER } from '@/content/shell';
import type { Locale } from '@/i18n/locales';
import { localePath } from '@/i18n/routes';
import { Logo } from '../Logo';
import { CurrentYear } from './CurrentYear';

const cell = 'flex flex-col bg-paper';
const contactLink = 'inline-flex min-h-8 items-center text-ink no-underline hover:text-accent';

/** The drawing's title block: company, address, contacts and registration data ruled into cells. */
export function SiteFooter({ locale }: { locale: Locale }) {
  const copy = FOOTER[locale];
  return (
    <footer className="bg-paper pb-[clamp(24px,3vw,40px)] text-ink">
      <div className="mx-auto flex max-w-sheet flex-wrap gap-px border-[1.5px] border-ink bg-ink/28">
        <div className={`${cell} min-h-37.5 flex-[1.6_1_300px] justify-center gap-6 p-5`}>
          <Logo className="h-16 w-auto self-start" />
        </div>
        <div className="flex flex-[3_1_520px] flex-wrap gap-px">
          <div className={`${cell} flex-[1_1_200px] gap-2.5 p-5`}>
            <div className="label-mono">{copy.address}</div>
            <div className="text-[15px] leading-normal">
              {COMPANY.street}
              <br />
              {COMPANY.city}
              <br />
              {COMPANY.country[locale]}
            </div>
          </div>
          <div className={`${cell} flex-[1_1_200px] gap-2.5 p-5`}>
            <div className="label-mono">{copy.contact}</div>
            <div className="-my-1 flex flex-col items-start font-mono text-sm leading-[1.6]">
              {COMPANY.phones.map((phone) => (
                <a key={phone.href} href={phone.href} className={contactLink}>
                  {phone.display}
                </a>
              ))}
              <a href={`mailto:${COMPANY.email}`} className={contactLink}>
                {COMPANY.email}
              </a>
            </div>
          </div>
          <div className="flex flex-[1_1_100%] flex-wrap gap-px">
            <div className={`${cell} flex-[1_1_120px] gap-2 px-5 py-3.5`}>
              <div className="label-mono">{copy.taxNumber}</div>
              <div className="font-mono text-sm leading-none tabular-nums">{COMPANY.taxNumber}</div>
            </div>
            <div className={`${cell} flex-[1_1_120px] gap-2 px-5 py-3.5`}>
              <div className="label-mono">{copy.registrationNumber}</div>
              <div className="font-mono text-sm leading-none tabular-nums">{COMPANY.registrationNumber}</div>
            </div>
          </div>
        </div>
        <div className="flex flex-[1_1_100%] flex-wrap items-baseline justify-between gap-x-6 gap-y-2 bg-paper px-5 py-3 font-mono text-xs leading-[1.4] text-grey">
          <span>
            © <CurrentYear buildYear={new Date().getFullYear()} /> {COMPANY.name} {copy.rights}
          </span>
          <Link
            href={localePath(locale, 'privacy')}
            className="-my-3 inline-flex min-h-10 items-center text-ink underline-offset-3 hover:text-accent"
          >
            {copy.privacy}
          </Link>
        </div>
      </div>
    </footer>
  );
}
