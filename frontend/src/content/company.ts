import type { Localized } from '@/i18n/locales';

const POSTAL_CODE = '2222';
const LOCALITY = 'Jakobski Dol';

export const COMPANY = {
  name: 'SUGO d.o.o.',
  url: 'https://www.sugo.si',
  founded: 2010,
  street: 'Spodnji Jakobski Dol 45',
  postalCode: POSTAL_CODE,
  locality: LOCALITY,
  city: `${POSTAL_CODE} ${LOCALITY}`,
  country: { sl: 'Slovenija', de: 'Slowenien', en: 'Slovenia' } satisfies Localized<string>,
  representative: {
    sl: 'Boštjan Golob, direktor',
    de: 'Boštjan Golob, Geschäftsführer',
    en: 'Boštjan Golob, managing director',
  } satisfies Localized<string>,
  phones: [
    { display: '+386 31 876 138', href: 'tel:+38631876138' },
    { display: '+386 31 557 929', href: 'tel:+38631557929' },
  ],
  email: 'cncgolob@gmail.com',
  taxNumber: '59203676',
  registrationNumber: '8550859000',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Spodnji+Jakobski+Dol+45,+2222+Jakobski+Dol,+Slovenija',
} as const;
