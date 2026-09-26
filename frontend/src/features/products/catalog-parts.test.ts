import { expect, it } from 'vitest';
import { catalogParts } from './catalog-parts';

it('numbers the parts of the catalogue and resolves their names into one locale', () => {
  expect(catalogParts('de')[0]).toEqual({
    kind: 'r01',
    process: 'milling',
    material: null,
    tone: 'metal',
    name: 'Trägerplatte mit Taschen',
    number: '01',
    caption: 'Fräsen',
  });
});

it('adds the material to the caption once the client has confirmed it', () => {
  expect(catalogParts('sl').at(-1)).toEqual({
    kind: 'r20',
    process: 'turning',
    material: 'brass',
    tone: 'brass',
    name: 'Medeninasta matica',
    number: '20',
    caption: 'struženje · medenina',
  });
});

it('keeps the whole catalogue in order', () => {
  expect(catalogParts('en').map((part) => part.number)).toEqual(
    Array.from({ length: 20 }, (_, index) => String(index + 1).padStart(2, '0')),
  );
});
