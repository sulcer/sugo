'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import type { NAVIGATION } from '@/content/shell';
import { LOCALES, type Locale } from '@/i18n/locales';
import { localePath, parsePathname, type RouteKey } from '@/i18n/routes';

type NavigationCopy = (typeof NAVIGATION)[Locale];

const SHEETS = ['park', 'products', 'contact'] as const satisfies RouteKey[];
const SHEET_NUMBER: Record<(typeof SHEETS)[number], string> = { park: '02', products: '03', contact: '04' };
const LANGUAGE_NAMES: Record<Locale, string> = { sl: 'Slovenščina', de: 'Deutsch', en: 'English' };
const MENU_ID = 'site-menu';

type HeaderBarProps = { locale: Locale; copy: NavigationCopy; logo: ReactNode };

/**
 * The sheet header: logo, numbered sheet cells and the language switch in one bar. Below 900 px
 * the cells give way to a menu button that drops the sheet list below the bar.
 */
export function HeaderBar({ locale, copy, logo }: HeaderBarProps) {
  const pathname = usePathname();
  const { route } = parsePathname(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <>
      <div className="flex h-15 @nav:mx-auto @nav:h-18 @nav:max-w-sheet @nav:border-x @nav:border-rule">
        <Link
          href={localePath(locale, 'home')}
          onClick={closeMenu}
          className="flex flex-auto items-center px-4 @nav:flex-none @nav:border-r @nav:border-rule @nav:pr-7 @nav:pl-5"
        >
          {logo}
        </Link>

        <nav aria-label={copy.menu} className="hidden min-w-0 flex-auto @nav:flex">
          {SHEETS.map((sheet) => (
            <Link
              key={sheet}
              href={localePath(locale, sheet)}
              aria-current={route === sheet ? 'page' : undefined}
              className="group flex min-w-0 flex-1 basis-0 flex-col justify-between border-r border-rule px-4.5 pt-2.75 pb-3.25 text-ink no-underline hover:bg-panel hover:text-ink hover:shadow-[inset_0_-3px_0_var(--color-accent)] aria-[current=page]:bg-panel aria-[current=page]:shadow-[inset_0_-3px_0_var(--color-accent)]"
            >
              <span
                aria-hidden="true"
                className="font-mono text-[10px] leading-none font-medium tracking-[.12em] text-grey group-aria-[current=page]:text-accent"
              >
                {SHEET_NUMBER[sheet]}
              </span>
              <span className="truncate text-base font-medium tracking-[-.005em]">{copy.names[sheet]}</span>
            </Link>
          ))}
        </nav>

        <div
          role="group"
          aria-label={copy.language}
          className="flex flex-none items-center gap-0.5 border-l border-rule px-2 @nav:border-l-0 @nav:px-4"
        >
          {LOCALES.map((language) => (
            <Link
              key={language}
              href={localePath(language, route ?? 'home')}
              hrefLang={language}
              lang={language}
              aria-label={LANGUAGE_NAMES[language]}
              aria-current={language === locale ? 'true' : undefined}
              onClick={closeMenu}
              className="px-1.5 py-2.5 font-mono text-xs leading-none font-medium tracking-[.08em] text-grey-light no-underline hover:text-ink aria-[current=true]:text-ink aria-[current=true]:shadow-[inset_0_-1.5px_0_var(--color-ink)]"
            >
              {language.toUpperCase()}
            </Link>
          ))}
        </div>

        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls={MENU_ID}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex flex-none cursor-pointer items-center gap-2.5 border-l border-rule px-4 font-mono text-xs leading-none font-medium tracking-[.12em] text-ink uppercase aria-expanded:bg-panel aria-expanded:text-accent @nav:hidden"
        >
          {copy.menu}
          <span aria-hidden="true" className="text-lg leading-none">
            {menuOpen ? '−' : '+'}
          </span>
        </button>
      </div>

      {menuOpen && (
        <div className="@nav:hidden">
          <div aria-hidden="true" onClick={closeMenu} className="fixed inset-0 -z-10 bg-ink/14" />
          <nav
            id={MENU_ID}
            aria-label={copy.menu}
            className="absolute inset-x-0 top-full border-b-[1.5px] border-ink bg-paper"
          >
            <div className="grid grid-cols-1 gap-px bg-rule">
              {SHEETS.map((sheet) => (
                <Link
                  key={sheet}
                  href={localePath(locale, sheet)}
                  aria-current={route === sheet ? 'page' : undefined}
                  onClick={closeMenu}
                  className="group flex min-w-0 flex-col gap-2.5 bg-paper p-4 text-ink no-underline hover:bg-panel hover:text-ink aria-[current=page]:shadow-[inset_0_-3px_0_var(--color-accent)]"
                >
                  <span
                    aria-hidden="true"
                    className="flex items-baseline justify-between font-mono text-[11px] leading-none font-medium tracking-[.1em]"
                  >
                    <span className="text-grey group-aria-[current=page]:text-accent">
                      {SHEET_NUMBER[sheet]}
                    </span>
                    {route === sheet && (
                      <span className="text-[10px] tracking-[.12em] text-accent uppercase">
                        ● {copy.currentSheet}
                      </span>
                    )}
                  </span>
                  <span className="flex flex-col gap-1.5">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-[clamp(20px,2vw,26px)] font-medium tracking-[-.01em]">
                        {copy.names[sheet]}
                      </span>
                      <span aria-hidden="true" className="font-mono text-base">
                        →
                      </span>
                    </span>
                    <span className="text-sm leading-[1.4] text-grey">{copy.descriptions[sheet]}</span>
                  </span>
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap items-stretch border-t border-rule">
              <button
                type="button"
                onClick={closeMenu}
                className="ml-auto flex min-h-13 flex-none cursor-pointer items-center gap-2.5 border-l border-rule px-5 font-mono text-xs leading-none font-medium tracking-[.12em] uppercase hover:text-accent"
              >
                {copy.close}
                <span aria-hidden="true" className="text-base">
                  −
                </span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
