import type { MachineKind } from '@/drawing/geometry/machines';
import type { Locale, Localized } from '@/i18n/locales';

export type MachineType = 'lathe' | 'vmc';

/** An axis or diameter symbol and its work envelope figure in millimetres. */
export type MachineFigure = readonly [axis: string, value: string];

export const MACHINE_TYPES: Record<MachineType, Localized<string>> = {
  lathe: { sl: 'CNC stružnica', de: 'CNC-Drehmaschine', en: 'CNC lathe' },
  vmc: {
    sl: 'Vertikalni obdelovalni center',
    de: 'Vertikales Bearbeitungszentrum',
    en: 'Vertical machining centre',
  },
};

type Machine = {
  kind: MachineKind;
  type: MachineType;
  name: string;
  figures: readonly MachineFigure[];
};

// prettier-ignore
export const MACHINES: readonly Machine[] = [
  { kind: 'm1', type: 'lathe', name: 'Hyundai Wia L160 LMSA', figures: [['Ø', '160'], ['L', '500']] },
  { kind: 'm2', type: 'lathe', name: 'Hyundai Wia SE 2200 LMSC', figures: [['Ø', '160'], ['L', '500']] },
  { kind: 'm3', type: 'lathe', name: 'Hyundai Wia E160', figures: [['Ø', '160'], ['L', '300']] },
  { kind: 'm4', type: 'lathe', name: 'Doosan Lynx 2100', figures: [['Ø', '210'], ['L', '500']] },
  { kind: 'm5', type: 'vmc', name: 'KAFO VMC 510', figures: [['X', '500'], ['Y', '350'], ['Z', '250']] },
  { kind: 'm6', type: 'vmc', name: 'VMC-600LR', figures: [['X', '600'], ['Y', '400'], ['Z', '300']] },
];

/** The machines, numbered across the whole park and labelled in one locale. */
export function machineRows(locale: Locale) {
  return MACHINES.map((machine, index) => ({
    ...machine,
    no: String(index + 1).padStart(2, '0'),
    typeLabel: MACHINE_TYPES[machine.type][locale],
  }));
}
