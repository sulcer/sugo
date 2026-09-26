import type { Ref } from 'react';
import { ACCENT, INK } from '@/drawing/DrawingSvg';

const PAPER = '#F2F1EC';
const DRILL_FLUTES = Array.from({ length: 8 }, (_, i) => i);

type ToolOverlayProps = {
  k: number;
  /** Part length and stock radius place the chuck jaws. */
  length: number;
  stockRadius: number;
  groupRef: Ref<SVGGElement>;
  feedRef: Ref<SVGPathElement>;
  rapidRef: Ref<SVGPathElement>;
  turnRef: Ref<SVGGElement>;
  threadRef: Ref<SVGGElement>;
  drillRef: Ref<SVGGElement>;
  partRef: Ref<SVGGElement>;
};

/**
 * Lathe tools, their toolpaths and the chuck, drawn over the part in drawing units (the tool tip
 * at the origin). Hidden until machining starts; moved every frame by the simulation.
 */
export function ToolOverlay({
  k,
  length,
  stockRadius,
  groupRef,
  feedRef,
  rapidRef,
  turnRef,
  threadRef,
  drillRef,
  partRef,
}: ToolOverlayProps) {
  const fixed = (value: number) => value.toFixed(2);
  const [thick, thin] = [fixed(1.5 * k), fixed(0.7 * k)];
  const holder = { fill: PAPER, stroke: INK, strokeWidth: thin };
  const insert = { fill: PAPER, stroke: INK, strokeWidth: thick, strokeLinejoin: 'round' as const };
  const chuckX = length + 7;
  return (
    <g ref={groupRef} opacity={0}>
      <path ref={feedRef} fill="none" stroke={ACCENT} strokeWidth={fixed(1.3 * k)} strokeLinejoin="round" />
      <path
        ref={rapidRef}
        fill="none"
        stroke={ACCENT}
        strokeWidth={fixed(0.8 * k)}
        strokeDasharray={`${fixed(4 * k)} ${fixed(3 * k)}`}
      />
      <g ref={turnRef} display="none">
        <path d="M-1.4 3.6 h7 v44 h-7 Z" {...holder} />
        <path d="M0 0 L3.4 1.5 L2.8 4.9 L-1 3.4 Z" {...insert} />
      </g>
      <g ref={threadRef} display="none">
        <path d="M-2.6 3 h5.2 v44 h-5.2 Z" {...holder} />
        <path d="M0 0 L1.7 3 L-1.7 3 Z" {...insert} />
      </g>
      <g ref={drillRef} display="none">
        <path d="M0 0 L-7.2 -12 H-80 V12 H-7.2 Z" {...insert} />
        {DRILL_FLUTES.map((i) => (
          <path
            key={i}
            d={`M${fixed(-12 - i * 8.5)} -12 L${fixed(-20 - i * 8.5)} 12`}
            stroke={INK}
            strokeWidth={thin}
          />
        ))}
      </g>
      <g ref={partRef} display="none">
        <path d="M-4.5 28 h9 v30 h-9 Z" {...holder} />
        <path d="M-0.6 0 h1.2 v28 h-1.2 Z" fill={PAPER} stroke={INK} strokeWidth={thick} />
      </g>
      <path
        d={
          `M${fixed(chuckX)} ${fixed(-stockRadius - 9)} h9 v${fixed(2 * stockRadius + 18)} h-9 Z ` +
          `M${fixed(chuckX)} ${fixed(-stockRadius - 2)} h-3 v-7 h3 M${fixed(chuckX)} ${fixed(stockRadius + 2)} h-3 v7 h3`
        }
        fill="none"
        stroke={INK}
        strokeWidth={thin}
      />
    </g>
  );
}
