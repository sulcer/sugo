import { createLayer, type Drawing, type DrawingLayer, type ViewBox } from './layer';
import { circle, line, polyline, rect, type Point } from './path';

/** Lathe: outline W × H, work envelope Ø D × L. Millimetres. */
type LatheSpec = {
  type: 'lathe';
  W: number;
  H: number;
  L: number;
  D: number;
  conveyor?: boolean;
  slope?: boolean;
};
/** Vertical machining centre: outline W × H, travels X / Y / Z. Millimetres. */
type VmcSpec = { type: 'vmc'; W: number; H: number; X: number; Y: number; Z: number };

/** The park, as drawn: outline and work envelope of every machine. The only source of both. */
// prettier-ignore
export const MACHINE_SPECS = {
  m1: { type: 'lathe', W: 2300, H: 1750, L: 500, D: 160, conveyor: true },
  m2: { type: 'lathe', W: 2600, H: 1820, L: 500, D: 160, conveyor: true, slope: true },
  m3: { type: 'lathe', W: 1900, H: 1700, L: 300, D: 160 },
  m4: { type: 'lathe', W: 2500, H: 1780, L: 500, D: 210, conveyor: true, slope: true },
  m5: { type: 'vmc', W: 2000, H: 2300, X: 500, Y: 350, Z: 250 },
  m6: { type: 'vmc', W: 2250, H: 2450, X: 600, Y: 400, Z: 300 },
} as const satisfies Record<string, LatheSpec | VmcSpec>;

export type MachineKind = keyof typeof MACHINE_SPECS;
export type MachineSpec = (typeof MACHINE_SPECS)[MachineKind];
export const MACHINE_KINDS = Object.keys(MACHINE_SPECS) as MachineKind[];

export function machineViewBox(kind: MachineKind): ViewBox {
  const { W, H } = MACHINE_SPECS[kind];
  const pad = W * 0.04;
  return [-pad, -pad, W + 2 * pad, H + 2 * pad];
}

/**
 * Front elevation of a machine in thin line, traced from the manufacturer outline, with its work
 * envelope drawn and dimensioned in accent ink. The envelope figures are the only real dimensions
 * on the site.
 */
export function drawMachine(kind: MachineKind, k: number): Drawing {
  const spec: LatheSpec | VmcSpec = MACHINE_SPECS[kind];
  const layer = createLayer(k, 'a');
  layer.thin.push(line(-spec.W * 0.03, spec.H, spec.W * 1.03, spec.H));
  if (spec.type === 'lathe') drawLathe(layer, spec);
  else drawVmc(layer, spec);
  return { layers: [layer], viewBox: machineViewBox(kind) };
}

function drawLathe(layer: DrawingLayer, m: LatheSpec) {
  const { W, H } = m;
  const T = layer.thin;
  T.push(rect(W * 0.02, H * 0.86, W * 0.78, H * 0.14));
  T.push(line(W * 0.02, H * 0.965, W * 0.8, H * 0.965));
  T.push(
    m.slope
      ? polyline(
          [
            [0, H * 0.86],
            [0, H * 0.16],
            [W * 0.05, H * 0.08],
            [W * 0.8, H * 0.08],
            [W * 0.8, H * 0.86],
          ],
          true,
        )
      : rect(0, H * 0.08, W * 0.8, H * 0.78),
  );
  T.push(line(m.slope ? W * 0.05 : 0, H * 0.12, W * 0.8, H * 0.12));
  // Door with window, handle and panel seams.
  T.push(rect(W * 0.17, H * 0.16, W * 0.48, H * 0.64));
  T.push(rect(W * 0.2, H * 0.2, W * 0.42, H * 0.36));
  T.push(line(W * 0.635, H * 0.3, W * 0.635, H * 0.5));
  T.push(line(W * 0.645, H * 0.3, W * 0.645, H * 0.5));
  T.push(line(W * 0.2, H * 0.62, W * 0.62, H * 0.62));
  T.push(line(W * 0.2, H * 0.74, W * 0.62, H * 0.74));

  // Chuck with jaws on the spindle axis.
  const axisY = H * 0.41;
  const chuckR = Math.max(m.D * 0.7, 110);
  const chuckFace = W * 0.2 + Math.max(140, W * 0.05);
  T.push(rect(W * 0.2, axisY - chuckR, chuckFace - W * 0.2, 2 * chuckR));
  T.push(line(chuckFace - 30, axisY - chuckR, chuckFace - 30, axisY + chuckR));
  [-1, 1].forEach((side) => T.push(rect(chuckFace, axisY + side * chuckR * 0.55 - 18, 26, 36)));
  layer.centre.push(line(W * 0.19, axisY, W * 0.63, axisY));

  // Tailstock, when it fits beyond the envelope.
  const envelopeEnd = chuckFace + m.L;
  if (envelopeEnd + 200 < W * 0.62) {
    T.push(rect(envelopeEnd + 70, axisY - chuckR * 0.6, W * 0.62 - envelopeEnd - 70, chuckR * 1.2));
    T.push(
      polyline([
        [envelopeEnd + 70, axisY - 22],
        [envelopeEnd + 25, axisY],
        [envelopeEnd + 70, axisY + 22],
      ]),
    );
  }

  // Octagonal turret above the envelope.
  const turretX = chuckFace + m.L * 0.3;
  const clearance = axisY - m.D / 2 - H * 0.2;
  const turretY = H * 0.2 + clearance * 0.5;
  const turretR = Math.min(95, clearance * 0.42);
  const octagon: Point[] = [];
  for (let i = 0; i < 8; i++) {
    const a = Math.PI / 8 + (i * Math.PI) / 4;
    octagon.push([turretX + turretR * Math.cos(a), turretY + turretR * Math.sin(a)]);
  }
  T.push(polyline(octagon, true));
  T.push(circle(turretX, turretY, turretR * 0.35));
  T.push(rect(turretX - 12, turretY + turretR * 0.9, 24, turretR * 0.5));

  // Control panel: screen, 3 × 4 keys, knob.
  T.push(rect(W * 0.82, H * 0.12, W * 0.16, H * 0.44));
  T.push(rect(W * 0.835, H * 0.15, W * 0.13, H * 0.15));
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      T.push(rect(W * 0.838 + col * W * 0.032, H * 0.33 + row * H * 0.045, W * 0.022, H * 0.028));
    }
  }
  T.push(circle(W * 0.95, H * 0.51, W * 0.012));
  T.push(line(W * 0.8, H * 0.2, W * 0.82, H * 0.2));

  if (m.conveyor) {
    T.push(
      polyline([
        [W * 0.8, H * 0.86],
        [W * 0.8, H * 0.66],
        [W * 0.95, H * 0.58],
        [W * 1.0, H * 0.58],
        [W * 1.0, H * 0.66],
        [W * 0.84, H * 0.75],
        [W * 0.84, H * 0.86],
      ]),
    );
    T.push(rect(W * 0.87, H * 0.78, W * 0.12, H * 0.22));
  }

  // Work envelope Ø D × L, dimensioned.
  const k = layer.k;
  const bottom = axisY + m.D / 2;
  layer.envelope.push(rect(chuckFace, axisY - m.D / 2, m.L, m.D));
  dimensionHorizontal(layer, chuckFace, envelopeEnd, bottom + 22 * k, String(m.L), false);
  layer.envelopeThin.push(line(chuckFace, bottom, chuckFace, bottom + 26 * k));
  layer.envelopeThin.push(line(envelopeEnd, bottom, envelopeEnd, bottom + 26 * k));
  dimensionVertical(layer, envelopeEnd - 12 * k, axisY - m.D / 2, bottom, '', -1);
  layer.texts.push({
    x: envelopeEnd,
    y: axisY - m.D / 2 - 6 * k,
    size: 11,
    text: 'Ø ' + m.D,
    anchor: 'end',
    accent: true,
  });
}

function drawVmc(layer: DrawingLayer, m: VmcSpec) {
  const { W, H } = m;
  const T = layer.thin;
  T.push(rect(W * 0.04, H * 0.86, W * 0.74, H * 0.14));
  T.push(line(W * 0.04, H * 0.965, W * 0.78, H * 0.965));
  // Enclosure, spindle head housing and motor cap.
  T.push(rect(0, H * 0.13, W * 0.82, H * 0.73));
  T.push(rect(W * 0.28, H * 0.03, W * 0.26, H * 0.1));
  T.push(rect(W * 0.35, 0, W * 0.12, H * 0.03));
  T.push(line(0, H * 0.17, W * 0.82, H * 0.17));
  // Two doors with windows and handles.
  T.push(rect(W * 0.09, H * 0.2, W * 0.32, H * 0.58));
  T.push(rect(W * 0.41, H * 0.2, W * 0.32, H * 0.58));
  T.push(rect(W * 0.12, H * 0.23, W * 0.26, H * 0.4));
  T.push(rect(W * 0.44, H * 0.23, W * 0.26, H * 0.4));
  T.push(line(W * 0.395, H * 0.4, W * 0.395, H * 0.52));
  T.push(line(W * 0.425, H * 0.4, W * 0.425, H * 0.52));

  // Table with T-slots, spindle head, nose and tool.
  const cx = W * 0.41;
  const tableY = H * 0.62;
  const envelopeBottom = tableY - 24;
  const envelopeTop = envelopeBottom - m.Z;
  T.push(rect(cx - W * 0.28, tableY, W * 0.56, 38));
  for (let i = 1; i < 4; i++) T.push(line(cx - W * 0.28, tableY + 9 * i, cx + W * 0.28, tableY + 9 * i));
  const headRoom = envelopeTop - 30 - H * 0.235;
  const headHeight = Math.max(60, headRoom * 0.72);
  T.push(rect(cx - W * 0.07, H * 0.235, W * 0.14, headHeight));
  const noseY = H * 0.235 + headHeight;
  T.push(rect(cx - 36, noseY, 72, envelopeTop - 30 - noseY));
  T.push(rect(cx - 12, envelopeTop - 30, 24, 30));
  layer.centre.push(line(cx, H * 0.2, cx, tableY + 60));

  // Control panel: arm, screen and 3 × 3 keys.
  T.push(line(W * 0.82, H * 0.26, W * 0.86, H * 0.26));
  T.push(rect(W * 0.86, H * 0.18, W * 0.13, H * 0.36));
  T.push(rect(W * 0.873, H * 0.205, W * 0.104, H * 0.12));
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      T.push(rect(W * 0.875 + col * W * 0.036, H * 0.35 + row * H * 0.042, W * 0.026, H * 0.026));
    }
  }

  // Work envelope X × Z (Y labelled), dimensioned.
  const k = layer.k;
  const left = cx - m.X / 2;
  const right = cx + m.X / 2;
  layer.envelope.push(rect(left, envelopeTop, m.X, m.Z));
  dimensionHorizontal(layer, left, right, envelopeTop - 16 * k, 'X ' + m.X, true);
  layer.envelopeThin.push(line(left, envelopeTop, left, envelopeTop - 20 * k));
  layer.envelopeThin.push(line(right, envelopeTop, right, envelopeTop - 20 * k));
  dimensionVertical(layer, right + 16 * k, envelopeTop, envelopeBottom, 'Z ' + m.Z, 1);
  layer.envelopeThin.push(line(right, envelopeTop, right + 20 * k, envelopeTop));
  layer.envelopeThin.push(line(right, envelopeBottom, right + 20 * k, envelopeBottom));
  layer.texts.push({
    x: left + 8 * k,
    y: envelopeBottom - 8 * k,
    size: 11,
    text: 'Y ' + m.Y,
    anchor: 'start',
    accent: true,
  });
}

/** Dimension line with two arrowheads and a centred label above (`labelAbove`) or below it. */
function dimensionHorizontal(
  layer: DrawingLayer,
  x1: number,
  x2: number,
  y: number,
  label: string,
  labelAbove: boolean,
) {
  const k = layer.k;
  const [arrow, half] = [7 * k, 2.2 * k];
  layer.envelopeThin.push(line(x1, y, x2, y));
  layer.envelopeFill.push(
    polyline(
      [
        [x1, y],
        [x1 + arrow, y - half],
        [x1 + arrow, y + half],
      ],
      true,
    ),
  );
  layer.envelopeFill.push(
    polyline(
      [
        [x2, y],
        [x2 - arrow, y - half],
        [x2 - arrow, y + half],
      ],
      true,
    ),
  );
  layer.texts.push({
    x: (x1 + x2) / 2,
    y: y + (labelAbove ? -4 * k : 13 * k),
    size: 11,
    text: label,
    anchor: 'middle',
    accent: true,
  });
}

/** Vertical dimension line; the label sits to the right (side 1) or left (side -1). */
function dimensionVertical(
  layer: DrawingLayer,
  x: number,
  y1: number,
  y2: number,
  label: string,
  side: 1 | -1,
) {
  const k = layer.k;
  const [arrow, half] = [7 * k, 2.2 * k];
  layer.envelopeThin.push(line(x, y1, x, y2));
  layer.envelopeFill.push(
    polyline(
      [
        [x, y1],
        [x - half, y1 + arrow],
        [x + half, y1 + arrow],
      ],
      true,
    ),
  );
  layer.envelopeFill.push(
    polyline(
      [
        [x, y2],
        [x - half, y2 - arrow],
        [x + half, y2 - arrow],
      ],
      true,
    ),
  );
  if (label) {
    layer.texts.push({
      x: x + side * 5 * k,
      y: (y1 + y2) / 2 + 4 * k,
      size: 11,
      text: label,
      anchor: side > 0 ? 'start' : 'end',
      accent: true,
    });
  }
}
