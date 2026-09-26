import { useId, type ReactNode, type Ref } from 'react';
import type { Drawing, DrawingLayer, ViewBox } from './geometry';
import { round2 } from './geometry/path';

export const INK = '#1E2124';
export const ACCENT = '#1F3FBF';
const MUTED = '#5C6166';
const PAPER = '#F2F1EC';

/** Hatch pattern and the clip rectangle the hover sweep animates. */
export function DrawingDefs({ id, viewBox, k }: { id: string; viewBox: ViewBox; k: number }) {
  const pitch = round2(5 * k);
  return (
    <defs>
      <pattern
        id={`${id}-hatch`}
        data-hatch-pattern=""
        patternUnits="userSpaceOnUse"
        width={pitch}
        height={pitch}
        patternTransform="rotate(45)"
      >
        <path d={`M0 -1 V${round2(pitch + 1)}`} stroke={INK} strokeWidth={round2(0.7 * k * 0.9)} />
      </pattern>
      <clipPath id={`${id}-clip`}>
        <rect
          data-hatch-clip=""
          x={round2(viewBox[0])}
          y={round2(viewBox[1])}
          width={round2(viewBox[2])}
          height={round2(viewBox[3])}
        />
      </clipPath>
    </defs>
  );
}

/**
 * One view of a drawing. Data attributes are the animation contract: `data-plot` lines are drawn by
 * the plotter, `data-fade` elements fade in after them, `data-envelope-*` do the same for the
 * machine work envelope, and `data-hatch` is swept in on hover.
 */
export function DrawingLayerGroup({
  layer,
  id,
  clip = true,
}: {
  layer: DrawingLayer;
  id: string;
  clip?: boolean;
}) {
  const k = layer.k;
  const thin = round2(0.7 * k);
  const hasEnvelope = layer.envelope.length > 0 || layer.envelopeThin.length > 0;
  return (
    <g data-view={layer.view || undefined} style={{ transition: 'opacity .25s linear' }}>
      {layer.roads.map((d) => (
        <g key={d}>
          <path d={d} fill="none" stroke={INK} strokeWidth={round2(16 * k)} strokeLinecap="butt" />
          <path d={d} fill="none" stroke={PAPER} strokeWidth={round2(13.4 * k)} strokeLinecap="butt" />
        </g>
      ))}
      <g
        data-hatch=""
        clipPath={clip ? `url(#${id}-clip)` : undefined}
        style={{ transition: 'opacity .4s linear' }}
      >
        {layer.hatch.map((d, i) => (
          <path key={i} d={d} fill={`url(#${id}-hatch)`} fillRule="evenodd" />
        ))}
      </g>
      <g fill="none" stroke={INK} strokeLinecap="round" strokeLinejoin="round">
        <g
          data-centre=""
          data-fade=""
          strokeWidth={thin}
          strokeDasharray={[14, 3, 2, 3].map((v) => round2(v * k)).join(' ')}
        >
          {layer.centre.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <g strokeWidth={thin}>
          {layer.thin.map((d, i) => (
            <path key={i} data-plot="" d={d} />
          ))}
        </g>
        <g strokeWidth={round2(1.5 * k)}>
          {layer.thick.map((d, i) => (
            <path key={i} data-plot="" d={d} />
          ))}
        </g>
      </g>
      {layer.fills.map((d, i) => (
        <path key={i} data-fade="" d={d} fill={INK} />
      ))}
      {hasEnvelope && (
        <g data-envelope="" fill="none" stroke={ACCENT} strokeLinecap="round">
          {layer.envelope.map((d, i) => (
            <path key={`e${i}`} data-envelope-plot="" d={d} strokeWidth={round2(1.8 * k)} />
          ))}
          {layer.envelopeThin.map((d, i) => (
            <path key={`t${i}`} data-envelope-plot="" d={d} strokeWidth={round2(0.8 * k)} />
          ))}
          {layer.envelopeFill.map((d, i) => (
            <path key={`f${i}`} data-envelope-fade="" d={d} fill={ACCENT} stroke="none" />
          ))}
        </g>
      )}
      {layer.texts.map((t, i) => (
        <text
          key={i}
          {...(t.accent ? { 'data-envelope-fade': '' } : { 'data-fade': '' })}
          className="font-mono"
          x={round2(t.x)}
          y={round2(t.y)}
          fontSize={round2(t.size * k)}
          letterSpacing={round2(0.04 * t.size * k)}
          fill={t.accent ? ACCENT : t.muted ? MUTED : INK}
          textAnchor={t.anchor}
        >
          {t.text}
        </text>
      ))}
    </g>
  );
}

/** Stable, url()-safe id for a drawing's pattern and clip path. */
export function useDrawingId() {
  return `d${useId().replace(/[^\w-]/g, '')}`;
}

type DrawingSvgProps = {
  drawing: Drawing;
  k: number;
  preserveAspectRatio?: string;
  className?: string;
  /** Extra SVG drawn over the drawing in the same coordinates (e.g. tool paths). */
  children?: ReactNode;
  ref?: Ref<SVGSVGElement>;
};

export function DrawingSvg({ drawing, k, preserveAspectRatio, className, children, ref }: DrawingSvgProps) {
  const id = useDrawingId();
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={drawing.viewBox.map(round2).join(' ')}
      width="100%"
      height="100%"
      preserveAspectRatio={preserveAspectRatio ?? 'xMidYMid meet'}
      className={className}
      style={{ display: 'block', overflow: 'visible' }}
      aria-hidden="true"
      focusable="false"
    >
      <DrawingDefs id={id} viewBox={drawing.viewBox} k={k} />
      {drawing.layers.map((layer, i) => (
        <DrawingLayerGroup key={i} layer={layer} id={id} />
      ))}
      {children}
    </svg>
  );
}
