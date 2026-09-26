import { expect, it } from 'vitest';
import { localBusiness } from './structured-data';

it('describes SUGO to search engines as a local business, in the page’s language', () => {
  expect(localBusiness('en')).toEqual({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'SUGO d.o.o.',
    description:
      'Family business for CNC turning and milling to your drawing, from single parts to series production. Diameters from 3 to 65 mm.',
    url: 'https://sugo.si',
    email: 'cncgolob@gmail.com',
    telephone: ['+38631876138', '+38631557929'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Spodnji Jakobski Dol 45',
      postalCode: '2222',
      addressLocality: 'Jakobski Dol',
      addressCountry: 'SI',
    },
    foundingDate: '2010',
    taxID: '59203676',
  });
});
