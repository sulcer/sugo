'use client';

import { useRef } from 'react';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';
import { plotLines, revealHatch } from './animations';
import { DrawingSvg } from './DrawingSvg';
import { drawSubject, viewBoxOf, type DrawingSubject } from './geometry';
import { useDrawingScale } from './use-drawing-scale';

type TechnicalDrawingProps = {
  subject: DrawingSubject;
  /** Typical rendered width in px; the server render uses it for line weights. */
  nominalWidth: number;
  /** Width / height of the box; the drawing's own proportion when omitted. */
  aspect?: number;
  /** Hover vocabulary: parts sweep their hatching in, machines plot their work envelope. */
  hover?: 'hatch' | 'envelope';
  className?: string;
};

/** An engineering drawing that keeps true line weights at any size. */
export function TechnicalDrawing({ subject, nominalWidth, aspect, hover, className }: TechnicalDrawingProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const viewBox = viewBoxOf(subject);
  const boxAspect = aspect ?? viewBox[2] / viewBox[3];
  const k = useDrawingScale(boxRef, viewBox, nominalWidth, boxAspect);

  const animateHover = () => {
    const svg = svgRef.current;
    if (!svg || reducedMotion) return;
    if (hover === 'hatch') revealHatch(svg, 520);
    if (hover === 'envelope') plotLines(svg, '[data-envelope-plot]', '[data-envelope-fade]', 700);
  };

  return (
    <div
      ref={boxRef}
      className={className}
      style={{ aspectRatio: String(boxAspect) }}
      onMouseEnter={hover ? animateHover : undefined}
    >
      <DrawingSvg ref={svgRef} drawing={drawSubject(subject, k)} k={k} />
    </div>
  );
}
