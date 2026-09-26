import Link from 'next/link';
import { COMPANY } from '@/content/company';
import { NOT_FOUND } from '@/content/shell';
import type { Locale } from '@/i18n/locales';
import { localePath } from '@/i18n/routes';

/** An empty drawing frame with its title block: the sheet the visitor asked for is not in the set. */
export function NotFoundSheet({ locale }: { locale: Locale }) {
  const copy = NOT_FOUND[locale];
  return (
    <div className="relative flex aspect-[1.414] w-full max-w-140 flex-col items-center justify-center gap-3 border-[1.5px] border-ink bg-panel text-center">
      <div aria-hidden="true" className="absolute inset-2.5 border border-ink/45" />
      <span className="relative font-mono text-[11px] leading-none font-medium tracking-[.14em] text-grey">
        404
      </span>
      <h1 className="relative m-0 text-[26px] font-medium tracking-[-.01em]">{copy.title}</h1>
      <Link
        href={localePath(locale, 'home')}
        className="relative border-b border-ink pb-0.5 text-[15px] no-underline hover:border-accent"
      >
        {copy.back}
      </Link>
      <div
        aria-hidden="true"
        className="absolute right-2.5 bottom-2.5 flex border-t border-l border-ink/45 font-mono text-[10px] leading-none"
      >
        <span className="border-r border-ink/45 px-2 py-1.5">{COMPANY.name}</span>
        <span className="px-2 py-1.5">{copy.sheet}</span>
      </div>
    </div>
  );
}
