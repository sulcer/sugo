import { Scene } from 'three';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { TurnedPart } from '@/drawing/geometry/parts-table';
import { PART_GEOMETRY } from '@/drawing/geometry/parts-table';
import { runMachining, type ToolOverlayHandle } from './simulate';

const flange = PART_GEOMETRY.flange as TurnedPart;
let frames = new Map<number, FrameRequestCallback>();
let nextFrame = 0;
let now = 0;

beforeEach(() => {
  frames = new Map();
  now = 0;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  vi.spyOn(performance, 'now').mockImplementation(() => now);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** Runs animation frames 250 ms apart until the machining finishes. */
async function runToEnd<T>(promise: Promise<T>) {
  let settled = false;
  void promise.finally(() => (settled = true));
  for (let guard = 0; !settled && guard < 2000; guard++) {
    now += 250;
    const pending = [...frames.values()];
    frames = new Map();
    pending.forEach((frame) => frame(now));
    await Promise.resolve();
  }
  return promise;
}

const overlay = (): ToolOverlayHandle => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const make = <K extends 'path' | 'g'>(tag: K) =>
    svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', tag));
  return {
    feed: make('path'),
    rapid: make('path'),
    tools: { turn: make('g'), thread: make('g'), drill: make('g'), part: make('g') },
  };
};

const model = () => ({ scene: new Scene(), render: vi.fn(), hideModels: vi.fn() });

it('works through the operations in machining order', async () => {
  const operations: number[] = [];
  await runToEnd(
    runMachining({
      model: model(),
      part: flange,
      overlay: overlay(),
      onOperation: (op) => operations.push(op),
      signal: new AbortController().signal,
    }),
  );
  expect(operations).toEqual([0, 1, 2, 3, 4, 5]);
});

it('leaves the finished, parted-off part', async () => {
  const run = await runToEnd(
    runMachining({
      model: model(),
      part: flange,
      overlay: overlay(),
      onOperation: () => {},
      signal: new AbortController().signal,
    }),
  );
  const beyondPart = run.stock.xs.findIndex((x) => x > flange.L + 1);
  expect(run.stock.outer[beyondPart]).toBe(0);
});

it('draws the feed moves as a toolpath', async () => {
  const handle = overlay();
  await runToEnd(
    runMachining({
      model: model(),
      part: flange,
      overlay: handle,
      onOperation: () => {},
      signal: new AbortController().signal,
    }),
  );
  expect(handle.feed.getAttribute('d')).toMatch(/^M-0\.30 38\.50L-0\.30 0\.00/);
});

it('shows only the tool in use', async () => {
  const handle = overlay();
  await runToEnd(
    runMachining({
      model: model(),
      part: flange,
      overlay: handle,
      onOperation: () => {},
      signal: new AbortController().signal,
    }),
  );
  expect(
    Object.entries(handle.tools)
      .filter(([, tool]) => tool.style.display === 'inline')
      .map(([name]) => name),
  ).toEqual(['part']);
});

it('reads out the tool position like a DRO', async () => {
  const readouts: string[] = [];
  await runToEnd(
    runMachining({
      model: model(),
      part: flange,
      overlay: overlay(),
      onOperation: () => {},
      onReadout: (x, z) => readouts.push(`${x} | ${z}`),
      signal: new AbortController().signal,
    }),
  );
  expect(readouts.at(-1)).toBe('X Ø 129.000  T04 | Z -60.000');
});

it('stops when aborted', async () => {
  const controller = new AbortController();
  const run = runMachining({
    model: model(),
    part: flange,
    overlay: overlay(),
    onOperation: () => {},
    signal: controller.signal,
  });
  now += 250;
  [...frames.values()].forEach((frame) => frame(now));
  controller.abort();
  await expect(run).rejects.toThrow();
});
