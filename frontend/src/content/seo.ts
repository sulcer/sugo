import type { Localized } from '@/i18n/locales';
import type { RouteKey } from '@/i18n/routes';

type SearchSnippet = { title: string; description: string };

/** What search results and link previews show for each page. Titles get " · SUGO d.o.o." appended. */
export const SEO: Localized<Record<RouteKey, SearchSnippet>> = {
  sl: {
    home: {
      title: 'CNC struženje in rezkanje',
      description:
        'Družinsko podjetje za CNC struženje in rezkanje po vaši risbi, od posameznih kosov do serijske proizvodnje. Premeri od 3 do 65 mm.',
    },
    park: {
      title: 'Strojni park',
      description:
        'Šest CNC strojev: štiri stružnice in dva vertikalna obdelovalna centra, z delovnim prostorom vsakega stroja.',
    },
    products: {
      title: 'Izdelki',
      description:
        'Risbe in 3D modeli struženih in rezkanih delov, izdelanih pri SUGO, iz jekla, nerjavnega jekla, aluminija, medenine in plastike.',
    },
    contact: {
      title: 'Kontakt',
      description:
        'Pošljite risbo za ponudbo (PDF, STEP ali DXF). Naslov, telefon in lokacija podjetja SUGO d.o.o. v Jakobskem Dolu.',
    },
    privacy: {
      title: 'Varovanje osebnih podatkov',
      description:
        'Kako SUGO d.o.o. obdeluje osebne podatke, posredovane prek spletne strani, in katere pravice imate.',
    },
  },
  de: {
    home: {
      title: 'CNC-Drehen und Fräsen',
      description:
        'Familienbetrieb für CNC-Drehen und -Fräsen nach Ihrer Zeichnung, vom Einzelteil bis zur Serienfertigung. Durchmesser von 3 bis 65 mm.',
    },
    park: {
      title: 'Maschinenpark',
      description:
        'Sechs CNC-Maschinen: vier Drehmaschinen und zwei vertikale Bearbeitungszentren, mit dem Arbeitsraum jeder Maschine.',
    },
    products: {
      title: 'Produkte',
      description:
        'Zeichnungen und 3D-Modelle von Dreh- und Frästeilen aus der Fertigung von SUGO – aus Stahl, Edelstahl, Aluminium, Messing und Kunststoff.',
    },
    contact: {
      title: 'Kontakt',
      description:
        'Senden Sie Ihre Zeichnung für ein Angebot (PDF, STEP oder DXF). Adresse, Telefon und Anfahrt zu SUGO d.o.o. in Jakobski Dol.',
    },
    privacy: {
      title: 'Datenschutzerklärung',
      description:
        'Wie SUGO d.o.o. über die Website übermittelte personenbezogene Daten verarbeitet und welche Rechte Sie haben.',
    },
  },
  en: {
    home: {
      title: 'CNC turning and milling',
      description:
        'Family business for CNC turning and milling to your drawing, from single parts to series production. Diameters from 3 to 65 mm.',
    },
    park: {
      title: 'Machine park',
      description:
        'Six CNC machines: four lathes and two vertical machining centres, with the work envelope of each.',
    },
    products: {
      title: 'Products',
      description:
        'Drawings and 3D models of turned and milled parts made at SUGO, in steel, stainless steel, aluminium, brass and plastics.',
    },
    contact: {
      title: 'Contact',
      description:
        'Send your drawing for a quote (PDF, STEP or DXF). Address, phone and directions to SUGO d.o.o. in Jakobski Dol.',
    },
    privacy: {
      title: 'Privacy policy',
      description:
        'How SUGO d.o.o. processes personal data submitted through the website, and which rights you have.',
    },
  },
};
