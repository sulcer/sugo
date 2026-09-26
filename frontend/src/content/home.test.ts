import { expect, it } from 'vitest';
import { HOME, TIMELINE } from './home';

it('lists the company history in order', () => {
  expect(TIMELINE.map((event) => event.year)).toEqual([2010, 2019, 2020, 2022]);
});

it('keeps the client headline exactly', () => {
  expect(HOME.sl.h1).toBe('Kakovostna mehanska obdelava kovin za vaše inovativne ideje');
});

it('names the six turning operations in machining order', () => {
  expect(HOME.en.operations).toEqual(['Facing', 'Roughing', 'Finishing', 'Thread', 'Drilling', 'Parting']);
});
