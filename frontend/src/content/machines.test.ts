import { expect, it } from 'vitest';
import { machineRows } from './machines';

it('numbers the machines across the whole park and labels each type in the locale', () => {
  expect(machineRows('de')).toEqual([
    {
      no: '01',
      kind: 'm1',
      type: 'lathe',
      name: 'Hyundai Wia L160 LMSA',
      typeLabel: 'CNC-Drehmaschine',
      figures: [
        ['Ø', 160],
        ['L', 500],
      ],
    },
    {
      no: '02',
      kind: 'm2',
      type: 'lathe',
      name: 'Hyundai Wia SE 2200 LMSC',
      typeLabel: 'CNC-Drehmaschine',
      figures: [
        ['Ø', 160],
        ['L', 500],
      ],
    },
    {
      no: '03',
      kind: 'm3',
      type: 'lathe',
      name: 'Hyundai Wia E160',
      typeLabel: 'CNC-Drehmaschine',
      figures: [
        ['Ø', 160],
        ['L', 300],
      ],
    },
    {
      no: '04',
      kind: 'm4',
      type: 'lathe',
      name: 'Doosan Lynx 2100',
      typeLabel: 'CNC-Drehmaschine',
      figures: [
        ['Ø', 210],
        ['L', 500],
      ],
    },
    {
      no: '05',
      kind: 'm5',
      type: 'vmc',
      name: 'KAFO VMC 510',
      typeLabel: 'Vertikales Bearbeitungszentrum',
      figures: [
        ['X', 500],
        ['Y', 350],
        ['Z', 250],
      ],
    },
    {
      no: '06',
      kind: 'm6',
      type: 'vmc',
      name: 'VMC-600LR',
      typeLabel: 'Vertikales Bearbeitungszentrum',
      figures: [
        ['X', 600],
        ['Y', 400],
        ['Z', 300],
      ],
    },
  ]);
});
