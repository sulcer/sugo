import { PART_GEOMETRY, type TurnedPart } from '@/drawing/geometry/parts-table';
import type { Tone } from '@/three/materials';

/** The part the hero draws, turns and shows finished; the prerendered still is made from it too. */
export const HERO_PART = PART_GEOMETRY.flange as TurnedPart;
export const HERO_SUBJECT = { type: 'part', kind: 'flange', views: 'full' } as const;
export const HERO_TONE: Tone = 'metal';
