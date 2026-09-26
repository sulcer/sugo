'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import type { COOKIE_NOTICE } from '@/content/shell';
import type { Locale } from '@/i18n/locales';
import { readConsent, subscribeConsent, writeConsent } from './consent-store';

/**
 * The bar appears only below the hero, so it never covers the headline or the primary button —
 * or at once on a page too short to scroll that far, so every visitor can still choose.
 */
const SHOW_BELOW_PX = 520;

const subscribeViewport = (onChange: () => void) => {
  window.addEventListener('scroll', onChange, { passive: true });
  window.addEventListener('resize', onChange);
  return () => {
    window.removeEventListener('scroll', onChange);
    window.removeEventListener('resize', onChange);
  };
};
const isPastHero = () =>
  window.scrollY > SHOW_BELOW_PX ||
  document.documentElement.scrollHeight - window.innerHeight <= SHOW_BELOW_PX;

type CookieBarProps = { copy: (typeof COOKIE_NOTICE)[Locale]; privacyHref: string };

export function CookieBar({ copy, privacyHref }: CookieBarProps) {
  const pastHero = useSyncExternalStore(subscribeViewport, isPastHero, () => false);
  const undecided = useSyncExternalStore(
    subscribeConsent,
    () => readConsent() === null,
    () => false,
  );
  if (!pastHero || !undecided) return null;

  return (
    <section
      aria-label={copy.label}
      className="fixed bottom-4 left-4 z-40 flex max-w-[min(380px,calc(100vw-32px))] flex-col gap-3 border border-ink bg-panel px-4.5 py-4 text-sm leading-[1.45] text-ink"
    >
      <p className="m-0">
        {copy.text}{' '}
        <Link href={privacyHref} className="text-ink underline-offset-3 hover:text-accent">
          {copy.more}
        </Link>
      </p>
      <div className="flex gap-5 font-mono text-xs leading-none font-medium tracking-[.1em] uppercase">
        <button
          type="button"
          onClick={() => writeConsent('yes')}
          className="cursor-pointer border-b-[1.5px] border-accent py-2 text-accent uppercase hover:border-ink hover:text-ink"
        >
          {copy.accept}
        </button>
        <button
          type="button"
          onClick={() => writeConsent('no')}
          className="cursor-pointer border-b-[1.5px] border-transparent py-2 text-ink uppercase hover:border-ink"
        >
          {copy.decline}
        </button>
      </div>
    </section>
  );
}
