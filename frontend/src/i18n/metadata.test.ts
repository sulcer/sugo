import { expect, it } from 'vitest';
import { metadataFor, pageMetadata } from './metadata';

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
      images: [{ url: '/og.png', width: 1200, height: 630, alt: 'SUGO d.o.o. — CNC-Drehen und Fräsen' }],
    },
  });
});

it('keeps every search description within what results show', () => {
  const lengths = (['sl', 'de', 'en'] as const).flatMap((locale) =>
    (['home', 'park', 'products', 'contact', 'privacy'] as const).map(
      (route) => pageMetadata(locale, route).description!.length,
    ),
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
  expect(pageMetadata('sl', 'home').title).toEqual({ absolute: 'CNC struženje in rezkanje · SUGO d.o.o.' });
});
