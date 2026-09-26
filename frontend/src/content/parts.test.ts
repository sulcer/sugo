import { expect, it } from 'vitest';
import { PARTS } from './parts';

it('lists the twenty parts of the catalogue in order', () => {
  expect(PARTS.map((part) => part.kind)).toEqual(
    Array.from({ length: 20 }, (_, i) => `r${String(i + 1).padStart(2, '0')}`),
  );
});

it('shows each part in its own finish and machined parts as bright steel', () => {
  expect(
    Object.fromEntries(PARTS.filter((part) => part.tone !== 'metal').map((part) => [part.kind, part.tone])),
  ).toEqual({
    r02: 'dark',
    r06: 'darkplastic',
    r20: 'brass',
  });
});

it('knows only the materials the client has confirmed', () => {
  expect(
    Object.fromEntries(PARTS.filter((part) => part.material).map((part) => [part.kind, part.material])),
  ).toEqual({
    r06: 'PVC',
    r20: 'brass',
  });
});
