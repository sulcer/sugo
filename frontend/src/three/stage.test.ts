import { expect, it, vi } from 'vitest';
import { createStage } from './stage';

const recorded = vi.hoisted(() => ({
  canvases: [] as HTMLCanvasElement[],
  frustums: [] as number[][],
  webgl: true,
}));
vi.mock('three', async (importOriginal) => {
  const three = await importOriginal<typeof import('three')>();
  class FakeRenderer {
    constructor({ canvas }: { canvas: HTMLCanvasElement }) {
      if (!recorded.webgl) throw new Error('Error creating WebGL context.');
      recorded.canvases.push(canvas);
    }
    setPixelRatio() {}
    setSize() {}
    render() {}
    dispose() {}
    forceContextLoss() {}
  }
  class RecordingCamera extends three.OrthographicCamera {
    constructor(left: number, right: number, top: number, bottom: number, near?: number, far?: number) {
      super(left, right, top, bottom, near, far);
      recorded.frustums.push([left, right, top, bottom]);
    }
  }
  return { ...three, WebGLRenderer: FakeRenderer, OrthographicCamera: RecordingCamera };
});
vi.mock('./environment', () => ({ createStudioEnvironment: () => null }));

const stageIn = (host?: HTMLElement) =>
  createStage({ host, size: [300, 100], viewBox: [0, 0, 600, 100] as const });

it('draws on a canvas of its own inside the host', () => {
  const host = document.createElement('div');
  const stage = stageIn(host);
  expect([...host.children]).toEqual([stage.canvas]);
});

it('takes its canvas out of the page when disposed', () => {
  const host = document.createElement('div');
  stageIn(host).dispose();
  expect(host.childElementCount).toBe(0);
});

it('never gives a new renderer the canvas whose context an earlier stage lost', () => {
  const host = document.createElement('div');
  recorded.canvases.length = 0;
  stageIn(host).dispose();
  stageIn(host);
  expect(recorded.canvases[0]).not.toBe(recorded.canvases[1]);
});

it('renders offscreen without a host', () => {
  expect(stageIn().canvas.isConnected).toBe(false);
});

it('frames the view box at its current size, as an SVG with "meet" does', () => {
  recorded.frustums.length = 0;
  stageIn(document.createElement('div'));
  expect(recorded.frustums).toEqual([[-300, 300, 100, -100]]);
});

it('leaves nothing in the host when the browser cannot create a WebGL context', () => {
  const host = document.createElement('div');
  recorded.webgl = false;
  try {
    expect(() => stageIn(host)).toThrow();
  } finally {
    recorded.webgl = true;
  }
  expect(host.childElementCount).toBe(0);
});
