import type { Material, Process } from '@/content/parts';
import type { Localized } from '@/i18n/locales';

/**
 * Copy of the Izdelki sheet. Process names stay lower case: they read as captions under the parts
 * and the filter chips capitalize their first letter.
 */
export const PRODUCTS: Localized<{
  title: string;
  lead: string;
  processLabel: string;
  materialLabel: string;
  all: string;
  allMaterials: string;
  result: string;
  empty: string;
  reset: string;
  footnote: string;
  process: Record<Process, string>;
  material: Record<Material, string>;
}> = {
  sl: {
    title: 'Izdelki',
    lead: 'Deli, izdelani pri SUGO po risbah naših strank. Vsak del si lahko ogledate kot risbo ali 3D model.',
    processLabel: 'Postopek',
    materialLabel: 'Material',
    all: 'Vse',
    allMaterials: 'Vsi materiali',
    result: 'prikazanih delov',
    empty: 'Za izbrani filter ni delov.',
    reset: 'Ponastavi filtre',
    footnote: 'Risbe in modeli so narejeni po delih, izdelanih pri SUGO.',
    process: { turning: 'struženje', milling: 'rezkanje', plastic: 'plastika' },
    material: {
      steel: 'jeklo',
      stainless: 'nerjavno jeklo',
      alu: 'aluminij',
      brass: 'medenina',
      PVC: 'PVC',
    },
  },
  de: {
    title: 'Produkte',
    lead: 'Teile, die bei SUGO nach Kundenzeichnung gefertigt wurden. Jedes Teil als Zeichnung oder 3D-Modell.',
    processLabel: 'Verfahren',
    materialLabel: 'Werkstoff',
    all: 'Alle',
    allMaterials: 'Alle Werkstoffe',
    result: 'Teile angezeigt',
    empty: 'Für diesen Filter gibt es keine Teile.',
    reset: 'Filter zurücksetzen',
    footnote: 'Die Zeichnungen und Modelle entstehen nach Teilen, die bei SUGO gefertigt wurden.',
    process: { turning: 'Drehen', milling: 'Fräsen', plastic: 'Kunststoff' },
    material: {
      steel: 'Stahl',
      stainless: 'Edelstahl',
      alu: 'Aluminium',
      brass: 'Messing',
      PVC: 'PVC',
    },
  },
  en: {
    title: 'Products',
    lead: 'Parts made at SUGO to our customers’ drawings. View each one as a drawing or a 3D model.',
    processLabel: 'Process',
    materialLabel: 'Material',
    all: 'All',
    allMaterials: 'All materials',
    result: 'parts shown',
    empty: 'No parts match this filter.',
    reset: 'Reset filters',
    footnote: 'Drawings and models are made from parts produced at SUGO.',
    process: { turning: 'turning', milling: 'milling', plastic: 'plastics' },
    material: {
      steel: 'steel',
      stainless: 'stainless steel',
      alu: 'aluminium',
      brass: 'brass',
      PVC: 'PVC',
    },
  },
};
