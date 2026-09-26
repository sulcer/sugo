'use client';

import { useEffect, useRef } from 'react';
import { DrawingDefs, DrawingLayerGroup, useDrawingId } from '@/drawing/DrawingSvg';
import { floorPlacements, PARTS_FLOOR } from '@/drawing/geometry/parts-floor';
import { round2 } from '@/drawing/geometry/path';
import { useDrawingScale } from '@/drawing/use-drawing-scale';
import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

const START_DELAY_MS = 600;
/** Phones keep the static drawing (and their battery). */
const MIN_VIEWPORT_PX = 460;

type PartsFloorProps = { className?: string; nominalWidth?: number; aspect?: number };

/**
 * Ten parts laid out as drawings on the floor under the counters. Once half of it is in view they
 * become 3D models that tilt up and turn. Reduced motion and phones keep the drawing.
 */
export function PartsFloor({ className, nominalWidth = 1200, aspect = 3.68 }: PartsFloorProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const drawingRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const relaunch = useRef<(() => void) | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const id = useDrawingId();
  const viewBox = PARTS_FLOOR.viewBox;
  const k = useDrawingScale(boxRef, viewBox, nominalWidth, aspect);

  useEffect(() => {
    const [box, drawing, canvas] = [boxRef.current, drawingRef.current, canvasRef.current];
    if (!box || !drawing || !canvas || reducedMotion) return;
    let visible = false;
    let started = false;
    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stop: (() => void) | undefined;

    const launch = async () => {
      const { startFloor } = await import('@/three/floor-scene');
      if (disposed) return;
      stop?.();
      try {
        stop = startFloor({
          canvas,
          drawing,
          size: [box.clientWidth, box.clientHeight],
          isVisible: () => visible,
        });
      } catch {
        stop = undefined; // No WebGL: the floor stays a drawing.
      }
    };
    relaunch.current = () => {
      if (stop) void launch();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        const ready =
          entry.intersectionRatio >= 0.5 && box.clientWidth >= 48 && window.innerWidth >= MIN_VIEWPORT_PX;
        if (started || !entry.isIntersecting || !ready) return;
        started = true;
        timer = setTimeout(launch, START_DELAY_MS);
      },
      { threshold: [0, 0.5] },
    );
    observer.observe(box);
    return () => {
      disposed = true;
      relaunch.current = null;
      observer.disconnect();
      clearTimeout(timer);
      stop?.();
    };
  }, [reducedMotion]);

  // The models are rendered for one size; after a real resize, rebuild them like the design does.
  useEffect(() => relaunch.current?.(), [k]);

  return (
    <div ref={boxRef} className={cn('relative', className)}>
      <div ref={drawingRef} className="absolute inset-0 transition-opacity duration-300 ease-linear">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={viewBox.map(round2).join(' ')}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          focusable="false"
          style={{ display: 'block', overflow: 'visible' }}
        >
          <DrawingDefs id={id} viewBox={viewBox} k={k} />
          {floorPlacements(k).map((placement, i) => (
            <g key={i} transform={placement.transform}>
              <DrawingLayerGroup layer={placement.layer} id={id} clip={false} />
            </g>
          ))}
        </svg>
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full opacity-0 transition-opacity duration-400 ease-linear"
      />
    </div>
  );
}
