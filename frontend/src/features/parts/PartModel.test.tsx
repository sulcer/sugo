import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { PartModel } from './PartModel';

const scene = vi.hoisted(() => ({
  create: vi.fn(),
  dispose: vi.fn(),
  stopSpin: vi.fn(),
}));

vi.mock('@/three/model-scene', () => ({
  createModelScene: scene.create,
}));
vi.mock('@/three/spin', () => ({
  startSpin: () => scene.stopSpin,
}));

beforeEach(() => {
  scene.create.mockReset().mockImplementation(() => ({
    pose: vi.fn(),
    render: vi.fn(),
    spinTo: vi.fn(),
    restAngle: 0,
    dispose: scene.dispose,
  }));
  scene.dispose.mockReset();
  scene.stopSpin.mockReset();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
});

afterEach(() => vi.unstubAllGlobals());

const renderPart = (label = 'Prirobnica') =>
  render(<PartModel kind="r17" tone="metal" label={label} nominalWidth={260} />);

it('is a toggle button named after the part', () => {
  renderPart();
  expect(screen.getByRole('button', { name: 'Prirobnica' })).toHaveAttribute('aria-pressed', 'false');
});

it('switches to the 3D model when tapped', async () => {
  renderPart();
  await userEvent.click(screen.getByRole('button'));
  expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
});

it('builds the model scene once the 3D code has loaded', async () => {
  renderPart();
  await userEvent.click(screen.getByRole('button'));
  await waitFor(() => expect(scene.create).toHaveBeenCalledOnce());
});

it('returns to the drawing and frees the scene when tapped again', async () => {
  renderPart();
  await userEvent.click(screen.getByRole('button'));
  await waitFor(() => expect(scene.create).toHaveBeenCalled());
  await userEvent.click(screen.getByRole('button'));
  expect([screen.getByRole('button').getAttribute('aria-pressed'), scene.dispose.mock.calls.length]).toEqual([
    'false',
    1,
  ]);
});

it('stops the first part when a second one goes live', async () => {
  render(
    <>
      <PartModel kind="r17" tone="metal" label="Prirobnica" nominalWidth={260} />
      <PartModel kind="r20" tone="brass" label="Matica" nominalWidth={260} />
    </>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Prirobnica' }));
  await userEvent.click(screen.getByRole('button', { name: 'Matica' }));
  expect(screen.getByRole('button', { name: 'Prirobnica' })).toHaveAttribute('aria-pressed', 'false');
});

it('stays on the drawing when the browser cannot render 3D', async () => {
  scene.create.mockImplementation(() => {
    throw new Error('WebGL unavailable');
  });
  renderPart();
  await userEvent.click(screen.getByRole('button'));
  await waitFor(() => expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false'));
});

it('frees the scene when it leaves the page', async () => {
  const { unmount } = renderPart();
  await userEvent.click(screen.getByRole('button'));
  await waitFor(() => expect(scene.create).toHaveBeenCalled());
  unmount();
  expect(scene.dispose).toHaveBeenCalledOnce();
});

it('ignores the click that ends a drag', () => {
  renderPart();
  const button = screen.getByRole('button');
  fireEvent.pointerDown(button, { clientX: 10, clientY: 10 });
  fireEvent.click(button, { clientX: 40, clientY: 10 });
  expect(button).toHaveAttribute('aria-pressed', 'false');
});
