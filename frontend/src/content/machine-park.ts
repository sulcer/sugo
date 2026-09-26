import type { Localized } from '@/i18n/locales';

export const MACHINE_PARK: Localized<{
  title: string;
  lead: string;
  lathes: string;
  vmcs: string;
  env: string;
}> = {
  sl: {
    title: 'Strojni park',
    lead: 'Sodobno opremljen strojni park za reševanje tudi najbolj zahtevnih problemov.',
    lathes: 'Stružnice',
    vmcs: 'Obdelovalni centri',
    env: 'Delovni prostor',
  },
  de: {
    title: 'Maschinenpark',
    lead: 'Ein modern ausgestatteter Maschinenpark, auch für anspruchsvolle Aufgaben.',
    lathes: 'Drehmaschinen',
    vmcs: 'Bearbeitungszentren',
    env: 'Arbeitsraum',
  },
  en: {
    title: 'Machine park',
    lead: 'A modern machine park, ready for demanding work.',
    lathes: 'Lathes',
    vmcs: 'Machining centres',
    env: 'Work envelope',
  },
};
