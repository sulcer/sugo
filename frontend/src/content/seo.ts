import type { Localized } from '@/i18n/locales';
import type { RouteKey } from '@/i18n/routes';
import { CONTACT } from './contact';
import { MACHINE_PARK } from './machine-park';
import { PRODUCTS } from './products';
import { FOOTER } from './shell';

type SearchSnippet = { title: string; description: string };

/**
 * What search results and link previews show for each page. Titles follow each sheet's own heading
 * (" · SUGO d.o.o." is appended); descriptions are written for search.
 */
export const SEO: Localized<Record<RouteKey, SearchSnippet>> = {
  sl: {
    home: {
      title: 'CNC struženje in rezkanje',
      description:
        'Družinsko podjetje za CNC struženje in rezkanje po vaši risbi, od posameznih kosov do serijske proizvodnje. Premeri od 3 do 65 mm.',
    },
    park: {
      title: MACHINE_PARK.sl.title,
      description:
        'Šest CNC strojev: štiri stružnice in dva vertikalna obdelovalna centra, z delovnim prostorom vsakega stroja.',
    },
    products: {
      title: PRODUCTS.sl.title,
      description:
        'Risbe in 3D modeli struženih in rezkanih delov, izdelanih pri SUGO, iz jekla, nerjavnega jekla, aluminija, medenine in plastike.',
    },
    contact: {
      title: CONTACT.sl.title,
      description:
        'Pošljite risbo za ponudbo (PDF, STEP ali DXF). Naslov, telefon in lokacija podjetja SUGO d.o.o. v Jakobskem Dolu.',
    },
    privacy: {
      title: FOOTER.sl.privacy,
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
      title: MACHINE_PARK.de.title,
      description:
        'Sechs CNC-Maschinen: vier Drehmaschinen und zwei vertikale Bearbeitungszentren, mit dem Arbeitsraum jeder Maschine.',
    },
    products: {
      title: PRODUCTS.de.title,
      description:
        'Zeichnungen und 3D-Modelle von Dreh- und Frästeilen aus der Fertigung von SUGO – aus Stahl, Edelstahl, Aluminium, Messing und Kunststoff.',
    },
    contact: {
      title: CONTACT.de.title,
      description:
        'Senden Sie Ihre Zeichnung für ein Angebot (PDF, STEP oder DXF). Adresse, Telefon und Anfahrt zu SUGO d.o.o. in Jakobski Dol.',
    },
    privacy: {
      title: FOOTER.de.privacy,
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
      title: MACHINE_PARK.en.title,
      description:
        'Six CNC machines: four lathes and two vertical machining centres, with the work envelope of each.',
    },
    products: {
      title: PRODUCTS.en.title,
      description:
        'Drawings and 3D models of turned and milled parts made at SUGO, in steel, stainless steel, aluminium, brass and plastics.',
    },
    contact: {
      title: CONTACT.en.title,
      description:
        'Send your drawing for a quote (PDF, STEP or DXF). Address, phone and directions to SUGO d.o.o. in Jakobski Dol.',
    },
    privacy: {
      title: FOOTER.en.privacy,
      description:
        'How SUGO d.o.o. processes personal data submitted through the website, and which rights you have.',
    },
  },
};
