import { LineBasicMaterial, MeshStandardMaterial, DoubleSide } from 'three';

/** Surface of a part: bright machined steel, brass, anodised dark, or grey / black plastic. */
export type Tone = 'metal' | 'plastic' | 'darkplastic' | 'dark' | 'brass';

const TONES: Record<Tone, { color: number; metalness: number; roughness: number }> = {
  metal: { color: 0xc4c7ca, metalness: 0.88, roughness: 0.36 },
  brass: { color: 0xc8a45e, metalness: 0.85, roughness: 0.34 },
  dark: { color: 0x2a2c30, metalness: 0.55, roughness: 0.42 },
  plastic: { color: 0x6a6e73, metalness: 0, roughness: 0.62 },
  darkplastic: { color: 0x2c2e32, metalness: 0, roughness: 0.55 },
};

export type PartMaterials = {
  metal: MeshStandardMaterial;
  /** Section faces of a cut-away model. */
  cap: MeshStandardMaterial;
  /** Inside of drilled holes. */
  hole: MeshStandardMaterial;
  /** CAD-style edge lines in drawing ink. */
  edge: LineBasicMaterial;
};

/** "Shaded with edges": satin surfaces pushed back a little so the ink edges always win. */
export function createMaterials(tone: Tone): PartMaterials {
  return {
    metal: new MeshStandardMaterial({
      ...TONES[tone],
      side: DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    }),
    cap: new MeshStandardMaterial({
      color: 0xdcdedf,
      metalness: 0.15,
      roughness: 0.85,
      side: DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    }),
    hole: new MeshStandardMaterial({ color: 0x33363a, metalness: 0.2, roughness: 0.8 }),
    edge: new LineBasicMaterial({ color: 0x1e2124, transparent: true, opacity: 0.8 }),
  };
}

export function disposeMaterials(materials: PartMaterials) {
  Object.values(materials).forEach((material) => material.dispose());
}
