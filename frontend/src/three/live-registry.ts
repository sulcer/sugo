/**
 * At most one interactive 3D scene runs at a time (the design's rule, and a cap on WebGL
 * contexts). Starting a scene stops the previous one; the returned function gives the claim up.
 */
let current: { stop: () => void } | null = null;

export function claimLive(stop: () => void): () => void {
  const previous = current;
  const claim = { stop };
  current = claim;
  previous?.stop();
  return () => {
    if (current === claim) current = null;
  };
}
