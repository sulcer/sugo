import { IBM_Plex_Mono, Instrument_Sans } from 'next/font/google';

const sans = Instrument_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-instrument-sans',
});

// No metric-adjusted Arial fallback: glyphs outside the Latin subsets (→ ↗ ✓ ●) must fall back to
// the system monospace, as in the design.
const mono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500'],
  variable: '--font-plex-mono',
  adjustFontFallback: false,
  fallback: ['monospace'],
});

/** Classes for `<html>` that define the sheet's two font families. */
export const fontVariables = `${sans.variable} ${mono.variable}`;
