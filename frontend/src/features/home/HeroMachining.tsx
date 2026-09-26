'use client';

import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { preload } from 'react-dom';
import { plotLines, revealHatch, showFrame } from '@/drawing/animations';
import { DrawingSvg } from '@/drawing/DrawingSvg';
import { drawSubject, viewBoxOf, type Drawing } from '@/drawing/geometry';
import { useDrawingScale } from '@/drawing/use-drawing-scale';
import { cn } from '@/lib/cn';
import { prefersReducedMotion, usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';
import { useWidthBelow } from '@/lib/use-width-below';
import { wait } from '@/lib/wait';
import { loadHeroThree } from '@/three/load-hero';
import type { ToolOverlayHandle } from '@/three/machining/simulate';
import { STOCK_RADIUS } from '@/three/machining/stock';
import { HERO_PART, HERO_SUBJECT, HERO_TONE } from './hero-part';
import still from './hero-still.json';
import styles from './HeroMachining.module.css';
import { OperationStrip } from './OperationStrip';
import { ToolOverlay } from './ToolOverlay';

const HERO_ASPECT = 1.38;
/** Height the operation strip reserves below the drawing on wide heroes. */
const STRIP_BAND_PX = 56;
/** Below this width the hero shows the finished part as a still (HeroMachining.module.css tests the same). */
const STATIC_BELOW_PX = 460;
const STILL_SOURCES = still.widths.map((width) => `/hero/flange-${width}.webp ${width}w`).join(', ');
const STILL_SRC = `/hero/flange-${still.widths.at(-1)}.webp`;
const STILL_SIZES = '(max-width: 700px) 100vw, 690px';
/** Where the still shows: a hero under 460 px (viewport minus its 34 px of margin) or reduced motion. */
const STILL_MEDIA = '(max-width: 493px), (prefers-reduced-motion: reduce)';
const PLOT_MS = 1300;
const MACHINING_STARTS_AT_MS = 1250;
const FINISHED_HOLD_MS = 1200;

type HeroMachiningProps = { operations: readonly string[]; nominalWidth?: number };

/**
 * The hero: the flange drawing plots itself, then the part is turned from bar stock operation by
 * operation, the hatching returns as the finished section, and the part tilts out and spins
 * (draggable). Reduced motion and narrow heroes get a prerendered still of the finished part instead,
 * shown by CSS alone, so they never load or run the 3D code.
 */
export function HeroMachining({ operations, nominalWidth = 690 }: HeroMachiningProps) {
  // The still is the largest paint on phones but lazy, so the preload scanner would miss it.
  preload(STILL_SRC, {
    as: 'image',
    imageSrcSet: STILL_SOURCES,
    imageSizes: STILL_SIZES,
    media: STILL_MEDIA,
    fetchPriority: 'high',
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const toolGroupRef = useRef<SVGGElement>(null);
  const feedRef = useRef<SVGPathElement>(null);
  const rapidRef = useRef<SVGPathElement>(null);
  const turnRef = useRef<SVGGElement>(null);
  const threadRef = useRef<SVGGElement>(null);
  const drillRef = useRef<SVGGElement>(null);
  const partRef = useRef<SVGGElement>(null);
  const readoutXRef = useRef<HTMLSpanElement>(null);
  const readoutZRef = useRef<HTMLSpanElement>(null);

  const reducedMotion = usePrefersReducedMotion();
  // Crossing 460 px swaps machining for the still even when the drawing keeps its scale.
  const narrow = useWidthBelow(rootRef, STATIC_BELOW_PX);
  const [gated, setGated] = useState(true);
  const [operation, setOperation] = useState(operations.length);
  const [readoutVisible, setReadoutVisible] = useState(false);

  const viewBox = viewBoxOf(HERO_SUBJECT);
  const stageAspect = nominalWidth / (nominalWidth / HERO_ASPECT - STRIP_BAND_PX);
  const k = useDrawingScale(stageRef, viewBox, nominalWidth, stageAspect);
  // The machining effect restarts whenever the drawing changes; keep it stable between scale changes.
  const drawing = useMemo(() => drawSubject(HERO_SUBJECT, k), [k]);
  const finished = operations.length;

  useEffect(() => {
    const [root, stage, svg, host, toolGroup] = [
      rootRef.current,
      stageRef.current,
      svgRef.current,
      canvasHostRef.current,
      toolGroupRef.current,
    ];
    const [feed, rapid, turn, thread, drill, part] = [
      feedRef.current,
      rapidRef.current,
      turnRef.current,
      threadRef.current,
      drillRef.current,
      partRef.current,
    ];
    if (!root || !stage || !svg || !host || !toolGroup) return;
    if (!feed || !rapid || !turn || !thread || !drill || !part) return;
    // Read the preference directly: during hydration the hook still reports the server's `false`.
    if (prefersReducedMotion() || root.getBoundingClientRect().width < STATIC_BELOW_PX) return;

    const overlay: ToolOverlayHandle = { feed, rapid, tools: { turn, thread, drill, part } };
    const controller = new AbortController();
    const cleanups: (() => void)[] = [];
    const context: MachiningContext = {
      stage,
      svg,
      host,
      toolGroup,
      overlay,
      drawing,
      finished,
      signal: controller.signal,
      cleanups,
      setGated,
      setOperation,
      setReadoutVisible,
      readout: (x, z) => {
        if (readoutXRef.current) readoutXRef.current.textContent = x;
        if (readoutZRef.current) readoutZRef.current.textContent = z;
      },
    };
    machinePart(context).catch(() => {
      if (controller.signal.aborted) return;
      // No WebGL, or the context died: free what was built and leave the finished drawing.
      cleanups
        .splice(0)
        .reverse()
        .forEach((cleanup) => cleanup());
      resetStage(context);
      setGated(false);
      setOperation(finished);
      setReadoutVisible(false);
    });

    return () => {
      controller.abort();
      cleanups.reverse().forEach((cleanup) => cleanup());
      resetStage(context);
      setOperation(finished);
      setReadoutVisible(false);
    };
  }, [drawing, reducedMotion, narrow, finished]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={cn('@container relative w-full', styles.hero, gated && styles.gated)}
      style={{ aspectRatio: String(HERO_ASPECT) }}
    >
      <div
        ref={stageRef}
        className="absolute inset-x-0 top-0 bottom-14 overflow-hidden @max-[560px]:bottom-25"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- prerendered sizes from scripts/render-hero-still.mjs */}
        <img
          alt=""
          src={STILL_SRC}
          srcSet={STILL_SOURCES}
          sizes={STILL_SIZES}
          width={still.size.width}
          height={still.size.height}
          loading="lazy"
          decoding="async"
          className={cn('pointer-events-none absolute inset-0 size-full object-contain', styles.still)}
        />
        <div
          ref={canvasHostRef}
          className="absolute inset-0 *:block *:size-full *:touch-pan-y *:opacity-0 *:transition-opacity *:duration-450 *:ease-linear"
        />
        <div className="pointer-events-none absolute inset-0 z-2">
          <DrawingSvg ref={svgRef} drawing={drawing}>
            <ToolOverlay
              k={k}
              length={HERO_PART.L}
              stockRadius={STOCK_RADIUS}
              groupRef={toolGroupRef}
              feedRef={feedRef}
              rapidRef={rapidRef}
              turnRef={turnRef}
              threadRef={threadRef}
              drillRef={drillRef}
              partRef={partRef}
            />
          </DrawingSvg>
        </div>
      </div>
      <OperationStrip
        operations={operations}
        current={operation}
        readoutVisible={readoutVisible}
        readoutX={readoutXRef}
        readoutZ={readoutZRef}
      />
    </div>
  );
}

/** Everything one machining run works with; aborted through `signal`, undone through `cleanups`. */
type MachiningContext = {
  stage: HTMLDivElement;
  svg: SVGSVGElement;
  /** Receives the 3D scene's canvas, created per run and removed with the scene. */
  host: HTMLElement;
  toolGroup: SVGGElement;
  overlay: ToolOverlayHandle;
  drawing: Drawing;
  finished: number;
  signal: AbortSignal;
  cleanups: (() => void)[];
  setGated: Dispatch<SetStateAction<boolean>>;
  setOperation: Dispatch<SetStateAction<number>>;
  setReadoutVisible: Dispatch<SetStateAction<boolean>>;
  readout: (x: string, z: string) => void;
};

const stageSize = (stage: HTMLElement) => [stage.clientWidth, stage.clientHeight] as const;
const mainHatch = (svg: SVGSVGElement) => svg.querySelector<SVGGElement>('[data-view="a"] [data-hatch]');

async function machinePart(context: MachiningContext) {
  const { stage, svg, host, toolGroup, overlay, drawing, signal, cleanups, finished } = context;
  const hatch = mainHatch(svg);

  context.setOperation(-1);
  if (hatch) {
    hatch.style.transition = 'none';
    hatch.style.opacity = '0';
  }
  plotLines(svg, '[data-plot]', '[data-centre]', PLOT_MS);
  context.setGated(false);

  const three = loadHeroThree();
  await wait(MACHINING_STARTS_AT_MS, signal);
  const { createModelScene, runMachining, startSpin } = await three;
  signal.throwIfAborted();

  const model = createModelScene({ host, part: HERO_PART, drawing, size: stageSize(stage), tone: HERO_TONE });
  cleanups.push(() => model.dispose());
  toolGroup.style.opacity = '1';
  model.canvas.style.transition = 'opacity .35s linear';
  model.canvas.style.opacity = '1';
  context.setReadoutVisible(true);

  const run = await runMachining({
    model,
    part: HERO_PART,
    overlay,
    onOperation: context.setOperation,
    onReadout: context.readout,
    signal,
  });
  cleanups.push(run.removeStock);

  // The finished section: tools fade, hatching sweeps back in, every operation ticked.
  toolGroup.style.transition = 'opacity .4s linear';
  toolGroup.style.opacity = '0';
  if (hatch) {
    hatch.style.transition = '';
    hatch.style.opacity = '1';
  }
  revealHatch(svg, 600);
  context.setOperation(finished);
  context.setReadoutVisible(false);

  await wait(FINISHED_HOLD_MS, signal);
  run.removeStock();
  showFrame(svg, 3);
  cleanups.push(startSpin(model));
}

function resetStage({ svg, toolGroup, overlay }: MachiningContext) {
  svg.getAnimations?.({ subtree: true }).forEach((animation) => animation.cancel());
  toolGroup.style.removeProperty('opacity');
  toolGroup.style.removeProperty('transition');
  overlay.feed.removeAttribute('d');
  overlay.rapid.removeAttribute('d');
  Object.values(overlay.tools).forEach((tool) => {
    tool.style.removeProperty('display');
    tool.removeAttribute('transform');
  });
  // Back to the stylesheet, which shows the half-section or, for the still, hides it.
  svg.querySelector<SVGGElement>('[data-view="a"]')?.style.removeProperty('opacity');
  const hatch = mainHatch(svg);
  hatch?.style.removeProperty('opacity');
  hatch?.style.removeProperty('transition');
}
