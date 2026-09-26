'use client';

import { useEffect, useRef, useState } from 'react';
import { revealHatch, showFrame } from '@/drawing/animations';
import { DrawingSvg } from '@/drawing/DrawingSvg';
import { drawSubject, viewBoxOf, type Drawing, type PartKind } from '@/drawing/geometry';
import { PART_GEOMETRY } from '@/drawing/geometry/parts-table';
import { useDrawingScale } from '@/drawing/use-drawing-scale';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';
import { wait } from '@/lib/wait';
import { claimLive } from '@/three/live-registry';
import type { Tone } from '@/three/materials';

/** A tap that ends a drag (turning the model by hand) must not toggle it off. */
const DRAG_TOLERANCE_PX = 6;
/** Frame 2 (metal in the section) holds this long before the model tilts out. */
const METAL_FRAME_MS = 900;

type PartModelProps = {
  kind: PartKind;
  tone: Tone;
  label: string;
  nominalWidth: number;
  aspect?: number;
};

/** A part drawing that turns into its 3D model on tap: drawing → metal → spinning part. */
export function PartModel({ kind, tone, label, nominalWidth, aspect = 1.3 }: PartModelProps) {
  const boxRef = useRef<HTMLButtonElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const stopSession = useRef<(() => void) | null>(null);
  const [live, setLive] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const subject = { type: 'part', kind, views: 'front' } as const;
  const k = useDrawingScale(boxRef, viewBoxOf(subject), nominalWidth, aspect);
  const drawing = drawSubject(subject, k);

  // A scene is sized for the drawing it replaced; after a real resize, go back to the drawing.
  useEffect(() => () => stopSession.current?.(), [k]);

  const start = () => {
    const [box, svg, canvas] = [boxRef.current, svgRef.current, canvasRef.current];
    if (!box || !svg || !canvas) return;
    const controller = new AbortController();
    const cleanups: (() => void)[] = [];
    const stop = () => {
      if (stopSession.current !== stop) return;
      stopSession.current = null;
      controller.abort();
      cleanups.reverse().forEach((cleanup) => cleanup());
      canvas.style.opacity = '0';
      showFrame(svg, 1);
      release();
      setLive(false);
    };
    const release = claimLive(stop);
    stopSession.current = stop;
    setLive(true);
    playModel({ box, svg, canvas, drawing, kind, tone, signal: controller.signal, cleanups }).catch(() =>
      stop(),
    );
  };

  return (
    <button
      ref={boxRef}
      type="button"
      aria-pressed={live}
      aria-label={label}
      className="relative block w-full cursor-pointer aria-pressed:cursor-auto"
      style={{ aspectRatio: String(aspect) }}
      onPointerDown={(event) => {
        pointerStart.current = { x: event.clientX, y: event.clientY };
      }}
      onClick={(event) => {
        const from = pointerStart.current;
        pointerStart.current = null;
        if (from && Math.hypot(event.clientX - from.x, event.clientY - from.y) > DRAG_TOLERANCE_PX) return;
        if (live) stopSession.current?.();
        else start();
      }}
      onMouseEnter={() => {
        if (!live && !reducedMotion && svgRef.current) revealHatch(svgRef.current, 520);
      }}
    >
      <span className="absolute inset-0">
        <DrawingSvg ref={svgRef} drawing={drawing} />
      </span>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full opacity-0 transition-opacity duration-450 ease-linear"
        style={{ touchAction: 'pan-y' }}
      />
    </button>
  );
}

type PlayOptions = {
  box: HTMLElement;
  svg: SVGSVGElement;
  canvas: HTMLCanvasElement;
  drawing: Drawing;
  kind: PartKind;
  tone: Tone;
  signal: AbortSignal;
  cleanups: (() => void)[];
};

async function playModel({ box, svg, canvas, drawing, kind, tone, signal, cleanups }: PlayOptions) {
  showFrame(svg, 1);
  const [{ createModelScene }, { startSpin }] = await Promise.all([
    import('@/three/model-scene'),
    import('@/three/spin'),
  ]);
  signal.throwIfAborted();
  const model = createModelScene({
    canvas,
    part: PART_GEOMETRY[kind],
    drawing,
    size: [box.clientWidth, box.clientHeight],
    tone,
  });
  cleanups.push(() => model.dispose());
  model.pose(2);
  model.render();
  canvas.style.opacity = '1';
  showFrame(svg, 2);
  await wait(METAL_FRAME_MS, signal);
  showFrame(svg, 3);
  cleanups.push(startSpin(model, canvas));
}
