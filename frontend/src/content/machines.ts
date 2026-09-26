import { MACHINE_SPECS, type MachineKind, type MachineSpec } from '@/drawing/geometry/machines';
import type { Locale, Localized } from '@/i18n/locales';

export type MachineType = MachineSpec['type'];

/** An axis or diameter symbol and its work envelope figure in millimetres. */
export type MachineFigure = readonly [axis: 'Ø' | 'L' | 'X' | 'Y' | 'Z', value: number];

export const MACHINE_TYPES: Record<MachineType, Localized<string>> = {
  lathe: { sl: 'CNC stružnica', de: 'CNC-Drehmaschine', en: 'CNC lathe' },
  vmc: {
    sl: 'Vertikalni obdelovalni center',
    de: 'Vertikales Bearbeitungszentrum',
    en: 'Vertical machining centre',
  },
};

/** The machines in sheet order; their type and figures come from the drawn geometry. */
export const MACHINES: readonly { kind: MachineKind; name: string }[] = [
  { kind: 'm1', name: 'Hyundai Wia L160 LMSA' },
  { kind: 'm2', name: 'Hyundai Wia SE 2200 LMSC' },
  { kind: 'm3', name: 'Hyundai Wia E160' },
  { kind: 'm4', name: 'Doosan Lynx 2100' },
  { kind: 'm5', name: 'KAFO VMC 510' },
  { kind: 'm6', name: 'VMC-600LR' },
];

/** The figures the drawing dimensions: Ø × L for a lathe, the three travels for a centre. */
// prettier-ignore
function figuresOf(spec: MachineSpec): MachineFigure[] {
  return spec.type === 'lathe'
    ? [['Ø', spec.D], ['L', spec.L]]
    : [['X', spec.X], ['Y', spec.Y], ['Z', spec.Z]];
}

/** The machines, numbered across the whole park and labelled in one locale. */
export function machineRows(locale: Locale) {
  return MACHINES.map(({ kind, name }, index) => {
    const spec: MachineSpec = MACHINE_SPECS[kind];
    return {
      kind,
      name,
      type: spec.type,
      no: String(index + 1).padStart(2, '0'),
      typeLabel: MACHINE_TYPES[spec.type][locale],
      figures: figuresOf(spec),
    };
  });
}

/** One machine as the sheet lists it. */
export type MachineListing = ReturnType<typeof machineRows>[number];
