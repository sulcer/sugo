import type { Localized } from '@/i18n/locales';

export const CONTACT: Localized<{
  title: string;
  lead: string;
  locationTitle: string;
  schematic: string;
  maps: string;
  faqTitle: string;
  faq: { question: string; answer: string }[];
}> = {
  sl: {
    title: 'Kontakt',
    lead: 'Pošljite risbo, material in količino — pripravimo ponudbo. Za hitra vprašanja pokličite neposredno.',
    locationTitle: 'Lokacija',
    schematic: 'Shematski prikaz lokacije',
    maps: 'Odpri v Google Maps',
    faqTitle: 'Pogosta vprašanja',
    faq: [
      {
        question: 'Kakšne izkušnje imate pri izdelavi CNC izdelkov in katere materiale lahko obdelujete?',
        answer:
          'Imamo dolgoletne izkušnje pri izdelavi CNC izdelkov in lahko obdelujemo različne materiale, vključno z aluminijem, jeklom, nerjavno pločevino, plastiko in drugimi materiali.',
      },
      {
        question: 'Kakšen je vaš proces naročanja in kakšen je vaš čas izdelave?',
        answer:
          'Naš proces naročanja je preprost in učinkovit. Stranka lahko odda naročilo preko naše spletne strani ali preko telefona. Naš čas izdelave je odvisen od obsega naročila, vrste materiala in zahtevnosti izdelka. Običajno pa lahko končamo manjša naročila v nekaj dneh, večja naročila pa lahko trajajo nekaj tednov.',
      },
      {
        question:
          'Kakšna je vaša politika glede kakovosti izdelkov in kaj storite, če stranka ni zadovoljna z izdelki?',
        answer:
          'Naše podjetje ima strog nadzor kakovosti in vsi naši izdelki so podvrženi strogim preizkusom, da se zagotovi njihova kakovost. Če stranka ni zadovoljna z izdelkom, bomo storili vse, kar je v naši moči, da to popravimo ali nadomestimo izdelek.',
      },
    ],
  },
  de: {
    title: 'Kontakt',
    lead: 'Senden Sie uns Zeichnung, Werkstoff und Stückzahl – wir erstellen ein Angebot. Für kurze Fragen rufen Sie uns direkt an.',
    locationTitle: 'Anfahrt',
    schematic: 'Schematische Lageskizze',
    maps: 'In Google Maps öffnen',
    faqTitle: 'Häufig gestellte Fragen',
    faq: [
      {
        question:
          'Welche Erfahrungen haben Sie in der Fertigung von CNC-Produkten und welche Materialien können Sie bearbeiten?',
        answer:
          'Wir haben langjährige Erfahrung in der Herstellung von CNC-Produkten und können eine Vielzahl von Materialien bearbeiten, darunter Aluminium, Stahl, Edelstahl, Kunststoff und andere Materialien.',
      },
      {
        question: 'Wie ist Ihr Bestellprozess und wie ist Ihre Vorlaufzeit?',
        answer:
          'Unser Bestellvorgang ist einfach und effizient. Der Kunde kann eine Bestellung über unsere Website oder telefonisch aufgeben. Unsere Produktionszeit hängt vom Auftragsvolumen, der Materialart und der Komplexität des Produkts ab. Kleine Aufträge können wir in der Regel innerhalb weniger Tage fertigstellen, größere Aufträge können einige Wochen dauern.',
      },
      {
        question:
          'Was ist Ihre Qualitätspolitik und was tun Sie, wenn ein Kunde mit den Produkten nicht zufrieden ist?',
        answer:
          'Unser Unternehmen hat eine strenge Qualitätskontrolle, und alle unsere Produkte werden strengen Prüfungen unterzogen, um ihre Qualität sicherzustellen. Wenn der Kunde mit dem Produkt nicht zufrieden ist, tun wir alles in unserer Macht Stehende, um es nachzubessern oder zu ersetzen.',
      },
    ],
  },
  en: {
    title: 'Contact',
    lead: 'Send us the drawing, material and quantity — we will prepare a quote. For quick questions, call us directly.',
    locationTitle: 'Location',
    schematic: 'Schematic location sketch',
    maps: 'Open in Google Maps',
    faqTitle: 'Frequently asked questions',
    faq: [
      {
        question: 'What experience do you have with CNC parts, and which materials can you machine?',
        answer:
          'We have many years of experience in CNC production and machine a wide range of materials, including aluminium, steel, stainless steel, plastics and others.',
      },
      {
        question: 'How does ordering work, and what is your lead time?',
        answer:
          'Ordering is simple: send an enquiry through the website or by phone. Lead time depends on order volume, material and part complexity. Small orders are usually finished within a few days; larger orders can take a few weeks.',
      },
      {
        question: 'What is your quality policy, and what happens if a customer is not satisfied?',
        answer:
          'We run strict quality control and every part is inspected to ensure its quality. If a customer is not satisfied with a part, we will do everything we can to rework or replace it.',
      },
    ],
  },
};
