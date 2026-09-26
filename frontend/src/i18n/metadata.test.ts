import { expect, it } from 'vitest';
import { LOCALES } from './locales';
import { metadataFor, pageMetadata } from './metadata';
import { ROUTE_KEYS } from './routes';

it('describes a page with its canonical url, language alternates and open graph card', () => {
  expect(pageMetadata('de', 'products')).toEqual({
    title: 'Produkte',
    description:
      'Zeichnungen und 3D-Modelle von Dreh- und Frästeilen aus der Fertigung von SUGO – aus Stahl, Edelstahl, Aluminium, Messing und Kunststoff.',
    alternates: {
      canonical: '/de/izdelki',
      languages: { sl: '/izdelki', de: '/de/izdelki', en: '/en/izdelki', 'x-default': '/izdelki' },
    },
    openGraph: {
      type: 'website',
      siteName: 'SUGO d.o.o.',
      locale: 'de_DE',
      url: '/de/izdelki',
      title: 'Produkte · SUGO d.o.o.',
      description:
        'Zeichnungen und 3D-Modelle von Dreh- und Frästeilen aus der Fertigung von SUGO – aus Stahl, Edelstahl, Aluminium, Messing und Kunststoff.',
      images: [{ url: '/og-de.png', width: 1200, height: 630, alt: 'SUGO d.o.o. — CNC-Drehen und Fräsen' }],
    },
  });
});

it('keeps every search description within what results show', () => {
  const lengths = LOCALES.flatMap((locale) =>
    ROUTE_KEYS.map((route) => pageMetadata(locale, route).description!.length),
  );
  expect(Math.max(...lengths)).toBeLessThanOrEqual(160);
});

it('builds a page’s generateMetadata from its route and the requested language', async () => {
  const generateMetadata = metadataFor('park');
  expect(await generateMetadata({ params: Promise.resolve({ locale: 'en' }) })).toEqual(
    pageMetadata('en', 'park'),
  );
});

it('brands the home page title itself, where the layout’s title template does not reach', () => {
  expect(pageMetadata('sl', 'home')).toEqual({
    title: { absolute: 'CNC struženje in rezkanje · SUGO d.o.o.' },
    description:
      'Družinsko podjetje za CNC struženje in rezkanje po vaši risbi, od posameznih kosov do serijske proizvodnje. Premeri od 3 do 65 mm.',
    alternates: { canonical: '/', languages: { sl: '/', de: '/de', en: '/en', 'x-default': '/' } },
    openGraph: {
      type: 'website',
      siteName: 'SUGO d.o.o.',
      locale: 'sl_SI',
      url: '/',
      title: 'CNC struženje in rezkanje · SUGO d.o.o.',
      description:
        'Družinsko podjetje za CNC struženje in rezkanje po vaši risbi, od posameznih kosov do serijske proizvodnje. Premeri od 3 do 65 mm.',
      images: [
        { url: '/og-sl.png', width: 1200, height: 630, alt: 'SUGO d.o.o. — CNC struženje in rezkanje' },
      ],
    },
  });
});
