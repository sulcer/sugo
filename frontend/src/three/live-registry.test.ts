import { expect, it, vi } from 'vitest';
import { claimLive } from './live-registry';

it('stops the scene that was live before', () => {
  const stopFirst = vi.fn();
  claimLive(stopFirst);
  claimLive(vi.fn());
  expect(stopFirst).toHaveBeenCalledOnce();
});

it('does not stop a scene that already released its claim', () => {
  const stopFirst = vi.fn();
  const release = claimLive(stopFirst);
  release();
  claimLive(vi.fn());
  expect(stopFirst).not.toHaveBeenCalled();
});

it('ignores a stale release so the newer scene keeps its claim', () => {
  const releaseFirst = claimLive(vi.fn());
  const stopSecond = vi.fn();
  claimLive(stopSecond);
  releaseFirst();
  claimLive(vi.fn());
  expect(stopSecond).toHaveBeenCalledOnce();
});
