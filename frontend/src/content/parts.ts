import type { PartKind } from '@/drawing/geometry';
import type { Localized } from '@/i18n/locales';
import type { Tone } from '@/three/materials';

export type Process = 'turning' | 'milling' | 'plastic';
export type Material = 'steel' | 'stainless' | 'alu' | 'brass' | 'PVC';

export type Part = {
  kind: Exclude<PartKind, 'flange'>;
  process: Process;
  /** Null until the client confirms it; unknown materials are never shown. */
  material: Material | null;
  tone: Tone;
  name: Localized<string>;
};

/** Parts made at SUGO, in catalogue order (numbered 01–20 on the site). */
export const PARTS: readonly Part[] = [
  {
    kind: 'r01',
    process: 'milling',
    material: null,
    tone: 'metal',
    name: { sl: 'Nosilna plošča z žepi', de: 'Trägerplatte mit Taschen', en: 'Pocketed carrier plate' },
  },
  {
    kind: 'r02',
    process: 'milling',
    material: null,
    tone: 'dark',
    name: { sl: 'Pokrov', de: 'Deckel', en: 'Cover plate' },
  },
  {
    kind: 'r03',
    process: 'turning',
    material: null,
    tone: 'metal',
    name: { sl: 'Gred z notranjim navojem', de: 'Welle mit Innengewinde', en: 'Shaft with internal thread' },
  },
  {
    kind: 'r04',
    process: 'turning',
    material: null,
    tone: 'metal',
    name: { sl: 'Jermenica z matico', de: 'Riemenscheibe mit Mutter', en: 'Pulley nut' },
  },
  {
    kind: 'r05',
    process: 'turning',
    material: null,
    tone: 'metal',
    name: { sl: 'Os z glavo', de: 'Achse mit Kopf', en: 'Headed axle' },
  },
  {
    kind: 'r06',
    process: 'plastic',
    material: 'PVC',
    tone: 'darkplastic',
    name: { sl: 'PVC blok', de: 'PVC-Block', en: 'PVC block' },
  },
  {
    kind: 'r07',
    process: 'milling',
    material: null,
    tone: 'metal',
    name: { sl: 'Letev', de: 'Leiste', en: 'Bar' },
  },
  {
    kind: 'r08',
    process: 'turning',
    material: null,
    tone: 'metal',
    name: { sl: 'Vijak z ramo', de: 'Passschraube', en: 'Shoulder bolt' },
  },
  {
    kind: 'r09',
    process: 'turning',
    material: null,
    tone: 'metal',
    name: { sl: 'Pesta', de: 'Nabe', en: 'Hub' },
  },
  {
    kind: 'r10',
    process: 'turning',
    material: null,
    tone: 'metal',
    name: { sl: 'Mali vijak z ramo', de: 'Kleine Passschraube', en: 'Small shoulder screw' },
  },
  {
    kind: 'r11',
    process: 'turning',
    material: null,
    tone: 'metal',
    name: { sl: 'Navojna puša', de: 'Gewindehülse', en: 'Threaded sleeve' },
  },
  {
    kind: 'r12',
    process: 'turning',
    material: null,
    tone: 'metal',
    name: { sl: 'Šestrobi vijak', de: 'Sechskantschraube', en: 'Hex bolt' },
  },
  {
    kind: 'r13',
    process: 'milling',
    material: null,
    tone: 'metal',
    name: { sl: 'Kocka s prevrtino', de: 'Würfel mit Bohrung', en: 'Bored cube' },
  },
  {
    kind: 'r14',
    process: 'milling',
    material: null,
    tone: 'metal',
    name: { sl: 'Rebrasta plošča', de: 'Rippenplatte', en: 'Ribbed plate' },
  },
  {
    kind: 'r15',
    process: 'milling',
    material: null,
    tone: 'metal',
    name: { sl: 'Nosilec', de: 'Halter', en: 'Bracket' },
  },
  {
    kind: 'r16',
    process: 'turning',
    material: null,
    tone: 'metal',
    name: { sl: 'Matica', de: 'Mutter', en: 'Nut' },
  },
  {
    kind: 'r17',
    process: 'turning',
    material: null,
    tone: 'metal',
    name: { sl: 'Prirobnica', de: 'Flansch', en: 'Flange' },
  },
  {
    kind: 'r18',
    process: 'turning',
    material: null,
    tone: 'metal',
    name: { sl: 'Spojka', de: 'Verschraubung', en: 'Union' },
  },
  {
    kind: 'r19',
    process: 'turning',
    material: null,
    tone: 'metal',
    name: { sl: 'Os', de: 'Achse', en: 'Axle' },
  },
  {
    kind: 'r20',
    process: 'turning',
    material: 'brass',
    tone: 'brass',
    name: { sl: 'Medeninasta matica', de: 'Messingmutter', en: 'Brass nut' },
  },
];

export const toneOf = (kind: PartKind): Tone => PARTS.find((part) => part.kind === kind)?.tone ?? 'metal';
