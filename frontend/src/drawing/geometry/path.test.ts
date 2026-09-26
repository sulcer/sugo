import { circle, clipSegment, line, polyline, rect, round2, roundedRect } from './path';

it('rounds to two decimals like the design engine', () => {
  expect(round2(1.23456)).toBe(1.23);
});

it('builds open and closed polylines from rounded points', () => {
  expect(
    polyline([
      [0, 0],
      [1.005, 2],
    ]),
  ).toBe('M0 0 L1 2');
  expect(
    polyline(
      [
        [0, 0],
        [1, 2],
      ],
      true,
    ),
  ).toBe('M0 0 L1 2 Z');
});

it('builds a line segment', () => {
  expect(line(0, 0, 3, 4)).toBe('M0 0 L3 4');
});

it('builds a full circle from two arcs', () => {
  expect(circle(0, 0, 2)).toBe('M2 0 A2 2 0 1 1 -2 0 A2 2 0 1 1 2 0');
});

it('draws a rectangle as a closed polyline', () => {
  expect(rect(0, 0, 2, 1)).toBe('M0 0 L2 0 L2 1 L0 1 Z');
});

it('rounds rectangle corners and clamps the radius to half the short side', () => {
  expect(roundedRect(0, 0, 4, 2, 5)).toBe(
    'M1 0 H3 A1 1 0 0 1 4 1 V1 A1 1 0 0 1 3 2 H1 A1 1 0 0 1 0 1 V1 A1 1 0 0 1 1 0 Z',
  );
});

it('falls back to a plain rectangle when the radius is zero', () => {
  expect(roundedRect(0, 0, 2, 1)).toBe(rect(0, 0, 2, 1));
});

it('clips a segment to a box', () => {
  expect(clipSegment(-1, 0, 2, 0, 0, -1, 1, 1)).toEqual([0, 0, 1, 0]);
});

it('rejects a segment entirely outside the box', () => {
  expect(clipSegment(2, 2, 3, 3, 0, 0, 1, 1)).toBeNull();
});
