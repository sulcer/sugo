import type { Localized } from '@/i18n/locales';

export type Capability = {
  label: string;
  value: string;
  /** Dimensions are set in the mono face with a lighter unit. */
  unit?: 'mm';
};

type HomeCopy = {
  h1: string;
  sub: string;
  cta: string;
  servicesTitle: string;
  servicesLead: string;
  services: { name: string; text: string }[];
  capabilitiesTitle: string;
  columns: { item: string; value: string };
  capabilities: Capability[];
  aboutTitle: string;
  paragraphs: [string, string];
  counters: { years: string; machines: string; projects: string };
  /** Program blocks N10–N60 of the hero machining strip. */
  operations: [string, string, string, string, string, string];
};

export const HOME: Localized<HomeCopy> = {
  sl: {
    h1: 'Kakovostna mehanska obdelava kovin za vaše inovativne ideje',
    sub: 'CNC struženje in rezkanje po vaši risbi, od manjših naročil do serijske proizvodnje',
    cta: 'Pošljite risbo',
    servicesTitle: 'Storitve',
    servicesLead: 'Naše storitve in dejavnosti',
    services: [
      {
        name: 'Struženje',
        text: 'Precizna obdelava kovin za natančne rezultate in visoko kakovostne izdelke.',
      },
      {
        name: 'Rezkanje',
        text: 'Uporaba vrhunske opreme za natančno rezkanje kovin za vaše posebne zahteve.',
      },
      {
        name: 'Svetovanje',
        text: 'Naše strokovno svetovanje vam pomaga doseči vaše cilje s kovinsko obdelavo.',
      },
    ],
    capabilitiesTitle: 'Zmogljivosti',
    columns: { item: 'Postavka', value: 'Vrednost' },
    capabilities: [
      { label: 'Premer struženja (specialnost)', value: 'Ø 3 – 65', unit: 'mm' },
      { label: 'Struženje, največ', value: 'Ø 210 × 500', unit: 'mm' },
      { label: 'Rezkanje, delovni prostor', value: '600 × 400 × 300', unit: 'mm' },
      { label: 'Materiali', value: 'jeklo, nerjavno jeklo, aluminij, medenina, plastika' },
      { label: 'Serije', value: 'posamezni kosi do serijske proizvodnje' },
      { label: 'Dobavni rok', value: 'manjša naročila v nekaj dneh, večja v nekaj tednih' },
    ],
    aboutTitle: 'Družinsko podjetje',
    paragraphs: [
      'Smo družinsko podjetje. Stremimo k konstantnemu razvoju in potrebam naših strank, kar zagotavljamo s sodobnim strojnim parkom in dobrimi poslovnimi procesi.',
      'Naša osnovna dejavnost je serijska proizvodnja in obdelava visoko preciznih struženih izdelkov iz različnih materialov za kupce iz različnih panog. Kar 90 % naših izdelkov izvažamo na tuje trge.',
    ],
    counters: { years: 'let na trgu', machines: 'CNC strojev', projects: 'projektov' },
    operations: ['Čelo', 'Grobo', 'Fino', 'Navoj', 'Vrtanje', 'Odrez'],
  },
  de: {
    h1: 'Hochwertige Metallbearbeitung für Ihre innovativen Ideen',
    sub: 'CNC-Dreh- und Frästeile nach Zeichnung, von Kleinserien bis zur Serienfertigung',
    cta: 'Zeichnung senden',
    servicesTitle: 'Leistungen',
    servicesLead: 'Unsere Leistungen und Tätigkeiten',
    services: [
      { name: 'Drehen', text: 'Präzise Metallbearbeitung für genaue Ergebnisse und hochwertige Teile.' },
      {
        name: 'Fräsen',
        text: 'Präzisionsfräsen auf erstklassigen Maschinen – für Ihre speziellen Anforderungen.',
      },
      {
        name: 'Beratung',
        text: 'Unsere fachkundige Beratung hilft Ihnen, Ihre Ziele in der Metallbearbeitung zu erreichen.',
      },
    ],
    capabilitiesTitle: 'Fertigungsmöglichkeiten',
    columns: { item: 'Merkmal', value: 'Wert' },
    capabilities: [
      { label: 'Werkstückdurchmesser Drehen (Spezialität)', value: 'Ø 3 – 65', unit: 'mm' },
      { label: 'Drehen, maximal', value: 'Ø 210 × 500', unit: 'mm' },
      { label: 'Fräsen, Arbeitsraum', value: '600 × 400 × 300', unit: 'mm' },
      { label: 'Werkstoffe', value: 'Stahl, Edelstahl, Aluminium, Messing, Kunststoffe' },
      { label: 'Losgrößen', value: 'Einzelteile bis Serienfertigung' },
      { label: 'Lieferzeit', value: 'kleinere Aufträge in wenigen Tagen, größere in wenigen Wochen' },
    ],
    aboutTitle: 'Familienbetrieb',
    paragraphs: [
      'Wir sind ein Familienunternehmen. Wir entwickeln uns ständig weiter und richten uns nach den Bedürfnissen unserer Kunden – mit einem modernen Maschinenpark und gut eingespielten Abläufen.',
      'Unser Kerngeschäft ist die Serienfertigung hochpräziser Drehteile aus verschiedenen Werkstoffen für Kunden unterschiedlicher Branchen. Rund 90 % unserer Produkte gehen in den Export.',
    ],
    counters: { years: 'Jahre am Markt', machines: 'CNC-Maschinen', projects: 'Projekte' },
    operations: ['Plan', 'Schruppen', 'Schlichten', 'Gewinde', 'Bohren', 'Abstechen'],
  },
  en: {
    h1: 'Quality metal machining for your innovative ideas',
    sub: 'CNC turned and milled parts made to your drawing, from small batches to series production',
    cta: 'Send your drawing',
    servicesTitle: 'Services',
    servicesLead: 'Our services and activities',
    services: [
      { name: 'Turning', text: 'Precision metal machining for accurate results and high-quality parts.' },
      {
        name: 'Milling',
        text: 'Top-grade equipment for precise metal milling to your specific requirements.',
      },
      { name: 'Consulting', text: 'Our expert advice helps you reach your goals in metal machining.' },
    ],
    capabilitiesTitle: 'Capabilities',
    columns: { item: 'Item', value: 'Value' },
    capabilities: [
      { label: 'Turning diameter (speciality)', value: 'Ø 3 – 65', unit: 'mm' },
      { label: 'Turning, maximum', value: 'Ø 210 × 500', unit: 'mm' },
      { label: 'Milling, work envelope', value: '600 × 400 × 300', unit: 'mm' },
      { label: 'Materials', value: 'steel, stainless steel, aluminium, brass, plastics' },
      { label: 'Batch sizes', value: 'single parts to series production' },
      { label: 'Lead time', value: 'small orders in a few days, larger ones in a few weeks' },
    ],
    aboutTitle: 'Family business',
    paragraphs: [
      'We are a family business. We keep developing with the needs of our customers, backed by a modern machine park and sound processes.',
      'Our core business is series production of high-precision turned parts in a range of materials for customers across industries. Around 90 % of our output is exported.',
    ],
    counters: { years: 'years in business', machines: 'CNC machines', projects: 'projects' },
    operations: ['Facing', 'Roughing', 'Finishing', 'Thread', 'Drilling', 'Parting'],
  },
};

/** Company history, drawn as graduations on a measuring scale. */
export const TIMELINE: readonly { year: number; label: Localized<string> }[] = [
  {
    year: 2010,
    label: {
      sl: 'Ustanovitev Boštjan Golob s.p.',
      de: 'Gründung Boštjan Golob s.p.',
      en: 'Boštjan Golob s.p. founded',
    },
  },
  {
    year: 2019,
    label: { sl: 'Ustanovitev SUGO d.o.o.', de: 'Gründung SUGO d.o.o.', en: 'SUGO d.o.o. founded' },
  },
  {
    year: 2020,
    label: { sl: 'Selitev proizvodnje', de: 'Verlagerung der Produktion', en: 'Production relocated' },
  },
  {
    year: 2022,
    label: {
      sl: 'Posodobitev strojne opreme',
      de: 'Modernisierung des Maschinenparks',
      en: 'Machine park modernised',
    },
  },
];
