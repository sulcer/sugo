import { TIMELINE } from '@/content/home';
import type { Locale } from '@/i18n/locales';
import { cn } from '@/lib/cn';

export function TimelineList({ locale, className }: { locale: Locale; className?: string }) {
  return (
    <ol className={cn('ml-2 flex w-full flex-col border-l-[1.5px] border-ink', className)}>
      {TIMELINE.map((event) => (
        <li key={event.year} className="flex items-baseline gap-3.5 py-3">
          <span aria-hidden="true" className="h-px flex-[0_0_14px] self-center bg-ink" />
          <time dateTime={String(event.year)} className="flex-[0_0_44px] font-mono text-[14px] font-medium">
            {event.year}
          </time>
          <span className="text-[15px]/[1.35] text-grey">{event.label[locale]}</span>
        </li>
      ))}
    </ol>
  );
}
