import { HOME } from '@/content/home';
import type { Locale } from '@/i18n/locales';
import { Counters } from './Counters';
import { PartsFloor } from './PartsFloor';

/** The track record: three figures over a floor of parts made at SUGO. */
export function Production({ locale }: { locale: Locale }) {
  return (
    <section className="flex flex-col items-center border-t border-rule px-gutter pt-[clamp(28px,3.5cqw,48px)] pb-[clamp(20px,2.5cqw,32px)]">
      <Counters labels={HOME[locale].counters} buildYear={new Date().getFullYear()} />
      <div className="relative w-full @max-wide:pt-7 @max-wide:pb-2 @wide:h-[clamp(260px,24cqw,340px)]">
        {/* Narrow sheets size the floor by its aspect; wide ones give it an explicit box, which wins. */}
        <PartsFloor
          aspect={2.7}
          className="w-full @wide:absolute @wide:top-[2%] @wide:left-0 @wide:h-[96%]"
        />
      </div>
    </section>
  );
}
