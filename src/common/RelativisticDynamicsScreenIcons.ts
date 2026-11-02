/**
 * RelativisticDynamicsScreenIcons.ts
 *
 * Home-screen and navigation-bar icons, one per screen, each a miniature of the
 * screen's central picture drawn in the sim's colour language:
 *
 *   Accelerate       the race: light pulse ahead, Newton's ghost overtaking it, the real particle behind
 *   Energy–Momentum  the triangle E² = (pc)² + (mc²)² beside its mass-shell hyperbola
 *   Collisions       two bodies meeting at a point and flying apart
 *   Thresholds       a beam striking a target and four products leaving together
 */

import { Shape } from "scenerystack/kite";
import { Circle, Line, Node, Path, Rectangle, type TPaint } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import { ScreenIcon } from "scenerystack/sim";
import RelativisticDynamicsColors from "../RelativisticDynamicsColors.js";

const W = 548;
const H = 373;

function background(): Rectangle {
  return new Rectangle(0, 0, W, H, { fill: RelativisticDynamicsColors.backgroundColorProperty });
}

function iconFrom(...content: Node[]): ScreenIcon {
  return new ScreenIcon(new Node({ children: [background(), ...content] }), {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: RelativisticDynamicsColors.backgroundColorProperty,
  });
}

const arrow = (x1: number, y1: number, x2: number, y2: number, fill: TPaint): ArrowNode =>
  new ArrowNode(x1, y1, x2, y2, { fill, stroke: null, headWidth: 40, headHeight: 34, tailWidth: 14 });

export function createAccelerateIcon(): ScreenIcon {
  const [lightY, newtonY, relativityY] = [95, 187, 279] as const;
  const laneY = [lightY, newtonY, relativityY];
  const lanes = laneY.map(
    (y) => new Line(50, y, 500, y, { stroke: RelativisticDynamicsColors.chartGridColorProperty, lineWidth: 6 }),
  );
  return iconFrom(
    ...lanes,
    new Line(500, 50, 500, 320, { stroke: RelativisticDynamicsColors.chartAxisColorProperty, lineWidth: 6 }),
    new Rectangle(330, lightY - 12, 80, 24, {
      fill: RelativisticDynamicsColors.lightColorProperty,
      cornerRadius: 12,
    }),
    new Circle(34, {
      x: 450,
      y: newtonY,
      stroke: RelativisticDynamicsColors.newtonianColorProperty,
      lineWidth: 9,
      lineDash: [16, 10],
    }),
    new Circle(34, {
      x: 290,
      y: relativityY,
      fill: RelativisticDynamicsColors.relativisticColorProperty,
    }),
  );
}

export function createEnergyMomentumIcon(): ScreenIcon {
  // Triangle: right angle at the bottom left, legs pc (blue) and mc² (green), hypotenuse E (pink).
  const ox = 60;
  const oy = 310;
  const pc = 230;
  const mc2 = 170;
  const triangle = new Node({
    children: [
      new Line(ox, oy, ox + pc, oy, { stroke: RelativisticDynamicsColors.momentumColorProperty, lineWidth: 16 }),
      new Line(ox, oy, ox, oy - mc2, { stroke: RelativisticDynamicsColors.restEnergyColorProperty, lineWidth: 16 }),
      new Line(ox, oy - mc2, ox + pc, oy, {
        stroke: RelativisticDynamicsColors.totalEnergyColorProperty,
        lineWidth: 16,
      }),
    ],
  });
  // Mass shell E = √(p² + 1) and its light-line asymptote, on the right.
  const cx = 420;
  const by = 330;
  const unit = 70;
  const shell = new Shape();
  for (let i = 0; i <= 40; i++) {
    const p = -1.5 + (3 * i) / 40;
    const x = cx + p * unit;
    const y = by - Math.hypot(p, 1) * unit;
    if (i === 0) {
      shell.moveTo(x, y);
    } else {
      shell.lineTo(x, y);
    }
  }
  return iconFrom(
    triangle,
    new Path(
      new Shape()
        .moveTo(cx - 1.6 * unit, by - 1.6 * unit)
        .lineTo(cx, by)
        .lineTo(cx + 1.6 * unit, by - 1.6 * unit),
      {
        stroke: RelativisticDynamicsColors.lightColorProperty,
        lineWidth: 6,
        lineDash: [14, 10],
      },
    ),
    new Path(shell, { stroke: RelativisticDynamicsColors.invariantColorProperty, lineWidth: 10 }),
    new Circle(18, {
      x: cx + 0.9 * unit,
      y: by - Math.hypot(0.9, 1) * unit,
      fill: RelativisticDynamicsColors.relativisticColorProperty,
    }),
  );
}

export function createCollisionsIcon(): ScreenIcon {
  const cx = W / 2;
  const cy = H / 2;
  return iconFrom(
    new Line(40, cy, cx, cy, { stroke: RelativisticDynamicsColors.trailColorProperty, lineWidth: 8 }),
    new Line(cx, cy, cx + 170, cy - 120, { stroke: RelativisticDynamicsColors.trailColorProperty, lineWidth: 8 }),
    new Line(cx, cy, cx + 170, cy + 120, { stroke: RelativisticDynamicsColors.trailColorProperty, lineWidth: 8 }),
    new Circle(42, { x: cx + 120, y: cy - 85, fill: RelativisticDynamicsColors.body1ColorProperty }),
    new Circle(42, { x: cx + 120, y: cy + 85, fill: RelativisticDynamicsColors.body2ColorProperty }),
    arrow(cx + 150, cy - 106, cx + 225, cy - 159, RelativisticDynamicsColors.body1ColorProperty),
    arrow(cx + 150, cy + 106, cx + 225, cy + 159, RelativisticDynamicsColors.body2ColorProperty),
    new Circle(40, {
      x: 110,
      y: cy,
      fill: RelativisticDynamicsColors.body1ColorProperty,
      opacity: 0.35,
    }),
  );
}

export function createThresholdsIcon(): ScreenIcon {
  const cy = H / 2;
  const tx = 300;
  const products = [-1.5, -0.5, 0.5, 1.5].map(
    (k) => new Circle(24, { x: tx + 120, y: cy + k * 62, fill: RelativisticDynamicsColors.compositeColorProperty }),
  );
  const productArrows = [-1.5, -0.5, 0.5, 1.5].map((k) =>
    arrow(tx + 150, cy + k * 62, tx + 230, cy + k * 62, RelativisticDynamicsColors.compositeColorProperty),
  );
  return iconFrom(
    new Circle(30, { x: 70, y: cy, fill: RelativisticDynamicsColors.body1ColorProperty }),
    arrow(105, cy, 210, cy, RelativisticDynamicsColors.body1ColorProperty),
    new Circle(30, { x: tx - 40, y: cy, fill: RelativisticDynamicsColors.body2ColorProperty }),
    ...products,
    ...productArrows,
  );
}
