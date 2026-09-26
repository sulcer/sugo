import { COMPANY } from '@/content/company';
import { PRIVACY, type PrivacySection } from '@/content/privacy';
import type { Locale } from '@/i18n/locales';
import { cn } from '@/lib/cn';

/** The design's cookie grid, 0.6fr · 2fr · 0.7fr, as table column shares. */
const COOKIE_COLUMNS = [0.6, 2, 0.7];
const COOKIE_COLUMN_TOTAL = COOKIE_COLUMNS.reduce((sum, share) => sum + share);

export function PrivacyStatement({ locale }: { locale: Locale }) {
  const { title, sections } = PRIVACY[locale];
  return (
    <article className="flex max-w-[760px] min-w-0 flex-[1_1_560px] flex-col gap-7 px-4 pt-[clamp(8px,4cqw,64px)] pb-[clamp(48px,6cqw,96px)] text-[17px]/[1.65]">
      <h1 className="text-[clamp(34px,3.6cqw,50px)]/[1.08] font-medium tracking-[-.02em] text-balance">
        {title}
      </h1>
      {sections.map((section, index) => (
        <section key={section.heading} className="flex flex-col gap-2.5 border-t border-rule pt-5">
          <h2 className="font-mono text-[11px]/[1.4] font-medium tracking-[.12em] text-grey uppercase">
            {String(index + 1).padStart(2, '0')} · {section.heading}
          </h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.controller && <ControllerAddress label={section.heading} />}
          {section.list && <RuledList items={section.list} />}
          {section.cookieTable && <CookieTable table={section.cookieTable} />}
        </section>
      ))}
    </article>
  );
}

function ControllerAddress({ label }: { label: string }) {
  return (
    <address aria-label={label} className="font-mono text-[15px]/[1.7] not-italic">
      {COMPANY.name}
      <br />
      {COMPANY.street}, {COMPANY.city}
      <br />
      {COMPANY.email}
    </address>
  );
}

function RuledList({ items }: { items: string[] }) {
  return (
    <ul role="list" className="flex flex-col border-t border-rule">
      {items.map((item) => (
        <li key={item} className="border-b border-rule py-2.5 last:border-b-0">
          {item}
        </li>
      ))}
    </ul>
  );
}

const HEADER_CELL =
  'border-b border-rule py-2.5 font-mono text-[10px]/[1.4] font-medium tracking-[.12em] text-grey uppercase';
const BODY_CELL = 'border-b border-rule py-3 align-top';

function CookieTable({ table }: { table: NonNullable<PrivacySection['cookieTable']> }) {
  const [name, purpose, duration] = table.headers;
  return (
    <table className="w-full table-fixed border-t-[1.5px] border-ink text-[15px]">
      <colgroup>
        {COOKIE_COLUMNS.map((share, index) => (
          <col key={index} style={{ width: `${(100 * share) / COOKIE_COLUMN_TOTAL}%` }} />
        ))}
      </colgroup>
      <thead>
        <tr>
          <th scope="col" className={cn(HEADER_CELL, 'pr-3 text-left')}>
            {name}
          </th>
          <th scope="col" className={cn(HEADER_CELL, 'pr-3 text-left')}>
            {purpose}
          </th>
          <th scope="col" className={cn(HEADER_CELL, 'text-right')}>
            {duration}
          </th>
        </tr>
      </thead>
      <tbody>
        {table.rows.map(([cookie, use, lifetime]) => (
          <tr key={cookie}>
            <th scope="row" className={cn(BODY_CELL, 'pr-3 text-left font-mono font-normal')}>
              {cookie}
            </th>
            <td className={cn(BODY_CELL, 'pr-3')}>{use}</td>
            <td className={cn(BODY_CELL, 'text-right')}>{lifetime}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
