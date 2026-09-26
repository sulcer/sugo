import type { Scene } from 'three';
import type { TurnedPart } from '@/drawing/geometry/parts-table';
import { buildProgram, type Move, type Operation, type Tool } from './program';
import { createStock, cutStock, dropOffcut, STOCK_RADIUS, type Stock } from './stock';
import { createStockMesh } from './stock-mesh';

/** SVG elements of the tool overlay, updated every frame without going through React. */
export type ToolOverlayHandle = {
  feed: SVGPathElement;
  rapid: SVGPathElement;
  tools: Record<Tool, SVGGElement>;
};

type MachiningOptions = {
  model: { scene: Scene; render(): void; hideModels(): void };
  part: TurnedPart;
  overlay: ToolOverlayHandle;
  onOperation: (operation: Operation) => void;
  /** DRO lines: `X Ø 69.000  T01` and `Z 0.000`. */
  onReadout?: (x: string, z: string) => void;
  signal: AbortSignal;
};

export type MachiningRun = { stock: Stock; removeStock(): void };

const RAPID_MM_PER_S = 260;
const TOOL_NUMBER: Record<Tool, string> = { turn: 'T01', thread: 'T02', drill: 'T03', part: 'T04' };
const coordinate = (value: number) => value.toFixed(2);

/**
 * Plays the turning program in real time: the tool glyph follows the program over the drawing,
 * feed moves leave an accent toolpath and rapids a dashed one, and every step of the tool tip cuts
 * the stock, whose revolved mesh is redrawn each frame. Resolves with the finished, parted-off stock.
 */
export function runMachining({
  model,
  part,
  overlay,
  onOperation,
  onReadout,
  signal,
}: MachiningOptions): Promise<MachiningRun> {
  const stock = createStock(part);
  const surface = createStockMesh(stock);
  const program = buildProgram(part);
  model.hideModels();
  model.scene.add(surface.mesh);

  let [x, r] = [-18, STOCK_RADIUS + 26];
  let feedPath = '';
  let rapidPath = '';
  let tool: Tool | null = null;
  let operation: Operation | -1 = -1;
  let index = 0;
  let frame = 0;

  const showTool = (next: Tool) => {
    if (next === tool) return;
    tool = next;
    (Object.entries(overlay.tools) as [Tool, SVGGElement][]).forEach(([name, glyph]) => {
      glyph.style.display = name === next ? 'inline' : 'none';
    });
  };

  type Segment = { move: Move; from: [number, number]; duration: number; start: number };
  const startSegment = (start: number): Segment | null => {
    const move = program[index];
    if (!move) return null;
    if (move.tool) showTool(move.tool);
    if (move.op !== operation) {
      operation = move.op;
      onOperation(move.op);
    }
    const distance = Math.hypot(move.x - x, move.r - r);
    const speed = move.rapid ? RAPID_MM_PER_S : (move.v ?? RAPID_MM_PER_S);
    const here = `${coordinate(x)} ${coordinate(r)}`;
    if (move.rapid) rapidPath += `M${here}L${coordinate(move.x)} ${coordinate(move.r)}`;
    else if (!feedPath.endsWith(here)) feedPath += `M${here}`;
    return { move, from: [x, r], duration: Math.max(40, (distance / speed) * 1000), start };
  };

  return new Promise((resolve, reject) => {
    const abort = () => {
      cancelAnimationFrame(frame);
      model.scene.remove(surface.mesh);
      surface.dispose();
      reject(signal.reason);
    };
    if (signal.aborted) return abort();
    signal.addEventListener('abort', abort, { once: true });

    let segment = startSegment(performance.now());
    const tick = (now: number) => {
      while (segment) {
        const { move, from, duration, start } = segment;
        const progress = Math.min(1, (now - start) / duration);
        const nx = from[0] + (move.x - from[0]) * progress;
        const nr = from[1] + (move.r - from[1]) * progress;
        const steps = Math.max(1, Math.ceil(Math.hypot(nx - x, nr - r) / (stock.step * 0.5)));
        for (let s = 1; s <= steps; s++) {
          cutStock(stock, x + ((nx - x) * s) / steps, Math.abs(r + ((nr - r) * s) / steps), move);
        }
        [x, r] = [nx, nr];
        if (progress < 1) break;
        if (!move.rapid) feedPath += `L${coordinate(x)} ${coordinate(r)}`;
        index++;
        segment = startSegment(now);
      }

      const cutting = segment && !segment.move.rapid ? `L${coordinate(x)} ${coordinate(r)}` : '';
      overlay.feed.setAttribute('d', feedPath + cutting);
      overlay.rapid.setAttribute('d', rapidPath);
      if (tool) overlay.tools[tool].setAttribute('transform', `translate(${coordinate(x)} ${coordinate(r)})`);
      onReadout?.(
        `X Ø ${(2 * Math.abs(r)).toFixed(3)}  ${tool ? TOOL_NUMBER[tool] : ''}`,
        `Z ${(-x).toFixed(3)}`,
      );
      surface.update();
      model.render();

      if (segment) {
        frame = requestAnimationFrame(tick);
        return;
      }
      signal.removeEventListener('abort', abort);
      dropOffcut(stock);
      surface.update();
      model.render();
      let removed = false;
      resolve({
        stock,
        removeStock: () => {
          if (removed) return;
          removed = true;
          model.scene.remove(surface.mesh);
          surface.dispose();
        },
      });
    };
    frame = requestAnimationFrame(tick);
  });
}
