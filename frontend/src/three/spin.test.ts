import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { ModelScene } from './model-scene';
import { startSpin } from './spin';

let frames = new Map<number, FrameRequestCallback>();
let nextFrame = 0;
let now = 0;
const advanceTo = (time: number) => {
  now = time;
  const pending = [...frames.values()];
  frames = new Map();
  pending.forEach((frame) => frame(time));
};

const fakeModel = () => {
  const state = { frame: 0, progress: 0, angle: 0, renders: 0 };
  const model = {
    restAngle: 0.35,
    pose: (frame: 2 | 3, progress = 1) => Object.assign(state, { frame, progress }),
    spinTo: (angle: number) => Object.assign(state, { angle }),
    render: () => state.renders++,
  } as unknown as ModelScene;
  return { model, state };
};

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

it('tilts the part in linearly over 420 ms', () => {
  const { model, state } = fakeModel();
  startSpin(model, document.createElement('canvas'));
  advanceTo(210);
  expect(state.progress).toBe(0.5);
});

it('stops the tilt exactly at the resting pose', () => {
  const { model, state } = fakeModel();
  startSpin(model, document.createElement('canvas'));
  advanceTo(420);
  advanceTo(900);
  expect(state.progress).toBe(1);
});

it('turns at a constant spindle speed once tilted in', () => {
  const { model, state } = fakeModel();
  startSpin(model, document.createElement('canvas'));
  advanceTo(420);
  const tiltedIn = state.angle;
  advanceTo(440);
  expect(state.angle - tiltedIn).toBeCloseTo(0.02 * 0.45);
});

it('turns the part by hand while it is dragged', () => {
  const { model, state } = fakeModel();
  const canvas = document.createElement('canvas');
  canvas.setPointerCapture = vi.fn();
  startSpin(model, canvas);
  advanceTo(420);
  const tiltedIn = state.angle;
  canvas.dispatchEvent(new PointerEvent('pointerdown', { clientX: 100, pointerId: 1 }));
  canvas.dispatchEvent(new PointerEvent('pointermove', { clientX: 150, pointerId: 1 }));
  advanceTo(440);
  expect(state.angle - tiltedIn).toBeCloseTo(50 * 0.012);
});

it('stops rendering when stopped', () => {
  const { model, state } = fakeModel();
  const stop = startSpin(model, document.createElement('canvas'));
  advanceTo(100);
  stop();
  const rendered = state.renders;
  advanceTo(200);
  expect(state.renders).toBe(rendered);
});
