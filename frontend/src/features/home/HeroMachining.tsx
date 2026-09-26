'use client';

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { plotLines, revealHatch, showFrame } from '@/drawing/animations';
import { DrawingSvg } from '@/drawing/DrawingSvg';
import { drawSubject, viewBoxOf, type Drawing } from '@/drawing/geometry';
import { PART_GEOMETRY, type TurnedPart } from '@/drawing/geometry/parts-table';
import { useDrawingScale } from '@/drawing/use-drawing-scale';
import { cn } from '@/lib/cn';
import { prefersReducedMotion, usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';
import { wait } from '@/lib/wait';
import { loadHeroThree } from '@/three/load-hero';
import type { ToolOverlayHandle } from '@/three/machining/simulate';
import { STOCK_RADIUS } from '@/three/machining/stock';
import styles from './HeroMachining.module.css';
import { OperationStrip } from './OperationStrip';
import { ToolOverlay } from './ToolOverlay';

const FLANGE = PART_GEOMETRY.flange as TurnedPart;
const SUBJECT = { type: 'part', kind: 'flange', views: 'full' } as const;
const HERO_ASPECT = 1.38;
/** Height the operation strip reserves below the drawing on wide heroes. */
const STRIP_BAND_PX = 56;
/** Below this width the hero shows the finished part as a still. */
const STATIC_BELOW_PX = 460;
const PLOT_MS = 1300;
const MACHINING_STARTS_AT_MS = 1250;
const FINISHED_HOLD_MS = 1200;

type HeroMachiningProps = { operations: readonly string[]; nominalWidth?: number };

/**
 * The hero: the flange drawing plots itself, then the part is turned from bar stock operation by
 * operation, the hatching returns as the finished section, and the part tilts out and spins
 * (draggable). Reduced motion and narrow screens get a still of the finished part instead.
 */
export function HeroMachining({ operations, nominalWidth = 690 }: HeroMachiningProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
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
  const [gated, setGated] = useState(true);
  const [operation, setOperation] = useState(operations.length);
  const [readoutVisible, setReadoutVisible] = useState(false);

  const viewBox = viewBoxOf(SUBJECT);
  const stageAspect = nominalWidth / (nominalWidth / HERO_ASPECT - STRIP_BAND_PX);
  const k = useDrawingScale(stageRef, viewBox, nominalWidth, stageAspect);
  const drawing = drawSubject(SUBJECT, k);
  const finished = operations.length;

  useEffect(() => {
    const [root, stage, svg, canvas, image, toolGroup] = [
      rootRef.current,
      stageRef.current,
      svgRef.current,
      canvasRef.current,
      imageRef.current,
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
    if (!root || !stage || !svg || !canvas || !image || !toolGroup) return;
    if (!feed || !rapid || !turn || !thread || !drill || !part) return;

    const overlay: ToolOverlayHandle = { feed, rapid, tools: { turn, thread, drill, part } };
    const controller = new AbortController();
    const cleanups: (() => void)[] = [];
    const context: SequenceContext = {
      stage,
      svg,
      canvas,
      image,
      toolGroup,
      overlay,
      drawing,
      finished,
      signal: controller.signal,
      cleanups,
      setGated,
      setOperation,
    };
    const readout = (x: string, z: string) => {
      if (readoutXRef.current) readoutXRef.current.textContent = x;
      if (readoutZRef.current) readoutZRef.current.textContent = z;
    };
    // Read the preference directly: during hydration the hook still reports the server's `false`.
    const sequence =
      prefersReducedMotion() || root.clientWidth < STATIC_BELOW_PX
        ? showFinishedStill(context)
        : machinePart({ ...context, setReadoutVisible, readout });
    sequence.catch(() => {
      // Aborted, or no WebGL: the complete drawing stays.
    });

    return () => {
      controller.abort();
      cleanups.reverse().forEach((cleanup) => cleanup());
      resetStage(context);
    };
  }, [drawing, reducedMotion, finished]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={cn('@container relative w-full', gated && styles.gated)}
      style={{ aspectRatio: String(HERO_ASPECT) }}
    >
      <div
        ref={stageRef}
        className="absolute inset-x-0 top-0 bottom-14 overflow-hidden @max-[560px]:bottom-25"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- a canvas snapshot, not an asset for next/image */}
        <img
          ref={imageRef}
          alt=""
          className="pointer-events-none absolute inset-0 size-full opacity-0 transition-opacity duration-450 ease-linear"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 size-full opacity-0 transition-opacity duration-450 ease-linear"
          style={{ touchAction: 'pan-y' }}
        />
        <div className="pointer-events-none absolute inset-0 z-2">
          <DrawingSvg ref={svgRef} drawing={drawing}>
            <ToolOverlay
              k={k}
              length={FLANGE.L}
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

type SequenceContext = {
  stage: HTMLDivElement;
  svg: SVGSVGElement;
  canvas: HTMLCanvasElement;
  image: HTMLImageElement;
  toolGroup: SVGGElement;
  overlay: ToolOverlayHandle;
  drawing: Drawing;
  finished: number;
  signal: AbortSignal;
  cleanups: (() => void)[];
  setGated: Dispatch<SetStateAction<boolean>>;
  setOperation: Dispatch<SetStateAction<number>>;
};

const stageSize = (stage: HTMLElement) => [stage.clientWidth, stage.clientHeight] as const;
const mainHatch = (svg: SVGSVGElement) => svg.querySelector<SVGGElement>('[data-view="a"] [data-hatch]');

/** Static frame: the end view stays, the half-section gives way to a rendered still of the part. */
async function showFinishedStill({
  stage,
  svg,
  image,
  drawing,
  signal,
  finished,
  setGated,
  setOperation,
}: SequenceContext) {
  setGated(false);
  setOperation(finished);
  const { renderStill } = await loadHeroThree();
  signal.throwIfAborted();
  image.src = renderStill({ part: FLANGE, drawing, size: stageSize(stage), tone: 'metal' });
  await image.decode?.().catch(() => {});
  signal.throwIfAborted();
  image.style.transition = 'none';
  image.style.opacity = '1';
  showFrame(svg, 3);
}

type MachiningContext = SequenceContext & {
  setReadoutVisible: Dispatch<SetStateAction<boolean>>;
  readout: (x: string, z: string) => void;
};

async function machinePart(context: MachiningContext) {
  const { stage, svg, canvas, toolGroup, overlay, drawing, signal, cleanups, finished } = context;
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

  const model = createModelScene({ canvas, part: FLANGE, drawing, size: stageSize(stage), tone: 'metal' });
  cleanups.push(() => model.dispose());
  toolGroup.style.opacity = '1';
  canvas.style.transition = 'opacity .35s linear';
  canvas.style.opacity = '1';
  context.setReadoutVisible(true);

  const run = await runMachining({
    model,
    part: FLANGE,
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
  cleanups.push(startSpin(model, canvas));
}

function resetStage({ svg, canvas, image, toolGroup, overlay }: SequenceContext) {
  svg.getAnimations?.({ subtree: true }).forEach((animation) => animation.cancel());
  canvas.style.removeProperty('opacity');
  canvas.style.removeProperty('transition');
  image.style.removeProperty('opacity');
  image.style.removeProperty('transition');
  image.removeAttribute('src');
  toolGroup.style.removeProperty('opacity');
  toolGroup.style.removeProperty('transition');
  overlay.feed.removeAttribute('d');
  overlay.rapid.removeAttribute('d');
  Object.values(overlay.tools).forEach((tool) => {
    tool.style.removeProperty('display');
    tool.removeAttribute('transform');
  });
  const hatch = mainHatch(svg);
  hatch?.style.removeProperty('opacity');
  hatch?.style.removeProperty('transition');
  showFrame(svg, 1);
}
