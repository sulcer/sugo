import type { Localized } from '@/i18n/locales';

type CookieTable = { headers: [string, string, string]; rows: [string, string, string][] };

export type PrivacySection = {
  heading: string;
  paragraphs: string[];
  /** Renders the data controller's address from the company record after the paragraphs. */
  controller?: true;
  list?: string[];
  cookieTable?: CookieTable;
};

type PrivacyStatement = { title: string; sections: PrivacySection[] };

/** SL as approved in the design; DE and EN from the previous site, mapped onto the same sections. */
export const PRIVACY: Localized<PrivacyStatement> = {
  sl: {
    title: 'Izjava o varovanju osebnih podatkov',
    sections: [
      {
        heading: 'Splošno',
        paragraphs: [
          'V podjetju SUGO d.o.o. spoštujemo vašo pravico do zasebnosti in se zavezujemo, da bomo varovali zaupnost osebnih podatkov in zasebnost obiskovalcev naše spletne strani. Zbrane osebne podatke bomo uporabili izključno za opravljanje storitev, ki jih spletno mesto ponuja. Z izjavo o varovanju osebnih podatkov vas želimo obvestiti o obdelavi vaših podatkov v našem podjetju ter o vaših pravicah v zvezi z varstvom podatkov.',
        ],
      },
      {
        heading: 'Upravljavec podatkov',
        paragraphs: [
          'Upravljavec osebnih podatkov v okviru te spletne strani po predpisih Splošne uredbe o varstvu podatkov:',
        ],
        controller: true,
      },
      {
        heading: 'Namen obdelave osebnih podatkov',
        paragraphs: [
          'Podjetje na spletnem mestu zbira osebne podatke, posredovane preko obrazcev. Osebni podatki, ki nam jih posredujete, bodo obravnavani zaupno in bodo uporabljeni zgolj za namene, za katere so bili posredovani. Vaši osebni podatki se bodo uporabljali v skladu z zakoni in predpisi, ki opredeljujejo varovanje osebnih podatkov (Splošna uredba EU o varstvu podatkov).',
        ],
      },
      {
        heading: 'Kontaktni obrazec',
        paragraphs: [
          'Na naši spletni strani lahko izpolnite spletni kontaktni obrazec za izvedbo povpraševanj. V ta namen SUGO d.o.o. od vas zbira naslednje podatke, ki jih posredujete na prostovoljen način: elektronski naslov.',
        ],
      },
      {
        heading: 'Obdobje hrambe',
        paragraphs: [
          'Podatki se hranijo največ toliko časa, kolikor je potrebno za dosego namena, zaradi katerega so bili zbrani ali nadalje obdelani, oziroma do poteka zastaralnih rokov za izpolnitev obveznosti ali zakonsko predpisanega roka hrambe.',
        ],
      },
      {
        heading: 'Pravice posameznika',
        paragraphs: [
          'V skladu z določili Splošne uredbe EU o varstvu osebnih podatkov (GDPR) imate do svojih podatkov pravico dostopati kadarkoli. Poleg tega lahko, če so izpolnjene določene zahteve, uveljavljate spodaj navedene pravice:',
        ],
        list: [
          'Pravica do popravka',
          'Pravica do izbrisa',
          'Pravica do omejitve obdelave',
          'Pravica do pritožbe',
          'Pravica do prenosljivosti podatkov',
        ],
      },
      {
        heading: 'Piškotki',
        paragraphs: [
          'Piškotki so majhne tekstovne datoteke, ki se ob obisku spletne strani prenesejo na vaš računalnik ali mobilno napravo. Spletna stran uporablja piškotke storitve Google Analytics za analizo obiska naše spletne strani. S pomočjo teh piškotkov se zbirajo statistični podatki o uporabi spletnega mesta brez osebne prepoznave obiskovalcev.',
        ],
        cookieTable: {
          headers: ['Ime', 'Namen', 'Trajanje'],
          rows: [
            [
              '_ga',
              'Analitični piškotek, ki se uporablja za izračun podatkov o obisku spletnega mesta',
              '2 leti',
            ],
          ],
        },
      },
    ],
  },
  de: {
    title: 'Erklärung zum Schutz personenbezogener Daten',
    sections: [
      {
        heading: 'Allgemein',
        paragraphs: [
          'Im Unternehmen SUGO d.o.o. respektieren wir Ihr Recht auf Privatsphäre und verpflichten uns, die Vertraulichkeit personenbezogener Daten und die Privatsphäre unserer Website-Besucher zu schützen. Wir verwenden die erhobenen personenbezogenen Daten ausschließlich zur Erbringung der auf der Website angebotenen Dienste. Mit der Erklärung zum Schutz personenbezogener Daten möchten wir Sie über die Verarbeitung Ihrer Daten in unserem Unternehmen und über Ihre Rechte in Bezug auf den Datenschutz informieren.',
        ],
      },
      {
        heading: 'Verantwortlicher',
        paragraphs: [
          'Verantwortlicher für personenbezogene Daten im Rahmen dieser Website gemäß den Bestimmungen der Datenschutz-Grundverordnung:',
        ],
        controller: true,
      },
      {
        heading: 'Zweck der Datenverarbeitung',
        paragraphs: [
          'Das Unternehmen erhebt personenbezogene Daten, die über Formulare auf der Website übermittelt werden. Die personenbezogenen Daten, die Sie uns zur Verfügung stellen, werden vertraulich behandelt und nur für die Zwecke verwendet, für die sie bereitgestellt wurden. Ihre personenbezogenen Daten werden in Übereinstimmung mit den Gesetzen und Vorschriften zum Schutz personenbezogener Daten (EU-Datenschutz-Grundverordnung) verwendet.',
        ],
      },
      {
        heading: 'Kontaktformular',
        paragraphs: [
          'Auf unserer Website können Sie ein Online-Kontaktformular ausfüllen, um Anfragen zu stellen. Zu diesem Zweck erhebt SUGO d.o.o. folgende Daten von Ihnen, die Sie uns freiwillig zur Verfügung stellen: E-Mail-Adresse.',
        ],
      },
      {
        heading: 'Speicherdauer',
        paragraphs: [
          'Daten werden so lange aufbewahrt, wie es für die Erreichung des Zwecks, für den sie erhoben oder weiterverarbeitet wurden, erforderlich ist, oder bis zum Ablauf der Verjährungsfrist zur Erfüllung von Verpflichtungen oder der gesetzlich vorgeschriebenen Aufbewahrungsfrist.',
        ],
      },
      {
        heading: 'Rechte des Einzelnen',
        paragraphs: [
          'Gemäß den Bestimmungen der EU-Datenschutz-Grundverordnung (DSGVO) haben Sie jederzeit das Recht auf Auskunft über Ihre Daten. Darüber hinaus können Sie bei Vorliegen bestimmter Voraussetzungen die nachfolgend aufgeführten Rechte ausüben:',
        ],
        list: [
          'Recht auf Berichtigung',
          'Recht auf Löschung',
          'Recht auf Einschränkung der Verarbeitung',
          'Recht auf Beschwerde',
          'Recht auf Datenübertragbarkeit',
        ],
      },
      {
        heading: 'Cookies',
        paragraphs: [
          'Cookies sind kleine Textdateien, die auf Ihren Computer oder Ihr mobiles Gerät heruntergeladen werden, wenn Sie eine Website besuchen. Die Website verwendet Google-Analytics-Cookies, um den Besuch unserer Website zu analysieren. Mit Hilfe dieser Cookies werden statistische Daten über die Nutzung der Website erhoben, ohne dass Besucher persönlich identifiziert werden.',
        ],
        cookieTable: {
          headers: ['Name', 'Zweck', 'Speicherdauer'],
          rows: [
            [
              '_ga',
              'Analytisches Cookie, das zur Berechnung von Website-Besuchsdaten verwendet wird',
              '2 Jahre',
            ],
          ],
        },
      },
    ],
  },
  en: {
    title: 'Statement on the protection of personal data',
    sections: [
      {
        heading: 'General',
        paragraphs: [
          'At SUGO d.o.o. we respect your right to privacy and are committed to protecting the confidentiality of personal data and the privacy of our website visitors. We will use the collected personal data exclusively to provide the services offered by the website. With the statement on the protection of personal data, we want to inform you about the processing of your data in our company and about your rights in relation to data protection.',
        ],
      },
      {
        heading: 'Data controller',
        paragraphs: [
          'Controller of personal data within the framework of this website according to the regulations of the General Data Protection Regulation:',
        ],
        controller: true,
      },
      {
        heading: 'Purpose of personal data processing',
        paragraphs: [
          'The company collects personal data submitted via forms on the website. The personal data you provide to us will be treated confidentially and will be used only for the purposes for which they were provided. Your personal data will be used in accordance with the laws and regulations defining the protection of personal data (EU General Data Protection Regulation).',
        ],
      },
      {
        heading: 'Contact form',
        paragraphs: [
          'On our website, you can fill out an online contact form to make inquiries. For this purpose, SUGO d.o.o. collects the following data from you, which you provide voluntarily: e-mail address.',
        ],
      },
      {
        heading: 'Retention period',
        paragraphs: [
          'Data is kept for as long as is necessary to achieve the purpose for which it was collected or further processed, or until the expiry of the statute of limitations for fulfilling obligations or the legally prescribed retention period.',
        ],
      },
      {
        heading: 'Individual rights',
        paragraphs: [
          'In accordance with the provisions of the EU General Data Protection Regulation (GDPR), you have the right to access your data at any time. In addition, if certain requirements are met, you may exercise the rights listed below:',
        ],
        list: [
          'Right to rectification',
          'Right to erasure',
          'Right to restriction of processing',
          'Right to lodge a complaint',
          'Right to data portability',
        ],
      },
      {
        heading: 'Cookies',
        paragraphs: [
          'Cookies are small text files that are downloaded to your computer or mobile device when you visit a website. The website uses Google Analytics cookies to analyse visits to our website. With the help of these cookies, statistical data on the use of the website are collected without personal identification of visitors.',
        ],
        cookieTable: {
          headers: ['Name', 'Purpose', 'Duration'],
          rows: [['_ga', 'Analytical cookie used to calculate website visit data', '2 years']],
        },
      },
    ],
  },
};
